import mongoose, { Document, Schema } from "mongoose";

export interface ICoverLetter extends Document {
  name?: string;
  job?: string;
  tag?: string;
  elements: unknown[];
  pageProperties?: Record<string, unknown>;
  createdBy?: mongoose.Types.ObjectId;
  modifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const coverLetterSchema: Schema<ICoverLetter> = new Schema(
  {
    name: { type: String, default: "Untitled Cover Letter" },
    job: { type: String, default: "" },
    tag: { type: String, default: "" },
    elements: { type: [Schema.Types.Mixed], required: true, default: [] },
    pageProperties: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const CoverLetter = mongoose.model<ICoverLetter>("CoverLetter", coverLetterSchema);

export default CoverLetter;
