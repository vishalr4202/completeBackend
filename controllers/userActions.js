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
      res.status(200).json({
        message: "login Url Opened",
        api_key: api_key,
      });
    });
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

