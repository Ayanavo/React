import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  photoURL?: string;
  mobile?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isLoggedIn: boolean;
  lastLoginAt?: Date | null;
  address: {
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
  settings: {
    date_format: string;
    currency_format: string;
    font_style: string;
    theme: string;
  };
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  generateJwt: () => string;
  generateRefreshToken: () => string;
}

const userSchema: Schema = new Schema(
  {
    photoURL: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobile: { type: String, default: "", unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    title: { type: String },
    isLoggedIn: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    address: {
      addressLine1: { type: String, default: "" },
      addressLine2: { type: String, default: "" },
      landmark: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    settings: {
      date_format: { type: String, default: "DD/MM/YYYY" },
      currency_format: { type: String, default: "INR" },
      font_style: { type: String, default: "system" },
      theme: { type: String, default: "system" },
    },
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
