import {
    create,
    remove,
    read,
    convertDataToTableEntry,
} from '../modules/tables/cache-table';

export async function getCache(
    key: string,
    expTime: number = 3600000
): Promise<string | null> {
    const cacheEntry = await read({
        where: [{ element: 'cache_key', value: key }],
        take: 1,
    });

    if (cacheEntry[0]) {
        const currentTime = new Date().getTime();
        const cacheTime = new Date(cacheEntry[0].created_at).getTime();

        // Cache expiration logic (e.g., 1 min expiration)
        if (currentTime - cacheTime < expTime) {
            return cacheEntry[0].data;
        } else {
            // Cache expired
            await remove(cacheEntry[0].id);
            return null;
        }
    }
    return null;
}

export async function setCache(key: string, data: string) {
    const cacheEntry = convertDataToTableEntry({
        cacheKey: key,
        data: data,
        createdAt: new Date(),
    });
    await create(cacheEntry);
}

export async function clearCache(key?: string) {
    if (key) {
        const cacheEntry = await read({
            where: [{ element: 'cache_key', value: key }],
            take: 1,
        });
        if (cacheEntry[0]) {
            await remove(cacheEntry[0].id);
        }
    } else {
        // Clear all cache entries
        const allCacheEntries = await read();
        for (const entry of allCacheEntries) {
            await remove(entry.id);
        }
    }
}
