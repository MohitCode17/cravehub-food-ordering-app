import jwt from "jsonwebtoken";
import User from "../model/User.js";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";

export const loginUser = TryCatch(async (req, res) => {
  const { name, email, picture } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });

  // Create user if not exists
  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  res.status(200).json({ message: "Login Successfully", token, user });
});

// `as const` preserves the exact role values instead of converting them to string[].
// `typeof allowedRoles` gets the tuple type, and `[number]` creates a union of all values.
// Result: Role = "customer" | "rider" | "seller"
const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  res.status(200).json({ user, token });
});
