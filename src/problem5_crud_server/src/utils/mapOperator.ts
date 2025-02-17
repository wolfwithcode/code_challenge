export function mapOperator(operator: string): string {
  const operatorMap: Record<string, string> = {
    '==': 'equals',
    '!=': 'not',
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    '~': 'contains'
  };
  return operatorMap[operator] || operator;
}
