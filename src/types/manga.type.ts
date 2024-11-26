import { LikeType } from "./like.type";
import { ChapterType } from "./chapter.type";
import { ScrapMangaType } from "./scrap-manga.type";

export interface MangaType {
    id?: number;
    name: string;
    pic: string;
    imagePath?: string;
    authors: string[];
    tags: string[];
    chapters?: ChapterType[];
    scrapManga?: ScrapMangaType;
    likes: LikeType[];
    lastUpdateDate: Date;
    addedDate: Date;
    description: string;
    chapterCount: number;
    viewCount: number;
}
