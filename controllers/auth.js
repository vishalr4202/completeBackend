const { validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const User = require("../model/user");

// const getDB = require("../utils/db").getDB;

exports.createSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 403;
    error.data = errors.array();
    throw error;
  } else {
    console.log("dskjsl");
  }
  const { name, email, password, access_token,
    api_key,
    secret_key,
    updated_at,
    zerodha,
    firstock,
    FS_id,
    FS_uid,
    FS_api_key,
    FS_access_token } = req.body;

  bcrypt
    .hash(password, 12)
    .then((hashedPW) => {
      //   console.log(hashedPW);
      const user = new User(name, email, hashedPW, access_token,
        api_key,
        secret_key,
        updated_at,
        zerodha,
        firstock,
        FS_id,
        FS_uid,
        FS_api_key,
        FS_access_token);
      return user.save();
    })
    .then((user) => {
      res.status(201).send([
        {
          message: "signup success",
          user: user,
        },
      ]);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.showLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 401;
    error.data = errors.array();
    throw error;
  }
  const { email, password } = req.body;
  let loggedUser;
  User.showLogin({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("email is not found");
        error.statusCode = 401;
        error.data = "email not found";
        throw error;
      }
      loggedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error();
        error.statusCode = 401;
        error.data = "password is not matched";
        throw error;
      }
      const token = jwt.sign(
        {
          email: loggedUser.email,
          userId: loggedUser._id.toString(),
          loginId: loggedUser.userId,
          role: loggedUser?.Role
        },
        "Fulham@chelsea&Liverpool",
        { expiresIn: "24h" }
      );
      console.log(loggedUser,"logged")
      const access = {
        'Zerodha': loggedUser?.api_key && loggedUser?.api_key!= '' ? true : false,
        'Firstock': loggedUser?.FS_uid && loggedUser?.FS_uid !== '' ? true :false
      }        
      res.status(200).json({
        message: "User loggedin",
        token: token,
        userId: loggedUser._id.toString(),
        username: loggedUser.name,
        loginId: loggedUser.userId,
        role:loggedUser?.Role,
        access:access
      });
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
};
