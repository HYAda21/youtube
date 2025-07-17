import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // do not return password by default
    },
    avatar: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

/// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password was changed

 // console.log("⏳ Hashing password...");
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
//  console.log("✅ Hashed Password:", this.password);

  next();
});

/// ✅ Compare password method
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/// ✅ Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

/// ✅ Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const User = mongoose.model("User", userSchema);
