var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var findomainSchema = new Schema({
    url: { type: String, required: [true, 'URL Required'] },
    syntax: { type: String },
    resolvable: { type: Boolean },
    program: { type: Schema.ObjectId, ref: 'Program' }
});

module.exports = mongoose.model('Findomain', findomainSchema);