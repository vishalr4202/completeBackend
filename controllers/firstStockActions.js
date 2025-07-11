const User = require("../model/user");
const Firstock = require("thefirstock");

const firstock = new Firstock();
// const ws = firstock.initializeWebSocket(2);

exports.firstLogin = (req, res, next) => {
  const { password, otp } = req.body
  const email = req.email;
  console.log(email)
  User.findByEmailId(email)
    .then((result) => {
      vendorCode = result.FS_id
      apiKey = result.FS_api_key
      UID = result.FS_uid
      console.log(result, "result")
    })
    .then(() => {
      console.log(vendorCode)
      firstock.login(
        {
          userId: UID,
          password: password,
          TOTP: otp,
          vendorCode: vendorCode,
          apiKey: apiKey,
        },
        (err, result) => {
          console.log("Error, ", err);
          console.log("Result: ", result);
          if (result && result !== null) {
            User.findByIdAndUpdateFSToken(email, result?.data?.susertoken)
              .then(
                () => {
                  res.status(200).json({
                    message: "Logged in successfully",
                  });
                }
              );
          }
          else {
            next(err)
          }
        }
      )
    })
    .catch(err => {
      console.log(err), "error";
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.fs_user_details = (req, res, next) => {
  const email = req.email
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
    })
    .then(() => {
      console.log(UID, access_token)
      firstock.getUserDetails(
        {
          userId: UID,
          jKey: access_token
        },
        (err, result) => {
          // console.log("Error, ", err);
          // console.log("Result: ", result);
          if (result && result !== null) {
            res.status(200).json({
              message: result?.data,
            });
          }
          else {
            next(err)
          }
        });
    })
  // .catch(err => {
  // console.log('ASJNjkans',err)
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // })
}

exports.fs_place_single_order = (req, res, next) => {
  console.log(req.body, "Sssasd")
  const email = req.email;
  const { tradingsymbol, transaction_type, entry_type, order, limit, quantity } = req.body
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      let quantMultiple = 50;
      if (tradingsymbol.includes('BANKNIFTY')) {
        quantMultiple = 15
      }
      if (tradingsymbol.includes('FINNIFTY')) {
        quantMultiple = 40
      }
      firstock.placeOrder(
        {
          userId: UID,
          jKey: access_token
        },
        {
          exchange: "NFO",
          tradingSymbol: tradingsymbol,
          quantity: quantity * quantMultiple,
          price: limit ? limit : '0',
          product: "M",
          transactionType: transaction_type,
          priceType: order == "Market" ? "MKT" : "LMT",
          retention: "IOC",
          triggerPrice: "0",
          remarks: "place order",
        },
        (err, result) => {
          console.log("Error, ", err);
          console.log("Result: ", result);
          if (result && result != null) {
            firstock.singleOrderHistory(
              { userId: UID, jKey: access_token, orderNumber: result?.data?.orderNumber },
              (err1, result1) => {
                console.log("Error, ", err1);
                console.log("Result: ", result1);
                if (result1 && result1 !== null && result1?.data[0]?.status != 'REJECTED') {
                  res.status(200).json({
                    message: { status: result1?.data[0]?.status, order_id: result1?.data[0]?.orderNumber },
                  });
                }
                if (result1?.data[0]?.status == 'REJECTED') {
                  // res.status(200).json({
                  //   error: { status: result1?.data[0]?.status, reason: result1?.data[0]?.rejectReason },
                  // });

                  next({
                    "fs_error": {
                      statusCode: 500, status: result1?.data[0]?.status, reason: result1?.data[0]?.rejectReason
                    }
                  })
                }
                else {
                  console.log(err1, "sdas")
                  next(err1)
                }
              }
            );
          }
          else {
            next(err)
          }
        }
      );
    }).catch(err => {
      console.log(err), "error";
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
  // firstock.placeOrder(
  //   {
  //     exchange: "NSE",
  //     tradingSymbol: "ITC-EQ",
  //     quantity: "1",
  //     price: "300",
  //     product: "I",
  //     transactionType: "B",
  //     priceType: "LMT",
  //     retention: "DAY",
  //     triggerPrice: "0",
  //     remarks: "place order",
  //   },
  //   (err, result) => {
  //     console.log("Error, ", err);
  //     console.log("Result: ", result);
  //     firstock.singleOrderHistory(
  //       { orderNumber: result?.data?.orderNumber },
  //       (err1, result1) => {
  //         console.log("Error, ", err1);
  //         console.log("Result: ", result1);
  //         if (result && result !== null) {
  //           res.status(200).json({
  //             message: { status: result?.data[0]?.status, order_id: result?.data[0]?.orderNumber },
  //           });
  //         }
  //         else {
  //           next(err)
  //         }
  //       }
  //     );
  //   }
  // );
}

exports.fs_place_multiple_order = (req, res, next) => {
  const email = req.email;

  // const x = new Promise((resolve, reject) => {
  //   return firstock.multiPlaceOrder(
  //     {
  //       userId:UID,
  //       jKey:access_token
  //     },
  //     {
  //       data: [
  //         {
  //           exchange: "NSE",
  //           tradingSymbol: "ITC-EQ",
  //           quantity: "1",
  //           price: "0",
  //           product: "I",
  //           transactionType: "S",
  //           priceType: "MKT",
  //           retention: "DAY",
  //           triggerPrice: "800",
  //           remarks: "Test1",
  //         },
  //         {
  //           exchange: "NSE",
  //           tradingSymbol: "ICICIBANK-EQ",
  //           quantity: "1",
  //           price: "0",
  //           product: "I",
  //           transactionType: "S",
  //           priceType: "MKT",
  //           retention: "DAY",
  //           triggerPrice: "800",
  //           remarks: "Test1",
  //         },
  //       ],
  //     },
  //     (err, result) => {
  //       if (result && result !== null) {
  //         resolve(result)
  //       } else {
  //         reject(err)
  //       }
  //     }
  //   );
  // }).then((result) => {
  //   const arr = [];
  //   for (let i = 0; i < result.length; i++) {
  //      firstock.singleOrderHistory(
  //       {  userId:UID,
  //         jKey:access_token,
  //         orderNumber: result[i]?.data?.orderNumber },
  //       (err1, result1) => {
  //         console.log("Error, ", err1);
  //         console.log("Result: ", result1);
  //         if (result && result !== null) {
  //           arr.push({ status: result1?.data[0]?.status, order_id: result1?.data[0]?.orderNumber,symbol:result1?.data[0]?.tradingSymbol })
  //         }
  //         else {
  //           next(err1)
  //         }
  //         if (arr.length == result.length) {
  //           res.status(200).json({
  //             message: arr,
  //           });
  //         }
  //       }
  //     );
  //   }
  // }).catch(err => {
  //   console.log(err), "error";
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // })
  console.log(req.body)
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then((resp) => {
      firstock.multiPlaceOrder(
        {
          userId: UID,
          jKey: access_token
        },
        {
          data: [...req.body
            // {
            //   exchange: "NSE",
            //   tradingSymbol: "ITC-EQ",
            //   quantity: "1",
            //   price: "0",
            //   product: "I",
            //   transactionType: "S",
            //   priceType: "MKT",
            //   retention: "DAY",
            //   triggerPrice: "800",
            //   remarks: "Test1",
            // },
            // {
            //   exchange: "NSE",
            //   tradingSymbol: "ICICIBANK-EQ",
            //   quantity: "1",
            //   price: "0",
            //   product: "I",
            //   transactionType: "S",
            //   priceType: "MKT",
            //   retention: "DAY",
            //   triggerPrice: "800",
            //   remarks: "Test1",
            // },
          ],
        },
        (err, result) => {
          // console.log("Error, ", err);
          // console.log("Result: ", result);
          if (result && result !== null) {
            const arr = [];
            for (let i = 0; i < result.length; i++) {
              firstock.singleOrderHistory(
                {
                  userId: UID,
                  jKey: access_token,
                  orderNumber: result[i]?.data?.orderNumber
                },
                (err1, result1) => {
                  console.log("Error, ", err1);
                  console.log("Result: ", result1);
                  if (result && result !== null) {
                    arr.push({ status: result1?.data[0]?.status, order_id: result1?.data[0]?.orderNumber, symbol: result1?.data[0]?.tradingSymbol })
                  }
                  else {
                    next(err1)
                  }
                  if (arr.length == result.length) {
                    res.status(200).json({
                      message: arr,
                    });
                  }
                }
              );
            }
          } else {
            // reject(err)
            next(err)
          }
        }
      );
    })
    .catch(err => {
      console.log(err), "error";
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.fs_getOrders = (req, res, next) => {
  const email = req.email;
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.orderBook({ userId: UID, jKey: access_token }, (err, result) => {
        console.log("Error, ", err);
        console.log("Result: ", result);
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

exports.fs_getPositions = (req, res, next) => {
  const email = req.email;
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

exports.fs_getBasketMargins = (req, res, next) => {
  const email = req.email;
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.basketMargin(
        { userId: UID, jKey: access_token },
        {
          basket: [
            {
              exchange: "NFO",
              tradingSymbol: "NIFTY30NOV23C20100",
              quantity: "50",
              transactionType: "B",
              price: "5.5",
              product: "M",
              priceType: "MKT",
            },
            {
              exchange: "NFO",
              tradingSymbol: "NIFTY30NOV23C19800",
              quantity: "50",
              transactionType: "S",
              price: "90",
              product: "M",
              priceType: "MKT",
            },
          ],
        },
        (err, result) => {
          console.log("Error, ", err);
          console.log("Result: ", result);
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

exports.fs_shortStraddle = (req, res, next) => {
  const email = req.email;
  const { symbol, strikePrice, expiry, quantity, hedge, hedgeValue } = req.body
  // console.log(symbol,strikePrice,expiry,quantity,hedge,hedgeValue)
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      const exp = expiry.replace(/-/g, "")
      // console.log(exp.toUpperCase(),"sdf")
      firstock.shortStraddle({ userId: UID, jKey: access_token },
        // {
        //   symbol: "NIFTY",
        //   strikePrice: "21000",
        //   expiry: "28DEC23",
        //   product: "M",
        //   quantity: "50",
        //   remarks: "ShortStraddleWithoutHedge",
        //   hedge: "false",
        //   hedgeValue: "0",
        // },
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

exports.fs_shortStrangle = (req, res, next) => {
  const email = req.email;
  const { symbol, callStrikePrice, putStrikePrice, expiry, quantity, hedge, hedgeValue } = req.body
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      const exp = expiry.replace(/-/g, "")
      firstock.shortStrangle({ userId: UID, jKey: access_token },
        // {
        //   symbol: "NIFTY",
        //   callStrikePrice: "21500",
        //   putStrikePrice: "20000",
        //   expiry: "28DEC23",
        //   product: "M",
        //   quantity: "50",
        //   remarks: "ShortStrangleWithOutHedge",
        //   hedge: "true",
        //   hedgeValue: "100",
        // },
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

exports.fs_longStraddle = (req, res, next) => {
  const email = req.email;
  const { symbol, strikePrice, expiry, quantity } = req.body
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      const exp = expiry.replace(/-/g, "")
      firstock.longStraddle(
        { userId: UID, jKey: access_token },
        // {
        //   symbol: "NIFTY",
        //   strikePrice: "17000",
        //   expiry: "30NOV23",
        //   product: "M",
        //   quantity: "50",
        //   remarks: "longStraddle",
        // },
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

exports.fs_longStrangle = (req, res, next) => {
  const email = req.email;
  const { symbol, callStrikePrice, putStrikePrice, expiry, quantity } = req.body
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      const exp = expiry.replace(/-/g, "")
      firstock.longStrangle(
        { userId: UID, jKey: access_token },
        // {
        //   symbol: "NIFTY",
        //   callStrikePrice: "18000",
        //   putStrikePrice: "17000",
        //   expiry: "30NOV23",
        //   product: "M",
        //   quantity: "50",
        //   remarks: "longStrangle",

        // },
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

exports.fs_bullCallSpread = (req, res, next) => {
  const email = req.email;
  const { symbol, callBuyStrikePrice, callSellStrikePrice, expiry, quantity } = req.body
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      const exp = expiry.replace(/-/g, "")
      firstock.bullCallSpread(
        { userId: UID, jKey: access_token },
        // {
        //   symbol: "NIFTY",
        //   callBuyStrikePrice: "18000",
        //   callSellStrikePrice: "17000",
        //   expiry: "30NOV23",
        //   product: "M",
        //   quantity: "50",
        //   remarks: "BullCallSpread",

        // },
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

exports.fs_bearPutSpread = (req, res, next) => {
  const email = req.email;
  const { symbol, putBuyStrikePrice, putSellStrikePrice, expiry, quantity } = req.body
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      const exp = expiry.replace(/-/g, "")
      firstock.bearPutSpread(
        { userId: UID, jKey: access_token },
        // {
        //   symbol: "NIFTY",
        //   putBuyStrikePrice: "18000",
        //   putSellStrikePrice: "18000",
        //   expiry: "30NOV23",
        //   product: "M",
        //   quantity: "50",
        //   remarks: "bearPutSpread",
        // },
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

exports.fs_getInstruments = (req, res, next) => {
  const email = req.email;
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.getIndexList({ userId: UID, jKey: access_token }, { exchange: "NFO" }, (err, result) => {
        console.log("Error, ", err);
        console.log("Result: ", result);
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

exports.FS_getLTP = (req, res, next) => {
  const email = req.email;
  let token = "";
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      ID = result.FS_id
      // console.log(result, "result")
    }).then(() => {

      firstock.searchScripts({ stext: "NIFTY08FEB24C22400", userId: UID, jKey: access_token, }, (err, result) => {
        console.log("Error, ", err);
        // console.log("Result: ", result);
        if (result) {
          token = result?.values[0]?.token
          console.log(token)
          // firstock.getQuoteltp(
          //   {
          //     userId: UID,
          //     jKey: access_token,
          //     exchange: "NFO",
          //     token: token,
          //   },
          //   (err, result) => {
          //     console.log("getQuoteltp Error, ", err);
          //     console.log("getQuoteltp Result: ", result?.data?.lastTradedPrice);
          //   }
          // );

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

          ws.on("error", function error(error) {
            console.log(`WebSocket error: ${error}`);
          });

          ws.on("message", function message(data) {
            const result = firstock.receiveWebSocketDetails(data);
            console.log("message: ", result?.lp);

          });
          // ws.on("open", function open() {
          //   firstock.getWebSocketDetails({UID:UID,jKey:access_token},(err, result) => {
          //     if (!err) {
          //       firstock.initialSendWebSocketDetails(ws, result, () => {
          //         ws.send(firstock.subscribeOrderUpdate(`${UID}`));
          //       });
          //     }
          //   });
          // });

          // ws.on("error", function error(error) {
          //   console.log(`WebSocket error: ${error}`);
          // });

          // ws.on("message", function message(data) {
          //   const result = firstock.receiveWebSocketDetails(data);
          //   console.log("message: ", result);
          // });
        }
      });
    })
}

exports.FS_getUserTokenData = (req, res, next) => {
  const email = req.email;
  User.findByEmailId(email)
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

exports.OrderUpdate = (req, res, next) => {
  const email = req.email;
  let token = "";
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      ID = result.FS_id
      // console.log(result, "result")
    }).then((res) => {

      const ws = firstock.initializeWebSocket(2);
      ws.on("open", function open() {
        firstock.getWebSocketDetails({ UID: UID, jKey: access_token }, (err, result) => {
          if (!err) {
            firstock.initialSendWebSocketDetails(ws, result, () => {
              // ws.send(firstock.subscribeOrderUpdate(ID));
              ws.send(firstock.subscribeOrderUpdate(UID))
            });
          }
        });
      });

      ws.on("error", function error(error) {
        console.log(`WebSocket error: ${error}`);
      });

      ws.on("message", function message(data) {
        const result = firstock.receiveWebSocketDetails(data);
        console.log("message: ", result);
      });
    })
}

exports.fs_place_single_order = (req, res, next) => {
  console.log(req.body, "Sssasd")
  const email = req.email;
  const { tradingsymbol, transaction_type, entry_type, order, limit, quantity, quickTrade, priceType } = req.body
  console.log(order, quickTrade, "sdhfbjs")
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      let quantMultiple = 50;
      if (tradingsymbol.includes('BANKNIFTY')) {
        quantMultiple = 15
      }
      if (tradingsymbol.includes('FINNIFTY')) {
        quantMultiple = 40
      }
      firstock.placeOrder(
        {
          userId: UID,
          jKey: access_token
        },
        {
          exchange: "NFO",
          tradingSymbol: tradingsymbol,
          quantity: quickTrade ? quantity : quantity * quantMultiple,
          price: limit ? limit : '0',
          product: "M",
          transactionType: transaction_type,
          // priceType: order == "Market" ? "MKT" : "LMT",
          priceType: priceType,
          retention: "IOC",
          triggerPrice: "0",
          remarks: "place order",
        },
        (err, result) => {
          console.log("Error, ", err);
          console.log("Result: ", result);
          if (result && result != null) {
            firstock.singleOrderHistory(
              { userId: UID, jKey: access_token, orderNumber: result?.data?.orderNumber },
              (err1, result1) => {
                console.log("Error, ", err1);
                console.log("Result: ", result1);
                if (result1 && result1 !== null && result1?.data[0]?.status != 'REJECTED') {
                  res.status(200).json({
                    message: { status: result1?.data[0]?.status, order_id: result1?.data[0]?.orderNumber },
                  });
                }
                if (result1?.data[0]?.status == 'REJECTED') {
                  // res.status(200).json({
                  //   error: { status: result1?.data[0]?.status, reason: result1?.data[0]?.rejectReason },
                  // });

                  next({
                    "fs_error": {
                      statusCode: 500, status: result1?.data[0]?.status, reason: result1?.data[0]?.rejectReason
                    }
                  })
                }
                else {
                  console.log(err1, "sdas")
                  next(err1)
                }
              }
            );
          }
          else {
            next(err)
          }
        }
      );
    }).catch(err => {
      console.log(err), "error";
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}


exports.fs_get_option_chain = (req, res, next) => {
  const email = req?.email;
  const symbol = req?.body?.symbol;
  const count = req?.body?.count;
  const strike = req?.body?.strike
  User.findByEmailId(email).then((result) => {
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
      //   tradingSymbol: "NIFTY05JUN25C24000",
      //   exchange: "NFO",
      //   strikePrice: "24000",
      //   count: "3",
      // },
       {
        tradingSymbol: symbol,
        exchange: "NFO",
        strikePrice: strike ,
        count: count,
      },
      (err, result) => {
        console.log("Error, ", err);
        console.log("Result: ", result);
        if (result && result?.status == 'Success') {
          res.send(result.data.sort((a, b) => parseFloat(a.strikePrice) - parseFloat(b.strikePrice)))
        }
        else {
          console.log(err, "sdas")
          next(err)
        }
      }
    )
  })
  .catch(err => {
      console.log(err), "error";
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}