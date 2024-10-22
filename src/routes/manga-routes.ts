import * as express from "express";
import { sendResponse } from "../helper/SendResponseHelper";
import { MangaType } from "../types/manga.type";
import { Manga } from "../entity/Manga";
import * as MangaTable from "../modules/tables/manga-table";
import * as ChapterTable from "../modules/tables/chapter-table";
import * as PageTable from "../modules/tables/page-table";
import * as LikeTable from "../modules/tables/like-table";
import { LikeType } from "../types/like.type";
import { ChapterType } from "../types/chapter.type";
import { RepositoryFindOptions } from "../types/repository-find-options";
import { UserTokenData } from "../types/user-token-data.type";
import { verifyToken } from "../modules/token-validation";
import { getCache, setCache } from "../helper/cache.helper";

const router = express.Router();

router.post(
    "/manga",
    verifyToken,
    async (req: express.Request, res: express.Response): Promise<any> => {
        try {
            const mangaData: MangaType = req.body.manga;
            const userData: UserTokenData = req["tokenData"]
                ? req["tokenData"]
                : undefined;

            if (userData === undefined || userData.accountType !== "admin") {
                return sendResponse(res, 403, {
                    status: "error",
                    message: "You are not authorized to do this action!",
                });
            }

            // Validate mangaData here (e.g., check for required fields)
            if (
                !mangaData ||
                !mangaData.name ||
                !mangaData.pic ||
                !mangaData.authors ||
                !mangaData.tags ||
                !mangaData.likes ||
                !mangaData.lastUpdateDate ||
                !mangaData.addedDate ||
                !mangaData.description ||
                !mangaData.chapterCount ||
                mangaData.viewCount
            ) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Missing required fields",
                });
            }

            const manga: Manga = MangaTable.convertDataToTableEntry(mangaData);
            const results = await MangaTable.create(manga);

            return sendResponse(res, 200, {
                status: "success",
                data: results, // Assuming `results` contains the created manga details
            });
        } catch (error) {
            return sendResponse(res, 500, {
                status: "error",
                message: "An error occurred while creating the manga",
            });
        }
    }
);

router.delete(
    "/manga/:id",
    verifyToken,
    async (req: express.Request, res: express.Response): Promise<any> => {
        const mangaId = req.params.id;
        const userData: UserTokenData = req["tokenData"]
            ? req["tokenData"]
            : undefined;
        try {
            if (userData === undefined || userData.accountType !== "admin") {
                return sendResponse(res, 403, {
                    status: "error",
                    message: "You are not authorized to do this action!",
                });
            }

            if (!mangaId) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Manga ID is required",
                });
            }

            const manga = await MangaTable.read({
                where: [{ element: "manga.id", value: mangaId }],
            });
            const mangaRemoved = manga
                ? await MangaTable.remove(manga[0])
                : false;

            if (mangaRemoved) {
                return sendResponse(res, 200, {
                    status: "success",
                    message: "Manga removed successfully",
                });
            } else {
                return sendResponse(res, 404, {
                    status: "error",
                    message: "Manga not found",
                });
            }
        } catch (error) {
            console.error(error);
            return sendResponse(res, 500, {
                status: "error",
                message: "An error occurred while removing the manga",
            });
        }
    }
);

