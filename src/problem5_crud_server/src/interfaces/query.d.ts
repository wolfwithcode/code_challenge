export interface ParsedQuery {
  filter?: Record<string, any>;
  sort?: Array<{ [key: string]: 'asc' | 'desc' }>;
  expand?: string[];
  fields?: string[];
  page?: number;
  perPage?: number;
  skip?: number;
  id?: string | number;
}
