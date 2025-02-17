import httpStatus from 'http-status';
import ApiError from '@utils/ApiError';
import catchAsync from '@utils/catchAsync';
import resourceService from './resource.service';
import { Request, Response } from 'express';
import { CreateResourceDTO } from './dto/resource.dto';

const createResource = catchAsync(async (req: Request, res: Response) => {
  const resource = await resourceService.createResource(req.body as CreateResourceDTO);
  res.status(httpStatus.CREATED).send(resource);
});

const getResources = catchAsync(async (req: Request, res: Response) => {
  const resources = await resourceService.getResources(req.prismaQuery);
  res.status(httpStatus.OK).send(resources);
});

const getResource = catchAsync(async (req: Request, res: Response) => {
  const resource = await resourceService.getResource(Number(req.params.id), req.prismaQuery);
  if (!resource) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Resource not found');
  }
  res.status(httpStatus.OK).send(resource);
});

const updateResource = catchAsync(async (req: Request, res: Response) => {
  const resource = await resourceService.updateResource(
    Number(req.params.id),
    req.body as Partial<CreateResourceDTO>
  );
  res.status(httpStatus.OK).send(resource);
});

const deleteResource = catchAsync(async (req: Request, res: Response) => {
  const resource = await resourceService.deleteResource(Number(req.params.id));
  res.status(httpStatus.OK).send(resource);
});

export default {
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource
};
