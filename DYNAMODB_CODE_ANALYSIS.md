# AWS DynamoDB 代码详细分析

## 📋 项目概述
这个学习平台项目使用 AWS DynamoDB 作为数据库，通过 Dynamoose ORM 进行数据操作。项目支持本地开发和生产环境两种模式。

---

## 🏗️ 1. 主配置文件 (src/index.ts)

### 导入部分
```typescript
import * as dynamoose from "dynamoose";
```
**作用**: 导入 Dynamoose ORM 库，用于简化 DynamoDB 操作

### 环境配置
```typescript
const isProduction = process.env.NODE_ENV == "production";
```
**作用**: 判断当前运行环境，决定连接本地还是 AWS DynamoDB

### 开发环境配置
```typescript
if(!isProduction){
    const ddb = new dynamoose.aws.ddb.DynamoDB({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
        },
        region: process.env.AWS_REGION || "us-west-1",
        endpoint: process.env.DYNAMODB_ENDPOINT || "http://dynamodb-local:8000"
    });
    dynamoose.aws.ddb.set(ddb);
}
```
**逐行解释**:
- `const ddb = new dynamoose.aws.ddb.DynamoDB({...})`: 创建 DynamoDB 客户端实例
- `credentials`: 设置认证信息（开发环境使用假凭证）
- `region`: 设置 AWS 区域
- `endpoint`: 设置本地 DynamoDB 端点
- `dynamoose.aws.ddb.set(ddb)`: 将客户端实例设置为 Dynamoose 的默认客户端

### 生产环境配置
```typescript
} else {
    const ddb = new dynamoose.aws.ddb.DynamoDB({
        region: process.env.AWS_REGION || "us-west-1",
        // 不要设置 endpoint
    });
    dynamoose.aws.ddb.set(ddb);
}
```
**逐行解释**:
- 不设置 `endpoint`，自动连接 AWS DynamoDB
- 不设置 `credentials`，使用 AWS IAM 角色或环境变量

---

## ⚙️ 2. AWS 配置文件 (src/config/aws.ts)

### AWS SDK 配置
```typescript
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy-access-key',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy-secret-key',
  region: process.env.AWS_REGION || 'us-west-1',
});
```
**作用**: 配置 AWS SDK 的全局设置

### 本地开发配置
```typescript
if (process.env.NODE_ENV === 'development' && process.env.DYNAMODB_ENDPOINT) {
  AWS.config.update({
    dynamodb: {
      endpoint: process.env.DYNAMODB_ENDPOINT,
    },
  });
}
```
**作用**: 在开发环境下设置 DynamoDB 本地端点

### 导出实例
```typescript
export const dynamodb = new AWS.DynamoDB();
```
**作用**: 创建并导出 DynamoDB 实例，供其他模块使用

---

## 📊 3. 数据模型定义

### 3.1 课程模型 (src/models/courseModel.ts)

#### 导入
```typescript
import dynamoose,{ Schema, model} from "dynamoose";
```
**作用**: 导入 Dynamoose 的核心组件

#### 用户模式定义
```typescript
const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
});
```
**作用**: 定义课程中用户的基本信息结构

#### 评论模式定义
```typescript
const commentSchema = new Schema({
  commentId: { type: String, required: true },
  userId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
});
```
**作用**: 定义模块评论的数据结构

#### 模块模式定义
```typescript
const moduleSchema = new Schema({
  moduleId: {
    type: String,
    hashKey: true,  // 主键
    required: true,
  },
  courseId: {
    type: String,
    required: true,
    index: {
      name: "courseIdIndex",
      type: "global"  // 全局二级索引
    }
  },
  type: {
    type: String,
    enum: ["Text","Video"],  // 枚举值
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  comments: { type: Array, schema: [commentSchema] },
  moduleVideo: { type: String },
  order: { type: Number, required: true }
});
```
**逐行解释**:
- `hashKey: true`: 设置为主键
- `index`: 创建全局二级索引，用于按 courseId 查询
- `enum`: 限制字段值只能是 "Text" 或 "Video"
- `schema: [commentSchema]`: 数组中的每个元素都遵循 commentSchema 结构

#### 课程模式定义
```typescript
const courseSchema = new Schema({
  courseId: {
    type: String,
    hashKey: true,  // 主键
    required: true,
  },
  teacherId: {
    type: String,
    required: true,
    index: {
      name: 'teacherIdIndex',
      type: 'global'  // 全局二级索引
    },
  },
  teacherName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  image: { type: String },
  price: { type: Number },
  level: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  status: {
    type: String,
    required: true,
    enum: ["Draft", "Published"],
  },
  enrollments: {
    type: Array,
    schema: [userSchema],
  },
}, {
  timestamps: true,  // 自动添加 createdAt 和 updatedAt
});
```

