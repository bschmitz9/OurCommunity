var user = require('../server/controllers/users.js');
var community = require('../server/controllers/community.js');
var discussion = require('../server/controllers/discussion.js');

module.exports = function (app){
    // add new user from home page
    app.post('/new_user', function (request, response){
        user.add(request, response);
    });

    //add new user from alternative sign up page
     app.post('/new_user2', function (request, response){
        user.add(request, response);
    });

    //user login
    app.post('/current_user', function (request, response){
        user.login(request, response);
    });

    //user selects a community from the dropdown options
    app.post('/user_added', function (request, response){
        user.addCommunity(request, response);
    });

    //show all communities
    app.get('/all_communities', function (request, response){
        community.show(request, response);
    });

    //user creates a new community
    app.post('/new_community', function (request, response){
        community.add(request, response);
    });

    //show commnity on the profile page
    app.get('/all_profile', function (request, response){
        community.show(request, response);
    });

    //add a new discussion
    app.post('/new_discussion', function (request, response){
        discussion.add(request, response);
    });

    //get all discussions when the community profile page
    app.post('/all_discussions', function (request, response){
        discussion.show(request, response);
    });

    //delete a discussion from the community profile page
    app.post('/remove_discussion/:id', function (request, response){
         discussion.delete(request, response);
    });
    
};

