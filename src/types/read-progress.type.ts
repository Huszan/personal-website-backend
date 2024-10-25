import { MangaType } from "./manga.type";

export interface ReadProgressType {
    id?: number;
    userId: number;
    mangaId: number;
    manga: MangaType;
    lastReadChapter: number;
    lastReadPage: number;
}
