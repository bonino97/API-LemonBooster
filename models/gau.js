var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var gauSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    //url: { type: String, required: [true, 'URL Required'] },
    gauDirectory: { type: String, required: [true, 'Gau Directory Required']},
    findomainFile: { type: String },
    url: { type: String },
    syntax: { type: String }
});

module.exports = mongoose.model('Gau', gauSchema);