router.get("/manga", async (req: express.Request, res: express.Response) => {
    const options: RepositoryFindOptions | undefined = req.query.options
        ? (JSON.parse(req.query.options as string) as RepositoryFindOptions)
        : undefined;

    try {
        const cacheKey = `manga_${JSON.stringify(req.query.options)}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return sendResponse(res, 200, {
                status: "success",
                data: JSON.parse(cachedData),
            });
        }

        // Fetch the manga list based on options if no ID is provided
        const data = await MangaTable.getMangaList(options);
        const convertedList: MangaType[] = [];

        for (const el of data.list) {
            el.chapter_count = await ChapterTable.getChapterCount({
                where: [{ element: "manga_id", value: el.id }],
            });
            convertedList.push(MangaTable.convertTableEntryToData(el));
        }

        await setCache(
            cacheKey,
            JSON.stringify({
                list: convertedList,
                count: data.count,
            })
        );
        return sendResponse(res, 200, {
            status: "success",
            data: {
                list: convertedList,
                count: data.count,
            },
        });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, {
            status: "error",
            message: "An error occurred while fetching the manga data",
        });
    }
});

router.get(
    "/manga/:id",
    async (req: express.Request, res: express.Response): Promise<any> => {
        const mangaId: number | undefined = req.params.id
            ? parseInt(req.params.id)
            : undefined;

        try {
            const manga = await MangaTable.read({
                where: [{ element: "manga.id", value: mangaId }],
            });

            if (!manga || manga.length === 0) {
                return sendResponse(res, 404, {
                    status: "error",
                    message: "Manga not found",
                });
            }

            const mangaEntry = manga[0];
            mangaEntry.chapter_count = await ChapterTable.getChapterCount({
                where: [{ element: "manga_id", value: mangaEntry.id }],
            });

            const convertedManga =
                MangaTable.convertTableEntryToData(mangaEntry);

            return sendResponse(res, 200, {
                status: "success",
                data: {
                    manga: convertedManga,
                },
            });
        } catch (error) {
            console.error(error);
            return sendResponse(res, 500, {
                status: "error",
                message: "An error occurred while fetching the manga data.",
            });
        }
    }
);

router.get(
    "/manga/:id/chapters",
    async (req: express.Request, res: express.Response): Promise<any> => {
        const mangaId: number = parseInt(req.params.id, 10);

        try {
            if (isNaN(mangaId)) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Invalid manga ID.",
                });
            }

            const chapterList = await ChapterTable.read({
                where: [{ element: "manga_id", value: mangaId }],
            });

            if (chapterList.length === 0) {
                return sendResponse(res, 404, {
                    status: "error",
                    message: "Didn't found any chapters for this manga",
                });
            }

            const convertedList: ChapterType[] = chapterList
                .sort((a, b) => b.id - a.id)
                .map((chapter) =>
                    ChapterTable.convertTableEntryToData(chapter)
                );

            return sendResponse(res, 200, {
                status: "success",
                data: {
                    chapters: convertedList,
                },
            });
        } catch (error) {
            console.error(error);
            return sendResponse(res, 500, {
                status: "error",
                message: "An error occurred while fetching manga chapters.",
            });
        }
    }
);

router.get(
    "/manga/:mangaId/chapters/:chapterId/pages",
    async (req: express.Request, res: express.Response): Promise<any> => {
        const mangaId: number = parseInt(req.params.mangaId, 10);
        const chapterId: number = parseInt(req.params.chapterId, 10);

        try {
            if (isNaN(mangaId) || isNaN(chapterId)) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Invalid manga ID or chapter ID.",
                });
            }

            const results = await PageTable.read({
                where: {
                    chapter_id: chapterId,
                },
            });

            await MangaTable.increaseViewCount(mangaId);

            return sendResponse(res, 200, {
                status: "success",
                data: {
                    pages: results,
                },
            });
        } catch (error) {
            console.error(error);
            return sendResponse(res, 500, {
                status: "error",
                message: "An error occurred while fetching manga pages.",
            });
        }
    }
);

router.post(
    "/manga/like",
    async (req: express.Request, res: express.Response): Promise<any> => {
        const likeData: LikeType = req.body.like;

        // Validate input
        if (!likeData || !likeData.mangaId || !likeData.userId) {
            return sendResponse(res, 400, {
                status: "error",
                message: "Didn't receive required data to process action",
            });
        }

        try {
            // Check if the user already liked the manga
            const likes = await LikeTable.read({
                where: {
                    user_id: likeData.userId,
                    manga_id: likeData.mangaId,
                },
            });

            const existingLike = likes[0];

            if (existingLike) {
                // User is removing their like (dislike)
                await LikeTable.remove(existingLike.id);
                await MangaTable.update(existingLike.manga_id);
                return sendResponse(res, 200, {
                    status: "success",
                    message: "Your dislike has been noted",
                    data: existingLike,
                });
            } else {
                // User is adding a like
                const like = LikeTable.convertDataToTableEntry(likeData);
                const createdLike = await LikeTable.create(like);
                await MangaTable.update(createdLike.manga_id);
                return sendResponse(res, 201, {
                    status: "success",
                    message: "Your like has been noted",
                    data: createdLike,
                });
            }
        } catch (err) {
            console.error(err);
            return sendResponse(res, 500, {
                status: "error",
                message: "An error occurred while processing your request.",
            });
        }
    }
);

export default router;
