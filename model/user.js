const mongodb = require("mongodb");

const getDB = require("../utils/db").getDB;

class User {
  constructor(
    name,
    email,
    password,
    access_token,
    api_key,
    secret_key,
    updated_at,
    zerodha,
    firstock,
    FS_id,
    FS_uid,
    FS_api_key,
    FS_access_token
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.access_token = access_token || "";
    this.api_key = api_key || "";
    this.secret_key = secret_key || "";
    this.updated_at = updated_at || Date.now();
    this.zerodha = zerodha || false;
    this.firstock = firstock || false;
    this.FS_id = FS_id || "";
    this.FS_uid = FS_uid || "";
    this.FS_api_key = FS_api_key || "";
    this.FS_access_token = FS_access_token || "";
  }

  save() {
    const db = getDB();
    console.log(this);
    return db
      .collection("users")
      .insertOne(this)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static showLogin(email) {
    const db = getDB();
    return db
      .collection("users")
      .findOne(email)
      .then((user) => {
        return user;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  static findById(userId) {
    const db = getDB();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then((user) => {
        // console.log("usermodel----", user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findByEmailId(email) {
    const db = getDB();
    return db
      .collection("users")
      .findOne({ email: email })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findByIdAndUpdate(email) {
    const db = getDB();
    return db
      .collection("users")
      .updateOne(
        { email: email},
        { $set: { updated_at: Date.now() } }
      )
      .then((user) => {
        // console.log("usermodel----", user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findByIdAndUpdateToken(userId, val) {
    console.log(userId, val, "inside Model");
    const db = getDB();
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(userId) },
        { $set: { access_token: val, updated_at: Date.now() } }
      )
      .then((user) => {
        // console.log("usermodel----", user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findByIdAndUpdateFSToken(email, val) {
    console.log(email, val, "inside Model");
    const db = getDB();
    return db
      .collection("users")
      .updateOne(
        { email: email },
        { $set: { FS_access_token: val, updated_at: Date.now() } }
      )
      .then((user) => {
        // console.log("usermodel----", user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  static getUsers() {
    const db = getDB();
    console.log("in users")
    return db
      .collection("users")
      .find().toArray()
      .then((user) => {
        const data = user.sort((a,b) => b.updated_at - a.updated_at).map(ele => {
          console.log(new Date(ele?.updated_at))
          return {"email":ele?.email,"name":ele?.name,"updated":ele?.updated_at}
         })
        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static getZerodhaUsers() {
    const db = getDB();
    console.log("in users")
    return db
      .collection("users")
      .find().toArray()
      .then((user) => {
      //  const newArr = user.filter((ele) => ele?.FS_id && ele?.FS_id !== '')
      const newArr = user.filter((ele) => ele?.zerodha == true)
       return newArr
      }).then((user) => {
        const data = user.sort((a,b) => b.updated_at - a.updated_at).map(ele => {
          console.log(new Date(ele?.updated_at))
          return {"email":ele?.email,"name":ele?.name,"updated":ele?.updated_at}
         })
        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static getFSUsers() {
    const db = getDB();
    console.log("in users")
    return db
      .collection("users")
      .find().toArray()
      .then((user) => {
      //  const newArr = user.filter((ele) => ele?.FS_id && ele?.FS_id !== '')
      const newArr = user.filter((ele) => ele?.firstock == true)
       return newArr
      }).then((user) => {
        const data = user.sort((a,b) => b.updated_at - a.updated_at).map(ele => {
          console.log(new Date(ele?.updated_at))
          return {"email":ele?.email,"name":ele?.name,"updated":ele?.updated_at}
         })
        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
