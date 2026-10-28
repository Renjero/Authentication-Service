
import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import dns from "dns";

import connectDb from "./config/dbConfig.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-Parser"


dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware — MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Connect DB
connectDb();

// Auth routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Backend Server is Running at ${PORT}`.bgCyan);
});



