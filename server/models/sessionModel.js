import mongoose from "mongoose";
import { Model } from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "user is required"],
    },
    refreshTokenHash: {
      type: String,
      required: [true, "Refresh Token hash requird "],
    },
    ip: {
      type: String,
      required: [true, "IP is required"],
    },
    userAgent: {
      type: String,
      required: [true, "userAgent is required"],
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);


const sessionModel = mongoose.model("sessions",sessionSchema)

export default sessionModel