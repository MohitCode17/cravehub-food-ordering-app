import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import restaurantRoutes from "./routes/restaurant.js";
import menuItemRoutes from "./routes/menuItems.js";
import cartRoutes from "./routes/carts.js";
import addressRoutes from "./routes/address.js";
import orderRoutes from "./routes/order.js";
import { connectRabbitMq } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";

dotenv.config();

await connectRabbitMq();
startPaymentConsumer();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Restaurant Service Running" });
});

app.use("/api/restaurant", restaurantRoutes);
app.use("/api/item", menuItemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

const port = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Restaurant Service Running on ${port}`);
    });
  } catch (err) {
    process.exit(1);
  }
};

startServer();
