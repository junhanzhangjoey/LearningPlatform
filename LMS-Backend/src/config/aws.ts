import AWS from 'aws-sdk';

// 配置AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy-access-key',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy-secret-key',
  region: process.env.AWS_REGION || 'us-west-1',
});

// 如果是本地开发，使用本地DynamoDB
if (process.env.NODE_ENV === 'development' && process.env.DYNAMODB_ENDPOINT) {
  AWS.config.update({
    dynamodb: {
      endpoint: process.env.DYNAMODB_ENDPOINT,
    },
  });
}

// 创建S3实例
export const s3 = new AWS.S3();

// 创建DynamoDB实例
export const dynamodb = new AWS.DynamoDB();

// 导出AWS配置
export default AWS; 