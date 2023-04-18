import { Manga } from "../../entity/Manga";
import { HtmlLocate } from "../../entity/HtmlLocate";

const exampleHtmlLocate: HtmlLocate =  new HtmlLocate()
exampleHtmlLocate.id = 2;
exampleHtmlLocate.positions =
    JSON.parse(JSON.stringify([".separator > a", ".separator", ".wp-block-image > figure"]));
exampleHtmlLocate.looked_type = 'img';
exampleHtmlLocate.looked_attr = 'src';
exampleHtmlLocate.urls =
    JSON.parse(JSON.stringify(["https://leveling-solo.org/manga/solo-leveling-chapter-4-!!!/"]));

const exampleManga = new Manga();
exampleManga.id = 2;
exampleManga.name = 'Solo Leveling'
exampleManga.pic = 'https://www.atomcomics.pl/environment/cache/images/0_0_productGfx_208373/STL185278.jpg'
exampleManga.authors = JSON.parse(JSON.stringify(['Chugong']))
exampleManga.genres = JSON.parse(JSON.stringify(['Action','Adventure','Demon slaying']))
exampleManga.last_update_date = new Date()
exampleManga.added_date = new Date()
exampleManga.view_count = 0
exampleManga.like_count = 0
exampleManga.description = 'Meh'
exampleManga.starting_chapter = 0
exampleManga.chapter_count = 179

exampleManga.html_locate = exampleHtmlLocate;
exampleHtmlLocate.manga = exampleManga;
