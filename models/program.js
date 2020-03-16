var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var programSchema = new Schema({
    name: { type: String, required: [true, 'Name Required']},
    domain: { type: String, required: [true, 'Domain Required']},
    scope: { type: String, required: false },
    programDir: { type: String, required: [true, 'Program Directory Required'] },
    subdomain: { type: Schema.ObjectId, ref: 'Subdomain' }
});


module.exports = mongoose.model('Program', programSchema);