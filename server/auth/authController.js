import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// import { config } from "dotenv";
import sessionModel from "../models/sessionModel.js";

const salt = bcrypt.genSaltSync(10);

const registerUser = async (req, res) => {
  const { username, email, phone, password } = req.body;

  if (!username || !email || !phone || !password) {
    res.status(400);
    throw new Error("Please fill all details!!!");
  }

  // Check if user exist
  const isAlreadyRegistered = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isAlreadyRegistered) {
    return res.status(409).json({
      success: false,
      message: "Username or email already exists",
    });
  }

  // Store hash in your password DB
  // const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  /// create a user successfully
  const user = await User.create({
    username,
    email,
    phone,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15d" },
  );

  res.status(200).json({
    message: "User Registed Successfully",
    user: {
      username: user.username,
      email: user.email,
      token: token,
      userid: user._id,
    },
  });
}; //registerUser

const getMyProfile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Token not found from the authorization",
    });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log("Decoded token:", decoded);

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "User fetched successfully",
    user: {
      username: user.username,
      email: user.email,
    },
  });
};


const authControllerService = {
  registerUser,
  getMyProfile,
  // login,
  // refreshToken,
  // logout,
};

export default authControllerService;
