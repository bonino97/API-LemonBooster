var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var dirsearchSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    //url: { type: String, required: [true, 'URL Required'] },
    dirsearchDirectory: { type: String, required: [true, 'Dirsearch Directory Required']},
    urlStatus: { type: Array },
    hakcheckurlFile: { type: String },
    list: { type: String },
    url: { type: String },
    syntax: { type: String },

});

module.exports = mongoose.model('Dirsearch', dirsearchSchema);