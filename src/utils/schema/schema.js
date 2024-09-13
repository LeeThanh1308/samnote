import Joi from 'joi'

export const schemaGroup = Joi.object({
 groupName: Joi.string().min(4).max(100).required(),
 desc: Joi.string().min(2).max(100).required(),
 members: Joi.array().min(1).required(),
})
