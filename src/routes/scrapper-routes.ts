import * as express from 'express';
import { verifyToken } from '../modules/token-validation';
import { AdvancedScrapper } from '../modules/scrapper/advanced-scrapper';
import { MangaType } from '../types/manga.type';
import { HtmlLocateType } from '../types/html-locate.type';
import { sendResponse, validateAdminToken } from '../helper/route.helper';

const router = express.Router();

function getLocateFromList(
    list: HtmlLocateType[] | undefined,
    entityName: string
) {
    if (!list) return;
    return list.filter((el) => el.entityName === entityName)[0];
}

router.post(
    '/scrapper/manga',
    verifyToken,
    async (req: express.Request, res: express.Response): Promise<any> => {
        try {
            const mangaData = req.body.data as MangaType;
            if (!validateAdminToken(req, res)) return;
            const data = await AdvancedScrapper.getMangaData(
                {
                    chapters: {
                        name: getLocateFromList(
                            mangaData.scrapManga.htmlLocateList,
                            'chapterNames'
                        ),
                        url: getLocateFromList(
                            mangaData.scrapManga.htmlLocateList,
                            'chapterUrls'
                        ),
                    },
                    pages: getLocateFromList(
                        mangaData.scrapManga.htmlLocateList,
                        'pages'
                    ),
                },
                mangaData.scrapManga.beforeUrl
            );
            if (!data) throw Error('No data found!');

            const manga: MangaType = {
                id: mangaData.id,
                name: mangaData.name,
                pic: mangaData.pic,
                authors: mangaData.authors,
                tags: mangaData.tags,
                chapters: data.chapters,
                likes: mangaData.likes ? mangaData.likes : [],
                lastUpdateDate: new Date(),
                addedDate: mangaData.id ? mangaData.addedDate : new Date(),
                description: mangaData.description,
                chapterCount: data.chapters.length,
                viewCount: mangaData.viewCount ? mangaData.viewCount : 0,
                scrapManga: mangaData.scrapManga,
            };

            return sendResponse(res, 200, {
                status: 'success',
                data: manga,
            });
        } catch (error) {
            return sendResponse(res, 500, {
                status: 'error',
                message: error.message
                    ? error.message
                    : 'An error occurred while testing scrapper form',
            });
        }
    }
);

export default router;
