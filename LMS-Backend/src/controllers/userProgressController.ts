import { Request, Response } from "express";
import Progress from "../models/userProgressModel";
import {Module,Course} from "../models/courseModel";


export const getUserProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;  // retrieve data from front end
  
  // make sure data is existed
  if (!userId) {
    res.status(400).json({ message: "userId are required" });
    return;
  }

  try {
    // find the data that match courseId and userId
    const progresses = await Progress.query("userId")
      .eq(userId)
      .exec();

    // if not found, send message: "not enrolled"
    res.status(200).json(progresses.length > 0 ? progresses : []);
  } catch (error) {
    console.error('Error retrieving progress:', error);
    res.status(500).json({ message: "Error retrieving progress", error });
  }
};

export const enrollUserToCourse = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId } = req.params as { userId: string; courseId: string };
    console.log('userId:', userId);
    console.log('courseId:', courseId);
    if (!userId || !courseId) {
      res.status(400).json({ message: "userId and courseId are required" });
      return;
    }
  
    try {
      // 1. check if the use enrolled
        const existing = await Progress.get({ userId, courseId });

        if (existing) {
            res.status(400).json({ message: "User is already enrolled in this course." });
            return;
        }



        // 2. 获取课程下所有模块
        const modules = await Module.query("courseId").using("courseIdIndex").eq(courseId).exec();

        const courses = await Course.query("courseId").eq(courseId).exec();
        console.log('Modules:', modules);

        if (!courses || courses.length === 0) {
            res.status(404).json({ message: "Course not found." });
            return;
        }

        const courseTitle = courses[0].title;
        console.log('Courses:', courses);
        // const modules = [];

        // modules.push({
        // moduleId: "m1",
        // title: "Introduction to JavaScript",
        // type: "Text",
        // content: "Welcome to the course! Let's get started.",
        // order: 0
        // });


        // if (modules.length === 0) {
        //     res.status(404).json({ message: "No modules found for this course." });
        //     return;
        // }
    
        // 3. 构建初始化模块进度
        const userModules = modules.map(mod => ({
            moduleId: mod.moduleId,
            completed: false,
        }));
    
        // 4. 创建进度记录
        const newProgress = await Progress.create({
            userId,
            courseId,
            courseTitle,
            progressPercentage: 0,
            modules: userModules,
        });

      res.status(201).json({data: newProgress} );
    } catch (error) {
      res.status(500).json({ message: "Error enrolling user", error });
    }
  };

  export const dropUserFromCourse = async (req: Request, res: Response) : Promise<void> => {
    const { userId, courseId } = req.params
  
    if (!userId || !courseId) {
      res.status(400).json({ error: 'Missing userId or courseId' })
    }
  
    try {
      await Progress.delete({ userId, courseId })
  
      const remaining = await Progress.query('userId').eq(userId).exec()
  
      res.status(200).json(remaining)
    } catch (error) {
      console.error('❌ dropUserFromCourse error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }


//when the user complete a module
export const updateProgress = async (req: Request, res: Response): Promise<void> => {
    //console.log("here");
    const { userId, courseId, moduleId } = req.params;
  
    try {
        // 1. 获取用户在课程中的进度记录（用 composite key）
        const progress = await Progress.get({ userId, courseId });
    
        if (!progress) {
            res.status(404).json({ message: "user not enrolled in this courses"});
            return;
        }
    
        // 2. 查找该模块是否已存在于模块列表中
        const existingModule = progress.modules.find((mod: any) => mod.moduleId === moduleId);
        if (!existingModule) {
        res.status(400).json({ message: `Module ${moduleId} does not exist in user's progress.` });
        return;
    }

        // 更新状态
        existingModule.completed = true;

  
      // 3. 计算 progressPercentage
        const total = progress.modules.length;
        const completedCount = progress.modules.filter((m: any) => m.completed).length;
        progress.progressPercentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
    
        // 4. 保存更新
        await progress.save();
    
        res.json({ message: "Progress updated successfully", data: progress });
    } catch (error) {
      res.status(500).json({ message: "Error updating progress", error });
    }
  };


  //every time student load the course and display all the modules, we call this function to maintain the latest version of courses(modules)of user progress table.
  export const getMergedProgressModules = async (req: Request, res: Response):Promise<void> => {
    const { userId, courseId } = req.params;
  
    try {
      const modules = await Module.query("courseId").using("courseIdIndex").eq(courseId).exec();
      const progress = await Progress.get({ userId, courseId });
      
      if (!progress) {
        res.status(404).json({ message: "User not enroll in this." });
        return;
      }
        //turn progress modules(arrays of jsone) into map-moduleId as key, completed as value
      const completedMap = new Map(
        (progress.modules as { moduleId: string; completed: boolean }[]).map(m => [m.moduleId, m.completed])
      );
      
  
      // merged result 
      const merged = modules.map(mod => ({
        moduleId: mod.moduleId,
        title: mod.title,
        content:mod.content,
        type: mod.type,
        completed: completedMap.get(mod.moduleId) || false,
        moduleVideo:mod.moduleVideo,
        order:mod.order
      }));
  
      // get the modules that is newly added
      const newModules = merged.filter(m =>
        !(progress.modules as { moduleId: string; completed: boolean }[]).some(
          pm => pm.moduleId === m.moduleId
        )
      );      
      if (newModules.length > 0) {
        //put new modules into progress table
        progress.modules.push(...newModules.map(m => ({ moduleId: m.moduleId, completed: false })));
        
        //calculate progress
        const total = progress.modules.length;
        const done = (progress.modules as { moduleId: string; completed: boolean }[]).filter(m => m.completed).length;

        progress.progressPercentage = total === 0 ? 0 : Math.round((done / total) * 100);
  
        await progress.save();
      }
      const sortedMerged = merged.sort((a, b) => a.order - b.order);
      res.json(sortedMerged);
    } catch (error) {
      console.error('Error merging progress:', error);
      res.status(500).json([]);
    }
  };
