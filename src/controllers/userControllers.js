const userServices = require('../services/userServices');
const e = require('../utils/dictionary/status');

const createUser = async (req, res) => {
  try {
    const user = await userServices.createUser(req.body);
    return res.status(e.created).json(user);
  } catch (error) {
    return res.status(error.status).json(error);
  }
};

const login = async (req, res) => {
  try {
    const token = await userServices.login(req.body);
    return res.status(e.success).json(token);
  } catch (error) {
    return res.status(error.status).json(error);
  }
};

module.exports = {
  createUser,
  login,
};