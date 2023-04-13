import {HtmlLocateType} from "./html-locate.type";

interface MangaDbType {
    id?: number,
    name: string,
    pic: string,
    authors: string[],
    genres: string[],
    last_update_date: Date,
    added_date: string,
    view_count: number,
    like_count: number,
    description: string,
    starting_chapter: number,
    chapter_count: number,
    id_html_locate: number,
}

interface MangaType {
    id: number,
    name: string,
    pic: string,
    authors: string[],
    genres: string[],
    lastUpdateDate: string,
    addedDate: string,
    viewCount: number,
    likeCount: number,
    description: string,
    startingChapter: number,
    chapterCount: number,
    htmlLocate: HtmlLocateType,
}

export { MangaDbType, MangaType };