#### 模型创建
```typescript
const isProduction = process.env.NODE_ENV === "production";

const Course = dynamoose.model("Course", courseSchema, isProduction?{}:{
  create: true,   // 自动创建表
  update: true    // 自动更新表结构
});

const Module = dynamoose.model("Module", moduleSchema, isProduction?{}:{
  create: true,
  update: true
});
```
**逐行解释**:
- `dynamoose.model()`: 创建 Dynamoose 模型
- `create: true`: 如果表不存在，自动创建
- `update: true`: 如果表结构变化，自动更新

### 3.2 用户模型 (src/models/userModel.ts)

```typescript
const userSchema = new Schema({
  userId: {
    type: String,
    hashKey: true,  // 主键
    required: true,
  },
  role: {
    type: String,
    enum: ["Student","Teacher","Manager","Admin"],
    required: true,
  },
});

const User = model("User", userSchema);
```
**作用**: 定义用户的基本信息，包括用户ID和角色

### 3.3 进度模型 (src/models/userProgressModel.ts)

#### 模块状态模式
```typescript
const moduleStatus = new Schema({
  moduleId: { type: String, required: true },
  completed: { type: Boolean, required: true }
});
```
**作用**: 定义单个模块的完成状态

#### 用户课程进度模式
```typescript
const userCourse = new Schema({
  userId: {
    type: String,
    hashKey: true,  // 分区键
    required: true,
  },
  courseId: {
    type: String,
    required: true,
    rangeKey: true,  // 排序键，与 userId 组成复合主键
    index: {
      name: "courseIdIndex",
      type: "global"
    }
  },
  courseTitle: { type: String, required: true },
  progressPercentage: { type: Number, required: true },
  modules: {
    type: Array,
    schema: [moduleStatus],  // 数组中的每个元素都是 moduleStatus 结构
  }
});
```
**逐行解释**:
- `hashKey: true`: 设置 userId 为分区键
- `rangeKey: true`: 设置 courseId 为排序键
- 复合主键: (userId, courseId) 唯一标识一个用户的课程进度
- `schema: [moduleStatus]`: 模块数组，每个元素包含模块ID和完成状态

#### 模型创建
```typescript
const Progress = dynamoose.model("Progress", userCourse, isProduction?{}:{
  create: true,
  update: true
});
```

---

## 🌱 4. 数据库初始化脚本 (src/seed/seedDynamodb.ts)

### 导入部分
```typescript
import {
  DynamoDB,
  DeleteTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import dynamoose from "dynamoose";
```
**作用**: 导入 AWS SDK 和 Dynamoose 用于数据库管理

### 客户端配置
```typescript
let client: DynamoDB;

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
```
**作用**: 根据环境创建 DynamoDB 客户端

### 警告抑制
```typescript
const originalWarn = console.warn.bind(console);
console.warn = (message, ...args) => {
  if (!message.includes("Tagging is not currently supported in DynamoDB Local")) {
    originalWarn(message, ...args);
  }
};
```
**作用**: 抑制 DynamoDB Local 不支持标签的警告信息

### 表创建函数
```typescript
async function createTables() {
  const models = [Progress, Course, Module, User];

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
      
      await waitForIndexesActive(tableName, client, 60000);
      console.log(`${tableName} table indexes should now be active`);
    } catch (error: any) {
      console.error(`Error creating table ${tableName}:`, error.message, error.stack);
    }
  }
}
```
**逐行解释**:
- `const models = [Progress, Course, Module, User]`: 定义要创建的所有模型
- `new dynamoose.Table()`: 创建表实例
- `waitForActive`: 等待表激活
- `throughput`: 设置读写容量单位
- `table.initialize()`: 初始化表
- `waitForIndexesActive()`: 等待索引激活

### 数据填充函数
```typescript
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
      if (err.name === 'ConditionalCheckFailedException') {
        console.log(`Item already exists in ${formattedTableName}, skipping...`);
      } else {
        console.error(`Unable to add item to ${formattedTableName}. Error:`, JSON.stringify(err, null, 2));
      }
    }
  }
}
```
**逐行解释**:
- `JSON.parse(fs.readFileSync(filePath, "utf8"))`: 读取 JSON 文件并解析
- `pluralize.singular()`: 将表名转换为单数形式
- `dynamoose.model(formattedTableName).create(item)`: 创建数据记录
- 错误处理: 跳过重复数据，记录其他错误

### 表删除函数
```typescript
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
```
**作用**: 删除指定的 DynamoDB 表

### 删除所有表函数
```typescript
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
```
**逐行解释**:
- `ListTablesCommand`: 列出所有表
- `client.send(listTablesCommand)`: 执行命令
- 循环删除每个表
- `setTimeout`: 等待 800ms 避免删除过快

### 索引等待函数
```typescript
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
```
**逐行解释**:
- `client.describeTable()`: 获取表描述信息
- `GlobalSecondaryIndexes`: 获取全局二级索引列表
- `every(idx => idx.IndexStatus === "ACTIVE")`: 检查所有索引是否激活
- 超时机制: 60秒后抛出错误

