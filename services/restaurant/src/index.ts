import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import restaurantRoutes from "./routes/restaurant.js";
import menuItemRoutes from "./routes/menuItems.js";
import cartRoutes from "./routes/carts.js";
import addressRoutes from "./routes/address.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/api/restaurant", restaurantRoutes);
app.use("/api/item", menuItemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Restaurant service is running on port ${port}`);
  connectDB();
});
