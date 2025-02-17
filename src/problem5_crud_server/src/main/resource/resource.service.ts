import httpStatus from 'http-status';
import ApiError from '@utils/ApiError';
import prismaRepo from '@config/database';
import { Resource } from '@prisma/client';
import { CreateResourceDTO } from './dto/resource.dto';
import authorService from '../author/author.service';
import { PrismaQuery } from '@common/prisma/prisma';

const createResource = async (resourceDto: CreateResourceDTO): Promise<Resource> => {
  const author = await authorService.getAuthorById(resourceDto.authorId);
  if (!author) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Author not found');
  }
  const newResource = await prismaRepo.create<Resource>('Resource', resourceDto);
  return newResource;
};

const getResourceById = async (id: number): Promise<Partial<Resource> | null> => {
  return await prismaRepo.findOne<Resource>('Resource', id);
};

const getResourceByName = async (name: string): Promise<Partial<Resource> | null> => {
  return await prismaRepo.findFirst<Resource>('Resource', {
    where: { name },
    select: {
      id: true,
      name: true,
      description: true
    }
  });
};

const getResources = async (query: PrismaQuery): Promise<Resource[]> => {
  return await prismaRepo.findMany<Resource>('Resource', query);
};

const getResource = async (id: number, query: PrismaQuery): Promise<Partial<Resource> | null> => {
  return await prismaRepo.findOne<Resource>('Resource', id, query);
};

const updateResource = async (
  id: number,
  resourceDto: Partial<CreateResourceDTO>
): Promise<Resource | null> => {
  const resource = await prismaRepo.update<Resource>('Resource', id, resourceDto);

  if (!resource) {
    throw new ApiError(httpStatus.NOT_FOUND, `Resource ${id} not found`);
  }

  return resource;
};

const deleteResource = async (id: number): Promise<Resource> => {
  const resource = await prismaRepo.delete<Resource>('Resource', id);
  return resource;
};

export default {
  createResource,
  getResourceById,
  getResourceByName,
  getResources,
  getResource,
  updateResource,
  deleteResource
};
