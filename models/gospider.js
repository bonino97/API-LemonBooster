var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var gospiderSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    gospiderDirectory: { type: String, required: [true, 'GoSpider Directory Required']},
    httprobeFile: { type: String },
    url: { type: String },
    syntax: { type: String }
});

module.exports = mongoose.model('GoSpider', gospiderSchema);