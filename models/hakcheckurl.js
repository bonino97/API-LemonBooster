var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var hakcheckurlSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    url: { type: String, required: [true, 'URL Required']},
    httprobeFile: { type: String, required: [true, 'Httprobe File Required']},
    hakcheckurlDirectory: { type: String, required: [true, 'Hakcheckurl Directory Required']},
    hakcheckurlFiles: { type: Array },
    syntax: { type: String }
});


module.exports = mongoose.model('Hakcheckurl', hakcheckurlSchema);