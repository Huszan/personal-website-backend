import * as express from "express";
import { verifyToken } from "../modules/token-validation";
import { ScrapMangaType } from "../types/scrap-manga.type";
import { sendResponse } from "../helper/SendResponseHelper";
import { UserTokenData } from "../types/user-token-data.type";
import { AdvancedScrapper } from "../modules/scrapper/advanced-scrapper";
import { MangaType } from "../types/manga.type";
import { HtmlLocate } from "../entity/HtmlLocate";
import { HtmlLocateType } from "../types/html-locate.type";

const router = express.Router();

function getLocateFromList(
    list: HtmlLocateType[] | undefined,
    entityName: string
) {
    if (!list) return;
    return list.filter((el) => el.entityName === entityName)[0];
}

router.post(
    "/scrapper/manga",
    verifyToken,
    async (req: express.Request, res: express.Response): Promise<any> => {
        try {
            const mangaData = req.body.data as MangaType;
            const userData: UserTokenData = req["tokenData"]
                ? req["tokenData"]
                : undefined;

            if (userData === undefined || userData.accountType !== "admin") {
                return sendResponse(res, 403, {
                    status: "error",
                    message: "You are not authorized to do this action!",
                });
            }
            const data = await AdvancedScrapper.getMangaData(
                {
                    chapters: {
                        name: getLocateFromList(
                            mangaData.scrapManga.htmlLocateList,
                            "chapterNames"
                        ),
                        url: getLocateFromList(
                            mangaData.scrapManga.htmlLocateList,
                            "chapterUrls"
                        ),
                    },
                    pages: getLocateFromList(
                        mangaData.scrapManga.htmlLocateList,
                        "pages"
                    ),
                },
                mangaData.scrapManga.beforeUrl
            );
            if (!data) throw Error("No data found!");

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
                status: "success",
                data: manga,
            });
        } catch (error) {
            return sendResponse(res, 500, {
                status: "error",
                message: "An error occurred while testing scrapper form",
            });
        }
    }
);

export default router;
