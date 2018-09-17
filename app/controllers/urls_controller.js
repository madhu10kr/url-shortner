const express = require('express');
const router = express.Router();

const Url = require('../models/url');

const {authencicateUser} = require('../middlewares/authentication')

router.get('/tables', function (req, res) {
    Url.find().then(urls => {
        res.render('index', {users: urls})
    }).catch(err => res.send(err));
    
  });


router.get('/',(req,res) => {
    Url.find().then(url => res.send(url)).catch(err => res.send(err));
});


//hashed url updating clicked data
router.get('/url/:hash',(req,res) => {
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
router.get('/tags',(req,res) => {
    let queryTags = req.query.names.split(',');
    Url.find({tags: {'$in': queryTags}}).then(url => {
        let arr = url.map(url2 => url2.original_url);
        res.send(arr[0]);
    }).catch(err => res.send(err));
});


//All the urls belonging to the user
router.get('/urls',authencicateUser,(req,res)=> {
    Url.find({user: req.locals.user._id}).then(urls => {
        res.send(urls);
    }).catch(err => res.send(err));
});

//url belonging to the url:id and authenticated user
router.get('/:id',authencicateUser,(req,res)=> {
    Url.find({user: req.locals.user._id,_id:req.params.id}).then(url => {
        res.send(url);
    }).catch(err => res.send(err));
});


//multiple query tags
router.get('/url/tags/:name',(req,res) => {
    Url.find({tags: req.params.name}).then(url => {
        let arr = url.map(url2 => url2.original_url);
        res.send(arr[0]);
    }).catch(err => res.send(err));
});

//posting new url
router.post('/',authencicateUser,(req,res) => {
    let body =  _.pick(req.body,['title','original_url','tags','clicks']);
    let url1 = new Url(body);
    url1.user = req.locals.user._id;
    url1.save().then(url => res.send(url)).catch(err => res.send(err));
});

//updating url id
router.put('/:id',(req,res) => {
    Url.findByIdAndUpdate(req.params.id,{ $set: req.body},{new: true})
    .then(url => res.send(url)).catch(err => res.send(err));
});

//deleting url id with authenticated user
router.delete('/:id',authencicateUser,(req,res) => {
    Url.findByIdAndRemove({user: req.locals.user._id,_id:req.params.id})
    .then(url => res.send(url)
    ).catch(err => res.send(err));
});


module.exports = {
    urlsController: router
}