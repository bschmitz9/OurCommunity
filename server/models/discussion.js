var mongoose = require('mongoose');

var discussionSchema = mongoose.Schema({
    text: String,
    firstName: String,
    lastName: String,
    userEmail: String,
    _userId: {type: mongoose.Schema.ObjectId, ref: 'User'},
    _community: {type: mongoose.Schema.ObjectId, ref: 'Community'},
    created_at: String,
    date: Date
});

mongoose.model('Discussion', discussionSchema);