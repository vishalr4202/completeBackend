const User = require("../model/user");
const Set = require('../model/sets')
const Firstock = require("thefirstock");
const { validationResult } = require("express-validator");
const { Double } = require("mongodb");
const totpGen = require("totp-generator").TOTP
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



exports.placeTrailingSetOrders = (req, res, next) => {
    const { name, tradingsymbol, quantity, transactionType, trailPrice } = req.body;
    let email;
    let primary
    const usersValid = [];

    function placeTrades(transactionType, email) {
        // const errors = [];
        // const successUsers = []
        for (let i = 0; i <= email.length - 1; i++) {
            console.log(email[0], "now")
            User.findByEmailId(email[i])
                .then((result) => {
                    access_token = result?.FS_access_token,
                        UID = result?.FS_uid
                    // console.log(result, "result")
                    return result
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
                            if (result?.status == 'Success' && transactionType == 'S') {
                                usersValid.push(resp?.email)
                            }
                        })
                })
        }
    }


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
            console.log(email, "mail")
            placeTrades('B', email)
        }).then((resp) => {
            User.findByEmailId(primary)
                .then((result) => {
                    access_token = result?.FS_access_token,
                        UID = result?.FS_uid
                    return result
                }).then((resp) => {
                    firstock.searchScripts({ stext: tradingsymbol, userId: UID, jKey: access_token, }, (err, result) => {
                        console.log("Error, ", err);
                        // console.log("Result: ", result);
                        if (result) {
                            token = result?.values[0]?.token
                            console.log(token)
                            const ws = firstock.initializeWebSocket(2);
                            ws.on("open", function open() {
                                firstock.getWebSocketDetails({ UID: UID, jKey: access_token }, (err, result) => {
                                    if (!err) {
                                        firstock.initialSendWebSocketDetails(ws, result, () => {
                                            //Subscribe Feed
                                            ws.send(firstock.subscribeFeedAcknowledgement(`NFO|${token}`)); //Sending NIFTY 50 and BANKNIFTY Token
                                        });
                                    }
                                });
                            });
                            let lastPrice = 0;
                            let startPrice = 0;
                            let stopLoss = 0;
                            let profit1, profit2, profit3;
                            let profit1Hit = false;
                            let profit2Hit = false;
                            let profit3Hit = false;
                            ws.on("error", function error(error) {
                                console.log(`WebSocket error: ${error}`);
                            });
                            ws.on("message", function message(data) {
                                const result = firstock.receiveWebSocketDetails(data);
                                // console.log("message: ", result);
                                // lastPrice = Number(result?.lp) 
                                if (result?.lp) {
                                    if (startPrice == 0) {
                                        startPrice = Number(result?.lp)
                                        lastPrice = Number(result?.lp)
                                        stopLoss = Number(result?.lp) - trailPrice
                                        // profit1 = Number(result?.lp) + 40
                                        // profit2 = Number(result?.lp) + 60
                                        // profit3 = Number(result?.lp) + 80
                                        console.log(startPrice, "startPrice")
                                        console.log(lastPrice, "last")
                                    }

                                    // if ( Number(result?.lp) > lastPrice && Number(result?.lp) < profit1) {
                                    //     lastPrice =  Number(result?.lp)
                                    //     stopLoss = result?.lp - 50
                                    // } 

                                    if (Number(result?.lp) > lastPrice) {
                                        lastPrice = Number(result?.lp)
                                        stopLoss = result?.lp - trailPrice
                                    }
                                    console.log(Number(result?.lp), "current")
                                    console.log(lastPrice, "high")
                                    console.log(stopLoss, "stop")

                                    // if (Number(result?.lp) >= profit1 && Number(result?.lp) >= lastPrice && !profit2Hit && !profit3Hit) {
                                    //     lastPrice = Number(result?.lp)
                                    //     stopLoss = Number(lastPrice) - 15
                                    //     profit1Hit = true;
                                    //     console.log(result?.lp, "in profit 1")
                                    // }
                                    // if (Number(result?.lp) >= profit2 && Number(result?.lp) >= lastPrice && !profit3Hit) {
                                    //     lastPrice = Number(result?.lp)
                                    //     stopLoss = Number(lastPrice) - 20
                                    //     profit2Hit = true;
                                    //     console.log(result?.lp, "in profit 2")
                                    // }
                                    // if (Number(result?.lp) >= profit3 && Number(result?.lp) >= lastPrice) {
                                    //     lastPrice = Number(result?.lp)
                                    //     stopLoss = Number(lastPrice) - 10
                                    //     profit3Hit = true;
                                    //     console.log(result?.lp, "in profit 3")
                                    // }
                                    if (Number(result?.lp) <= stopLoss) {
                                        console.log("----------------------------exited Trades---------------");
                                        ws.send(firstock.unsubscribeFeed(`NFO|${token}`));
                                        placeTrades('S', email)
                                        res.status(200).json({
                                            message: `orders placed: exit:${result?.lp}, entry:${startPrice}`,
                                        });
                                    }
                                }
                            });
                        }
                    });
                })
        })
        .catch((err) => {
            console.log(err, "errwdwd")
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
    console.log('in')
    function newFunc() {
        var result = [];
        function helperFunc(quant) {
            if (quant <= 0) return;
            if (quant > 0) {
                console.log('placeOrder')
                result.push('placed')
            }
            helperFunc(quant - 1800);
        }
        helperFunc(quantity);
        return result;
    }

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
            if (quantity > 1800) {
                newFunc();
            }
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

    // fetch('http://ec2-13-235-40-45.ap-south-1.compute.amazonaws.com:5999/TriggerInstantOrder', {
    //     headers:
    //     {
    //         "Content-Type": "application/json",
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({ ...req.body, transactionType: 'B' })
    // })
    //     .then(res => res.json())
    //     .then(json => console.log(json, "chicghu"))
    //     .catch(err => console.log(err, "err"))
}

exports.placeSetLimitOrders = (req, res, next) => {
    const { name, tradingsymbol, quantity, transactionType,limitprice } = req.body;
    let email;
    let primary
    console.log('in')
    function newFunc() {
        var result = [];
        function helperFunc(quant) {
            if (quant <= 0) return;
            if (quant > 0) {
                console.log('placeOrder')
                result.push('placed')
            }
            helperFunc(quant - 1800);
        }
        helperFunc(quantity);
        return result;
    }

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
            if (quantity > 1800) {
                newFunc();
            }
            for (let i = 0; i <= email.length - 1; i++) {
                console.log(email[0], "now")
                User.findByEmailId(email[i])
                    .then((result) => {
                        access_token = result?.FS_access_token,
                            UID = result?.FS_uid
                        console.log(result, "result user")
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
                                console.log('result trade', result);
                                if(result){
                                           firstock.singleOrderHistory(
                                    {
                                        userId: UID,
                                        jKey: access_token,
                                        orderNumber: result?.data?.orderNumber
                                        // orderNumber: '25062000005190'
                                    },
                                    (err, result) => {
                                        console.log("orderError, ", err);
                                        console.log("Resultorder", result);
                                        if(result && result.status == 'Success'){
                                            console.log(result.data[0].averagePrice ,Number(result?.data[0]?.averagePrice) - Number(limitprice),"price now");
                                               firstock.placeOrder(
                                            {
                                                userId: UID,
                                                jKey: access_token
                                            },
                                            {
                                                exchange: "NFO",
                                                tradingSymbol: tradingsymbol,
                                                quantity: quantity,
                                                price:result?.data[0]?.transactionType == 'B'? Math.round((Number(result?.data[0]?.averagePrice) + Number(limitprice)) / 0.05)* 0.05 :  Math.round((Number(result?.data[0]?.averagePrice) - Number(limitprice)) / 0.05) * 0.05,
                                                product: "M",
                                                transactionType: result?.data[0]?.transactionType == 'B' ? 'S' : 'B',
                                                priceType: "LMT",
                                                retention: "DAY",
                                                triggerPrice: "0",
                                                remarks: "place limit order again",
                                            },
                                            (err, result) => {
                                                console.log("re-orderError, ", err);
                                                console.log("ResultRe-order", result);
                                            }
                                        )
                                        }
                                    }
                                );
                                }
                         

                                console.log('err', err)
                                // if (result && result != LMTnull) {
                                if (result) {
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
                                        console.log(errors, "errs","all orders placed")
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

    // fetch('http://ec2-13-235-40-45.ap-south-1.compute.amazonaws.com:5999/TriggerInstantOrder', {
    //     headers:
    //     {
    //         "Content-Type": "application/json",
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({ ...req.body, transactionType: 'B' })
    // })
    //     .then(res => res.json())
    //     .then(json => console.log(json, "chicghu"))
    //     .catch(err => console.log(err, "err"))
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

    // fetch('http://ec2-13-235-40-45.ap-south-1.compute.amazonaws.com:5999/TriggerInstantOrder', {
    //     headers:
    //     {
    //         "Content-Type": "application/json",
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({ ...req.body, transactionType: 'S' })
    // })
    //     .then(res => res.json())
    //     .then(json => console.log(json, "chicghu"))
    //     .catch(err => console.log(err, "err"))
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
    console.log(symbol)
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

exports.set_loginAll = (req, res, next) => {
    const { name } = req?.body;
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
                        FS_Pass = result?.FS_Pass
                        FS_TOTPKEY = result?.FS_TOTPKEY
                        UID = result?.FS_uid
                        apiKey = result?.FS_api_key
                        vendorCode = result?.FS_id
                    }).then(() => {
                        let otp = totpGen.generate(FS_TOTPKEY)
                        console.log(otp, FS_Pass, apiKey, "otp")
                        firstock.login(
                            {
                                userId: UID,
                                password: FS_Pass,
                                TOTP: otp?.otp,
                                vendorCode: vendorCode,
                                apiKey: apiKey,
                            },
                            (err, result) => {
                                console.log("Error, ", err?.detail);
                                console.log("Result: ", result);
                                if (result && result !== null) {
                                    User.findByIdAndUpdateFSToken(result?.data?.email.toLowerCase(), result?.data?.susertoken)
                                        .then((rspp) => {
                                            console.log(rspp, email[i], "rspp")
                                            if (rspp?.acknowledged) {
                                                successUsers.push(email[i]);
                                            }
                                        }).then(() => {
                                            if (i == email.length - 1) {
                                                console.log(successUsers, "succ")
                                                res.status(200).json({
                                                    message: `${successUsers?.length} users logged in`,
                                                });
                                            }
                                        });
                                }
                            }
                        )

                    })
            }
        }).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

    // fetch('http://ec2-13-235-40-45.ap-south-1.compute.amazonaws.com:5999/login', {
    //     headers:
    //     {
    //         "Content-Type": "application/json",
    //     },
    //     method: 'GET',
    // })
    //     .then(res => res.json())
    //     .then(json => console.log(json, "sds"))
    //     .catch(err => console.log(err, "err"))
}


exports.set_option_chain = (req, res, next) => {

    const { name } = req?.body;
    const symbol = req?.body?.symbol;
    const count = req?.body?.count;
    const strike = req?.body?.strike
    Set.getSet(name)
        .then((resp) => {
            if (resp) {
                email = resp.email;
                primary = resp?.primary
                console.log(resp, "ASD")
            }
            else {
                const error = new Error();
                error.statusCode = 403;
                error.data = "No such set";
                throw error;
            }
        }).then(() => {
            // for (let i = 0; i <= email.length - 1; i++) {
            User.findByEmailId(primary).then((result) => {
                access_token = result.FS_access_token,
                    UID = result.FS_uid
                console.log(result, "result")
            }).then(() => {
                firstock.getOptionChain(
                    {
                        userId: UID,
                        jKey: access_token
                    },
                    // {
                    //     tradingSymbol: "NIFTY05JUN25C24000",
                    //     exchange: "NFO",
                    //     strikePrice: "24000",
                    //     count: "5",
                    // },
                    {
                        tradingSymbol: symbol,
                        exchange: "NFO",
                        strikePrice: strike,
                        count: count,
                    },
                    (err, result) => {
                        console.log("Error, ", err);
                        console.log("Result: ", result);
                        if (result && result?.status == 'Success') {
                            // res.send(result.data.sort((a, b) => parseFloat(a.strikePrice) - parseFloat(b.strikePrice)))
                            // let data = [...result.data].sort((a, b) => parseFloat(a.strikePrice) - parseFloat(b.strikePrice))
                            let ceOptions = result.data.filter(item => item.optionType === 'CE');
                            let peOptions = result.data.filter(item => item.optionType === 'PE');

                            // Sort both CE and PE options by strikePrice
                            let sortedCE = ceOptions.sort((a, b) => parseFloat(a.strikePrice) - parseFloat(b.strikePrice));
                            let sortedPE = peOptions.sort((a, b) => parseFloat(a.strikePrice) - parseFloat(b.strikePrice));

                            // res.status(200).json({data:result.data})
                            res.status(200).json({
                                data: {
                                    ceOptions: sortedCE,
                                    peOptions: sortedPE
                                }
                            })

                        }
                        else {
                            console.log(err, "sdas")
                            next(err)
                        }
                    }
                )
            })
            // }
        }
        ).catch(err => {
            console.log(err), "error";
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}