import mongoose, { Document, Schema } from "mongoose";

export interface IWorkflow extends Document {
  name: string;
  description?: string;
  nodes: unknown[];
  edges: unknown[];
  createdBy?: mongoose.Types.ObjectId;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workflowSchema: Schema<IWorkflow> = new Schema(
  {
    name: { type: String, required: true, trim: true, default: "Untitled workflow" },
    description: { type: String, default: "" },
    nodes: { type: [Schema.Types.Mixed], default: [] },
    edges: { type: [Schema.Types.Mixed], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastRunAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Workflow = mongoose.model<IWorkflow>("Workflow", workflowSchema);

export default Workflow;
