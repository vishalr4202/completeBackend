const User = require("../model/user");
var KiteConnect = require("kiteconnect").KiteConnect;

exports.getDashboard = (req, res, next) => {
  const email = req.email;
  var kc;
  var api_key, secretkey, requestToken;
  User.findByEmailId(email)
    .then((result) => {
      api_key = result.api_key;
      console.log(api_key)
    })
    .then(() => {
      if(api_key !== ''){
        res.status(200).json({
          message: "login Url Opened",
          api_key: api_key,
        });
      }
      else{
        res.status(401).json({
          message:"No Api Key",
          status:401
        })
      }
    })
};

exports.getAccessToken = (req, res, next) => {
  const { tokenUrl } = req.body;
  const index = tokenUrl.indexOf("request_token");
  const currentRequestToken = tokenUrl.slice(index + 14, index + 14 + 32);
  const secret = req.secretKey;
  const api_key = req.apiKey;
  let access = "";
  var kc = new KiteConnect({
    api_key: api_key,
  });

  // findByIdAndUpdateToken
  kc.generateSession(currentRequestToken, secret)
    .then(function (response) {
      User.findByIdAndUpdateToken(req.userId, response.access_token).then(
        () => {
          res.status(200).json({
            message: "Access Token Generated",
          });
        }
      );
    })
    .catch(function (err) {
      console.log(err), "error";
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};


exports.getUserBalances = (req,res,next) => {
  const user = req.email
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then((resp) => {
     return kc.getMargins()
  }).then(resp => {
    console.log(resp)
    res.status(200).json({
      data: resp,
    });
  }).catch(err => {
    console.log(err), "error";
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
  })
}

exports.getBalances = (req,res,next) => {
  const {user} = req.body
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then((resp) => {
     return kc.getMargins()
  }).then(resp => {
    console.log(resp)
    res.status(200).json({
      message: resp,
    });
  }).catch(err => {
    console.log(err), "error";
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
  })
}

exports.getUserProfile = (req,res,next) => {
  const user = req.email
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then(() => {
   return kc.getProfile()
  }).then(resp => {
    console.log(resp,"resp")
    res.status(200).json({
      data: resp,
    });
  }).catch(err => {
    console.log(err), "error";
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

exports.getProfile = (req,res,next) => {
  const {user} = req.body
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then(() => {
   return kc.getProfile()
  }).then(resp => {
    console.log(resp,"resp")
    res.status(200).json({
      message: resp,
    });
  }).catch(err => {
    console.log(err), "error";
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

exports.getUserOrders = (req,res,next) => {
  const user = req.email
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then(() => {
   return kc.getOrders()
  }).then(resp => {
    console.log(resp,"resp")
    res.status(200).json({
      data: resp,
    });
  }).catch(err => {
    console.log(err), "error";
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

exports.getOrders = (req,res,next) => {
  const {user} = req.body
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then(() => {
   return kc.getOrders()
  }).then(resp => {
    console.log(resp,"resp")
    res.status(200).json({
      message: resp,
    });
  }).catch(err => {
    console.log(err), "error";
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

exports.getUserPositions = (req,res,next) => {
  const user = req.email
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then(() => {
   return kc.getPositions()
  }).then(resp => {
    console.log(resp,"resp")
    res.status(200).json({
      data: resp,
    });
  }).catch(err => {
    console.log(err), "error";
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

exports.getPositions = (req,res,next) => {
  const {user} = req.body
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then(() => {
   return kc.getPositions()
  }).then(resp => {
    // console.log(resp,"resp")
    res.status(200).json({
      message: resp,
    });
  }).catch(err => {
    console.log(err), "error";
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

exports.getInstruments = (req,res,next) => {
  const user = req.email
  console.log(user,"user")
  User.findByEmailId(user)
  .then((result) => {
    api_key = result.api_key;
    secretkey = result.secret_key;
    access_token = result.access_token
  }).then((resp => {
     kc = new KiteConnect({
      api_key: api_key,
    });
  })).then(resp =>{
    kc.setAccessToken(access_token);
  })
  .then(() => {
   return kc.getInstruments(["NFO"])
  }).then(resp => {
    // console.log(resp,"resp")
    res.status(200).json({
      message: resp,
    });
  }).catch(err => {
    console.log(err), "error";
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

exports.getAllUsers = (req,res,next) => {
   User.getUsers().
   then(resp => {
    console.log(resp,"resp")
    res.status(200).json({
      message: resp,
    });

  }).catch(err => {
    console.log(err,"err")
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}


exports.setBasicTrade = (req,res,next) => {
  console.log(req.body)
  const {
    price,
    quantity,
    transaction_type,
    order,
    derivative,
    tradingsymbol,
    entry_type,
  } = req.body;
  const email = req.email

  var kc;
  var api_key, secretkey, requestToken, access_token;
  let newPrice = 0;
  let symbol = "";
  
  async function regularOrderPlace(variety) {
    let ordered;
  await kc.placeOrder(variety, {
      exchange: 'NFO',
      // tradingsymbol: 'ICICIBANK',
      tradingsymbol: tradingsymbol,
      transaction_type: transaction_type,
      quantity: quantity,
      // product: "MIS",
      product: "NRML",
      order_type: order.toUpperCase(),
    })
      .then(async function (resp) {
        console.log(resp);
        ordered = await resp?.order_id;
        return await resp?.order_id
      })
      .catch(function (err) {
        console.log(err);
        next(err)
      });
      return ordered;
  }

  User.findByEmailId(email)
    .then((result) => {
      api_key = result.api_key;
      secretkey = result.secret_key;
      access_token = result.access_token;
    })
    .then(() => {
      kc = new KiteConnect({
        api_key: api_key,
      });
    })
    .then(() => {
      kc.setAccessToken(access_token);
      let x = regularOrderPlace("regular").then((res) => {
        return res;
      });
      return x;
    })
    .then(result => {
      if(result != undefined){
        console.log(result,"res")
        return kc
        .getOrderHistory(result)
        .then((res) => {
          console.log(res,"sfd")
          return res[res?.length - 1];
        })
        .catch((err) => {
          console.log(err, "error");
           next(err);
        });
      }
      // else{
      //   const error = new Error();
      //   error.statusCode = 501;
      //   error.data = "Order Rejected";
      //   throw error;
      // }
    }).then(result => {
      if(result !== undefined && result?.status == 'COMPLETED'){
        console.log(result,"orders")
         res.status(200).json({
        message: 'receivedBody',
       });
      }
      else{
       console.log(result,"in dhbf")
        const error = new Error();
        error.statusCode = 501;
        error.data = "Order Rejected";
        throw error;
      }
    }).catch(err => {
      console.log(err,"Sdas")
      next(err)
    });
}

