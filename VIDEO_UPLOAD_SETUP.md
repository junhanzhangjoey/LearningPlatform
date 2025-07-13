# 视频上传功能设置指南

## 概述

这个 LMS 平台现在支持真正的视频上传功能，包括：
- 拖拽上传视频文件
- 自动上传到 AWS S3
- 自定义视频播放器
- 支持多种视频格式

## 环境变量配置

在根目录创建 `.env` 文件，添加以下配置：

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-lms-video-bucket
CLOUDFRONT_DOMAIN=https://your-cloudfront-domain.cloudfront.net

# 其他现有配置
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DYNAMODB_ENDPOINT=http://dynamodb-local:8000
```

## AWS S3 设置

### 1. 创建 S3 存储桶

1. 登录 AWS 控制台
2. 进入 S3 服务
3. 创建新的存储桶，名称如：`your-lms-video-bucket`
4. 选择区域（建议与你的应用在同一区域）
5. 配置存储桶权限：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-lms-video-bucket/*"
        }
    ]
}
```

### 2. 创建 IAM 用户

1. 进入 IAM 服务
2. 创建新用户
3. 附加以下策略：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-lms-video-bucket/*"
        }
    ]
}
```

4. 生成访问密钥和秘密密钥

### 3. CloudFront 设置（可选，用于 CDN）

1. 创建 CloudFront 分发
2. 源域选择你的 S3 存储桶
3. 配置缓存行为
4. 获取分发域名

## 功能特性

### 视频上传组件 (VideoUpload)

- 支持拖拽上传
- 文件类型验证（仅视频文件）
- 文件大小限制（100MB）
- 上传进度显示
- 预览当前视频

### 视频播放器 (VideoPlayer)

- 自定义控制栏
- 播放/暂停控制
- 进度条拖拽
- 音量控制
- 全屏支持
- 时间显示

### 支持的视频格式

- MP4
- WebM
- OGG
- 其他浏览器支持的格式

## 使用方法

### 教师端

1. 进入课程编辑页面
2. 选择或创建视频模块
3. 使用视频上传组件上传视频
4. 保存模块

### 学生端

1. 进入课程学习页面
2. 点击视频模块展开
3. 使用视频播放器观看视频
4. 完成模块后标记为已完成

## 技术实现

### 前端

- `VideoUpload.tsx`: 视频上传组件
- `VideoPlayer.tsx`: 视频播放组件
- `api/upload/video-url/route.ts`: 上传 URL 获取 API

### 后端

- `config/aws.ts`: AWS 配置
- `controllers/courseController.ts`: 视频上传处理
- `routes/courseRoutes.ts`: 视频上传路由

### 上传流程

1. 用户选择视频文件
2. 前端调用后端获取预签名上传 URL
3. 前端直接上传到 S3
4. 上传完成后更新模块信息

## 故障排除

### 常见问题

1. **上传失败**
   - 检查 AWS 凭证是否正确
   - 确认 S3 存储桶权限设置
   - 验证文件大小是否超限

2. **视频无法播放**
   - 检查 CORS 设置
   - 确认存储桶公共读取权限
   - 验证视频格式是否支持

3. **环境变量问题**
   - 确认 `.env` 文件在根目录
   - 检查 Docker Compose 环境变量配置
   - 重启容器以加载新配置

### 调试步骤

1. 检查后端日志：
```bash
docker-compose logs backend
```

2. 检查前端日志：
```bash
docker-compose logs frontend
```

3. 验证 S3 连接：
```bash
# 在容器内测试
docker-compose exec backend node -e "
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
s3.listBuckets((err, data) => {
  if (err) console.log('Error:', err);
  else console.log('Buckets:', data.Buckets.map(b => b.Name));
});
"
```

## 安全考虑

1. **文件类型验证**: 仅允许视频文件上传
2. **文件大小限制**: 防止过大文件上传
3. **预签名 URL**: 临时访问权限，提高安全性
4. **CORS 配置**: 限制跨域访问
5. **IAM 权限**: 最小权限原则

## 性能优化

1. **CDN 加速**: 使用 CloudFront 分发视频
2. **视频压缩**: 建议上传前压缩视频
3. **分片上传**: 大文件支持分片上传（待实现）
4. **缓存策略**: 合理的缓存设置 