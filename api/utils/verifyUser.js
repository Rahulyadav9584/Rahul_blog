import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(errorHandler(401, 'No token provided, authorization denied'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Differentiate between invalid and expired tokens if desired
      const message = err.name === 'TokenExpiredError' 
        ? 'Token expired, please log in again' 
        : 'Invalid token, authorization denied';

      return next(errorHandler(401, message));
    }

    req.user = user;
    next();
  });
};
