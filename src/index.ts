import { AppDataSource } from "./data-source"
import * as bodyParser from "body-parser";
import {MangaType} from "./types/manga.type";
import {Manga} from "./entity/Manga";
import * as MangaTable from "./modules/tables/manga-table";
import * as HtmlLocateTable from "./modules/tables/html-locate-table";
import * as PageTable from "./modules/tables/page-table";
import * as UserTable from "./modules/tables/user-table";
import * as LikeTable from "./modules/tables/like-table";
import * as EmailHandler from "./modules/email-handler";
import * as AccountHandler from './modules/account-handler';
const express = require('express');
const cors = require("cors");
import * as ExampleData from "./modules/tables/example-data";
import {LikeType} from "./types/like.type";
import {FindManyOptions} from "typeorm";
import {UserType} from "./types/user.type";
import {getRandomString, sendPasswordResetEmail} from "./modules/account-handler";
import {AdvancedScrapper} from "./modules/scrapper/advanced-scrapper";
import {HtmlLocateType} from "./types/html-locate.type";
import {BTTScrapper} from "./modules/scrapper/b-t-t-scrapper";
import {ChapterType} from "./types/chapter.type";
import {RepositoryFindOptions} from "./types/repository-find-options";

AppDataSource.initialize().then(async () => {
    const app = express();
    let listener: any = app.listen(process.env.PORT || 3000, () => {
        console.log(`The server started on port ${listener.address()!.port}`);
    });
    app.use(bodyParser.json());
    app.use(function (req: any, res: any, next: any) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Headers', true);
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        next();
    })
    app.use(cors(
        '*',
        true,
        200
    ));

    app.post("/post", (req: any, res: any) => {
        let body = req.body;
        EmailHandler.sendMail(body, (info: { messageId: any; }) => {
            console.log(`E-mail has been sent. Id -> ${info.messageId}`);
            res.send(info);
        });
    });

    app.post("/getMangaPages", async (req: any, res: any) => {
        let mangaId: number = req.body.mangaId;
        let chapter: ChapterType = req.body.chapter;
        PageTable.read({
            where: {
                chapter: chapter
            }
        })
            .then((results: any) => {
                res.send(results);
                MangaTable.increaseViewCount(mangaId);
            })
    })

    app.post("/testMangaForm", async (req: any, res: any) => {
        // let manga: MangaType = req.body.manga || null;
        // let testId = req.body.testId || null;
        // if (testId) {
        //     scrapper.continueTest(manga, testId)
        //         .then((results: any) => {
        //             res.send(results);
        //         })
        // } else {
        //     scrapper.testMangaForm(manga)
        //         .then((results: any) => {
        //             res.send(results);
        //         })
        // }
        res.send(false);
    })

    app.post("/testMangaChapter", async (req: any, res: any) => {
        // let manga: MangaType = req.body.manga || null;
        // let chapter = req.body.chapter || null;
        // scrapper.testMangaChapter(manga, chapter)
        //     .then((passed: any) => {
        //         res.send(passed);
        //     })
        res.send(false);
    })

    app.post("/createManga", async (req: any, res: any) => {
        let manga: Manga = MangaTable.convertDataToTableEntry(req.body.manga) || null;
        MangaTable.create(manga)
            .then((results: any) => {
                res.send({
                    success: true
                });
            })
    })

    app.post("/removeManga", async (req: any, res: any) => {
        let manga: MangaType = req.body.manga;
        let tableEntry = MangaTable.convertDataToTableEntry(manga);
        MangaTable.remove(tableEntry).then((mangaRemoved) => {
            res.send({
                success: true
            });
        })
    })

    app.post("/getMangaList", (req: any, res: any) => {
        let options: RepositoryFindOptions | undefined = req.body.options as RepositoryFindOptions;
        let bigSearch: string | undefined = req.body.bigSearch;

        MangaTable.read(options)
            .then((mangaList: any) => {
                let convertedList: MangaType[] = [];
                mangaList.forEach(el => {
                    convertedList.push(MangaTable.convertTableEntryToData(el));
                })
                convertedList.forEach(el => {
                    el.chapters = el.chapters.sort((a, b) => b.id - a.id);
                })
                res.send(convertedList);
            })
    })

    app.post("/likeManga", (req: any, res: any) => {
        const likeData: LikeType = req.body.like;
        if (
            !likeData
            || !likeData.mangaId
            || !likeData.userId) {
                res.send({
                status: 0,
                message: "Didn't received required data to process action",
                data: null,
            })
        }


        LikeTable.read({
            where: {
                user_id: likeData.userId,
                manga_id: likeData.mangaId,
            }
        })
            .then(likes => {
                const like = likes[0];
                if (like) {
                    LikeTable.remove(like.id)
                        .then(like => {
                            MangaTable.update(like.manga_id);
                            res.send({
                                status: 1,
                                message: 'Your dislike has been noticed',
                                data: like,
                            })
                        })
                        .catch(err => {
                            res.send({
                                status: 0,
                                message: err,
                                data: null,
                            })
                        })
                }
                else {
                    const like = LikeTable.convertDataToTableEntry(likeData);
                    LikeTable.create(like)
                        .then(like => {
                            MangaTable.update(like.manga_id);
                            res.send({
                                status: 1,
                                message: 'You like has been noticed',
                                data: like,
                            })
                        })
                        .catch(err => {
                            res.send({
                                status: 0,
                                message: err,
                                data: null,
                            })
                        })
                }
            })

    })

    app.post("/register", (req: any, res: any) => {
        const userData: UserType = req.body.user;
        const activateUrl: string = req.body.activateUrl;
        if (!userData || !userData.email || !userData.name || !userData.password) {
            res.send({
                status: 0,
                message: "Invalid user form sent",
                data: null,
            })
            return;
        }
        UserTable.read({
            where: {
                email: userData.email
            },
            take: 1
        })
            .then(async user => {
                if (user[0]) {
                    res.send({
                        status: 0,
                        message: "User with this email address already exist",
                        data: null,
                    })
                    return;
                }
                userData.password = await AccountHandler.hashPassword(userData.password)
                    .then(hash => {
                        return hash;
                    });
                UserTable.create(UserTable.convertDataToTableEntry(
                    userData,
                    AccountHandler.getRandomString()
                ) )
                    .then(registerRes => {
                        res.send({
                            status: 1,
                            message: "User created. Check Your email to activate your account. (Remember to check spam as well)",
                            data: registerRes,
                        })
                        AccountHandler.sendConfirmationEmail(activateUrl, registerRes);
                        return;
                    })
                    .catch(registerErr => {
                        res.send({
                            status: 0,
                            message: registerErr,
                            data: null,
                        })
                        return;
                    })
            })
    })

    app.post("/resendActivation", (req: any, res: any) => {
        const email = req.body.email;
        const activateUrl: string = req.body.activateUrl;
        if (!email || !activateUrl) {
            res.send({
                status: 0,
                message: 'Invalid data. Issue reported to administration',
                data: null,
            })
            console.log('Invalid data given on resendActivation', email, activateUrl);
            return;
        }
        UserTable.read({
            where: {
                email: email
            }
        }).then(users => {
            let user = users[0];
            if (!user) {
                res.send({
                    status: 0,
                    message: 'There is no user with this email',
                    data: null,
                })
                return;
            }
            if (!user.verificationCode) {
                res.send({
                    status: 0,
                    message: 'User already verified. You can log in now',
                    data: null,
                })
                return;
            }
            AccountHandler.sendConfirmationEmail(activateUrl, user, () => {
                res.send({
                    status: 1,
                    message: 'Activation link has been sent to your email address',
                    data: null,
                })
                return;
            })
        })
            .catch(err => {
                res.send({
                    status: 0,
                    message: err,
                    data: null,
                })
                return;
            })
    })

    app.post("/login", (req: any, res: any) => {
        const userData = {
            email: req.body.email,
            password: req.body.password,
        }
        if (!userData || !userData.email || !userData.password) {
            res.send({
                status: 0,
                message: "Invalid credentials",
                data: null,
            })
            return;
        }
        UserTable.read({
            where: {
                email: userData.email,
                verificationCode: null
            },
            take: 1
        })
            .then(loginUser => {
                if (!loginUser[0]) {
                    res.send({
                        status: 0,
                        message: "Invalid credentials",
                        data: null,
                    })
                    return;
                }
                AccountHandler.comparePassword(userData.password, loginUser[0].password).then((isPasswordValid) => {
                    if (isPasswordValid) {
                        loginUser[0].authToken = getRandomString();
                        UserTable.update(loginUser[0]);
                        res.send({
                            status: 1,
                            message: 'Successfully logged in',
                            data: loginUser[0],
                        })
                        return;
                    } else {
                        res.send({
                            status: 0,
                            message: 'Invalid password',
                            data: null,
                        })
                        return;
                    }
                })
            })
            .catch(loginErr => {
                res.send({
                    status: 0,
                    message: loginErr,
                    data: null,
                })
                return;
            })
    });

    app.post("/login/token", (req: any, res: any) => {
        const token = req.body.token;
        if (!token) {
            res.send({
                status: 0,
                message: "Auth token not found",
                data: null,
            })
            return;
        }
        UserTable.read({
            where: {
                authToken: token,
                verificationCode: null
            },
            take: 1
        })
            .then(loginUser => {
                if (!loginUser[0]) {
                    res.send({
                        status: 0,
                        message: "Auth code expired",
                        data: null,
                    })
                    return;
                }
                res.send({
                    status: 1,
                    message: 'Successfully logged in',
                    data: loginUser[0],
                })
            })
            .catch(loginErr => {
                res.send({
                    status: 0,
                    message: loginErr,
                    data: null,
                })
                return;
            })
    });

    app.post("/logout", (req: any, res: any) => {
        const id = req.body.id;
        if (!id) {
            res.send({
                status: 0,
                message: "Id was not found in request",
                data: null,
            })
            return;
        }
        UserTable.read({
            where: {
                id: id
            }
        })
            .then(users => {
                if (!users[0]) {
                    res.send({
                        status: 0,
                        message: "There is no account with given id",
                        data: null,
                    })
                    return;
                }
                let user = users[0];
                user.authToken = null;
                UserTable.update(user);
                res.send({
                    status: 1,
                    message: "Successfully logged out",
                    data: true,
                })
                return;
            })
            .catch(err => {
                res.send({
                    status: 0,
                    message: err,
                    data: null,
                })
                return;
            })
    });

    app.post("/activate", (req: any, res: any) => {
        const code = req.body.code;
        if (!code) {
            res.send({
                status: 0,
                message: "Code was not found in request",
                data: null,
            })
            return;
        }
        UserTable.read({
            where: {
                verificationCode: code
            }
        }).then(users => {
           if (!users[0]) {
               res.send({
                   status: 0,
                   message: 'This verification code expired',
               })
               return;
           }
           const updatedUser = users[0];
           updatedUser.verificationCode = null;
           UserTable.update(updatedUser)
               .then(verifiedUser => {
                   if (!verifiedUser) {
                       res.send({
                           status: 0,
                           message: 'Something went wrong during user verification. Try again later.',
                       })
                       return;
                   }
                   res.send({
                       status: 1,
                       message: 'Account verified successfully. You can now log in!',
                   })
                   return;
               })
               .catch(verifiedErr => {
                   res.send({
                       status: 0,
                       message: verifiedErr,
                   })
                   return;
               })
        })
    });

    app.post("/forgotPassword", async (req: any, res: any) => {
        const email = req.body.email;
        const newPassword = req.body.newPassword;
        if (!email || !newPassword) {
            res.send({
                status: 0,
                message: "Data was not found in request",
                data: null,
            })
            return;
        }
        UserTable.read({
            where: {
                email: email,
                verificationCode: null,
            }
        })
            .then(async users => {
                let user = users[0];
                if (!user) {
                    res.send({
                        status: 0,
                        message: "There is no user with this email address",
                        data: null,
                    })
                    return;
                }
                let generatedToken = AccountHandler.getRandomString();
                sendPasswordResetEmail(
                    `${req.protocol}://${req.get('host')}/resetPassword`,
                    generatedToken,
                    user,
                    () => {
                        AccountHandler.forgotPasswordWaitingList.push({
                            user: user,
                            newPassword: newPassword,
                            token: generatedToken,
                        });
                        res.send({
                            status: 1,
                            message: "Verification mail has been sent to your account",
                            data: null,
                        })
                        return;
                    }
                )
            })
    });

    app.get("/resetPassword", async (req: any, res: any) => {
        const token = req.query.token;
        if (!token) {
            res.send("<d1>Token invalid</d1>")
            return;
        }
        let changeRequestIndex = AccountHandler.forgotListIndexOfReq(token);
        if (changeRequestIndex === null) {
            res.send("<d1>Token not found</d1>")
            return;
        }
        let changeRequest = AccountHandler.forgotPasswordWaitingList[changeRequestIndex];
        changeRequest.newPassword = await AccountHandler.hashPassword(changeRequest.newPassword)
            .then(hash => {
                return hash;
            });
        changeRequest.user.password = changeRequest.newPassword;
        changeRequest.user.authToken = null;
        UserTable.update(changeRequest.user).then(userUpdateRes => {
            if (!userUpdateRes) {
                res.send("<d1>Something went wrong during changing your account password</d1>")
                return;
            } else {
                res.send("<d1>Your password has been changed</d1>")
            }
            AccountHandler.forgotPasswordWaitingList.splice(changeRequestIndex, 1);
        })
    });

    AdvancedScrapper.axiosSetup();

    // let bttScrapper = new BTTScrapper();
    // bttScrapper.sendSpider({
    //     saveEntries: true,
    //     skipTo: 15031,
    // });

    MangaTable.updateCounts();

}).catch(error => console.log(error))
