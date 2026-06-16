import { Document, model, Schema } from "mongoose";

export interface IMasterAccess extends Document {
  userId: string;
  allowedRoutes: string[];
  menuOrder: string[];
}

const masterAccessSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    allowedRoutes: { type: [String], default: [] },
    menuOrder: { type: [String], default: [] },
  },
  { timestamps: true }
);

const MasterAccess = model<IMasterAccess>("MasterAccess", masterAccessSchema);

export default MasterAccess;
