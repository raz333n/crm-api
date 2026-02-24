const Joi = require("joi");

const createLeadSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  company: Joi.string().optional(),
  source: Joi.string()
    .valid("website", "referral", "cold-call", "social", "other")
    .optional(),
  status: Joi.string()
    .valid("new", "contacted", "qualified", "lost", "converted")
    .optional(),
  assignedTo: Joi.string().optional(),
  notes: Joi.string().optional(),
});

module.exports = {
  createLeadSchema,
};