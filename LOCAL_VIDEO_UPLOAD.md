# 本地视频上传功能（免费方案）

## 概述

这个方案允许你在不配置 AWS S3 的情况下使用视频上传功能。视频文件会存储在本地服务器上，完全免费。

## 配置

### 1. 环境变量

创建 `.env` 文件，只需要基础配置：

```env
# 基础配置
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DYNAMODB_ENDPOINT=http://dynamodb-local:8000

# 不需要配置 AWS 相关变量
# 系统会自动检测并使用本地存储
```

### 2. 文件存储位置

视频文件会存储在：
- 容器内：`/app/uploads/videos/`
- 主机：`./uploads/videos/`（通过 Docker 卷映射）

## 功能特性

### ✅ 支持的功能
- 拖拽上传视频文件
- 文件类型验证（仅视频文件）
- 文件大小限制（100MB）
- 上传进度显示
- 视频预览
- 自定义视频播放器
- 支持多种视频格式（MP4, WebM, OGG等）

### ⚠️ 限制
- 视频文件存储在本地，重启容器后文件会保留
- 不适合生产环境（文件会占用服务器存储空间）
- 没有 CDN 加速
- 不支持分布式部署

## 使用方法

### 1. 启动应用

```bash
docker-compose up --build
```

### 2. 教师端上传视频

1. 进入课程编辑页面
2. 选择或创建视频模块
3. 使用视频上传组件上传视频
4. 保存模块

### 3. 学生端观看视频

1. 进入课程学习页面
2. 点击视频模块展开
3. 使用视频播放器观看视频
4. 完成模块后标记为已完成

## 技术实现

### 自动检测机制

系统会自动检测环境变量：
- 如果没有配置 `S3_BUCKET_NAME` 或 `AWS_ACCESS_KEY_ID`，使用本地存储
- 如果配置了 AWS 相关变量，使用 S3 存储

### 上传流程

1. 用户选择视频文件
2. 前端调用后端获取上传 URL
3. 后端检测存储方式，返回相应的上传端点
4. 前端上传文件到本地服务器
5. 文件存储在 `uploads/videos/` 目录
6. 返回可访问的视频 URL

### 文件访问

上传的视频可以通过以下 URL 访问：
```
http://localhost:3001/uploads/videos/{uniqueId}/{filename}
```

## 文件管理

### 查看上传的文件

```bash
# 查看主机上的文件
ls -la ./uploads/videos/

# 查看容器内的文件
docker-compose exec backend ls -la /app/uploads/videos/
```

### 清理文件

```bash
# 清理主机上的文件
rm -rf ./uploads/videos/*

# 清理容器内的文件
docker-compose exec backend rm -rf /app/uploads/videos/*
```

## 故障排除

### 常见问题

1. **上传失败**
   - 检查文件大小是否超过 100MB
   - 确认文件类型是视频格式
   - 检查容器日志：`docker-compose logs backend`

2. **视频无法播放**
   - 确认文件已成功上传到 `uploads/videos/` 目录
   - 检查文件权限
   - 验证视频格式是否支持

3. **存储空间不足**
   - 定期清理不需要的视频文件
   - 监控 `uploads/` 目录大小

### 调试步骤

1. 检查后端日志：
```bash
docker-compose logs backend
```

2. 检查文件是否上传成功：
```bash
docker-compose exec backend ls -la /app/uploads/videos/
```

3. 测试文件访问：
```bash
curl http://localhost:3001/uploads/videos/{filename}
```

## 升级到 AWS S3

当你准备好使用 AWS S3 时：

1. 配置 AWS 环境变量
2. 创建 S3 存储桶
3. 设置 IAM 权限
4. 重启应用

系统会自动切换到 S3 存储，无需修改代码。

## 优势

- ✅ 完全免费
- ✅ 无需 AWS 配置
- ✅ 快速开始
- ✅ 适合开发和测试
- ✅ 文件持久化（通过 Docker 卷映射）

## 劣势

- ❌ 不适合生产环境
- ❌ 文件占用服务器存储空间
- ❌ 没有 CDN 加速
- ❌ 不支持分布式部署
- ❌ 备份和恢复复杂 