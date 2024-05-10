import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

function protectedMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const refreshToken = req.headers["authorization"];

  if (refreshToken === undefined || refreshToken === null) {
    res
      .status(401)
      .json({ statusCode: 401, message: "You're unauthorized to do that." });
    return;
  }

  jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        statusCode: 403,
        message: "You are forbidden from doing that.",
      });
    }

    req.user = user;
    next();
  });
}

export default protectedMiddleware;
