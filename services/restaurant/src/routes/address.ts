import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addAddress,
  deleteAddress,
  getMyAddresses,
} from "../controllers/address.js";

const router = express.Router();

router.post("/new", isAuth, addAddress);
router.get("/all", isAuth, getMyAddresses);
router.delete("/:id", isAuth, deleteAddress);

export default router;
