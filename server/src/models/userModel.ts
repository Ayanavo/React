import { compare } from "bcrypt";
import { Document, model, Schema } from "mongoose";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  generateJwt: () => string;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

// Add the matchPassword method to the schema
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await compare(enteredPassword, this.password);
};

// Add the generateJwt method to the schema
userSchema.methods.generateJwt = function () {
  return jwt.sign({ id: this._id }, process.env.API_SECRET_KEY!, { expiresIn: "1h" });
};

const User = model<IUser>("User", userSchema);

export default User;
