const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bodyParser = require('body-parser');
var sh = require("shorthash");
 

const urlSchema = new Schema({
    title:{
        type: String,
        required:true
    },
    original_url:{
        type: String,
        required: true
    },
    tags: [ String ],
    createdAt:{
        type: Date,
        default: Date.now
    },
    hashed_url:{
        type: String
    }
}); 

urlSchema.pre('save',function(next) {
    if(!this.hashed_url){
        this.hashed_url = sh.unique(`${this.original_url}`);
    }
    
    next();
});

const Url = mongoose.model('URL',urlSchema);

module.exports = Url;