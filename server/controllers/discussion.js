var mongoose = require('mongoose');
var User = mongoose.model('User');
var Community = mongoose.model('Community');
var Discussion = mongoose.model("Discussion");
var moment = require('moment');
var validate = require('validate.js');

module.exports = (function (){
    return {
        //show all discussions when the community profile page loads.
        show: function (request, response){
            if(request.body._id){
                //if the user comes from the dropdown upon sign up or when the user signs in to his or her account
                 Community.find({_id: request.body._id}).populate('discussions').exec(function (error, results){
                    if(error){
                        response.writeHead(500);
                        response.end(error);
                    } else {
                        response.json(results);
                        }
                });
         } else {
            // when the user creates a new comunity after signing up
                Community.find({_id: request.body.id}).populate('discussions').exec(function (error, results){
                    if(error){
                        response.writeHead(500);
                        response.end(error);
                    } else {
                        response.json(results);
                        }
                });
            }
        },

        //add a new discussion to the database
        add: function(request, response){
            var discussion = new Discussion({
                text: request.body.discussion.text,
                firstName: request.body.user.firstName,
                lastName: request.body.user.lastName,
                userEmail: request.body.user.email,
                _community: request.body.community._id,
                _userId: request.body.user._id,
                created_at: moment().format('MMM Do YYYY'),
                date: new Date()
            });

            discussion.save(function (error, result){
                if(error){
                    response.writeHead(500);
                    response.end(error);
                } else {
                    var discussionId = result._id;
                    User.findOne({email: result.userEmail}, function (error, result){
                        if(error){
                            response.writeHead(500);
                            response.end(error);
                        } else {
                            result.discussions.push(discussionId);
                            result.save(function (error, result){
                                if(error){
                                    response.writeHead(500);
                                    response.end(error);
                                } else {
                                    Community.findOne({_id: result._community}, function (error, result){
                                            if(error){
                                                response.writeHead(500);
                                                response.end(error);
                                            } else {
                                                result.discussions.push(discussionId);
                                                result.save(function (error, result){
                                                    if(error){
                                                         response.writeHead(500);
                                                         response.end(error);
                                                    } else {
                                                        Community.findOne({_id: result._id}).populate('discussions').exec(function (error, result){
                                                            if(error){
                                                                 response.writeHead(500);
                                                                 response.end(error);
                                                            } else {
                                                                response.json({
                                                                    communities: result
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },

        //delete a user's discussion, only available if the user created the message him or her self.
        delete: function (request, response){
            Discussion.remove({_id: request.body.id}, function (error, result){
                if(error){
                     response.writeHead(500);
                     response.end(error);
                } else {
                    response.json(result);
                }

            });
        }
    };
})();







