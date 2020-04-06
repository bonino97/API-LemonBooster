var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var getJsSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    getjsDirectory: { type: String, required: [true, 'GetJs Directory Required']},
    file: { type: String },
    link: { type: String },
    syntax: { type: String },
});




module.exports = mongoose.model('GetJs', getJsSchema);