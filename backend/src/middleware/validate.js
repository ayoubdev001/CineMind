import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  res.status(422).json({
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
}