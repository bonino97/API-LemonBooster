var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var programSchema = new Schema({
    name: { type: String, required: [true, 'Name Required']},
    domain: { type: String, required: [true, 'Domain Required']},
    scope: { type: String, required: false },
    subdomain: { type: Schema.ObjectId, ref: 'Subdomain' }
});


module.exports = mongoose.model('Program', programSchema);