const { check, body, checkSchema } = require("express-validator");
const getDB = require("../utils/db").getDB;

exports.userSignupSchema = [
  checkSchema({
    name: {
      trim: true,
      not: true,
      isEmpty: true,
      errorMessage: "should not be empty",
      isLength: {
        errorMessage: "should be a minimum of 3 characters",
        options: { min: 3 },
      },
      matches: {
        options: [/^[a-z,A-Z ]+$/],
        errorMessage: "Please enter alphabets only",
      },
    },
    email: {
      trim: true,
      isEmail: true,
      custom: {
        options: (value, { req }) => {
          const db = getDB();
          return db
            .collection("users")
            .findOne({ email: value })
            .then((result) => {
              console.log(result);
              if (result) {
                return Promise.reject("email already exists");
              }
            });
        },
      },
      errorMessage: "Please enter a valid email Id",
    },
    password: {
      trim: true,
      isAlphanumeric: false,
      isLength: {
        errorMessage: "should be a minimum of 5 and maximum of 10",
        options: { min: 5, max: 15 },
      },
      errorMessage: "Please enter a valid password",
    },
  }),
];

exports.userLoginSchema = [
  checkSchema({
    email: {
      trim: true,
      isEmail: true,
      errorMessage: "Please enter a valid email Id",
    },
    password: {
      trim: true,
      isLength: {
        errorMessage: "Password should be a minimum of 5 characters",
        options: { min: 5 },
      },
      errorMessage: "Please enter a valid password",
    },
  }),
];


exports.setSignupSchema = [
  checkSchema({
    name: {
      trim: true,
      not: true,
      isEmpty: true,
      errorMessage: "should not be empty",
      isLength: {
        errorMessage: "should be a minimum of 3 characters",
        options: { min: 3 },
      },
      custom: {
        options: (value, { req }) => {
          console.log(value,"val")
          const db = getDB();
          return db
            .collection("set")
            .findOne({ name: value })
            .then((result) => {
              console.log(result,"validation");
              if (result) {
                return Promise.reject("name already exists");
              }
            });
        },
      },
      errorMessage: "Please enter a valid email Id",
    },
    // email: {
    //   trim: true,
    //   isEmail: true,
    //   custom: {
    //     options: (value, { req }) => {
    //       const db = getDB();
    //       return db
    //         .collection("users")
    //         .findOne({ email: value })
    //         .then((result) => {
    //           console.log(result);
    //           if (result) {
    //             return Promise.reject("email already exists");
    //           }
    //         });
    //     },
    //   },
    //   errorMessage: "Please enter a valid email Id",
    // },
    // password: {
    //   trim: true,
    //   isAlphanumeric: false,
    //   isLength: {
    //     errorMessage: "should be a minimum of 5 and maximum of 10",
    //     options: { min: 5, max: 15 },
    //   },
    //   errorMessage: "Please enter a valid password",
    // },
  }),
];