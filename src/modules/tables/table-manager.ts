import { SelectQueryBuilder } from "typeorm";
import { RepositoryFindOptions } from "../../types/repository-find-options";

export class TableManager {
    static applyOptionsToQuery(
        query: SelectQueryBuilder<any>,
        options: RepositoryFindOptions
    ) {
        if (!options) return query;
        if (options.where !== undefined)
            query = TableManager.applyWhereOptions(query, options);
        if (options.order) {
            query.orderBy(options.order.element, options.order.sort);
        }
        if (options.take) query.take(options.take);
        if (options.skip) query.skip(options.skip);
        return query;
    }

    static applyWhereOptions(
        query: SelectQueryBuilder<any>,
        options: RepositoryFindOptions
    ) {
        if (!options || !options.where) return query;
        let i = 0;
        for (let option of options.where) {
            if (option.specialType) {
                switch (option.specialType) {
                    case "like": {
                        query.andWhere(`${option.element} LIKE :search${i}`, {
                            [`search${i}`]: `%${option.value}%`,
                        });
                        i++;
                        break;
                    }
                }
            } else {
                query.andWhere(
                    `${option.element} ${
                        Array.isArray(option.value) ? "IN" : "="
                    } :val`,
                    {
                        val: option.value,
                    }
                );
            }
        }
        return query;
    }
}
