import { SelectQueryBuilder, UpdateQueryBuilder } from "typeorm";

export function applyWhereClauses(
  queryBuilder: SelectQueryBuilder<any> | UpdateQueryBuilder<any>,
  options: Record<string, any>,
  queryFields: Record<string, string>,
) {
  for (const [key, value] of Object.entries(options)) {
    if (value !== null && value !== undefined) {
      const fieldName = queryFields[key];
      if (fieldName) {
        if (typeof value !== "object") {
          queryBuilder.andWhere(`${fieldName} = :${key} `, { [key]: value });
        } else {
          queryBuilder.andWhere(`${fieldName} BETWEEN :start AND :end`, {
            start: value.start,
            end: value.end,
          });
        }
      }
    }
  }
}

export function applyGroupedWhereClauses(
  queryBuilder: SelectQueryBuilder<any> | UpdateQueryBuilder<any>,
  options: Record<string, any>,
  queryFieldGroups: Record<string, string>[],
) {
  if (!queryFieldGroups || queryFieldGroups.length === 0) {
    return;
  }
  const orConditions = queryFieldGroups.map((queryFields) => {
    const andConditions = [];
    for (const [key, value] of Object.entries(options)) {
      if (value !== null && value !== undefined) {
        const fieldName = queryFields[key];
        if (fieldName) {
          if (typeof value !== "object") {
            andConditions.push(`${fieldName} = :${key} `, { [key]: value });
          } else {
            andConditions.push(`${fieldName} BETWEEN :start AND :end`, {
              start: value.start,
              end: value.end,
            });
          }
        }
      }
    }
    return `(${andConditions.join(" AND ")})`;
  });

  if (orConditions.length > 0) {
    const combineOrConditions = orConditions
      .filter((c) => c !== "()")
      .join(" OR ");
    if (combineOrConditions.length > 0) {
      queryBuilder.andWhere(`(${combineOrConditions})`, options);
    }
  }
}
