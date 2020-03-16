var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var httprobeSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    url: { type: String, required: [true, 'URL Required']},
    findoFile: { type: String, required: [true, 'Findomain File Required']},
    httprobeDirectory: { type: String, required: [true, 'Httprobe Directory Required']},
    syntax: { type: String }
});


module.exports = mongoose.model('Httprobe', httprobeSchema);