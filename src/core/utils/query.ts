export function parseSortQuery(sortQuery: string): any {
  if (!sortQuery) {
    return {};
  }
  const result = {};
  const queryList = sortQuery.split(',');
  queryList.map((query: string) => {
    if (query.split(':')[0] && query.split(':')[1]) {
      result[query.split(':')[0]] = query.split(':')[1]
    }
  });
  return result;
}