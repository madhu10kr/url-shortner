const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const _ = require('lodash');

var sh = require("shorthash");
 


const mongoose = require('./config/db-url');
const Url = require('./models/url');

const app = express();
const port = 3000;


app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/url',(req,res) => {
    Url.find().then(url => res.send(url)).catch(err => res.send(err));
});

app.get('/url/:hash',(req,res) => {
    Url.findOne({ hashed_url: `${req.params.hash}`}).select(['original_url']).then(url => {
        res.send({
            url
        })
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