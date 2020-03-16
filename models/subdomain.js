var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var subdomainSchema = new Schema({
    
    program: { type: Schema.ObjectId, ref: 'Program' },
    subdomain: { type: String, required: [true, 'Subdomain Required']},
    subdomainsDirectory: { type: String, required: [true, 'Subdomain Directory Required']},
    subdomainFile: { type: String, required: [true, 'Subdomain File Required']}
});


module.exports = mongoose.model('Subdomain', subdomainSchema);