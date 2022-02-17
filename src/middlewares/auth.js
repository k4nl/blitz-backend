require('dotenv').config();
const jwt = require('jsonwebtoken');
const CustomError = require('./CustomError');
const e = require('../utils/dictionary/status');

const secret = process.env.SECRET;

const jwtConfig = {
  expiresIn: '1h',
  algorithm: 'HS256',
}

const login = (req, _res, next) => {
  const token = req.headers.authorization;
  if (!token) throw new CustomError(e.unauthorized);

  try {
    const decoded = jwt.verify(token, secret);
    const user = decoded.data;
    req.user = user;
    return next();
  } catch (error) {
    return next(e.unauthorized);
  }
};

const createToken = (id, email) => jwt.sign({ data: { id, email } }, secret, jwtConfig);

module.exports = {
  login,
  createToken,
};