import express from "express";
import {getUserProgress,enrollUserToCourse,updateProgress,getMergedProgressModules,dropUserFromCourse} from "../controllers/userProgressController";

const router = express.Router();
router.get("/:userId",getUserProgress);
router.post("/:userId/:courseId",enrollUserToCourse);
router.post("/drop/:userId/:courseId",dropUserFromCourse);
router.post("/:userId/:courseId/:moduleId",updateProgress);
router.get("/:userId/:courseId",getMergedProgressModules);

export default router;