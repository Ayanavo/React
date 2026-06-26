import { Request, Response } from "express";
import Workflow, { IWorkflow } from "../models/workflowModel.js";

function formatWorkflowSummary(workflow: IWorkflow) {
  return {
    _id: workflow._id,
    name: workflow.name,
    description: workflow.description ?? "",
    updatedAt: workflow.updatedAt,
    createdAt: workflow.createdAt,
    lastRunAt: workflow.lastRunAt ?? null,
  };
}

function formatWorkflow(workflow: IWorkflow) {
  return {
    ...formatWorkflowSummary(workflow),
    nodes: workflow.nodes ?? [],
    edges: workflow.edges ?? [],
  };
}

function validateGraphPayload(nodes: unknown, edges: unknown) {
  if (nodes !== undefined && !Array.isArray(nodes)) {
    return "Nodes must be an array";
  }
  if (edges !== undefined && !Array.isArray(edges)) {
    return "Edges must be an array";
  }
  return null;
}

export const getWorkflows = async (req: Request, res: Response) => {
  try {
    const query = req.user?.id ? { createdBy: req.user.id } : {};
    const workflows = await Workflow.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ workflows: workflows.map(formatWorkflowSummary) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching workflows", error });
  }
};

export const getWorkflowById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const workflow = await Workflow.findOne(query);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    res.status(200).json({ workflow: formatWorkflow(workflow) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching workflow", error });
  }
};

export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const { name, description, nodes, edges } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const graphError = validateGraphPayload(nodes, edges);
    if (graphError) {
      return res.status(400).json({ message: graphError });
    }

    const workflow = await Workflow.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      nodes: Array.isArray(nodes) ? nodes : [],
      edges: Array.isArray(edges) ? edges : [],
      createdBy: req.user?.id,
    });

    res.status(201).json({ message: "Workflow created successfully", workflow: formatWorkflow(workflow) });
  } catch (error) {
    res.status(500).json({ message: "Error creating workflow", error });
  }
};

export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, nodes, edges, lastRunAt } = req.body;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };

    if (name !== undefined && !name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const graphError = validateGraphPayload(nodes, edges);
    if (graphError) {
      return res.status(400).json({ message: graphError });
    }

    const updatedWorkflow = await Workflow.findOneAndUpdate(
      query,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() ?? "" }),
        ...(nodes !== undefined && { nodes }),
        ...(edges !== undefined && { edges }),
        ...(lastRunAt !== undefined && { lastRunAt: lastRunAt ? new Date(lastRunAt) : null }),
      },
      { new: true }
    );

    if (!updatedWorkflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    res.status(200).json({ message: "Workflow updated successfully", workflow: formatWorkflow(updatedWorkflow) });
  } catch (error) {
    res.status(500).json({ message: "Error updating workflow", error });
  }
};

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const deletedWorkflow = await Workflow.findOneAndDelete(query);

    if (!deletedWorkflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    res.status(200).json({ message: "Workflow deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting workflow", error });
  }
};
