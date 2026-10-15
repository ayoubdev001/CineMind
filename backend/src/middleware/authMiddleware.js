import jwt from 'jsonwebtoken';
import { httpError } from './errorHandler.js';

export function authMiddleware(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw httpError(401, 'Missing token');
  try {
    req.userId = Number(jwt.verify(token, process.env.JWT_ACCESS_SECRET).sub);
  } catch {
    throw httpError(401, 'Invalid or expired token');
  }
  next();
}