import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sequelize, User, UserPreference } from '../models/index.js';
import { httpError } from '../middleware/errorHandler.js';

const signToken = (user) =>
  jwt.sign({ sub: String(user.id) }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const publicUser = (u) => ({ id: u.id, username: u.username, email: u.email });

export async function register({ username, email, password }) {
  if (await User.findOne({ where: { email } })) throw httpError(409, 'Email already registered');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await sequelize.transaction(async (t) => {
    const u = await User.create({ username, email, passwordHash }, { transaction: t });
    await UserPreference.create({ userId: u.id }, { transaction: t });
    return u;
  });
  return { user: publicUser(user), token: signToken(user) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw httpError(401, 'Invalid email or password');
  return { user: publicUser(user), token: signToken(user) };
}