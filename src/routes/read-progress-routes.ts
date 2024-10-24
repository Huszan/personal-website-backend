import * as express from "express";
import { ReadProgressType } from "../types/read-progress.type";
import { sendResponse } from "../helper/SendResponseHelper";
import { ReadProgress } from "../entity/ReadProgress";
import { AppDataSource } from "../data-source";
import { Equal } from "typeorm";
import {
    convertDataToTableEntry,
    convertTableEntryToData,
} from "../modules/tables/read-progress-table";

const router = express.Router();
const repo = AppDataSource.manager.getRepository(ReadProgress);

const isDataCorrect = (data: ReadProgressType) => {
    return (
        data &&
        data.lastReadChapter !== undefined &&
        data.lastReadPage !== undefined &&
        data.mangaId !== undefined &&
        data.userId !== undefined
    );
};

const isEntityCorrect = (entity: ReadProgress) => {
    return (
        entity && entity.user_id !== undefined && entity.manga_id !== undefined
    );
};

router.post(
    "/user/:userId/progress",
    async (req: express.Request, res: express.Response) => {
        const data = req.body.data as ReadProgressType;

        if (!isDataCorrect(data)) {
            return sendResponse(res, 400, {
                status: "error",
                message: "Invalid read progress data",
            });
        }

        try {
            let progress = await repo.findOne({
                where: { user: Equal(data.userId), manga: Equal(data.mangaId) },
            });

            if (!progress) progress = convertDataToTableEntry(data);
            else {
                progress.last_read_chapter = data.lastReadChapter;
                progress.last_read_page = data.lastReadPage;
            }

            if (!isEntityCorrect(progress)) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Couldnt create database entry from data provided",
                });
            }

            await repo.save(progress);
            return sendResponse(res, 200, {
                status: "success",
                message: "Succesfully saved read progress",
            });
        } catch (error) {
            return sendResponse(res, 500, {
                status: "error",
                message: "Failed to update progress",
            });
        }
    }
);

router.delete(
    "/user/:userId/progress/:progressId",
    async (req: express.Request, res: express.Response) => {
        const progressId = Number(req.params.progressId);

        if (Number.isNaN(progressId)) {
            return sendResponse(res, 400, {
                status: "error",
                message: "Progress id not provided",
            });
        }

        try {
            const progress = await repo.findOne({
                where: { id: progressId },
            });
            if (progress === undefined) {
                return sendResponse(res, 404, {
                    status: "error",
                    message: "Progress not found",
                });
            }
            await repo.remove(progress);
            return sendResponse(res, 200, {
                status: "success",
                message: "Progress removed",
            });
        } catch (error) {
            return sendResponse(res, 500, {
                status: "error",
                message: "Couldn't remove progress",
            });
        }
    }
);

router.get(
    "/user/:userId/progress/:progressId?",
    async (req: express.Request, res: express.Response) => {
        const userId = Number(req.params.userId);
        const progressId = req.params.progressId
            ? Number(req.params.progressId)
            : NaN;

        if (Number.isNaN(userId)) {
            return sendResponse(res, 400, {
                status: "error",
                message: "User id not provided or invalid",
            });
        }

        try {
            if (!Number.isNaN(progressId)) {
                const progress = await repo.findOne({
                    where: { id: progressId },
                });
                if (progress === undefined) {
                    return sendResponse(res, 404, {
                        status: "error",
                        message: "Progress not found",
                    });
                }

                return sendResponse(res, 200, {
                    status: "success",
                    message: "Progress found",
                    data: convertTableEntryToData(progress),
                });
            } else {
                const progressList = await repo.find({
                    where: { user: Equal(userId) },
                });
                if (progressList === undefined || progressList.length === 0) {
                    return sendResponse(res, 404, {
                        status: "error",
                        message: "No progress entries found for this user",
                    });
                }

                return sendResponse(res, 200, {
                    status: "success",
                    message: "Progress entries found",
                    data: progressList.map((el) => convertTableEntryToData(el)),
                });
            }
        } catch (error) {
            return sendResponse(res, 500, {
                status: "error",
                message: "Internal server error while retrieving progress",
            });
        }
    }
);

export default router;
