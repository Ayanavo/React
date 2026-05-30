import mongoose, { Document, Schema } from "mongoose";

export interface ITag extends Document {
  name: string;
  description: string;
  color: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema: Schema<ITag> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    color: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Tag = mongoose.model<ITag>("Tag", tagSchema);

export default Tag;
