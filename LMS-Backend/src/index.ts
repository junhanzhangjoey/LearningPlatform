import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";//for safety
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import {
    clerkMiddleware,
    createClerkClient,
    requireAuth,
  } from "@clerk/express";


/*ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";
import progressRoutes from "./routes/progressRoutes";
import moduleRoutes from "./routes/moduleRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";

/*CONFIGURATIONS*/
dotenv.config();

const isProduction=process.env.NODE_ENV=="production";//convinent for testing

if(!isProduction){
    // Configure DynamoDB Local with the correct endpoint
    const ddb = new dynamoose.aws.ddb.DynamoDB({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
        },
        region: process.env.AWS_REGION || "us-east-1",
        endpoint: process.env.DYNAMODB_ENDPOINT || "http://dynamodb-local:8000"
    });
    dynamoose.aws.ddb.set(ddb);
}

export const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
app.use(clerkMiddleware());

/* ROUTES */
app.get("/",(req,res)=>{
    res.send("Hello World")
});

app.use("/courses", requireAuth(),courseRoutes); //any route in courseRoutes are mounted under /courses
app.use("/modules",requireAuth(),moduleRoutes);
app.use("/progress", requireAuth(),progressRoutes); //any route in progressRoutes are mounted under /progress
app.use("/users/clerk", requireAuth(),userClerkRoutes);//we will add back requireAuth() after implement all the feature, use mock userId for now

/* SERVER */
const port=process.env.PORT || 3001;
console.log(`Attempting to start server on port ${port}`)
if(!isProduction){
    app.listen(port,()=>{
        console.log(`Server running on port ${port}`);
    }).on('error', (err: any) => {
        console.error(`Server failed to start on port ${port}:`, err);
        process.exit(1); // Exit with an error code
    });
}