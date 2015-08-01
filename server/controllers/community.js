var mongoose = require('mongoose');
var Community = mongoose.model('Community');
var User = mongoose.model('User');
var moment = require('moment');
var validate = require('validate.js');

module.exports = (function (){
    return {
        //show all registered communitites to the user
        show: function (request, response){
            Community.find({}, function (error, results){
                if(error){
                    response.writeHead(500);
                    response.end(error);
                } else {
                    response.json(results);
                }
            });
        },

        //add a new community if it passes all validations
        add: function (request, response){
            if(request.body.member === null){
                var constraints = {
                   name: {
                        presence: true,
                        format: {
                            pattern: "^[a-zA-Z_]+ .+$",
                            message: "can only contain letters"
                        }
                    },
                    address: {
                        presence: true,
                        format: {
                        pattern: "^[0-9]+ .+$",
                        message: "must be valid: House Number, Street, City, State, Zip Code"
                        }
                    }
                };
           
            //add the word "communtiy" to the community name if it is not already there
                var string = request.body.community.name;
                var lower = string.toLowerCase();
                if(lower.indexOf("community") === -1){
                      request.body.community.name = request.body.community.name + " " + "Community";
                }
                Community.findOne({name: request.body.community.name}, function (error, result){
                    if(error){
                        response.writeHead(500);
                        response.end(error);
                    } else {
                        if(!result){
                            Community.findOne({address: request.body.community.address}, function (error, result){
                                if(error){
                                    response.writeHead(500);
                                    response.end(error);
                                } else {
                                    if(!result){
                                        var validation = validate({
                                            name: request.body.community.name,
                                            address: request.body.community.address
                                        }, constraints);
                                        //if there are validation errors send that response back and leave the rest
                                        if(validation){
                                            response.json(validation);
                                            return;
                                           } else {
                                                var community = new Community({
                                                    name: request.body.community.name,
                                                    firstName: request.body.user.firstName,
                                                    lastName: request.body.user.lastName,
                                                    address: request.body.community.address,
                                                    googleDir: request.body.community.googleDir,
                                                    email: request.body.user.email,
                                                    location: request.body.community.location,
                                                    objective: request.body.community.objective,
                                                    created_at: moment().format('MMM Do YYYY'),
                                                    date: new Date()
                                                });
                                                community.save(function (error, result){
                                                    if(error){
                                                        response.writeHead(500);
                                                        response.end(error);
                                                    } else {
                                                        User.findOneAndUpdate({email: request.body.user.email}, {$set: {_community: result._id}}, {$set: {community: request.body.community.name}}, function (error, result){
                                                             if(error){
                                                                    response.writeHead(500);
                                                                    response.end(error);
                                                              }else {
                                                                var user_id = result._id;
                                                                var fullName = result.firstName + " " + result.lastName;
                                                                var description = result.description;
                                                                var date_joined = result.created_at;
                                                                Community.findOne({address: request.body.community.address}, function (error, result){
                                                                     if(error){
                                                                            response.writeHead(500);
                                                                            response.end(error);
                                                                     } else {
                                                                        result.users.push(user_id);
                                                                        result.memberFullName.push(fullName);
                                                                        result.userDescription.push(description);
                                                                        result.date_joined.push(date_joined);
                                                                        result.save(function (error, result){
                                                                            if(error){
                                                                                response.writeHead(500);
                                                                                response.end(error);
                                                                            } else {
                                                                                //send back the community data to the client
                                                                                response.json({
                                                                                communityAdded: true,
                                                                                community: {
                                                                                    id: result._id,
                                                                                    name: result.name,
                                                                                    firstName: result.firstName,
                                                                                    lastName: result.lastName,
                                                                                    info: {
                                                                                        name: result.memberFullName,
                                                                                        description: result.userDescription,
                                                                                        joined: result.date_joined
                                                                                    },
                                                                                    member: result.memberFullName,
                                                                                    userDescription: result.userDescription,
                                                                                    joined: result.date_joined,
                                                                                    address: result.address,
                                                                                    googleDir: result.googleDir,
                                                                                    email: result.email,
                                                                                    location: result.location,
                                                                                    objective: result.objective,
                                                                                    created_at: result.created_at
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
                                            //end of community.save
                                            }
                                        } else {
                                            response.json({communityAdded:false, addressTaken:"Another community is already registered at this address."});
                                        }
                                    }
                                });
                            } else {
                                    response.json({communityAdded: false, nameTaken: "Community name is already taken."});
                            }
                        }
                    });
                 } else {
                    response.json({communityAdded: false, alreadyJoined: "You have already joined a community."});
                 }
            }
        };
})();