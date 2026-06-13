import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Auth service is running on port ${port}`);
  connectDB();
});