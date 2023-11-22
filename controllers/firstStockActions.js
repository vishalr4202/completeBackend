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
        console.log(result,"result")
    })
  .then(() => {
  console.log(UID, access_token)
   firstock.getUserDetails(
    {
      userId:UID,
      jKey:access_token
    },
    (err, result) => {
      console.log("Error, ", err);
      console.log("Result: ", result);
      if (result && result !== null) {
        res.status(200).json({
          message: result?.data,
        });
      }
      else {
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

exports.fs_place_single_order = (req, res, next) => {
  const email=req.email;
  User.findByEmailId(email)
    .then((result) => {
        access_token = result.FS_access_token,
        UID = result.FS_uid
        console.log(result,"result")
    }).then(() => {
      firstock.placeOrder(
        {
          userId:UID,
          jKey:access_token
        },
        {
          exchange: "NSE",
          tradingSymbol: "ITC-EQ",
          quantity: "1",
          price: "300",
          product: "I",
          transactionType: "B",
          priceType: "LMT",
          retention: "DAY",
          triggerPrice: "0",
          remarks: "place order",
        },
        (err, result) => {
          console.log("Error, ", err);
          console.log("Result: ", result);
          if(result && result != null){
          firstock.singleOrderHistory(
            {   userId:UID, jKey:access_token,orderNumber: result?.data?.orderNumber },
            (err1, result1) => {
              console.log("Error, ", err1);
              console.log("Result: ", result1);
              if (result1 && result1 !== null) {
                res.status(200).json({
                  message: { status: result1?.data[0]?.status, order_id: result1?.data[0]?.orderNumber },
                });
              }
              else {
                console.log(err1,"sdas")
                next(err1)
              }
            }
          );
        }
        else{
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
  const email=req.email;

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
  User.findByEmailId(email)
  .then((result) => {
      access_token = result.FS_access_token,
      UID = result.FS_uid
      console.log(result,"result")
  }).then((resp) => {
    firstock.multiPlaceOrder(
      {
        userId:UID,
        jKey:access_token
      },
      {
        data: [
          {
            exchange: "NSE",
            tradingSymbol: "ITC-EQ",
            quantity: "1",
            price: "0",
            product: "I",
            transactionType: "S",
            priceType: "MKT",
            retention: "DAY",
            triggerPrice: "800",
            remarks: "Test1",
          },
          {
            exchange: "NSE",
            tradingSymbol: "ICICIBANK-EQ",
            quantity: "1",
            price: "0",
            product: "I",
            transactionType: "S",
            priceType: "MKT",
            retention: "DAY",
            triggerPrice: "800",
            remarks: "Test1",
          },
        ],
      },
      (err, result) => {
        // console.log("Error, ", err);
        // console.log("Result: ", result);
        if (result && result !== null) {
          const arr =[];
          for (let i = 0; i < result.length; i++) {
            firstock.singleOrderHistory(
             {  userId:UID,
               jKey:access_token,
               orderNumber: result[i]?.data?.orderNumber },
             (err1, result1) => {
               console.log("Error, ", err1);
               console.log("Result: ", result1);
               if (result && result !== null) {
                 arr.push({ status: result1?.data[0]?.status, order_id: result1?.data[0]?.orderNumber,symbol:result1?.data[0]?.tradingSymbol })
               }
               else {
                 next(err1)
               }
               if (arr.length == result.length) {
                 res.status(200).json({
                   message: arr,
                 });
               }
               else{
                next(err1)
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

exports.fs_getOrders = (req,res,next) => {
  firstock.orderBook((err, result) => {
    console.log("Error, ", err);
    console.log("Result: ", result);
    if(result && result!=null){
      res.status(200).json({
        message: result,
      });
    }else{
      next(err)
    }
  });
}