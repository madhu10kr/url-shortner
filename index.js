const express = require('express');
const morgan = require('morgan');
const _ = require('lodash');
const mongoose = require('./config/db');

var file = require('fs-extra');
var path = require('path');

const {router} = require('./config/routes');

const app = express();

var useragent = require('express-useragent');
const port = 3000;
//console.log(morgan.date);

var logCreate = file.createWriteStream(path.join('./logs', 'access.log'), {flags: 'a'});


//app.use(morgan('combined', {stream: logCreate}));
app.use(morgan((tokens, req, res) => {
    return `STARTED: ${tokens.method(req, res)} ${tokens.url(req, res)} for ${req.ip} at ${new Date()}
COMPLETED: ${tokens.status(req, res)} in  ${tokens['response-time'](req, res)}ms`;
  },{stream: logCreate}));


app.use(express.json());
app.use(useragent.express());

app.use('/',router);


//custom middle ware using tokens in morgan
app.use(morgan((tokens, req, res) => {
    return `STARTED: ${tokens.method(req, res)} ${tokens.url(req, res)} for ${req.ip} at ${new Date()}
COMPLETED: ${tokens.status(req, res)} in  ${tokens['response-time'](req, res)}ms`;
  }));





  app.set('view engine', 'pug');
  //template engine pug


app.use(function(req, res, next) {
        res.status(404).send({ error : 'route not found'});
  });

app.listen(port,() => {
    console.log('URL - Listening to port '+port);
});