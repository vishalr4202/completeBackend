const jwt = require("jsonwebtoken");
const User = require("../model/user");
const { error } = require("winston");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error();
    error.statusCode = 401;
    error.data = "Not authenticated, Please Login";
    throw error;
  }
  const token = authHeader;
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "Fulham@chelsea&Liverpool");
  } catch (error) {
    console.log("inHere");
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    error.data = "Incorrect credentials , try again";
    throw error;
  }
  if(decodedToken.role !== 'admin'){
    const error = new Error("Not a valid user role");
    error.statusCode = 401;
    error.data = "Invalid role";
    throw error;
  }
  User.findById(decodedToken.userId)
    .then((result) => {
      if(result?.Role == 'admin'){
      req.userId = decodedToken.userId;
      req.apiKey = result?.api_key;
      req.secretKey = result?.secret_key;
      req.accessToken = result?.access_token;
      req.request_token = result?.request_token;
      req.email = result?.email;
      req.updatedAt = result.updated_at;
      req.loginId = result.userId;
      req.role = result?.Role
      next();
    }
    else{
           const error = new Error("Not a valid user role");
            error.statusCode = 401;
            error.data = "Invalid role";
            next(error);
    }
}).catch((err) => {
      const error = new Error("api and secret key mismatch");
      error.statusCode = 401;
      error.data = err;
      throw error;
    });
};
