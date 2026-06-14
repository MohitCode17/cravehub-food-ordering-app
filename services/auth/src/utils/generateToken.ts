import jwt from "jsonwebtoken";

export const generateToken = (id: string, role: string | null) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });
};
