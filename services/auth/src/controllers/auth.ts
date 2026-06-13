import jwt from "jsonwebtoken";
import User from "../model/User.js";
import TryCatch from "../middlewares/trycatch.js";

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
