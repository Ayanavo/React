import { Request, Response } from "express";
import Note, { INote } from "../models/noteModel.js";
import Tag from "../models/tagModel.js";

async function resolveTagId(tagId: string | undefined, userId?: string) {
  if (!tagId) return undefined;

  const query = userId ? { _id: tagId, createdBy: userId } : { _id: tagId };
  const tag = await Tag.findOne(query);
  if (!tag) {
    throw new Error("INVALID_TAG");
  }

  return tag._id;
}

function formatNote(note: INote) {
  return {
    _id: note._id,
    title: note.title,
    body: note.body,
    color: note.color,
    image: note.image ?? [],
    tag: note.tag ? String(note.tag) : null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export const getNotes = async (req: Request, res: Response) => {
  try {
    const query = req.user?.id ? { createdBy: req.user.id } : {};
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ notes: notes.map(formatNote) });
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

    res.status(200).json({ note: formatNote(note) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching note", error });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, body, color, image, tag } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    let tagId;
    try {
      tagId = await resolveTagId(tag, req.user?.id);
    } catch {
      return res.status(400).json({ message: "Invalid tag selected" });
    }

    const note = await Note.create({
      title: title.trim(),
      body: body ?? "",
      color: color ?? "",
      image: Array.isArray(image) ? image : [],
      tag: tagId ?? null,
      createdBy: req.user?.id,
    });

    res.status(201).json({ message: "Note created successfully", note: formatNote(note) });
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, body, color, image, tag } = req.body;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };

    let tagId;
    if (tag !== undefined) {
      try {
        tagId = await resolveTagId(tag || undefined, req.user?.id);
      } catch {
        return res.status(400).json({ message: "Invalid tag selected" });
      }
    }

    const updatedNote = await Note.findOneAndUpdate(
      query,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(body !== undefined && { body }),
        ...(color !== undefined && { color }),
        ...(image !== undefined && { image: Array.isArray(image) ? image : [] }),
        ...(tag !== undefined && { tag: tagId ?? null }),
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note updated successfully", note: formatNote(updatedNote) });
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
