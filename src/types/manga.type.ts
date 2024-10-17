import { LikeType } from "./like.type";
import { ChapterType } from "./chapter.type";

export interface MangaType {
    id?: number;
    name: string;
    pic: string;
    authors: string[];
    tags: string[];
    chapters?: ChapterType[];
    likes: LikeType[];
    lastUpdateDate: Date;
    addedDate: Date;
    description: string;
    chapterCount: number;
    viewCount: number;
}
