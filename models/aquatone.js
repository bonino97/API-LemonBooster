var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var aquatoneSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    httprobeFile: { type: String, required: [true, 'Httprobe File Required']},
    url: { type: String, required: [true, 'URL Required']},
    aquatoneDirectory: { type: String, required: [true, 'Aquatone Directory Required']},
    aquatoneDirSession: { type: String, required: [true, 'Aquatone Directory Session Required']},
    syntax: { type: String }

});


module.exports = mongoose.model('Aquatone', aquatoneSchema);