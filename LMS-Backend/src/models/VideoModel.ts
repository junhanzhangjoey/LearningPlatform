// import { Request, Response } from 'express';
// import { uploadToS3 } from '../utils/s3';
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
// import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
// import { v4 as uuidv4 } from 'uuid';
// const client = new DynamoDBClient({ region: process.env.AWS_REGION });
// const docClient = DynamoDBDocumentClient.from(client);

// export const uploadVideo = async (req: Request, res: Response) => {
//   try {
//     const { title, courseId, moduleId, uploadedBy } = req.body;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ message: 'No video file provided' });
//     }

//     const s3Url = await uploadToS3(file);

//     const videoItem = {
//       videoId: uuidv4(),
//       title,
//       url: s3Url,
//       courseId,
//       moduleId,
//       uploadedBy,
//       uploadedAt: new Date().toISOString(),
//     };

//     await docClient.send(
//       new PutCommand({
//         TableName: 'Videos', 
//         Item: videoItem,
//       })
//     );

//     res.status(201).json({ message: 'Video uploaded and saved to DynamoDB', video: videoItem });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ message: 'Upload failed', error });
//   }
// };
