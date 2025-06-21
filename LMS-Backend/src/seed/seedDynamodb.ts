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
        waitForActive: true,
        throughput: { read: 5, write: 5 },
      });
  
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await table.initialize();
        console.log(`Table created and initialized: ${tableName}`);
        
        // Wait longer for indexes to be fully active in DynamoDB Local
        if (tableName === "Progress") {
          console.log("Waiting for Progress table indexes to be fully active...");
          await new Promise((resolve) => setTimeout(resolve, 10000)); // Increased to 10 seconds
          console.log("Progress table indexes should now be active");
        }
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
      } catch (err) {
        console.error(
          `Unable to add item to ${formattedTableName}. Error:`,
          JSON.stringify(err, null, 2)
        );
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
  
  export default async function seed() {
    await deleteAllTables();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await createTables();
  
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