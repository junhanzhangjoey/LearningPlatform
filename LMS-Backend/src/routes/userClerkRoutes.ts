import express from "express";
import { updateUser,getAllUsers,getAllStudents} from "../controllers/userClerkController";

const router = express.Router();

router.get("/",getAllUsers);
router.get("/students",getAllStudents);
router.put("/:userId", updateUser);

export default router;