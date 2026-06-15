import mongoose, { Document, Schema } from "mongoose";

export interface ICvBuilder extends Document {
  name?: string;
  job?: string;
  tag?: string;
  elements: unknown[];
  pageProperties?: Record<string, unknown>;
  atsScore?: number;
  atsAnalysis?: {
    score: number;
    ranking: string;
    summary: string;
    strengths: string[];
    gaps: string[];
    recommendations: string[];
    model?: string;
  };
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
    atsScore: { type: Number, default: null },
    atsAnalysis: {
      type: {
        score: Number,
        ranking: String,
        summary: String,
        strengths: [String],
        gaps: [String],
        recommendations: [String],
        model: String,
      },
      default: null,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const CvBuilder = mongoose.model<ICvBuilder>("CvBuilder", cvBuilderSchema);

export default CvBuilder;
