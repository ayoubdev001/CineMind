import * as authService from '../services/authService.js';
import { User } from '../models/index.js';
import { httpError } from '../middleware/errorHandler.js';

export const register = async (req, res) => {
  res.status(201).json(await authService.register(req.body));
};

export const login = async (req, res) => {
  res.json(await authService.login(req.body));
};

export const me = async (req, res) => {
  const user = await User.findByPk(req.userId);
  if (!user) throw httpError(404, 'User not found');
  res.json({ user: authService.publicUser(user) });
};