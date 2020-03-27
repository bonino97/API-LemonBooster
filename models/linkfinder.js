var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var linkfinderSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    linkfinderDirectory: { type: String, required: [true, 'LinkFinder Directory Required']},
    file: { type: String },
    link: { type: String },
    syntax: { type: String },

});

module.exports = mongoose.model('Linkfinder', linkfinderSchema);