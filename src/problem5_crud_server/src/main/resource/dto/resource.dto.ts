import { ParsedQuery } from '@interfaces/query';

export interface CreateResourceDTO {
  name: string;
  description: string;
  authorId: number;
}

export interface GetResourcesDTO extends ParsedQuery {
  name?: string;
  description?: string;
  authorId?: number;
}

export interface GetResourceDTO extends ParsedQuery {
  id: number;
}

export interface UpdateResourceDTO {
  name?: string;
  description?: string;
  authorId?: string;
}

export interface DeleteResourceDTO {
  id: number;
}
