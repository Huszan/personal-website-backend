import * as express from "express";
import { sendResponse } from "../helper/SendResponseHelper";
import * as UserTable from "../modules/tables/user-table";
import * as AccountHandler from "../modules/account-handler";
import { UserType } from "../types/user.type";
import { sendPasswordResetEmail } from "../modules/account-handler";
import { generateToken } from "../modules/token-validation";
import { UserTokenData } from "../types/user-token-data.type";
import {
    AuthLogoutConfig,
    defAuthLogoutConfig,
} from "../types/auth-logout-config.type";
import { merge } from "../helper/basic.helper";

const router = express.Router();

router.post("/register", (req: express.Request, res: express.Response) => {
    const userData: UserType = req.body.user;
    const activateUrl: string = req.body.activateUrl;
    if (!userData || !userData.email || !userData.name || !userData.password) {
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
                AccountHandler.sendConfirmationEmail(activateUrl, registerRes);
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

router.post(
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
                        message: "User already verified. You can log in now",
                    });
                }
                AccountHandler.sendConfirmationEmail(activateUrl, user, () => {
                    return sendResponse(res, 200, {
                        status: "success",
                        message:
                            "Activation link has been sent to your email address",
                    });
                });
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

router.post("/login", (req: express.Request, res: express.Response) => {
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
                    loginUser[0].authToken = generateToken({
                        id: loginUser[0].id,
                        accountType: loginUser[0].accountType,
                    } as UserTokenData);
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

router.post("/login/token", (req: express.Request, res: express.Response) => {
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
});

router.post("/logout", (req: express.Request, res: express.Response) => {
    const id = req.body.id;
    const config = merge(
        defAuthLogoutConfig,
        req.body.config
    ) as AuthLogoutConfig;
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
            if (config.logoutFromAllDevices) {
                let user = users[0];
                user.authToken = null;
                UserTable.update(user);

                return sendResponse(res, 200, {
                    status: "success",
                    message: "Successfully logged out from all devices",
                });
            }
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

router.post("/activate", (req: express.Request, res: express.Response) => {
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

router.post(
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

router.get(
    "/resetPassword",
    async (req: express.Request, res: express.Response) => {
        const token = req.query.token as string;
        if (!token) {
            res.send("<d1>Token invalid</d1>");
            return;
        }
        let changeRequestIndex = AccountHandler.forgotListIndexOfReq(token);
        if (changeRequestIndex === null) {
            res.send("<d1>Token not found</d1>");
            return;
        }
        let changeRequest =
            AccountHandler.forgotPasswordWaitingList[changeRequestIndex];
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

export default router;
