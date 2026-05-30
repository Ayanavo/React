import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  title: string;
  body: string;
  color: string;
  image: string[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema: Schema<INote> = new Schema(
  {
    title: { type: String, required: true, default: "" },
    body: { type: String, default: "" },
    color: { type: String, default: "" },
    image: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Note = mongoose.model<INote>("Note", noteSchema);

export default Note;
