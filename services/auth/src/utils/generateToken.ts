import jwt from "jsonwebtoken";

export const generateToken = (
  id: string,
  name: string,
  email: string,
  image: string,
  role: string | null,
) => {
  return jwt.sign({ id, name, email, image, role }, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });
};
