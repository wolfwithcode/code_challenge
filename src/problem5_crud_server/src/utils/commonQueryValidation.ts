import Joi from 'joi';

const baseQueryParams = Joi.object({
  id: Joi.string().optional(),
  sort: Joi.string().optional(),
  expand: Joi.string().optional(),
  fields: Joi.string().optional(),
  page: Joi.number().integer().optional(),
  perPage: Joi.number().integer().optional()
});

export default baseQueryParams;
