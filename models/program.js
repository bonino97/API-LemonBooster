var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var programSchema = new Schema({
    name: { type: String, required: [true, 'Name Required']},
    domain: { type: String, required: [true, 'Domain Required']},
    scope: { type: String, required: false }
});


module.exports = mongoose.model('Program', programSchema);