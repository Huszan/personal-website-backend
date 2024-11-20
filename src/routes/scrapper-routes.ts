import * as express from "express";
import { verifyToken } from "../modules/token-validation";
import { ScrapMangaType } from "../types/scrap-manga.type";
import { sendResponse } from "../helper/SendResponseHelper";
import { UserTokenData } from "../types/user-token-data.type";
import { AdvancedScrapper } from "../modules/scrapper/advanced-scrapper";
import { MangaType } from "../types/manga.type";

const router = express.Router();

router.post(
    "/scrapper/manga",
    verifyToken,
    async (req: express.Request, res: express.Response): Promise<any> => {
        try {
            const scrapData: ScrapMangaType = req.body.data;
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
                        name: scrapData.chaptersScrap.nameLocate,
                        url: scrapData.chaptersScrap.urlLocate,
                    },
                    pages: scrapData.pagesLocate,
                },
                scrapData.beforeUrl
            );
            if (!data) throw Error("No data found!");

            const manga: MangaType = {
                name: scrapData.name,
                pic: scrapData.pic,
                authors: scrapData.authors,
                tags: scrapData.tags,
                chapters: data.chapters,
                likes: [],
                lastUpdateDate: new Date(),
                addedDate: new Date(),
                description: scrapData.description,
                chapterCount: data.chapters.length,
                viewCount: 0,
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
