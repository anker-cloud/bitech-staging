# DC4AI CloudFormation Deployment

This directory contains the CloudFormation template for deploying the DC4AI platform on AWS.

## Prerequisites

Before deploying, ensure you have:

1. **AWS CLI** installed and configured with appropriate credentials
2. **Existing AWS resources** (these are NOT created by the template):
   - Cognito User Pool with App Client
   - Glue Data Catalog databases (crime-data-db, events-data-db, etc.)
   - S3 bucket for Athena results
   - Lake Formation configured

## Deployment Steps

### Step 1: Validate the Template

```bash
aws cloudformation validate-template \
  --template-body file://dc4ai-infrastructure.yaml \
  --region eu-central-1
```

### Step 2: Create the Stack (Initial Deployment)

For the **initial deployment** (before you have a Docker image):

```bash
aws cloudformation create-stack \
  --stack-name dc4ai-production \
  --template-body file://dc4ai-infrastructure.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region eu-central-1 \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=DBPassword,ParameterValue=YourSecurePassword123 \
    ParameterKey=CognitoUserPoolId,ParameterValue=eu-central-1_XXXXXXX \
    ParameterKey=CognitoClientId,ParameterValue=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Build and Push Docker Image

After the stack creates the ECR repository:

```bash
# Get ECR repository URI from outputs
ECR_URI=$(aws cloudformation describe-stacks \
  --stack-name dc4ai-production \
  --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryUri`].OutputValue' \
  --output text \
  --region eu-central-1)

# Login to ECR
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin $ECR_URI

# Build image
docker build -t dc4ai .

# Tag and push
docker tag dc4ai:latest $ECR_URI:latest
docker push $ECR_URI:latest
```

### Step 4: Update Stack with Container Image

```bash
aws cloudformation update-stack \
  --stack-name dc4ai-production \
  --template-body file://dc4ai-infrastructure.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region eu-central-1 \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=DBPassword,UsePreviousValue=true \
    ParameterKey=CognitoUserPoolId,UsePreviousValue=true \
    ParameterKey=CognitoClientId,UsePreviousValue=true \
    ParameterKey=ContainerImage,ParameterValue=$ECR_URI:latest
```

### Step 5: Run Database Migrations

Connect to the RDS instance and run Drizzle migrations:

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name dc4ai-production \
  --query 'Stacks[0].Outputs[?OutputKey==`RDSEndpoint`].OutputValue' \
  --output text \
  --region eu-central-1)

# Set DATABASE_URL and run migrations (from a bastion host or VPN)
DATABASE_URL="postgresql://dc4ai_admin:YourPassword@$RDS_ENDPOINT:5432/postgres" \
npm run db:push
```

### Step 6: Access the Application

Get the ALB URL:

```bash
aws cloudformation describe-stacks \
  --stack-name dc4ai-production \
  --query 'Stacks[0].Outputs[?OutputKey==`ALBUrl`].OutputValue' \
  --output text \
  --region eu-central-1
