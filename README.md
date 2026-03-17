# Bitech DC4AI — Data Collection for Artificial Intelligence

A role-based data access platform that enables organisations to query AWS-hosted data sources through a visual query builder or custom SQL interface, with fine-grained permission controls at the column and row level.

## Features

- **Role-based access control** — Admins manage users and roles with granular permissions per data source
- **Visual query builder** — Select columns and apply filters without writing SQL
- **Custom SQL editor** — Write and execute raw SQL against permitted data sources
- **Multi-source JOIN queries** — Query multiple data sources simultaneously via LEFT JOINs
- **Public REST API** — Programmatic data access using API keys
- **AWS-native** — Integrates with Cognito, Athena, Glue, Lake Formation, IAM, and S3

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Auth | AWS Cognito (JWT) |
| Query Engine | AWS Athena |
| Data Catalog | AWS Glue |
| Access Control | AWS Lake Formation, IAM |

## Prerequisites

- Node.js 20+
- PostgreSQL database
- AWS account with the following services configured:
  - Cognito User Pool with `ADMIN_USER_PASSWORD_AUTH` enabled
  - Athena with an S3 output bucket
  - Glue catalog with `bitech_staging_db` / `bitech_prod_db` databases
  - Lake Formation permissions configured

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_ACCOUNT_ID=your_account_id
COGNITO_USER_POOL_ID=your_pool_id
COGNITO_CLIENT_ID=your_client_id
ATHENA_OUTPUT_LOCATION=s3://your-bucket/athena-results/
```

## Getting Started

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`. On first launch, a setup page will guide you through creating the initial admin user.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Sync database schema |

## REST API

The platform exposes a public REST API for programmatic access:

```
GET /api/v1/fetch
```

**Headers:**
- `x-api-key` — API key (generate from the API Keys page)
- `x-data-source` — Data source short name: `crime`, `events`, `insurance`, `traffic`, `weather`
- `Accept` — `application/json` (default) or `text/csv`

**Query Parameters:**
- `columns` — Comma-separated column names (omit for all permitted columns)
- `limit` — Max rows (default: 100, max: 1000)
- Any additional parameter is treated as an equals filter (e.g. `city_name=Berlin`)

## Data Sources

| Short Name | Table | Description |
|---|---|---|
| `crime` | `crime_data_silver` | Crime statistics and incident data |
| `events` | `events_data_silver` | Event scheduling and tracking |
| `insurance` | `policy_claims_data_silver` | Insurance policy and claims data |
| `traffic` | `traffic_data_silver` | Traffic flow and incident data |
| `weather` | `weather_data_silver` | Weather conditions and forecasts |

## Project Structure

```
.
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── server/          # Express backend
│   └── aws/         # AWS service integrations
├── shared/          # Shared types and schema
├── script/          # Build scripts
└── cloudformation/  # AWS infrastructure templates
```
