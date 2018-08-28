const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('./config/db-url');
const Url = require('./models/url');

const app = express();
const port = 3000;


app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/url',(req,res) => {
    Url.find().then(url => res.send(url)).catch(err => res.send(err));
});


//hashed url
app.get('/url/:hash',(req,res) => {
    Url.find({ hashed_url: `${req.params.hash}`}).then(url => {
        let arr = url.map(url2 => url2.original_url);
        res.send(arr[0]);
    }).catch(err => res.send(err));
});

//tags url

app.get('/urls/tags',(req,res) => {
    let queryTags = req.query.names.split(',');
    Url.find({tags: {'$in': queryTags}}).then(url => {
        let arr = url.map(url2 => url2.original_url);
        res.send(arr[0]);
    }).catch(err => res.send(err));
});

//multiple tags
app.get('/url/tags/:name',(req,res) => {
    Url.find({tags: req.params.name}).then(url => {
        let arr = url.map(url2 => url2.original_url);
        res.send(arr[0]);
    }).catch(err => res.send(err));
});


app.post('/url',(req,res) => {
    let body =  _.pick(req.body,['title','original_url','tags']);
    let url1 = new Url(body);
    url1.save().then(url => res.send(url)).catch(err => res.send(err));
});

app.put('/url/:id',(req,res) => {
    Url.findByIdAndUpdate(req.params.id,{ $set: req.body},{new: true})
    .then(url => res.send(url)).catch(err => res.send(err));
});

app.delete('/url/:id',(req,res) => {
    Url.findByIdAndRemove(req.params.id)
    .then(url => res.send(url)).catch(err => res.send(err));
});

app.listen(port,() => {
    console.log('Listening to port '+port);
});