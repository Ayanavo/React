import { Document, model, Schema, Types } from "mongoose";

export interface IMobileVerification extends Document {
  userId: Types.ObjectId;
  mobile: string;
  otpHash: string;
  otpExpiresAt: Date;
  lastSentAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const mobileVerificationSchema = new Schema<IMobileVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    mobile: { type: String, required: true, trim: true },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    lastSentAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mobileVerificationSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

const MobileVerification = model<IMobileVerification>("MobileVerification", mobileVerificationSchema);

export default MobileVerification;
