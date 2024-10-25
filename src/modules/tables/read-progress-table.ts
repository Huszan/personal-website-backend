import { AppDataSource } from "../../data-source";
import { ReadProgress } from "../../entity/ReadProgress";
import { ReadProgressType } from "../../types/read-progress.type";
import * as mangaTable from "./manga-table";

export const repository = AppDataSource.manager.getRepository(ReadProgress);

export function convertDataToTableEntry(data: ReadProgressType): ReadProgress {
    let entry = new ReadProgress();
    if (data.id) entry.id = data.id;
    entry.user_id = data.userId;
    entry.manga_id = data.mangaId;
    entry.last_read_chapter = data.lastReadChapter;
    if (data.lastReadPage) entry.last_read_page = data.lastReadPage;
    return entry;
}

export function convertTableEntryToData(entry: ReadProgress): ReadProgressType {
    return {
        id: entry.id,
        userId: entry.user_id,
        mangaId: entry.manga_id,
        manga: mangaTable.convertTableEntryToData(entry.manga),
        lastReadChapter: entry.last_read_chapter,
        lastReadPage: entry.last_read_page,
    };
}
