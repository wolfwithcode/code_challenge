import qs from 'qs';
import { ParsedQuery } from '@interfaces/query';
import { mapOperator } from '@utils/mapOperator';
import { PrismaQuery } from '@common/prisma/prisma';

function parseValue(value: string): any {
  if (typeof value !== 'string') return value;
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (!isNaN(Number(value))) return Number(value);
  return value;
}

function parseSortParams(sortStr?: string | string[]): Array<{ [key: string]: 'asc' | 'desc' }> {
  if (!sortStr) return [];
  const sortFields = Array.isArray(sortStr) ? sortStr : sortStr.split(',');

  return sortFields.map((field) => {
    const isDesc = field.startsWith('-');
    const fieldName = isDesc ? field.substring(1) : field;
    return { [fieldName]: isDesc ? 'desc' : 'asc' };
  });
}

function parseExpand(expandStr?: string | string[]): string[] {
  if (!expandStr) return [];
  return Array.isArray(expandStr) ? expandStr : expandStr.split(',');
}

function parseFields(fieldsStr?: string | string[]): string[] {
  if (!fieldsStr) return [];
  return Array.isArray(fieldsStr) ? fieldsStr : fieldsStr.split(',');
}

function parseFilter(filterStr?: string): Record<string, Record<string, any>> {
  if (!filterStr || typeof filterStr !== 'string') return {};

  try {
    const matches = filterStr.match(/\((.*?)\)/);
    if (!matches || !matches[1]) return {};

    const conditions = matches[1];

    const conditionParts = conditions.match(/(?:[^&&"']|"[^"]*"|'[^']*')+/g) || [];

    const filter: Record<string, Record<string, any>> = {};

    for (const condition of conditionParts) {
      const match = condition.trim().match(/([^><=!~]+)([><=!~]+)(.+)/);
      if (!match) continue;

      const [_, field, operator, value] = match;
      const cleanField = field.trim();
      const cleanValue = value.trim();

      filter[cleanField] = {
        [mapOperator(operator)]: parseValue(cleanValue)
      };
    }

    return filter;
  } catch (error) {
    console.error('Error parsing filter:', error);
    return {};
  }
}

function buildPrismaQuery(parsedQuery: ParsedQuery) {
  const page = parsedQuery.page || 1;
  const perPage = parsedQuery.perPage || 10;
  const skip = parsedQuery.skip || (page - 1) * perPage;
  const queryBuilder: PrismaQuery = {
    where: parsedQuery.filter || {}
  };
  if (parsedQuery.id) {
    queryBuilder.select = parsedQuery.fields?.length
      ? parsedQuery.fields.reduce<Record<string, boolean>>((acc, field) => {
          acc[field] = true;
          return acc;
        }, {})
      : undefined;
    return queryBuilder;
  }

  if (parsedQuery.expand && parsedQuery.expand.length > 0) {
    queryBuilder.include =
      parsedQuery.expand.reduce<Record<string, boolean>>((acc, field) => {
        acc[field] = true;
        return acc;
      }, {}) || {};
  }

  if (parsedQuery.sort) {
    queryBuilder.orderBy =
      parsedQuery.sort?.map((sort) => {
        const [field, direction] = Object.entries(sort)[0];
        return { [field]: direction };
      }) || [];
  }

  queryBuilder.skip = skip;
  queryBuilder.take = perPage;
  return queryBuilder;
}

const queryParser = (req: any, res: any, next: () => void) => {
  try {
    const query = qs.parse(req.query);
    req.parsedQuery = {
      filter: parseFilter(query.filter as string),
      sort: parseSortParams(query.sort as string),
      page: parseInt(query.page as string, 10) || 1,
      perPage: parseInt(query.perPage as string, 10) || 10,
      skip: parseInt(query.skip as string, 10) || 0
    };

    const params = req.params;
    if (params?.id) {
      req.parsedQuery.id = params.id;
      req.parsedQuery.fields = parseFields(query.fields as string);
    } else {
      req.parsedQuery.expand = parseExpand(query.expand as string);
    }

    req.prismaQuery = buildPrismaQuery(req.parsedQuery);
    next();
  } catch (error) {
    console.error('❌ Query parser error:', error);
    res.status(400).json({ error: 'Invalid query parameters' });
  }
};

export default queryParser;
