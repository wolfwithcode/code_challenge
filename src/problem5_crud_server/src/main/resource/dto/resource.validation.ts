import Joi from 'joi';
import {
  CreateResourceDTO,
  GetResourceDTO,
  GetResourcesDTO,
  UpdateResourceDTO,
  DeleteResourceDTO
} from './resource.dto';
import baseQueryParams from '@utils/commonQueryValidation';

const createResource = {
  body: Joi.object<CreateResourceDTO>().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    authorId: Joi.number().integer().required()
  })
};

const getResources = {
  query: Joi.object<GetResourcesDTO>({
    name: Joi.string(),
    description: Joi.string(),
    authorId: Joi.number().integer()
  }).concat(baseQueryParams)
};

const getResource = {
  params: Joi.object<GetResourceDTO>().keys({
    id: Joi.number().integer().required()
  })
};

const updateResource = {
  params: Joi.object<GetResourceDTO>().keys({
    id: Joi.number().integer().required()
  }),
  body: Joi.object<UpdateResourceDTO>()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      authorId: Joi.number().integer()
    })
    .min(1)
};

const deleteResource = {
  params: Joi.object<DeleteResourceDTO>().keys({
    id: Joi.number().integer().required()
  })
};

export default {
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource
};
