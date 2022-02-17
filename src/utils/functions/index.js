const CustomError = require('../../middlewares/CustomError');
const taskSchema = require('../../schemas/taskSchema');
const userSchema = require('../../schemas/userSchema');
const e = require('../dictionary/status');
const m = require('../dictionary/errorMessages');

const verifyName = (name) => {
  if (name) {
    throw new CustomError({ status: e.invalidRequest, message: m.taskName})
  };
};

const verifyIfUserEmailExists = (email) => {
  if (email) {
    throw new CustomError({ status: e.invalidRequest, message: m.emailAlreadyExists})
  };
};

const verifyIfTaskExist = (task) => {
  if (!task) {
    throw new CustomError({ status: e.notFound, message: m.taskNotFound })
  };
};

const verifySchema = (error, msg) => {
  if (error) {
    throw new CustomError({ status: e.invalidRequest, message: msg })
  }
}

const verifyTaskOwner = (task, userId, userEmail) => {
  if (task !== userId && userEmail !== 'admin@blitz.com') {
    throw new CustomError({ status: e.unauthorized, message: m.unauthorized })
  }
};

const verifyUser = (user) => {
  if (!user) {
    throw new CustomError({ status: e.invalidRequest, message: m.userNotFound })
  }
}

const verifyPassword = ({ user }, password) => {
  if (user.password !== password) {
    throw new CustomError({ status: e.unauthorized, message: m.incorrectPassword })
  }
}

const verifyJoiError = (error) => {
  const msg = error && error.details[0].message;
  if (error) {
    throw new CustomError({ status: e.invalidRequest, message: msg});
  }
}

const verifyTaskStatus = (status) => {
  const taskOpt = ['pendente', 'em andamento', 'pronto'];
  const found = taskOpt.find((taskStatus) => status === taskStatus);
  if (!found) throw new CustomError({ status: e.invalidRequest, message: m.invalidTaskStatus });
}


module.exports = {
  verifyName,
  verifyIfTaskExist,
  verifyIfUserEmailExists,
  verifySchema,
  verifyTaskOwner,
  verifyUser,
  verifyJoiError,
  verifyPassword,
  verifyTaskStatus,
}