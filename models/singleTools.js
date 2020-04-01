var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var singleToolsSchema = new Schema({

    syntax: { type: String, required: [true, 'Syntax Required']},
    url: { type: String, required: [true, 'URL Required']}
    
});


module.exports = mongoose.model('SingleTools', singleToolsSchema);