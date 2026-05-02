import mongoose, { Document, Schema } from "mongoose";

export interface ICvBuilder extends Document {
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

const cvBuilderSchema: Schema<ICvBuilder> = new Schema(
  {
    name: { type: String, default: "Untitled CV" },
    job: { type: String, default: "" },
    tag: { type: String, default: "" },
    elements: { type: [Schema.Types.Mixed], required: true, default: [] },
    pageProperties: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const CvBuilder = mongoose.model<ICvBuilder>("CvBuilder", cvBuilderSchema);

export default CvBuilder;
