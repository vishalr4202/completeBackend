const User = require("../model/user");
const Firstock = require("thefirstock");

const firstock = new Firstock();

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
  console.log(req.body,"Sssasd")
  const email = req.email;
  const{tradingsymbol,transaction_type,entry_type,order,limit,quantity} = req.body
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      let quantMultiple = 50;
      if(tradingsymbol.includes('BANKNIFTY')){
        quantMultiple = 15
      }
      if(tradingsymbol.includes('FINNIFTY')){
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
          quantity: quantity*quantMultiple ,
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
                if (result1 && result1 !== null) {
                  res.status(200).json({
                    message: { status: result1?.data[0]?.status, order_id: result1?.data[0]?.orderNumber },
                  });
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
      console.log(result, "result")
    }).then(() => {
      firstock.positionsBook({ userId: UID, jKey: access_token }, (err, result) => {
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
              price:"5.5",
              product: "M",
              priceType: "MKT",
            },
            {
              exchange: "NFO",
              tradingSymbol: "NIFTY30NOV23C19800",
              quantity: "50",
              transactionType: "S",
              price:"90",
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
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.shortStraddle({ userId: UID, jKey: access_token },
        {
          symbol: "NIFTY",
          strikePrice: "17000",
          expiry: "30NOV23",
          product: "M",
          quantity: "50",
          remarks: "ShortStraddleWithoutHedge",
          hedge: "true",
          hedgeValue: "100",
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
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.shortStrangle({ userId: UID, jKey: access_token },
        {
          symbol: "NIFTY",
          callStrikePrice: "17500",
          putStrikePrice: "17000",
          expiry: "30NOV23",
          product: "M",
          quantity: "50",
          remarks: "ShortStrangleWithOutHedge",
          hedge: "true",
          hedgeValue: "100",
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
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.longStraddle(
        { userId: UID, jKey: access_token },
        {
          symbol: "NIFTY",
          strikePrice: "17000",
          expiry: "30NOV23",
          product: "M",
          quantity: "50",
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
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
        UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.longStrangle(
        { userId: UID, jKey: access_token },
        {
          symbol: "NIFTY",
          callStrikePrice: "18000",
          putStrikePrice: "17000",
          expiry: "30NOV23",
          product: "M",
          quantity: "50",
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
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
      UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.bullCallSpread(
        { userId: UID, jKey: access_token },
        {
          symbol: "NIFTY",
          callBuyStrikePrice: "18000",
          callSellStrikePrice: "17000",
          expiry: "30NOV23",
          product: "M",
          quantity: "50",
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
  User.findByEmailId(email)
    .then((result) => {
      access_token = result.FS_access_token,
      UID = result.FS_uid
      console.log(result, "result")
    }).then(() => {
      firstock.bearPutSpread(
        { userId: UID, jKey: access_token },
        {
          symbol: "NIFTY",
          putBuyStrikePrice: "18000",
          putSellStrikePrice: "18000",
          expiry: "30NOV23",
          product: "M",
          quantity: "50",
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
      firstock.getIndexList({ userId: UID, jKey: access_token },{exchange:"NFO"}, (err, result) => {
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

