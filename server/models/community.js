var mongoose = require('mongoose');

var communitySchema = mongoose.Schema({
    name: String,
    address: String,
    objective: String,
    firstName: String,
    lastName: String,
    email: String,
    location: Object,
    googleDir: String,
    memberFullName: [String],
    userDescription: [String],
    date_joined: [String],
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    discussions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Discussion'}],
    created_at: String,
    date: Date
});

mongoose.model('Community', communitySchema);