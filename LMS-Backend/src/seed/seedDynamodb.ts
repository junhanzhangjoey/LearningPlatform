import {
  DynamoDB,
  DeleteTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import fs from "fs";
import path from "path";
import dynamoose from "dynamoose";
import pluralize from "pluralize";
import { Course, Module} from "../models/courseModel";
import Progress from "../models/userProgressModel";
import User from "../models/userModel";
import dotenv from "dotenv";

dotenv.config();
let client: DynamoDB;

/* DynamoDB Configuration */
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  const ddb = new DynamoDB({
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://dynamodb-local:8000",
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: "dummyKey123",
      secretAccessKey: "dummyKey123",
    },
  });
  dynamoose.aws.ddb.set(ddb);
  client = ddb;
} else {
  client = new DynamoDB({
    region: process.env.AWS_REGION || "us-east-2",
  });
}

/* DynamoDB Suppress Tag Warnings */
const originalWarn = console.warn.bind(console);
console.warn = (message, ...args) => {
  if (
    !message.includes("Tagging is not currently supported in DynamoDB Local")
  ) {
    originalWarn(message, ...args);
  }
};

async function createTables() {
  const models = [Progress, Course, Module,User];

  for (const model of models) {
    const tableName = model.name;
    const table = new dynamoose.Table(tableName, [model], {
      create: true,
      update: true,
      waitForActive: {
        enabled: true,
        check: {
          timeout: 30000,
          frequency: 500,
        },
      },
      throughput: { read: 5, write: 5 },
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await table.initialize();
      console.log(`Table created and initialized: ${tableName}`);
      
      // 主动检测索引状态，确保所有 GSI 都变为 ACTIVE
      await waitForIndexesActive(tableName, client, 60000);
      console.log(`${tableName} table indexes should now be active`);
    } catch (error: any) {
      console.error(
        `Error creating table ${tableName}:`,
        error.message,
        error.stack
      );
    }
  }
}

async function seedData(tableName: string, filePath: string) {
  const data: { [key: string]: any }[] = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  const formattedTableName = pluralize.singular(
    tableName.charAt(0).toUpperCase() + tableName.slice(1)
  );

  console.log(`Seeding data to table: ${formattedTableName}`);

  for (const item of data) {
    try {
      await dynamoose.model(formattedTableName).create(item);
    } catch (err: any) {
      // 检查是否是重复插入错误
      if (err.name === 'ConditionalCheckFailedException') {
        console.log(`Item already exists in ${formattedTableName}, skipping...`);
      } else {
        console.error(
          `Unable to add item to ${formattedTableName}. Error:`,
          JSON.stringify(err, null, 2)
        );
      }
    }
  }

  console.log(
    "\x1b[32m%s\x1b[0m",
    `Successfully seeded data to table: ${formattedTableName}`
  );
}

async function deleteTable(baseTableName: string) {
  let deleteCommand = new DeleteTableCommand({ TableName: baseTableName });
  try {
    await client.send(deleteCommand);
    console.log(`Table deleted: ${baseTableName}`);
  } catch (err: any) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`Table does not exist: ${baseTableName}`);
    } else {
      console.error(`Error deleting table ${baseTableName}:`, err);
    }
  }
}

async function deleteAllTables() {
  const listTablesCommand = new ListTablesCommand({});
  const { TableNames } = await client.send(listTablesCommand);

  if (TableNames && TableNames.length > 0) {
    for (const tableName of TableNames) {
      await deleteTable(tableName);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
}

async function waitForIndexesActive(tableName: string, client: DynamoDB, timeout = 60000) {
  const start = Date.now();
  while (true) {
    const desc = await client.describeTable({ TableName: tableName });
    const gsis = desc.Table?.GlobalSecondaryIndexes || [];
    const allActive = gsis.every(idx => idx.IndexStatus === "ACTIVE");
    if (allActive) break;
    if (Date.now() - start > timeout) throw new Error("Timeout waiting for indexes to be ACTIVE");
    await new Promise(res => setTimeout(res, 1000));
  }
}

export default async function seed() {
  if(!isProduction){
    await deleteAllTables();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await createTables();
  }

  const seedDataPath = path.join(__dirname, "./data");
  const files = fs
    .readdirSync(seedDataPath)
    .filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const tableName = path.basename(file, ".json");
    const filePath = path.join(seedDataPath, file);
    await seedData(tableName, filePath);
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error("Failed to run seed script:", error);
  });
}