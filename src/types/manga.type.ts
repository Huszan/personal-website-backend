import {HtmlLocateType} from "./html-locate.type";
import {LikeType} from "./like.type";
import {ChapterType} from "./chapter.type";

export interface MangaType {
    id?: number,
    name: string,
    pic: string,
    authors: string[],
    genres: string[],
    lastUpdateDate: Date,
    addedDate: Date,
    viewCount: number,
    likes: LikeType[],
    description: string,
    startingChapter: number,
    chapterCount: number,
    chapters?: ChapterType[],
}