### 主函数
```typescript
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
```
**逐行解释**:
- 开发环境: 删除所有表，重新创建
- 生产环境: 只填充数据，不删除表
- `readdirSync()`: 读取数据目录
- `filter()`: 只处理 JSON 文件
- `basename(file, ".json")`: 提取表名

---

## 🎮 5. 控制器中的 DynamoDB 操作

### 5.1 课程控制器 (src/controllers/courseController.ts)

#### 列出课程
```typescript
const courses = category && category !== "all"
  ? await Course.scan("category").eq(category).exec()
  : await Course.scan().exec();
```
**作用**: 扫描课程表，支持按分类筛选

#### 获取单个课程
```typescript
const course = await Course.get(courseId);
```
**作用**: 根据主键获取课程

#### 查询教师课程
```typescript
const courses = await Course.query('teacherId')
  .eq(userId)
  .using('teacherIdIndex')
  .exec()
```
**逐行解释**:
- `Course.query('teacherId')`: 按 teacherId 查询
- `.eq(userId)`: 等于指定用户ID
- `.using('teacherIdIndex')`: 使用全局二级索引
- `.exec()`: 执行查询

#### 创建课程
```typescript
const newCourse = await Course.create({
  courseId: uuidv4(),
  teacherId,
  teacherName,
  title: "Untitled Course",
  // ... 其他字段
});
```
**作用**: 创建新课程记录

#### 更新课程
```typescript
const course = await Course.get(courseId);
Object.assign(course, updateData);
await course.save();
```
**作用**: 获取课程，更新数据，保存

#### 删除课程
```typescript
await Course.delete(courseId);
```
**作用**: 根据主键删除课程

### 5.2 模块控制器 (src/controllers/moduleController.ts)

#### 查询课程模块
```typescript
const modules = await Module.query("courseId")
  .using("courseIdIndex")
  .eq(courseId)
  .exec();
```
**作用**: 使用索引查询指定课程的所有模块

#### 批量保存模块
```typescript
await Module.batchPut(modulesToSave);
```
**作用**: 批量插入或更新模块

#### 创建模块
```typescript
const newModule = await Module.create({
  moduleId: module.moduleId || uuidv4(),
  courseId: module.courseId,
  title: module.title,
  content: module.content,
  type: module.type,
  moduleVideo: module.moduleVideo || "",
  comments: module.comments || [],
  order: maxOrder + 1
});
```
**作用**: 创建新模块，自动生成顺序号

### 5.3 进度控制器 (src/controllers/userProgressController.ts)

#### 查询用户进度
```typescript
const progresses = await Progress.query("userId")
  .eq(userId)
  .exec();
```
**作用**: 查询指定用户的所有课程进度

#### 获取特定进度
```typescript
const existing = await Progress.get({ userId, courseId });
```
**作用**: 使用复合主键获取特定进度

#### 创建进度记录
```typescript
const newProgress = await Progress.create({
  userId,
  courseId,
  courseTitle: courses[0].title,
  progressPercentage: 0,
  modules: modules.map(m => ({
    moduleId: m.moduleId,
    completed: false
  }))
});
```
**作用**: 创建新的学习进度记录

#### 更新模块完成状态
```typescript
const progress = await Progress.get({ userId, courseId });
const existingModule = progress.modules.find((mod: any) => mod.moduleId === moduleId);
existingModule.completed = true;

const total = progress.modules.length;
const completedCount = progress.modules.filter((m: any) => m.completed).length;
progress.progressPercentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

await progress.save();
```
**逐行解释**:
- 获取进度记录
- 找到指定模块并标记为完成
- 计算完成百分比
- 保存更新

---

## 📦 6. 依赖配置 (package.json)

```json
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.758.0",
    "dynamoose": "^4.0.3"
  },
  "scripts": {
    "seed": "ts-node src/seed/seedDynamodb.ts"
  }
}
```
**作用**: 定义项目依赖和脚本命令

---

## 🔧 7. 环境变量配置

### 开发环境 (.env.local)
```bash
NODE_ENV=development
DYNAMODB_ENDPOINT=http://dynamodb-local:8000
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
AWS_REGION=us-west-1
```

### 生产环境 (.env.production)
```bash
NODE_ENV=production
AWS_ACCESS_KEY_ID=your_real_aws_key
AWS_SECRET_ACCESS_KEY=your_real_aws_secret
AWS_REGION=us-west-1
```

---

## 🎯 总结

这个项目展示了完整的 DynamoDB 使用模式：

1. **环境适配**: 支持本地开发和生产环境
2. **ORM 使用**: 通过 Dynamoose 简化数据操作
3. **索引设计**: 使用全局二级索引优化查询
4. **数据管理**: 完整的 CRUD 操作
5. **初始化脚本**: 自动化的数据库设置

每个代码段都有明确的职责，形成了完整的数据库操作体系。 