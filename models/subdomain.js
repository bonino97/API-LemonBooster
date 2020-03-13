var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var subdomainSchema = new Schema({
    subdomain: { type: Array, required: [true, 'Subdomain Required']}
});


module.exports = mongoose.model('Subdomain', subdomainSchema);