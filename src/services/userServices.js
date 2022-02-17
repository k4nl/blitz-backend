const { ObjectId } = require('mongodb');
const userModels = require('../models/userModels');
const CustomError = require('../middlewares/CustomError');
const e = require('../utils/dictionary/status');
const schema = require('../schemas/userSchema');
const auth = require('../middlewares/auth');
const verify = require('../utils/functions');

const createUser = async (user) => {
  const { error } = schema.userSchema.validate(user);
  verify.verifyJoiError(error);
  
  const emailAlreadyTaken = await userModels.findUserByEmail(user.email);

  verify.verifyIfUserEmailExists(emailAlreadyTaken);

  const { insertedId } = await userModels.createUser(user);

  return { _id: ObjectId(insertedId), user: { name: user.name, email: user.email } };
};

const login = async (user) => {
  const { error } = schema.loginSchema.validate(user);
  verify.verifyJoiError(error);

  const userFound = await userModels.findUserByEmail(user.email);

  verify.verifyUser(userFound);
  verify.verifyPassword(userFound, user.password);

  const { _id } = userFound;

  return { token: auth.createToken(_id, user.email) };
};

module.exports = {
  createUser,
  login,
};