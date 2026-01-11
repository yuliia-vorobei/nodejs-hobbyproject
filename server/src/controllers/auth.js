import { ONE_DAY } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetToken,
  resetPasswod,
} from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.json({
    status: 201,
    message: 'Successfully registered a user',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    //res.cookie - метод, який встановлює кукі
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  }); //refreshToken доступний лише по http а не по JS клієнта
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  }); // sessionId також по http та один день

  res.json({
    status: 200,
    message: 'Successfully logged in',
    data: {
      accessToken: session.accessToken,
    },
  });
  // загалом сесія потрібнра для зберігання інфи про стан сесії, тобто факт входження у систему і зберігання даних між переходами на сайті
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
  res.status(204).send();
};

export const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUserSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  setupSession(res, session);
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const requestResetEmailToken = async (req, res) => {
  await requestResetToken(req.body.email);

  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPasswod(req.body);
    res.json({
    message: 'Your password was successfully changed!',
    status: 200,
    data: {},
  });
}
