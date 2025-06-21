import { Request, Response } from "express";
import { clerkClient } from "../index";
import User from "../models/userModel";

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const userData = req.body;
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: userData.publicMetadata.role,
        settings: userData.publicMetadata.settings,
      },
    });

    res.json({ message: "User updated successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};


export const getAllUsers = async (
  req: Request,
  res: Response
):Promise<void> => {
  try {
    const users = await User.scan().exec();
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Internal server error" })
  }
};

export const getAllStudents = async (
  req: Request,
  res: Response
):Promise<void> => {
  try {
    const users = await User.scan().exec();
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Internal server error" })
  }
};
