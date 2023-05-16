import {UserType} from "../../types/user.type";
import {MangaType} from "../../types/manga.type";
import {HtmlLocateType} from "../../types/html-locate.type";
import {LikeType} from "../../types/like.type";

export const exampleHtmlLocateForm: HtmlLocateType = {
    id: 10000,
    positions: [".separator > a", ".separator", ".wp-block-image > figure"],
    lookedType: 'img',
    lookedAttr: 'src',
    urls: ["https://leveling-solo.org/manga/solo-leveling-chapter-4-!!!/"],
}

export const exampleMangaForm: MangaType = {
    id: 10000,
    name: 'Solo Leveling',
    pic: 'https://www.atomcomics.pl/environment/cache/images/0_0_productGfx_208373/STL185278.jpg',
    authors: JSON.parse(JSON.stringify(['Chugong'])),
    genres: JSON.parse(JSON.stringify(['Action','Adventure','Demon slaying'])),
    lastUpdateDate: new Date(),
    addedDate: new Date(),
    viewCount: 0,
    likes: [],
    description: 'Meh',
    startingChapter: 0,
    chapterCount: 179,
    htmlLocate: exampleHtmlLocateForm,
}

export const exampleUserForm: UserType = {
    id: 10000,
    name: 'Jacek',
    email: 'mateuszjacenty1@gmail.com',
    password: 'unrefinedPassword123',
    isVerified: false,
    accountType: 'admin',
}

export const exampleLike: LikeType = {
    id: null,
    mangaId: 10000,
    userId: 10000,
}
