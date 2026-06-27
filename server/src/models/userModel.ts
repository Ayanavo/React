import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { Document, model, Schema } from "mongoose";

const MOBILE_PATTERN = /^[\+]?[1-9][\d]{0,15}$/;
const MONTH_PATTERN = /^(0[1-9]|1[0-2])$/;
const YEAR_PATTERN = /^\d{4}$/;
const PINCODE_PATTERN = /^\d{6}$/;

const companySchema = new Schema(
  {
    companyName: { type: String, default: "", trim: true, maxlength: 200 },
    designation: { type: String, default: "", trim: true, maxlength: 200 },
    fromMonth: {
      type: String,
      default: "",
      validate: {
        validator: (value: string) => !value || MONTH_PATTERN.test(value),
        message: "From month must be between 01 and 12",
      },
    },
    fromYear: {
      type: String,
      default: "",
      validate: {
        validator: (value: string) => !value || YEAR_PATTERN.test(value),
        message: "From year must be a 4-digit year",
      },
    },
    toMonth: {
      type: String,
      default: "",
      validate: {
        validator: (value: string) => !value || MONTH_PATTERN.test(value),
        message: "To month must be between 01 and 12",
      },
    },
    toYear: {
      type: String,
      default: "",
      validate: {
        validator: (value: string) => !value || YEAR_PATTERN.test(value),
        message: "To year must be a 4-digit year",
      },
    },
    isPresent: { type: Boolean, default: false },
  },
  { _id: false }
);

export interface IUser extends Document {
  photoURL?: string;
  mobile?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  oauthProvider?: "google" | "github";
  oauthId?: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isLoggedIn: boolean;
  lastLoginAt?: Date | null;
  lastLogoutAt?: Date | null;
  totalTimeSpentMs: number;
  currentSessionStartedAt?: Date | null;
  address: {
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
  companies: Array<{
    companyName: string;
    designation: string;
    fromMonth: string;
    fromYear: string;
    toMonth?: string;
    toYear?: string;
    isPresent: boolean;
  }>;
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
    photoURL: { type: String, default: "" },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    mobile: {
      type: String,
      default: "",
      unique: true,
      trim: true,
      validate: {
        validator: (value: string) => !value || MOBILE_PATTERN.test(value),
        message: "Mobile number format is invalid",
      },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    oauthProvider: { type: String, enum: ["google", "github"], default: null },
    oauthId: { type: String, default: null, sparse: true },
    title: { type: String },
    isLoggedIn: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    lastLogoutAt: { type: Date, default: null },
    totalTimeSpentMs: { type: Number, default: 0 },
    currentSessionStartedAt: { type: Date, default: null },
    address: {
      addressLine1: { type: String, default: "", trim: true, maxlength: 255 },
      addressLine2: { type: String, default: "", trim: true, maxlength: 255 },
      landmark: { type: String, default: "", trim: true, maxlength: 255 },
      city: { type: String, default: "", trim: true, maxlength: 100 },
      state: { type: String, default: "", trim: true, maxlength: 100 },
      pincode: {
        type: String,
        default: "",
        trim: true,
        validate: {
          validator: (value: string) => !value || PINCODE_PATTERN.test(value),
          message: "Pincode must be 6 digits",
        },
      },
    },
    companies: {
      type: [companySchema],
      default: [],
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
