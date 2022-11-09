
class Manga {
    constructor(
        id = null,
        name,
        pic,
        startingChapter,
        chapterCount,
        htmlLocate,
    ) {
        this.id = id;
        this.name = name;
        this.pic = pic;
        this.startingChapter = startingChapter;
        this.chapterCount = chapterCount;
        this.htmlLocate = htmlLocate;
    }
}

module.exports = {Manga}