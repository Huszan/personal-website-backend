import { AppDataSource } from "./data-source"
import * as bodyParser from "body-parser";
import * as scrapper from "./modules/scrapper";
import {MangaType} from "./types/manga.type";
import {Manga} from "./entity/Manga";
import * as MangaTable from "./modules/tables/manga-table";
import * as HtmlLocateTable from "./modules/tables/html-locate-table";
import * as UserTable from "./modules/tables/user-table";
import * as LikeTable from "./modules/tables/like-table";
import * as EmailHandler from "./modules/email-handler";
import * as AccountHandler from './modules/account-handler';
const express = require('express');
const cors = require("cors");
import * as ExampleData from "./modules/tables/example-data";
import {HtmlLocate} from "./entity/HtmlLocate";
import {Like} from "./entity/Like";
import {LikeType} from "./types/like.type";
import {data} from "cheerio/lib/api/attributes";
import {FindManyOptions} from "typeorm";
import {UserType} from "./types/user.type";
import {User} from "./entity/User";
import {getRandomString} from "./modules/account-handler";

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
        let manga: MangaType = req.body.manga;
        let chapter: number = req.body.chapter;
        scrapper.getMangaPages(chapter, manga.htmlLocate)
            .then((results: any) => {
                res.send(results);
                let data = MangaTable.convertDataToTableEntry(manga);
                data.view_count++;
                MangaTable.update(data, manga.id)
            })
    })

    app.post("/testMangaForm", async (req: any, res: any) => {
        let manga: MangaType = req.body.manga || null;
        let testId = req.body.testId || null;
        if (testId) {
            scrapper.continueTest(manga, testId)
                .then((results: any) => {
                    res.send(results);
                })
        } else {
            scrapper.testMangaForm(manga)
                .then((results: any) => {
                    res.send(results);
                })
        }
    })

    app.post("/testMangaChapter", async (req: any, res: any) => {
        let manga: MangaType = req.body.manga || null;
        let chapter = req.body.chapter || null;
        scrapper.testMangaChapter(manga, chapter)
            .then((passed: any) => {
                res.send(passed);
            })
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
        MangaTable.remove(manga.id).then(() => {
            res.send({
                success: true
            });
        })
    })

    app.get("/getMangaList", (req: any, res: any) => {
        let id: number | undefined = req.query.id;
        let options: FindManyOptions<Manga> | null = null;

        if (id) { options = {
            where: {
                id: id
            }
        } }

        MangaTable.read(options)
            .then((mangaList: any) => {
                let convertedList = [];
                mangaList.forEach(el => {
                    convertedList.push(MangaTable.convertTableEntryToData(el));
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
                        EmailHandler.sendCustomMail(
                            {
                                from: 'Manga-dot',
                                to: registerRes.email,
                                subject: 'Manga-dot: activate account',
                                text: `To activate your account, please click this link - 
                                \n${activateUrl}?code=${registerRes.verificationCode}`
                            },
                            () => {}
                        )
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

}).catch(error => console.log(error))
