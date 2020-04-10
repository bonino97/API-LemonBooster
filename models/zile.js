var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var zileSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    zileDirectory: { type: String, required: [true, 'Zile Directory Required']},
    file: { type: String },
    syntax: { type: String }
});




module.exports = mongoose.model('Zile', zileSchema);