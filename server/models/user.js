var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
        firstName: String,
        lastName: String,
        address: String,
        googleDir: String,
        description: String,
        community: String,
        email: String,
        location: Object,
        _community: {type: mongoose.Schema.ObjectId, ref: 'Community'},
        discussions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Discussion'}],
        password: String,
        created_at: String,
        date: Date,
    //facebook login
    // facebook: {
    //     id: String,
    //     token: String,
    //     email: String,
    //     name: String
    // }
});

mongoose.model('User', userSchema);