const {HtmlLocate} = require("./htmlLocate");

const REPLACEMENT_TOKEN = '!!!';

class Manga {
    constructor(
        name,
        pic,
        startingChapter,
        chapterCount,
        urls,
        htmlLocate,
    ) {
        this.name = name;
        this.pic = pic;
        this.startingChapter = startingChapter;
        this.chapterCount = chapterCount;
        this.urls = urls;
        this.htmlLocate = htmlLocate;
    }
    getUrlWithToken(url, chapter) {
        return url.replace(REPLACEMENT_TOKEN, chapter);
    }
}

// Fake database
const mangaList = [
    new Manga(
        name = "Solo Leveling",
        pic = 'https://www.atomcomics.pl/environment/cache/images/0_0_productGfx_208373/STL185278.jpg',
        startingChapter = 0,
        chapterCount = 179,
        urls = [
            `https://leveling-solo.org/manga/solo-leveling-chapter-4-${REPLACEMENT_TOKEN}/`,
        ],
        htmlLocate = new HtmlLocate(
            positions = [
                '.separator > a',
                '.separator',
                '.wp-block-image > figure',
            ],
            lookedType = 'img',
            lookedAttr = 'src',
            reqComparisons = [],
        )
    ),
    new Manga(
        name = "One Punch Man",
        pic = 'https://i.imgur.com/3lDcwdF.jpg',
        startingChapter = 1,
        chapterCount = 171,
        url = [
            `https://ww1.onepunch.online/manga/one-punch-man-chapter-3-${REPLACEMENT_TOKEN}/`,
            `https://ww1.onepunch.online/manga/one-punch-man-chapter-3-${REPLACEMENT_TOKEN}-1/`
        ],
        htmlLocate = new HtmlLocate(
            positions = [
                '.separator > a',
                '.separator',
                '.wp-block-image > figure',
            ],
            lookedType = 'img',
            lookedAttr = 'src',
            reqComparisons = [],
        )
    ),
]

module.exports = {Manga, mangaList}