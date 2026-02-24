const Joi = require('joi')

const registerValidationSchema = Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).required()
})

const loginValidationSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).required()
})

module.exports = {
    registerValidationSchema,
    loginValidationSchema
}