const User = require("../model/user");
const Set = require('../model/sets')
const Firstock = require("thefirstock");
const { validationResult } = require("express-validator");

const firstock = new Firstock();

exports.createSet = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error();
        error.statusCode = 403;
        error.data = errors.array();
        throw error;
    } else {
        console.log("dskjsl");
    }
    const { email, primary, name } = req.body;
    if (email && primary) {
        const set = new Set(email, primary, name);
        return set.save()
            .then((result) => {
                res.status(201).send([
                    {
                        message: "setCreated success",
                        name: name,
                    },
                ]);
            }).catch((err) => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            })
    }

}

exports.deleteSet = (req, res, next) => {
    const { name } = req.body;
    Set.deleteCollection({ name: name }).then((result) => {
        res.status(201).send([
            {
                message: "set deleted success",
                name: name,
            },
        ]);
    }).catch((err) => {
        console.log(err, "err")
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.placeSetOrders = (req, res, next) => {
    const { name, tradingsymbol, quantity, transactionType } = req.body;
    let email;
    let primary
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }

        }).then(() => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                console.log(email[0], "now")
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result?.FS_access_token,
                            UID = result?.FS_uid
                        console.log(result, "result")
                    }).then((resp) => {
                        firstock.placeOrder(
                            {
                                userId: UID,
                                jKey: access_token
                            },
                            {
                                exchange: "NFO",
                                tradingSymbol: tradingsymbol,
                                quantity: quantity,
                                price: '0',
                                product: "M",
                                transactionType: transactionType ? transactionType : 'B',
                                priceType: "MKT",
                                retention: "IOC",
                                triggerPrice: "0",
                                remarks: "place order",
                            },
                            (err, result) => {
                                console.log('result', result)
                                console.log('err', err)
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}` },
                                        });
                                    }
                                }

                            })
                    })
            }
        })
        .catch((err) => {
            console.log(err, "errwdwd")
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.exitSetOrders = (req, res, next) => {
    const { name, tradingsymbol, quantity, transactionType } = req.body;
    let email;
    let primary
    console.log(name, tradingsymbol, quantity, transactionType, "names")
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }

        }).then(() => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                console.log(email[0], "now")
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result?.FS_access_token,
                            UID = result?.FS_uid
                        console.log(result, "result")
                    }).then((resp) => {
                        firstock.placeOrder(
                            {
                                userId: UID,
                                jKey: access_token
                            },
                            {
                                exchange: "NFO",
                                tradingSymbol: tradingsymbol,
                                quantity: quantity,
                                price: '0',
                                product: "M",
                                transactionType: transactionType ? transactionType : 'S',
                                priceType: "MKT",
                                retention: "IOC",
                                triggerPrice: "0",
                                remarks: "place order",
                            },
                            (err, result) => {
                                console.log('result', result)
                                console.log('err', err)
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}`, failed: `failed for ${errors}` },
                                        });
                                    }
                                }

                            })
                    })
            }
        })
        .catch((err) => {
            console.log(err, "err")
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.getFSUsers = (req, res, next) => {
    User.getFSUsers().
        then(resp => {
            console.log(resp, "resp")
            res.status(200).json({
                message: resp,
            });

        }).catch(err => {
            console.log(err, "err")
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.getAllSets = (req, res, next) => {
    Set.getAllSets().
        then(resp => {
            console.log(resp, "resp")
            res.status(200).json({
                message: resp,
            });

        }).catch(err => {
            console.log(err, "err")
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.getPrimaryUserDetails = (req, res, next) => {
    const { primary } = req.body;
    console.log(primary, "prims")
    User.findByEmailId(primary)
        .then((result) => {
            access_token = result.FS_access_token,
                UID = result.FS_uid,
                id = result.FS_id
            console.log(result, "result")
        }).then(() => {
            console.log(access_token, UID, id, "userDATA")
            res.status(200).json({
                message: {
                    uid: UID,
                    actid: id,
                    susertoken: access_token
                },
            });
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.getPrimarySetPositions = (req, res, next) => {
    const { email } = req.body;
    console.log(email, "asdasn")
    User.findByEmailId(email)
        .then((result) => {
            access_token = result.FS_access_token,
                UID = result.FS_uid
            // console.log(result, "result")
        }).then(() => {
            firstock.positionsBook({ userId: UID, jKey: access_token }, (err, result) => {
                // console.log("Error, ", err);
                // console.log("Result: ", result);
                if (result && result != null) {
                    res.status(200).json({
                        message: result,
                    });
                } else {
                    next(err)
                }
            });
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.fs_Set_place_multiple_order = (req, res, next) => {
    const { name } = req.body;
    console.log(req.body[0]?.name)

    Set.getSet(req.body[0]?.name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }
        }).then((resp) => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result.FS_access_token,
                            UID = result.FS_uid
                        console.log(result, "result")
                    })
                    .then((resp) => {
                        firstock.multiPlaceOrder(
                            {
                                userId: UID,
                                jKey: access_token
                            },
                            {
                                data: [...req.body],
                            },
                            (err, result) => {
                                console.log("Error, ", err);
                                console.log("Result: ", result);
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}`, failed: `failed for ${errors}` },
                                        });
                                    }
                                }
                            }
                        );
                    })
                    .catch((err) => {
                        console.log(err, "err")
                        if (!err.statusCode) {
                            err.statusCode = 500;
                        }
                        next(err);
                    })
            }
        })
}

exports.set_fs_shortStraddle = (req, res, next) => {
    const { symbol, strikePrice, expiry, quantity, hedge, hedgeValue, name } = req.body
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }
        }).then(() => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result.FS_access_token,
                            UID = result.FS_uid
                        console.log(result, "result")
                    }).then(() => {
                        const exp = expiry.replace(/-/g, "")
                        // console.log(exp.toUpperCase(),"sdf")
                        firstock.shortStraddle({ userId: UID, jKey: access_token },
                            {
                                symbol: symbol,
                                strikePrice: strikePrice,
                                expiry: exp.toUpperCase(),
                                product: "M",
                                quantity: quantity,
                                remarks: "ShortStraddleWithoutHedge",
                                hedge: hedge ? "true" : "false",
                                hedgeValue: hedge == false ? "0" : hedgeValue,
                            },
                            (err, result) => {
                                console.log("Error, ", err);
                                console.log("Result: ", result);
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}`, failed: `failed for ${errors}` },
                                        });
                                    }
                                }
                            });
                    })
            }
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.set_fs_shortStrangle = (req, res, next) => {
    const { symbol, callStrikePrice, putStrikePrice, expiry, quantity, hedge, hedgeValue, name } = req.body
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }
        }).then(() => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result.FS_access_token,
                            UID = result.FS_uid
                        console.log(result, "result")
                    }).then(() => {
                        const exp = expiry.replace(/-/g, "")
                        // console.log(exp.toUpperCase(),"sdf")
                        firstock.shortStrangle({ userId: UID, jKey: access_token },
                            {
                                symbol: symbol,
                                callStrikePrice: callStrikePrice,
                                putStrikePrice: putStrikePrice,
                                expiry: exp.toUpperCase(),
                                product: "M",
                                quantity: quantity,
                                remarks: "ShortStrangleWithOutHedge",
                                hedge: hedge ? "true" : "false",
                                hedgeValue: hedge == false ? "0" : hedgeValue,
                            },
                            (err, result) => {
                                console.log("Error, ", err);
                                console.log("Result: ", result);
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}`, failed: `failed for ${errors}` },
                                        });
                                    }
                                }
                            });
                    })
            }
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.set_fs_longStraddle = (req, res, next) => {
    const { symbol, strikePrice, expiry, quantity, name } = req.body
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }
        }).then(() => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result.FS_access_token,
                            UID = result.FS_uid
                        console.log(result, "result")
                    }).then(() => {
                        const exp = expiry.replace(/-/g, "")
                        // console.log(exp.toUpperCase(),"sdf")
                        firstock.longStraddle({ userId: UID, jKey: access_token },
                            {
                                symbol: symbol,
                                strikePrice: strikePrice,
                                expiry: exp.toUpperCase(),
                                product: "M",
                                quantity: quantity,
                                remarks: "longStraddle",
                            },
                            (err, result) => {
                                console.log("Error, ", err);
                                console.log("Result: ", result);
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}`, failed: `failed for ${errors}` },
                                        });
                                    }
                                }
                            });
                    })
            }
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.set_fs_longStrangle = (req, res, next) => {
    const { symbol, callStrikePrice, putStrikePrice, expiry, quantity, name } = req.body
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }
        }).then(() => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result.FS_access_token,
                            UID = result.FS_uid
                        console.log(result, "result")
                    }).then(() => {
                        const exp = expiry.replace(/-/g, "")
                        // console.log(exp.toUpperCase(),"sdf")
                        firstock.longStrangle({ userId: UID, jKey: access_token },
                            {
                                symbol: symbol,
                                callStrikePrice: callStrikePrice,
                                putStrikePrice: putStrikePrice,
                                expiry: exp.toUpperCase(),
                                product: "M",
                                quantity: quantity,
                                remarks: "longStrangle",

                            },
                            (err, result) => {
                                console.log("Error, ", err);
                                console.log("Result: ", result);
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}`, failed: `failed for ${errors}` },
                                        });
                                    }
                                }
                            });
                    })
            }
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}


exports.set_fs_bullCallSpread = (req, res, next) => {
    const { symbol, callBuyStrikePrice, callSellStrikePrice, expiry, quantity, name } = req.body
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }
        }).then(() => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result.FS_access_token,
                            UID = result.FS_uid
                        console.log(result, "result")
                    }).then(() => {
                        const exp = expiry.replace(/-/g, "")
                        // console.log(exp.toUpperCase(),"sdf")
                        firstock.bullCallSpread({ userId: UID, jKey: access_token },
                            {
                                symbol: symbol,
                                callBuyStrikePrice: callBuyStrikePrice,
                                callSellStrikePrice: callSellStrikePrice,
                                expiry: exp.toUpperCase(),
                                product: "M",
                                quantity: quantity,
                                remarks: "BullCallSpread",

                            },
                            (err, result) => {
                                console.log("Error, ", err);
                                console.log("Result: ", result);
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}`, failed: `failed for ${errors}` },
                                        });
                                    }
                                }
                            });
                    })
            }
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}



