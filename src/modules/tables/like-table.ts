import {AppDataSource} from "../../data-source";
import {LikeType} from "../../types/like.type";
import {Like} from "../../entity/Like";
import * as MangaTable from "../tables/manga-table";
import * as UserTable from "../tables/user-table";
import {FindManyOptions} from "typeorm";

export const repository = AppDataSource.manager.getRepository(Like);

export async function create(data: Like) {
    return repository.save(data);
}

export async function read(options?: FindManyOptions<Like>) {
    let query = repository
        .createQueryBuilder("like")
    if (options) query = query.setFindOptions(options);
    return query.getMany();
}

export async function update(data: Like) {
    return repository.save(data);
}

export async function remove(id?: number) {
    let entry = await repository.findOneBy({id: id});
    if (entry) { return repository.remove(entry) }
}

export function convertDataToTableEntry(data: LikeType): Like {
    let like = new Like();
    if (data.id) like.id = data.id;
    like.manga_id = data.mangaId;
    like.user_id = data.userId;
    return like;
}

export function convertTableEntryToData(entry: Like): LikeType {
    return {
        id: entry.id,
        mangaId: entry.manga_id,
        userId: entry.user_id,
    }
}
