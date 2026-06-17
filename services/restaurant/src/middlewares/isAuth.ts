import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Please login to continue - No auth headers" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res
        .status(401)
        .json({ message: "Please login to continue - Auth token missing" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decoded || !decoded.id) {
      res.status(401).json({ message: "Invalid token!" });
      return;
    }

    req.user = {
      _id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      image: decoded.image,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(500).json({ message: "Please login - JWT Error" });
  }
};

export const isSeller = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const user = req.user;

  if (user && user.role !== "seller") {
    res.status(401).json({
      message: "You are not authorized seller",
    });
    return;
  }
  next();
};
