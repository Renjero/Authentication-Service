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

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // change 2
  const accessToken = jwt.sign(
    {
      id: user._id,
      sessionId: session._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  // Store the refresh token in an HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // JavaScript in the browser cannot read this cookie
    secure: true, // HTTPS in production
    sameSite: "strict", // Helps protect against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  res.status(200).json({
    message: "User Registed Successfully",
    user: {
      username: user.username,
      email: user.email,
      accessToken: accessToken,
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

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // Check whether the cookie exists
  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token not found!",
    });
  }

  // Next, verify the refresh token and validate its session.

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });
  if (!session) {
    return res.status(401).json({
      message: "invaild refresh token",
    });
  }

  const acessToken = jwt.sign(
    {
      id: decoded.id, // User ID stored inside the token
    },
    process.env.JWT_SECRET, // Secret key used to sign the token
    {
      expiresIn: "15m", // Access token expires after 15 minutes
    },
  );

  const newRefreshToken = jwt.sign(
    {
      id: decoded.id, // User ID stored inside the token
    },
    process.env.JWT_SECRET, // Secret key used to sign the token
    {
      expiresIn: "7d", // Access token expires after 15 minutes
    },
  );

  const newRefreshTokenHash = bcrypt.hash(newRefreshTokenHash, salt);

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  // Store the refresh token in an HTTP-only cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true, // JavaScript in the browser cannot read this cookie
    secure: true, // HTTPS in production
    sameSite: "strict", // Helps protect against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  res.status(200).json({
    message: "Refresh token sucess",
    acessToken,
  });
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // Check whether the refresh token cookie exists
  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token not found",
    });
  }

  // Verify the refresh token and get its payload
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  // Find the session using the user ID from the token
  const session = await sessionModel.findOne({
    user: decoded.id,
    revoked: false,
  });

  // Check whether the session exists
  if (!session) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  // Compare the refresh token with the stored hash
  const isValidRefreshToken = await bcrypt.compare(
    refreshToken,
    session.refreshTokenHash,
  );

  if (!isValidRefreshToken) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  // Revoke the session to prevent further use
  session.revoked = true;
  await session.save();

  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return res.status(200).json({
    message: "Successfully logged out!",
  });
};

const logoutAll = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(400).json({
      message: "Refresh Token not found ",
    });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  await sessionModel.updateMany(
    {
      user: decoded._id,
      revoked: false,
    },
    {
      revoked: true,
    },
  );

  res.status(200).json({
    message: "Logout from All Devices succesfully ",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "enter both email and password correctly ",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const ispasswordVaild = await bcrypt.compare(password, user.password);

  if (!ispasswordVaild) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
  const refreshToken = jwt.sign(
    {
      id: user._id, // User ID stored inside the token
    },
    process.env.JWT_SECRET, // Secret key used to sign the token
    {
      expiresIn: "7d", // Access token expires after 15 minutes
    },
  );

  const refreshTokenHash = bcrypt.hashSync(refreshToken, salt);

  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const acessToken = jwt.sign(
    {
      id: user._id, // User ID stored inside the token
    },
    process.env.JWT_SECRET, // Secret key used to sign the token
    {
      expiresIn: "15m", // Access token expires after 15 minutes
    },
  );

  // Store the refresh token in an HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // JavaScript in the browser cannot read this cookie
    secure: true, // HTTPS in production
    sameSite: "strict", // Helps protect against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  res.status(200).json({
    message: "Logged in Succesfully !",
    user: {
      username: user.username,
      email: user.email,
    },
    acessToken,
  });
};

const authControllerService = {
  registerUser,
  getMyProfile,
  refreshToken,
  logout,
  login,
};

export default authControllerService;
