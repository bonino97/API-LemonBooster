var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var waybackurlsSchema = new Schema({
    program: { type: Schema.ObjectId, ref: 'Program' },
    //url: { type: String, required: [true, 'URL Required'] },
    waybackurlsDirectory: { type: String, required: [true, 'Waybackurls Directory Required']},
    findomainFile: { type: String },
    url: { type: String },
    syntax: { type: String }
});

module.exports = mongoose.model('Waybackurls', waybackurlsSchema);