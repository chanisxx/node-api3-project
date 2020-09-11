const express = require('express');
// const morgan = require('morgan');
const userRouter = require('./users/userRouter');
const helmet = require('helmet');

const server = express();

server.use(express.json());
server.use(helmet());
// server.use(lockout); // close out the server for maintenence, etc

server.use(logger);
server.use('/api/users', userRouter);

server.get('/', (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

//custom middleware

function logger(req, res, next) {
 // console.log(req);
 let date = new Date();

 console.log(
   `${req.method} request, 
   URL: ${req.headers.host}${req.originalUrl}, 
   Date: ${date}`
  );

 next();
};

function lockout (req,res, next) {
  res.status(401).json({message: 'api in maintenence mode'})
}

server.use((error, req, res, next) => { // we can check to ensure error codes are always there
  res.status(error.code).json({message: "Error:", error}) 
  });


module.exports = server;
