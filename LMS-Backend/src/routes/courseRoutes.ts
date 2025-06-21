import express from "express";
import multer from "multer";
import {getCourse, listCourses, updateCourse,createCourse,deleteCourse,getCourseOfTeacher} from "../controllers/courseController";
import {getCourseModules, reorderAndAddModules} from "../controllers/moduleController";
//import{requireAuth} from "@clerk/express";

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});//for uploading video

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

// router.post(
//     "/:courseId/lessons/:lessonId/get-upload-url",
//     requireAuth(),
//     getUploadVideoUrl
//   );
export default router;