exports.set_fs_bearPutSpread = (req, res, next) => {
    const { symbol, putBuyStrikePrice, putSellStrikePrice, expiry, quantity, name } = req.body
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }
        }).then(() => {
            const errors = [];
            const successUsers = []
            for (let i = 0; i <= email.length - 1; i++) {
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result.FS_access_token,
                            UID = result.FS_uid
                        console.log(result, "result")
                    }).then(() => {
                        const exp = expiry.replace(/-/g, "")
                        // console.log(exp.toUpperCase(),"sdf")
                        firstock.bearPutSpread({ userId: UID, jKey: access_token },
                            {
                                symbol: symbol,
                                putBuyStrikePrice: putBuyStrikePrice,
                                putSellStrikePrice: putSellStrikePrice,
                                expiry: exp.toUpperCase(),
                                product: "M",
                                quantity: quantity,
                                remarks: "bearPutSpread",
                            },
                            (err, result) => {
                                console.log("Error, ", err);
                                console.log("Result: ", result);
                                if (result && result != null) {
                                    successUsers.push(email[i])
                                }
                                if (err) {
                                    errors.push(email[i])
                                }
                                if (i == email.length - 1) {
                                    if (email.length == errors.length) {
                                        console.log(errors?.length, email?.length, "only errors")
                                        res.status(200).json({
                                            message: { failed: `failed for ${errors}` },
                                        });
                                    }
                                    else {
                                        console.log(errors, "errs")
                                        res.status(200).json({
                                            message: { success: `orders placed for ${successUsers}`, failed: `failed for ${errors}` },
                                        });
                                    }
                                }
                            });
                    })
            }
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}
