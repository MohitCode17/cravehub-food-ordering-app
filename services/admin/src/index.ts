import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.js";
import { connectDb } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", adminRoutes);

const port = process.env.PORT;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(port, () => {
      console.log(`Admin Service Running on ${port}`);
    });
  } catch (err) {
    process.exit(1);
  }
};

startServer();
