import express from "express";
import { addUserRole, getUserProfile, loginUser } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.put("/add-role", isAuth, addUserRole);
router.get("/me", isAuth, getUserProfile);

export default router;
