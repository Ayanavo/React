import { Request, Response } from "express";
import CvBuilder from "../models/cvBuilderModel.js";

export const saveCvbuilder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, job, tag, elements, pageProperties } = req.body;

    if (!Array.isArray(elements)) {
      return res.status(400).json({ message: "CV elements are required" });
    }

    const cvBuilder = await CvBuilder.create({
      name,
      job,
      tag,
      elements,
      pageProperties,
      createdBy: userId,
      modifiedBy: userId,
    });

    res.status(201).json({ message: "CV builder saved successfully", cvBuilder });
  } catch (error) {
    res.status(500).json({ message: "Error saving CV builder", error });
  }
};

export const getCvbuilderlist = async (req: Request, res: Response) => {
  try {
    const query = req.user?.id ? { createdBy: req.user.id } : {};
    const cvBuilderList = await CvBuilder.find(query).sort({ updatedAt: -1 });

    res.status(200).json({ cvBuilderList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching CV builder list", error });
  }
};

export const getCvbulderListByid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const cvBuilder = await CvBuilder.findOne(query);

    if (!cvBuilder) {
      return res.status(404).json({ message: "CV builder not found" });
    }

    res.status(200).json({ cvBuilder });
  } catch (error) {
    res.status(500).json({ message: "Error fetching CV builder", error });
  }
};

export const updateCvbuilder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, job, tag, elements, pageProperties } = req.body;

    if (!Array.isArray(elements)) {
      return res.status(400).json({ message: "CV elements are required" });
    }

    const query = userId ? { _id: id, createdBy: userId } : { _id: id };
    const cvBuilder = await CvBuilder.findOneAndUpdate(
      query,
      {
        name,
        job,
        tag,
        elements,
        pageProperties,
        modifiedBy: userId,
      },
      { new: true }
    );

    if (!cvBuilder) {
      return res.status(404).json({ message: "CV builder not found" });
    }

    res.status(200).json({ message: "CV builder updated successfully", cvBuilder });
  } catch (error) {
    res.status(500).json({ message: "Error updating CV builder", error });
  }
};

export const deleteCvbuilder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const query = userId ? { _id: id, createdBy: userId } : { _id: id };
    const deletedCvBuilder = await CvBuilder.findOneAndDelete(query);

    if (!deletedCvBuilder) {
      return res.status(404).json({ message: "CV builder not found" });
    }

    res.status(200).json({ message: "CV builder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting CV builder", error });
  }
};
