var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var hakrawlerSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    //url: { type: String, required: [true, 'URL Required'] },
    hakrawlerDirectory: { type: String, required: [true, 'Hakrawler Directory Required']},
    hakrawlerJsDirectory: { type: String, required: [true, 'HakrawlerJs Directory Required']},
    findomainFile: { type: String },
    url: { type: String },
    syntax: { type: String }
});

module.exports = mongoose.model('Hakrawler', hakrawlerSchema);