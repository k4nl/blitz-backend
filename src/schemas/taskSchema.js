const Joi = require('joi');

const taskSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().required(),
});

const editSchema = Joi.object({
  status: Joi.string().required(),
});

module.exports = {
  taskSchema,
  editSchema,
}