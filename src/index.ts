import { AppDataSource } from "./data-source";
import * as bodyParser from "body-parser";
import { MangaType } from "./types/manga.type";
import { Manga } from "./entity/Manga";
import * as MangaTable from "./modules/tables/manga-table";
import * as ChapterTable from "./modules/tables/chapter-table";
import * as PageTable from "./modules/tables/page-table";
import * as UserTable from "./modules/tables/user-table";
import * as LikeTable from "./modules/tables/like-table";
import * as EmailHandler from "./modules/email-handler";
import * as AccountHandler from "./modules/account-handler";
import { LikeType } from "./types/like.type";
import { UserType } from "./types/user.type";
import {
    getRandomString,
    sendPasswordResetEmail,
} from "./modules/account-handler";
import { AdvancedScrapper } from "./modules/scrapper/advanced-scrapper";
import { ChapterType } from "./types/chapter.type";
import { RepositoryFindOptions } from "./types/repository-find-options";
import { ContactInfo } from "./modules/tables/contact-info";
import * as express from "express";
import { sendResponse } from "./helper/SendResponseHelper";

const cors = require("cors");
require("@dotenvx/dotenvx").config();

AppDataSource.initialize()
    .then(async () => {
        const app = express();
        let listener: any = app.listen(process.env.PORT || 3000, () => {
            console.log(
                `The server started on port ${listener.address()!.port}`
            );
        });
        app.use(bodyParser.json());
        app.use(cors());

        // Use this for developement purposes. Do not push changes for it.
        app.post("/test", (req: express.Request, res: express.Response) => {
            sendResponse(res, 200);
        });

        app.post("/post", (req: express.Request, res: express.Response) => {
            let body = req.body;
            EmailHandler.sendMail(body, (info: { messageId: any }) => {
                const message = `E-mail has been sent`;
                console.log(`${message}. Id -> ${info.messageId}`);
                sendResponse(res, 200, {
                    status: "success",
                    message,
                    data: info,
                });
            });
        });

        app.post(
            "/sendMailMangaDot",
            (req: express.Request, res: express.Response) => {
                let info: ContactInfo = req.body.info;
                const body = {
                    from: info.email,
                    to: "mangadot.contact@gmail.com",
                    subject: `Contact from Manga Dot - ${info.subject}`,
                    text: `Hi, my name is ${info.name}.\n\n\t${info.message} \n\nPlease, contact me back ${info.email}`,
                };
                EmailHandler.sendCustomMail(
                    body,
                    (info: { messageId: any }) => {
                        console.log(
                            `E-mail has been sent. Id -> ${info.messageId}`
                        );
                        sendResponse(res, 200, {
                            status: "success",
                            message: `E-mail has been sent`,
                            data: info,
                        });
                    }
                );
            }
        );

        app.post(
            "/manga",
            async (
                req: express.Request,
                res: express.Response
            ): Promise<any> => {
                try {
                    const mangaData: MangaType = req.body.manga;

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

                    const manga: Manga =
                        MangaTable.convertDataToTableEntry(mangaData);
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

        app.delete(
            "/manga/:id",
            async (
                req: express.Request,
                res: express.Response
            ): Promise<any> => {
                const mangaId = req.params.id;

                try {
                    // Validate the manga ID
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

        app.get(
            "/manga",
            async (req: express.Request, res: express.Response) => {
                const options: RepositoryFindOptions | undefined = req.query
                    .options
                    ? (JSON.parse(
                          req.query.options as string
                      ) as RepositoryFindOptions)
                    : undefined;

                try {
                    // Fetch the manga list based on options if no ID is provided
                    const data = await MangaTable.getMangaList(options);
                    const convertedList: MangaType[] = [];

                    for (const el of data.list) {
                        el.chapter_count = await ChapterTable.getChapterCount({
                            where: [{ element: "manga_id", value: el.id }],
                        });
                        convertedList.push(
                            MangaTable.convertTableEntryToData(el)
                        );
                    }

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
                        message:
                            "An error occurred while fetching the manga data",
                    });
                }
            }
        );

        app.get(
            "/manga/:id",
            async (
                req: express.Request,
                res: express.Response
            ): Promise<any> => {
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
                    mangaEntry.chapter_count =
                        await ChapterTable.getChapterCount({
                            where: [
                                { element: "manga_id", value: mangaEntry.id },
                            ],
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
                        message:
                            "An error occurred while fetching the manga data.",
                    });
                }
            }
        );

        app.get(
            "/manga/:id/chapters",
            async (
                req: express.Request,
                res: express.Response
            ): Promise<any> => {
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
                        message:
                            "An error occurred while fetching manga chapters.",
                    });
                }
            }
        );

        app.get(
            "/manga/:mangaId/chapters/:chapterId/pages",
            async (
                req: express.Request,
                res: express.Response
            ): Promise<any> => {
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
                        message:
                            "An error occurred while fetching manga pages.",
                    });
                }
            }
        );

        app.post(
            "/manga/like",
            async (
                req: express.Request,
                res: express.Response
            ): Promise<any> => {
                const likeData: LikeType = req.body.like;

                // Validate input
                if (!likeData || !likeData.mangaId || !likeData.userId) {
                    return sendResponse(res, 400, {
                        status: "error",
                        message:
                            "Didn't receive required data to process action",
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
                        const like =
                            LikeTable.convertDataToTableEntry(likeData);
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
                        message:
                            "An error occurred while processing your request.",
                    });
                }
            }
        );

        app.post("/register", (req: express.Request, res: express.Response) => {
            const userData: UserType = req.body.user;
            const activateUrl: string = req.body.activateUrl;
            if (
                !userData ||
                !userData.email ||
                !userData.name ||
                !userData.password
            ) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Invalid user form",
                });
            }
            UserTable.read({
                where: {
                    email: userData.email,
                },
                take: 1,
            }).then(async (user) => {
                if (user[0]) {
                    return sendResponse(res, 409, {
                        status: "error",
                        message: "User with this email address already exist",
                    });
                }

                userData.password = await AccountHandler.hashPassword(
                    userData.password
                ).then((hash) => {
                    return hash;
                });

                UserTable.create(
                    UserTable.convertDataToTableEntry(
                        userData,
                        AccountHandler.getRandomString()
                    )
                )
                    .then((registerRes) => {
                        sendResponse(res, 201, {
                            status: "success",
                            message:
                                "User created. Check Your email to activate your account. (Remember to check spam as well)",
                        });
                        AccountHandler.sendConfirmationEmail(
                            activateUrl,
                            registerRes
                        );
                        return;
                    })
                    .catch((registerErr) => {
                        return sendResponse(res, 500, {
                            status: "error",
                            message: registerErr.message,
                        });
                    });
            });
        });

        app.post(
            "/resendActivation",
            (req: express.Request, res: express.Response) => {
                const email = req.body.email;
                const activateUrl: string = req.body.activateUrl;
                if (!email || !activateUrl) {
                    return sendResponse(res, 400, {
                        status: "error",
                        message: "Missing form data",
                    });
                }
                UserTable.read({
                    where: {
                        email: email,
                    },
                })
                    .then((users) => {
                        let user = users[0];
                        if (!user) {
                            return sendResponse(res, 404, {
                                status: "error",
                                message: "User not found",
                            });
                        }
                        if (!user.verificationCode) {
                            return sendResponse(res, 500, {
                                status: "success",
                                message:
                                    "User already verified. You can log in now",
                            });
                        }
                        AccountHandler.sendConfirmationEmail(
                            activateUrl,
                            user,
                            () => {
                                return sendResponse(res, 200, {
                                    status: "success",
                                    message:
                                        "Activation link has been sent to your email address",
                                });
                            }
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                        return sendResponse(res, 500, {
                            status: "error",
                            message:
                                "Failed to send activation link. Please try again later",
                        });
                    });
            }
        );

        app.post("/login", (req: express.Request, res: express.Response) => {
            const userData = {
                email: req.body.email,
                password: req.body.password,
            };
            if (!userData || !userData.email || !userData.password) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Invalid credentials",
                });
            }
            UserTable.read({
                where: {
                    email: userData.email,
                    verificationCode: null,
                },
                take: 1,
            })
                .then((loginUser) => {
                    if (!loginUser[0]) {
                        return sendResponse(res, 400, {
                            status: "error",
                            message: "Invalid credentials",
                        });
                    }

                    AccountHandler.comparePassword(
                        userData.password,
                        loginUser[0].password
                    ).then((isPasswordValid) => {
                        if (isPasswordValid) {
                            loginUser[0].authToken = getRandomString();
                            UserTable.update(loginUser[0]);
                            return sendResponse(res, 200, {
                                status: "success",
                                message: "Successfully logged in",
                                data: loginUser[0],
                            });
                        } else {
                            return sendResponse(res, 400, {
                                status: "error",
                                message: "Invalid password",
                            });
                        }
                    });
                })
                .catch((loginErr) => {
                    console.log(loginErr);
                    return sendResponse(res, 500, {
                        status: "error",
                        message: "Something went wrong. Try again later.",
                    });
                });
        });

        app.post(
            "/login/token",
            (req: express.Request, res: express.Response) => {
                const token = req.body.token;
                if (!token) {
                    return sendResponse(res, 404, {
                        status: "error",
                        message: "Auth token not found",
                    });
                }
                UserTable.read({
                    where: {
                        authToken: token,
                        verificationCode: null,
                    },
                    take: 1,
                })
                    .then((loginUser) => {
                        if (!loginUser[0]) {
                            return sendResponse(res, 400, {
                                status: "error",
                                message: "Auth code expired",
                            });
                        }

                        return sendResponse(res, 200, {
                            status: "success",
                            message: "Successfully logged in",
                            data: loginUser[0],
                        });
                    })
                    .catch((loginErr) => {
                        console.log(loginErr);
                        return sendResponse(res, 500, {
                            status: "error",
                            message: "Something went wrong. Try again later.",
                        });
                    });
            }
        );

        app.post("/logout", (req: express.Request, res: express.Response) => {
            const id = req.body.id;
            if (!id) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Id was not found in request",
                });
            }
            UserTable.read({
                where: {
                    id: id,
                },
            })
                .then((users) => {
                    if (!users[0]) {
                        return sendResponse(res, 404, {
                            status: "error",
                            message: "Account not found",
                        });
                    }
                    let user = users[0];
                    user.authToken = null;
                    UserTable.update(user);
                    return sendResponse(res, 200, {
                        status: "success",
                        message: "Successfully logged out",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    return sendResponse(res, 500, {
                        status: "error",
                        message: "Something went wrong. Try again later.",
                    });
                });
        });

        app.post("/activate", (req: express.Request, res: express.Response) => {
            const code = req.body.code;
            if (!code) {
                return sendResponse(res, 400, {
                    status: "error",
                    message: "Code not found in request",
                });
            }

            UserTable.read({
                where: {
                    verificationCode: code,
                },
            }).then((users) => {
                if (!users[0]) {
                    return sendResponse(res, 400, {
                        status: "error",
                        message: "Verification code expired",
                    });
                }

                const updatedUser = users[0];
                updatedUser.verificationCode = null;
                UserTable.update(updatedUser)
                    .then((verifiedUser) => {
                        if (!verifiedUser) {
                            return sendResponse(res, 500, {
                                status: "error",
                                message:
                                    "Something went wrong during user verification. Try again later.",
                            });
                        }

                        return sendResponse(res, 201, {
                            status: "success",
                            message:
                                "Account verified successfully. You can now log in!",
                        });
                    })
                    .catch((verifiedErr) => {
                        console.log(verifiedErr);
                        return sendResponse(res, 500, {
                            status: "error",
                            message:
                                "Something went wrong during user verification. Try again later.",
                        });
                    });
            });
        });

        app.post(
            "/forgotPassword",
            async (req: express.Request, res: express.Response) => {
                const email = req.body.email;
                const newPassword = req.body.newPassword;
                if (!email || !newPassword) {
                    return sendResponse(res, 400, {
                        status: "error",
                        message: "Missing email and new password.",
                    });
                }

                UserTable.read({
                    where: {
                        email: email,
                        verificationCode: null,
                    },
                }).then(async (users) => {
                    let user = users[0];
                    if (!user) {
                        return sendResponse(res, 404, {
                            status: "error",
                            message: "There is no user with this email address",
                        });
                    }
                    let generatedToken = AccountHandler.getRandomString();
                    sendPasswordResetEmail(
                        `${req.protocol}://${req.get("host")}/resetPassword`,
                        generatedToken,
                        user,
                        () => {
                            AccountHandler.forgotPasswordWaitingList.push({
                                user: user,
                                newPassword: newPassword,
                                token: generatedToken,
                            });
                            return sendResponse(res, 200, {
                                status: "success",
                                message:
                                    "Verification mail has been sent to your account",
                            });
                        }
                    );
                });
            }
        );

        app.get(
            "/resetPassword",
            async (req: express.Request, res: express.Response) => {
                const token = req.query.token as string;
                if (!token) {
                    res.send("<d1>Token invalid</d1>");
                    return;
                }
                let changeRequestIndex =
                    AccountHandler.forgotListIndexOfReq(token);
                if (changeRequestIndex === null) {
                    res.send("<d1>Token not found</d1>");
                    return;
                }
                let changeRequest =
                    AccountHandler.forgotPasswordWaitingList[
                        changeRequestIndex
                    ];
                changeRequest.newPassword = await AccountHandler.hashPassword(
                    changeRequest.newPassword
                ).then((hash) => {
                    return hash;
                });
                changeRequest.user.password = changeRequest.newPassword;
                changeRequest.user.authToken = null;
                UserTable.update(changeRequest.user).then((userUpdateRes) => {
                    if (!userUpdateRes) {
                        res.send(
                            "<d1>Something went wrong during changing your account password</d1>"
                        );
                        return;
                    } else {
                        res.send("<d1>Your password has been changed</d1>");
                    }
                    AccountHandler.forgotPasswordWaitingList.splice(
                        changeRequestIndex,
                        1
                    );
                });
            }
        );

        AdvancedScrapper.axiosSetup();

        // let bttScrapper = new BTTScrapper();
        // bttScrapper.sendSpider({
        //     saveEntries: true,
        //     skipTo: 15031,
        // });
    })
    .catch((error) => console.log(error));
