import { AppDataSource } from "../../data-source";
import { Cache } from "../../entity/Cache";
import { CacheType } from "../../types/cache.type";
import { RepositoryFindOptions } from "../../types/repository-find-options";
import { TableManager } from "./table-manager";

const repository = AppDataSource.manager.getRepository(Cache);

export async function create(data: Cache) {
    return repository.save(data);
}

export async function read(options?: RepositoryFindOptions) {
    let query = repository.createQueryBuilder("cache");
    if (options) TableManager.applyOptionsToQuery(query, options);

    return query.getMany();
}

export async function update(data: Cache, id?: number) {
    let entry = await repository.findOneBy({ id: id });
    if (entry) {
        for (let para in data) {
            if (JSON.stringify(entry[para]) !== JSON.stringify(data[para])) {
                entry[para] = data[para];
            }
        }
        return repository.save(entry);
    }
}

export async function remove(id: number) {
    let entry = await repository.findOneBy({ id: id });
    if (entry) {
        return repository.remove(entry);
    }
}

export function convertDataToTableEntry(data: CacheType): Cache {
    let entry = new Cache();
    entry.id = data.id;
    entry.cache_key = data.cacheKey;
    entry.data = data.data;
    entry.created_at = data.createdAt;
    return entry;
}

export function convertTableEntryToData(entry: Cache): CacheType {
    let data: CacheType = {
        id: entry.id,
        cacheKey: entry.cache_key,
        data: entry.data,
        createdAt: entry.created_at,
    };
    return data;
}
