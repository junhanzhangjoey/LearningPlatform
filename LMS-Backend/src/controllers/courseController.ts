import { Request, Response } from "express";
import {Course,Module} from "../models/courseModel";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
//import { getAuth } from "@clerk/express";

const s3 = new AWS.S3();

export const listCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.query;
  try {
    const courses =
      category && category !== "all"
        ? await Course.scan("category").eq(category).exec()
        : await Course.scan().exec();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses", error });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error });
  }
};

export const getCourseOfTeacher = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params

  if (!userId) {
    res.status(400).json({ message: 'Missing teacher ID' })
    return;
  }

  try {
    const courses = await Course.query('teacherId')
      .eq(userId)
      .using('teacherIdIndex')
      .exec()

    res.status(200).json(courses)
  } catch (error) {
    console.error('Error fetching teacher courses:', error)
    res.status(500).json({
    message: 'Failed to fetch courses',
    error: error instanceof Error ? error.message : error,
})
  }
}


export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teacherId, teacherName } = req.body;

    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Teacher Id and name are required" });
      return;
    }

    const newCourse = await Course.create({
      courseId: uuidv4(),
      teacherId,
      teacherName,
      title: "Untitled Course",
      description: "",
      category: "Uncategorized",
      image: "",
      price: 0,
      level: "Beginner",
      status: "Draft",
      enrollments: [],
    });

    res.json({ message: "Course created successfully", data: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const updateData = { ...req.body };
//  const { userId } = getAuth(req);


  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }


    // if (course.teacherId !== userId) {
    //   res
    //     .status(403)
    //     .json({ message: "Not authorized to update this course " });
    //   return;
    // }

    if (updateData.price) {
      const price = parseInt(updateData.price);
      if (isNaN(price)) {
        res.status(400).json({
          message: "Invalid price format",
          error: "Price must be a valid number",
        });
        return;
      }
      updateData.price = price * 100;
    }
    Object.assign(course, updateData);
    await course.save();

    res.json({ message: "Course updated successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};
export const deleteCourse = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { courseId } = req.params;
//    const { userId } = getAuth(req);
  
    try {
      const course = await Course.get(courseId);
      if (!course) {
        res.status(404).json({ message: "Course not found" });
        return;
      }
  
    //   if (course.teacherId !== userId) {
    //     res
    //       .status(403)
    //       .json({ message: "Not authorized to delete this course " });
    //     return;
    //   }
  
      await Course.delete(courseId);
  
      res.json({ message: "Course deleted successfully", data: course });
    } catch (error) {
      res.status(500).json({ message: "Error deleting course", error });
    }
};


export const getUploadVideoUrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { fileName, fileType } = req.body;
  
    if (!fileName || !fileType) {
      res.status(400).json({ message: "File name and type are required" });
      return;
    }
  
    try {
      const uniqueId = uuidv4();
      const s3Key = `videos/${uniqueId}/${fileName}`;
  
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: s3Key,
        Expires: 60,
        ContentType: fileType,
      };
  
      const uploadUrl = s3.getSignedUrl("putObject", s3Params);
      const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${fileName}`;
  
      res.json({
        message: "Upload URL generated successfully",
        data: { uploadUrl, videoUrl },
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating upload URL", error });
    }
  };


