import {HtmlLocateType} from "./html-locate.type";

export interface MangaType {
    id: number,
    name: string,
    pic: string,
    authors: string[],
    genres: string[],
    lastUpdateDate: Date,
    addedDate: Date,
    viewCount: number,
    likeCount: number,
    description: string,
    startingChapter: number,
    chapterCount: number,
    htmlLocate: HtmlLocateType,
}