```

## Parameters Reference

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| Environment | Yes | production | Environment name (production/staging/development) |
| ProjectName | No | dc4ai | Project name for resource naming |
| VpcCidr | No | 10.0.0.0/16 | CIDR block for VPC |
| DBUsername | No | dc4ai_admin | Database username |
| DBPassword | Yes | - | Database password (min 8 chars) |
| DBInstanceClass | No | db.t3.micro | RDS instance class |
| CognitoUserPoolId | Yes | - | Existing Cognito User Pool ID |
| CognitoClientId | Yes | - | Existing Cognito Client ID |
| AthenaOutputLocation | No | s3://bitech-pbac-data-prd/athena-post-op/ | S3 for Athena results |
| ContainerImage | No | - | Docker image URI (empty for initial setup) |
| DomainName | No | - | Custom domain (optional) |
| HostedZoneId | No | - | Route 53 Hosted Zone ID |
| DesiredTaskCount | No | 2 | Number of ECS tasks |
| TaskCpu | No | 512 | CPU units (256/512/1024/2048) |
| TaskMemory | No | 1024 | Memory in MB (512/1024/2048/4096) |

## Resources Created

The template creates the following resources:

### Networking
- VPC with DNS support
- 2 Public Subnets (multi-AZ)
- 2 Private Subnets (multi-AZ)
- Internet Gateway
- NAT Gateway (with Elastic IP)
- Route Tables (public and private)

### Security
- ALB Security Group (ports 80, 443)
- ECS Security Group (port 5000 from ALB)
- RDS Security Group (port 5432 from ECS)

### Database
- RDS PostgreSQL 15 (encrypted, auto-backup)
- DB Subnet Group

### Secrets
- Database URL (auto-generated)
- Session Secret (auto-generated)
- Cognito User Pool ID
- Cognito Client ID
- Athena Output Location

### Container Infrastructure
- ECR Repository (with lifecycle policy)
- ECS Cluster (Fargate)
- ECS Task Definition
- ECS Service

### Load Balancing
- Application Load Balancer
- Target Group (with health checks)
- HTTP Listener (redirects to HTTPS)
- HTTP Direct Listener (port 8080, for initial setup)

### IAM Roles
- ECS Task Execution Role
- ECS Task Role (with AWS service permissions)
- CodeBuild Role
- CodePipeline Role

### CI/CD
- S3 Artifact Bucket
- CodeBuild Project

### Monitoring
- CloudWatch Log Group (30-day retention)
- CPU Utilization Alarm
- Memory Utilization Alarm
- ALB 5XX Error Alarm
- RDS CPU Alarm

### DNS (Optional)
- Route 53 A Record (if DomainName provided)

## Post-Deployment Steps

### 1. Configure HTTPS

After deployment, request an ACM certificate:

```bash
aws acm request-certificate \
  --domain-name dc4ai.yourdomain.com \
  --validation-method DNS \
  --region eu-central-1
```

Then update the template to uncomment the HTTPS listener and redeploy.

### 2. Set Up CodePipeline

1. Create a CodeStar connection in the AWS Console:
   - Go to Developer Tools > Settings > Connections
   - Create connection to GitHub/GitLab

2. Uncomment the CodePipeline resource in the template and add your connection ARN

3. Update the stack

### 3. Configure SNS for Alarms

Create an SNS topic for alarm notifications and add the ARN to the alarms.

## Stack Operations

### Check Stack Status

```bash
aws cloudformation describe-stacks \
  --stack-name dc4ai-production \
  --region eu-central-1
```

### View Stack Events

```bash
aws cloudformation describe-stack-events \
  --stack-name dc4ai-production \
  --region eu-central-1
```

### Delete Stack

```bash
aws cloudformation delete-stack \
  --stack-name dc4ai-production \
  --region eu-central-1
```

**Note:** RDS has deletion protection enabled in production. Disable it first:

```bash
aws rds modify-db-instance \
  --db-instance-identifier dc4ai-production-postgres \
  --no-deletion-protection \
  --region eu-central-1
```

## Cost Optimization Tips

1. **Development environment**: Use `db.t3.micro` and single task
2. **Fargate Spot**: Modify capacity provider to use FARGATE_SPOT for non-critical workloads
3. **NAT Gateway**: Consider NAT instances for dev environments
4. **Reserved Capacity**: Purchase Savings Plans for production workloads

## Troubleshooting

### Stack Creation Failed

Check events for the specific error:

```bash
aws cloudformation describe-stack-events \
  --stack-name dc4ai-production \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]' \
  --region eu-central-1
```

### ECS Tasks Not Starting

1. Check ECS service events
2. Review CloudWatch logs at `/ecs/dc4ai-production`
3. Verify secrets are accessible

### Database Connection Issues

1. Verify security group rules
2. Check RDS is in AVAILABLE state
3. Test connectivity from a bastion host
