import { Document, model, Schema } from "mongoose";

export interface IRegistrationVerification extends Document {
  email: string;
  tokenHash: string;
  tokenExpiresAt: Date;
  registrationExpiresAt: Date | null;
  isVerified: boolean;
  verifiedAt: Date | null;
  lastSentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const registrationVerificationSchema = new Schema<IRegistrationVerification>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true },
    tokenExpiresAt: { type: Date, required: true },
    registrationExpiresAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    lastSentAt: { type: Date, required: true },
  },
  { timestamps: true }
);

registrationVerificationSchema.index({ tokenExpiresAt: 1 }, { expireAfterSeconds: 0 });

const RegistrationVerification = model<IRegistrationVerification>(
  "RegistrationVerification",
  registrationVerificationSchema
);

export default RegistrationVerification;
