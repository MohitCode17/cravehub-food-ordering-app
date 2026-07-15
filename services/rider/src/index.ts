import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5005;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Realtime Service Running on ${port}`);
    });
  } catch (err) {
    process.exit(1);
  }
};

startServer();
