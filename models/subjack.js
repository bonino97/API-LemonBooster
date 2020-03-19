var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var subjackSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    url: { type: String, required: [true, 'URL Required']},
    findoFile: { type: String, required: [true, 'Findomain File Required']},
    subjackDirectory: { type: String, required: [true, 'Subjack Directory Required']},
    syntax: { type: String }
});


module.exports = mongoose.model('Subjack', subjackSchema);