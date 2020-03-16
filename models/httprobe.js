var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var httprobeSchema = new Schema({
    subdomain:  { type: Schema.ObjectId, ref: 'Subdomain' },
    program: { type: Schema.ObjectId, ref: 'Program' },
    url: { type: String, required: [true, 'URL Required']},
    httprobeDirectory: { type: String, required: [true, 'Httprobe Directory Required']},
    httprobeFiles: { type: Array, required: [true, 'Httprobe Files Required']},
    syntax: { type: String }
});


module.exports = mongoose.model('Httprobe', httprobeSchema);