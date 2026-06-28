import { Document, model, Schema } from "mongoose";

export interface IPasswordReset extends Document {
  email: string;
  tokenHash: string;
  tokenExpiresAt: Date;
  lastSentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true },
    tokenExpiresAt: { type: Date, required: true },
    lastSentAt: { type: Date, required: true },
  },
  { timestamps: true }
);

passwordResetSchema.index({ tokenExpiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = model<IPasswordReset>("PasswordReset", passwordResetSchema);

export default PasswordReset;
