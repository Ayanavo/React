import mongoose, { Document, Schema } from "mongoose";

export type ActivityPriority = "low" | "medium" | "high" | "urgent";
export type ActivityStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface IActivity extends Document {
  name: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  color?: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  location?: string;
  conferenceProvider?: "none" | "zoom" | "google_meet";
  conferenceLink?: string;
  conferenceMeetingId?: string;
  tag?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema: Schema<IActivity> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    start: { type: Date, required: true },
    end: { type: Date },
    allDay: { type: Boolean, default: false },
    color: { type: String, default: "#6366f1" },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done", "cancelled"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    location: { type: String, default: "" },
    conferenceProvider: { type: String, enum: ["none", "zoom", "google_meet"], default: "none" },
    conferenceLink: { type: String, default: "" },
    conferenceMeetingId: { type: String, default: "" },
    tag: { type: Schema.Types.ObjectId, ref: "Tag" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Activity = mongoose.model<IActivity>("Activity", activitySchema);

export default Activity;
