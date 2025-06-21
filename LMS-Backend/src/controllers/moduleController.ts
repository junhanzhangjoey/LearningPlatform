import { Request, Response } from "express";
import {Module} from "../models/courseModel";
import { v4 as uuidv4 } from "uuid";

export const getCourseModules = async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.params;
    //console.log("getCourseModules called with courseId:", courseId);
    try {
      const modules = await Module.query("courseId").using("courseIdIndex").eq(courseId).exec();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving modules", error });
    }
};

//every time we add or edit existed modules we need to reorder
export const reorderAndAddModules = async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.params;
    const modulesData = req.body;
  
    if (!Array.isArray(modulesData)) {
      res.status(400).json({ message: "Modules should be an array" });
      return;
    }
  
    try {
        //standarize the format of json
      const modulesToSave = modulesData.map((module: any, index: number) => ({
        moduleId: module.moduleId || uuidv4(),
        courseId,
        title: module.title,
        content: module.content,
        type: module.type,
        moduleVideo: module.moduleVideo || "",
        comments: module.comments || [],
        order: index,
      }));
  
      await Module.batchPut(modulesToSave);
  
      res.json(modulesToSave);
    } catch (error) {
      res.status(500).json({ message: "Error processing modules", error });
    }
  };
  

export const getModule = async (req: Request, res: Response): Promise<void> => {
    const { moduleId } = req.params;
    try {
      const module = await Module.get(moduleId);
  
      if (!module) {
        res.status(404).json({ message: "Module not found" });
        return;
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving module", error });
    }
};
export const addModule = async (req:Request,res: Response): Promise<void>=>{
  const {courseId}=req.params;
  try{
    const moduleId=uuidv4();
    const modules=await Module.query("courseId").using("courseIdIndex").eq(courseId).exec();
    const maxOrder=modules.reduce((max,module)=>Math.max(max,module.order),0)
    const newModule={
      moduleId,
      courseId,
      type:"Text",
      title:"New Module",
      content:"",
      comments:[],
      moduleVideo:"",
      order:maxOrder+1,
    }
    await Module.create(newModule);
    const saved=await Module.get(moduleId);
    res.json(saved);
  }catch(error){
    console.error("addModule error:", error);
    res.status(500).json({
      message: "Error retrieving modules",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
//update a single module
export const updateModule = async (req: Request, res: Response): Promise<void> => {
    const { moduleId } = req.params;
    const updateData = req.body;
    try {
      const module = await Module.get(moduleId);
  
      if (!module) {
        res.status(404).json({ message: "Module not found" });
        return;
      }
  
      Object.assign(module, updateData);
      await module.save();
    
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Error updating module", error });
    }
};

export const deleteModule = async (req: Request, res: Response): Promise<void> => {
    const { moduleId } = req.params;
  
    try {
      const module = await Module.get(moduleId);
  
      if (!module) {
        res.status(404).json({ message: "Module not found" });
        return;
      }
  
      await Module.delete(moduleId);

      res.json({ message: "Module deleted successfully", data: module });
    } catch (error) {
      res.status(500).json({ message: "Error deleting module", error });
    }
  };

  


  