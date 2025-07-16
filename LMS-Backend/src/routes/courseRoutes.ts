import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {getCourse, listCourses, updateCourse,createCourse,deleteCourse,getCourseOfTeacher, getUploadVideoUrl} from "../controllers/courseController";
import {getCourseModules} from "../controllers/moduleController";
//import{requireAuth} from "@clerk/express";

const router = express.Router();

// 配置本地文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/videos');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 使用原始文件名
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.get("/",listCourses);
router.post("/",createCourse);
//router.post("/", requireAuth(), createCourse);

router.get("/teacher/:userId",getCourseOfTeacher);

router.get("/:courseId",getCourse)
router.put("/:courseId",upload.single("image"), updateCourse);
//router.put("/:courseId", requireAuth(), upload.single("image"), updateCourse);

router.delete("/:courseId",deleteCourse);
//router.delete("/:courseId", requireAuth(), deleteCourse);

router.get("/:courseId/modules",getCourseModules);
//router.patch("/:courseId/modules",reorderAndAddModules);

// 视频上传路由
router.post("/upload/video-url", getUploadVideoUrl);

// 本地文件上传路由
router.post("/upload/local/:uniqueId/:fileName", upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    
    res.json({ 
      message: "File uploaded successfully",
      filename: req.file.filename,
      path: req.file.path
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error });
  }
});

// 静态文件服务
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

export default router;