import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  profile_image?: string;
  mobile?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  address: {
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  generateJwt: () => string;
  generateRefreshToken: () => string;
}

const userSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    title: { type: String },
  },
  { timestamps: true }
);

// Add the matchPassword method to the schema
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await compare(enteredPassword, this.password);
};

// Add the generateJwt method to the schema
userSchema.methods.generateJwt = function () {
  return jwt.sign({ id: this._id, email: this.email }, process.env.API_SECRET_KEY!, { expiresIn: "1h" });
};

// Add the generateRefreshToken method to the schema
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
};

const User = model<IUser>("User", userSchema);

export default User;
