import { Request, Response } from "express";
import Note from "../models/noteModel.js";

export const getNotes = async (req: Request, res: Response) => {
  try {
    const query = req.user?.id ? { createdBy: req.user.id } : {};
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const note = await Note.findOne(query);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ note });
  } catch (error) {
    res.status(500).json({ message: "Error fetching note", error });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, body, color, image } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const note = await Note.create({
      title: title.trim(),
      body: body ?? "",
      color: color ?? "",
      image: Array.isArray(image) ? image : [],
      createdBy: req.user?.id,
    });

    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, body, color, image } = req.body;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };

    const updatedNote = await Note.findOneAndUpdate(
      query,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(body !== undefined && { body }),
        ...(color !== undefined && { color }),
        ...(image !== undefined && { image: Array.isArray(image) ? image : [] }),
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note updated successfully", note: updatedNote });
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const deletedNote = await Note.findOneAndDelete(query);

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error });
  }
};
