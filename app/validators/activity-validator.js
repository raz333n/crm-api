const Joi = require("joi");

const createActivitySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),

  type: Joi.string()
    .valid("task", "call", "meeting", "appointment", "event")
    .required(),

  dueDate: Joi.date().required(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),

  isAllDay: Joi.boolean().optional(),

  lead: Joi.string().optional(),
});

const updateActivitySchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),

  type: Joi.string()
    .valid("task", "call", "meeting", "appointment", "event")
    .optional(),

  status: Joi.string()
    .valid("pending", "completed", "cancelled")
    .optional(),

  dueDate: Joi.date().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),

  isAllDay: Joi.boolean().optional(),
});

module.exports = {
  createActivitySchema,
  updateActivitySchema,
};