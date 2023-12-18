
const AuthRoutes = require("./routes/auth");
const MongoConnect = require("./utils/db").MongoConnect;
const port = 8001;
const cluster = require('node:cluster');
const totalCPUs = require('node:os').cpus().length;
const process = require('node:process');

var corsOptions = {
  origin: 'https://zerodhalogin.netlify.app',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var cors= require('cors')
// if (cluster.isMaster) {
//   console.log(`Number of CPUs is ${totalCPUs}`);
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < 2; i++) {
//     cluster.fork();
//   }

//   cluster.on('online',function(worker){
//     console.log('Worker is running on %s pid', worker.process.pid);
//   })
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//     console.log("Let's fork another worker!");
//     cluster.fork();
//   });

// }
//  else {
  const express = require("express");
  const app = express()
  app.use(express.json());
  app.use(cors(corsOptions))
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("ngrok-skip-browser-warning",true);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });
  
  app.use(AuthRoutes);
  
  app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    
    if(error?.message && !error?.data){
      console.log(error,"inner err")
      res.status(status).send(error)
    }
    else{
      console.log(error,"outer err")
      res.status(status).send(error);
    }
    
  });
  
  MongoConnect(() => {
    app.listen(port, () => console.log(`Example app listening on port ${port}!, version 2`));
  });
// }



