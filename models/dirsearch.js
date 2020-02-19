var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var dirsearchSchema = new Schema({
    url: { type: String, required: [true, 'URL Required'] },
    syntax: { type: String }
});

module.exports = mongoose.model('Dirsearch', dirsearchSchema);