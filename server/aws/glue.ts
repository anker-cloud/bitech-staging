import {
  GlueClient,
  GetDatabasesCommand,
  GetTablesCommand,
  GetTableCommand,
} from "@aws-sdk/client-glue";
import { DATA_SOURCES } from "@shared/schema";

const client = new GlueClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const isDemoMode = process.env.DEMO_MODE === "true" || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY;

const DEMO_SCHEMAS: Record<string, TableColumn[]> = {
  "crime-data-db": [
    { name: "incident_id", type: "string" },
    { name: "incident_date", type: "timestamp" },
    { name: "incident_type", type: "string" },
    { name: "location", type: "string" },
    { name: "district", type: "string" },
    { name: "severity", type: "int" },
    { name: "status", type: "string" },
    { name: "reported_by", type: "string" },
  ],
  "events-data-db": [
    { name: "event_id", type: "string" },
    { name: "event_name", type: "string" },
    { name: "event_date", type: "timestamp" },
    { name: "venue", type: "string" },
    { name: "category", type: "string" },
    { name: "attendees", type: "int" },
    { name: "organizer", type: "string" },
    { name: "status", type: "string" },
  ],
  "traffic-data-db": [
    { name: "record_id", type: "string" },
    { name: "timestamp", type: "timestamp" },
    { name: "intersection", type: "string" },
    { name: "vehicle_count", type: "int" },
    { name: "average_speed", type: "double" },
    { name: "congestion_level", type: "string" },
    { name: "weather_condition", type: "string" },
  ],
  "weather-data-db": [
    { name: "observation_id", type: "string" },
    { name: "observation_time", type: "timestamp" },
    { name: "station", type: "string" },
    { name: "temperature", type: "double" },
    { name: "humidity", type: "double" },
    { name: "wind_speed", type: "double" },
    { name: "precipitation", type: "double" },
    { name: "conditions", type: "string" },
  ],
  "insurance-data-db": [
    { name: "claim_id", type: "string" },
    { name: "claim_date", type: "timestamp" },
    { name: "policy_number", type: "string" },
    { name: "claim_type", type: "string" },
    { name: "amount", type: "double" },
    { name: "status", type: "string" },
    { name: "customer_id", type: "string" },
    { name: "region", type: "string" },
  ],
};

export interface TableColumn {
  name: string;
  type: string;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
}

export interface DataSourceSchema {
  dataSourceId: string;
  tables: TableInfo[];
}

export async function getDataSourceSchemas(): Promise<DataSourceSchema[]> {
  const schemas: DataSourceSchema[] = [];

  for (const dataSource of DATA_SOURCES) {
    if (isDemoMode) {
      const demoColumns = DEMO_SCHEMAS[dataSource.id] || [
        { name: "id", type: "string" },
        { name: "created_at", type: "timestamp" },
        { name: "data", type: "string" },
      ];
      schemas.push({
        dataSourceId: dataSource.id,
        tables: [{
          name: dataSource.id.replace("-data-db", ""),
          columns: demoColumns,
        }],
      });
      continue;
    }

    try {
      const tablesCommand = new GetTablesCommand({
        DatabaseName: dataSource.id,
      });

      const tablesResponse = await client.send(tablesCommand);
      const tables: TableInfo[] = [];

      for (const table of tablesResponse.TableList || []) {
        const columns: TableColumn[] = (table.StorageDescriptor?.Columns || []).map(col => ({
          name: col.Name || "",
          type: col.Type || "string",
        }));

        tables.push({
          name: table.Name || "",
          columns,
        });
      }

      schemas.push({
        dataSourceId: dataSource.id,
        tables,
      });
    } catch (error) {
      schemas.push({
        dataSourceId: dataSource.id,
        tables: [{
          name: dataSource.id.replace("-data-db", ""),
          columns: [
            { name: "id", type: "string" },
            { name: "created_at", type: "timestamp" },
            { name: "data", type: "string" },
          ]
        }],
      });
    }
  }

  return schemas;
}

export async function getTableColumns(databaseName: string, tableName: string): Promise<TableColumn[]> {
  try {
    const command = new GetTableCommand({
      DatabaseName: databaseName,
      Name: tableName,
    });

    const response = await client.send(command);
    
    return (response.Table?.StorageDescriptor?.Columns || []).map(col => ({
      name: col.Name || "",
      type: col.Type || "string",
    }));
  } catch (error) {
    return [
      { name: "id", type: "string" },
      { name: "created_at", type: "timestamp" },
      { name: "data", type: "string" },
    ];
  }
}

export async function getDataSourceColumns(dataSourceId: string): Promise<TableColumn[]> {
  const schemas = await getDataSourceSchemas();
  const schema = schemas.find(s => s.dataSourceId === dataSourceId);
  
  if (!schema || schema.tables.length === 0) {
    return [];
  }

  return schema.tables[0].columns;
}
