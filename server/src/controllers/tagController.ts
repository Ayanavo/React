import { Request, Response } from "express";
import Tag from "../models/tagModel.js";

export const getTags = async (req: Request, res: Response) => {
  try {
    const query = req.user?.id ? { createdBy: req.user.id } : {};
    const tags = await Tag.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tags", error });
  }
};

export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const tag = await Tag.findOne(query);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({ tag });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tag", error });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const tag = await Tag.create({
      name: name.trim(),
      description: description ?? "",
      color: color ?? "",
      createdBy: req.user?.id,
    });

    res.status(201).json({ message: "Tag created successfully", tag });
  } catch (error) {
    res.status(500).json({ message: "Error creating tag", error });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };

    const tag = await Tag.findOneAndUpdate(
      query,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
      },
      { new: true }
    );

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({ message: "Tag updated successfully", tag });
  } catch (error) {
    res.status(500).json({ message: "Error updating tag", error });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const tag = await Tag.findOneAndDelete(query);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tag", error });
  }
};
