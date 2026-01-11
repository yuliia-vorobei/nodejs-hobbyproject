import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomBytes } from 'crypto';
import { UserCollection } from '../db/models/user.js';
import { SessionCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY, SMTP, TEMPLATES_DIR, JWT_SECRET } from '../constants/index.js';
import { sendEmail } from '../utils/sendMail.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export const registerUser = async (payload) => {
  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  const user = await UserCollection.findOne({ email: payload.email });
  if (user) {
    throw createHttpError(409, 'Email is already in use');
  }

  return await UserCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError(404, 'User is not found');
  }
  const samePassword = await bcrypt.compare(payload.password, user.password);
  if (!samePassword) {
    throw createHttpError(401, 'Wrong password');
  }
  await SessionCollection.deleteOne({ userId: user._id });
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session is not found');
  }

  const isSessionExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionExpired) {
    throw createHttpError(401, 'Session token is expired');
  }

  const newSession = createSession(); //createSession генерує нові токени і встановлює терміни їх дії

  await SessionCollection.findOne({ _id: sessionId, refreshToken });

  return await SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const requestResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User is not registered');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );
  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPasswod = async (payload) => {
  let entries;
  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'))
  } catch (error) {
if (error instanceof Error) throw createHttpError(401, error.message);
    throw err;
  }
  console.log(entries)
  const user = await UserCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });
   if (!user) {
    throw createHttpError(404, 'User not found');
  }
 const encryptedPassword = await bcrypt.hash(payload.password, 10);
  await UserCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
}
