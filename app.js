const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('./config/db-url');
const Url = require('./models/url');

var file = require('fs-extra');
var path = require('path');

const {authencicateUser} = require('./middlewares/authentication'); 

const {usersRouter} = require('./routes/user');

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


app.use(bodyParser.json());
app.use(useragent.express());

app.use('/users',usersRouter)


//custom middle ware using tokens in morgan
app.use(morgan((tokens, req, res) => {
    return `STARTED: ${tokens.method(req, res)} ${tokens.url(req, res)} for ${req.ip} at ${new Date()}
COMPLETED: ${tokens.status(req, res)} in  ${tokens['response-time'](req, res)}ms`;
  }));





  app.set('view engine', 'pug');
  //template engine pug
app.get('/tables', function (req, res) {
    Url.find().then(urls => {
        res.render('index', {users: urls})
    }).catch(err => res.send(err));
    
  });


app.get('/url',(req,res) => {
    Url.find().then(url => res.send(url)).catch(err => res.send(err));
});


//hashed url updating clicked data
app.get('/url/:hash',(req,res) => {
   // res.send(req.useragent)
    let data = {
      ipAdress: req.ip,
      browserName: req.useragent.browser,
      osType: req.useragent.os,
      deviceType: req.useragent.isDesktop ? 'Desktop' : 'Mobile'
    };
    Url.findOneAndUpdate({ hashed_url: req.params.hash },{$push: {clicks: data}}, { new: true }).then(data => {
        res.send(data)
      }).catch(err => res.send(err));
  });

//query tags url-single
app.get('/urls/tags',(req,res) => {
    let queryTags = req.query.names.split(',');
    Url.find({tags: {'$in': queryTags}}).then(url => {
        let arr = url.map(url2 => url2.original_url);
        res.send(arr[0]);
    }).catch(err => res.send(err));
});


//All the urls belonging to the user
app.get('/urls',authencicateUser,(req,res)=> {
    Url.find({user: req.locals.user._id}).then(urls => {
        res.send(urls);
    }).catch(err => res.send(err));
});

//url belonging to the url:id and authenticated user
app.get('/urls/:id',authencicateUser,(req,res)=> {
    Url.find({user: req.locals.user._id,_id:req.params.id}).then(url => {
        res.send(url);
    }).catch(err => res.send(err));
});


//multiple query tags
app.get('/url/tags/:name',(req,res) => {
    Url.find({tags: req.params.name}).then(url => {
        let arr = url.map(url2 => url2.original_url);
        res.send(arr[0]);
    }).catch(err => res.send(err));
});

//posting new url
app.post('/url',authencicateUser,(req,res) => {
    let body =  _.pick(req.body,['title','original_url','tags','clicks']);
    let url1 = new Url(body);
    url1.user = req.locals.user._id;
    url1.save().then(url => res.send(url)).catch(err => res.send(err));
});

//updating url id
app.put('/url/:id',(req,res) => {
    Url.findByIdAndUpdate(req.params.id,{ $set: req.body},{new: true})
    .then(url => res.send(url)).catch(err => res.send(err));
});

//deleting url id with authenticated user
app.delete('/urls/:id',authencicateUser,(req,res) => {
    Url.findByIdAndRemove({user: req.locals.user._id,_id:req.params.id})
    .then(url => res.send(url)
    ).catch(err => res.send(err));
});

app.use(function(req, res, next) {
        res.status(404).send({ error : 'route not found'});
  });

app.listen(port,() => {
    console.log('Listening to port '+port);
});