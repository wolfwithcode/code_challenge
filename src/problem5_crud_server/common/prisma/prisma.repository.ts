import { PrismaClient, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '@utils/ApiError';
import { ModelName, PrismaQuery } from '@common/prisma/prisma';
import { PrismaService } from './prisma.service';

export class PrismaRepository {
  private static instance: PrismaRepository;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = PrismaService.getInstance().getClient();
  }

  public static getInstance(): PrismaRepository {
    if (!PrismaRepository.instance) {
      PrismaRepository.instance = new PrismaRepository();
    }
    return PrismaRepository.instance;
  }

  private getModel<T extends keyof PrismaClient>(modelName: ModelName): any {
    const model = this.prisma[modelName.toLowerCase() as keyof PrismaClient];
    if (!model) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Invalid model name: ${modelName}`);
    }
    return model;
  }

  async findMany<T>(model: ModelName, query?: PrismaQuery): Promise<T[]> {
    try {
      const prismaModel = this.getModel(model);
      return await prismaModel.findMany(query);
    } catch (error) {
      throw this.handleError(error, model);
    }
  }

  async findFirst<T>(
    model: ModelName,
    options?: {
      include?: Prisma.JsonObject;
      select?: Prisma.JsonObject;
      where?: Prisma.JsonObject;
    }
  ): Promise<T> {
    try {
      const prismaModel = this.getModel(model);
      const result = await prismaModel.findFirst({
        ...options
      });
      return result;
    } catch (error) {
      throw this.handleError(error, model);
    }
  }

  async findOne<T>(
    model: ModelName,
    id: string | number,
    options?: {
      include?: Prisma.JsonObject;
    }
  ): Promise<T> {
    try {
      const query: PrismaQuery = {
        where: { id }
      };
      if (options?.include) {
        query.include = options.include;
      }
      const prismaModel = this.getModel(model);
      return await prismaModel.findUnique(query);
    } catch (error) {
      throw this.handleError(error, model);
    }
  }

  async findUnique<T>(
    model: ModelName,
    where: Partial<T>,
    options?: {
      include?: Prisma.JsonObject;
      select?: Prisma.JsonObject;
    }
  ): Promise<T | null> {
    try {
      const prismaModel = this.getModel(model);
      return await prismaModel.findUnique({
        where,
        ...options
      });
    } catch (error) {
      throw this.handleError(error, model);
    }
  }

  async create<T>(
    model: ModelName,
    data: Partial<T>,
    options?: {
      include?: Prisma.JsonObject;
      select?: Prisma.JsonObject;
    }
  ): Promise<T> {
    try {
      const prismaModel = this.getModel(model);
      return await prismaModel.create({
        data,
        ...options
      });
    } catch (error) {
      throw this.handleError(error, model);
    }
  }

  async update<T>(
    model: ModelName,
    id: string | number,
    data: Partial<T>,
    options?: {
      include?: Prisma.JsonObject;
      select?: Prisma.JsonObject;
    }
  ): Promise<T> {
    try {
      const prismaModel = this.getModel(model);
      return await prismaModel.update({
        where: { id },
        data,
        ...options
      });
    } catch (error) {
      throw this.handleError(error, model);
    }
  }

  async delete<T>(model: ModelName, id: string | number): Promise<T> {
    try {
      const prismaModel = this.getModel(model);
      return await prismaModel.delete({
        where: { id }
      });
    } catch (error) {
      throw this.handleError(error, model);
    }
  }

  private handleError(error: unknown, model: string): never {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ApiError(
            httpStatus.CONFLICT,
            `${model} already exists with this unique constraint`
          );
        case 'P2014':
          throw new ApiError(httpStatus.BAD_REQUEST, `Invalid ID for ${model}`);
        case 'P2003':
          throw new ApiError(httpStatus.BAD_REQUEST, `Invalid relation for ${model}`);
        case 'P2025':
          throw new ApiError(httpStatus.NOT_FOUND, `${model} not found`);
        default:
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Error processing ${model} operation: ${error.message}`
          );
      }
    }

    if (error instanceof Error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error processing ${model} operation: ${error.message}`
      );
    }

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Unknown error processing ${model} operation`
    );
  }
}
