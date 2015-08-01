var mongoose = require('mongoose');
var User = mongoose.model('User');
var Community = mongoose.model('Community');
var moment = require('moment');
var validate = require('validate.js');

module.exports = (function (){
    return {
        //Add a new user to the database upon passing the below validations.
        add: function (request, response){
            var constraints = {
                firstName: {
                    presence: true,
                    format: {
                        pattern: "[a-zA-Z_]+",
                        message: "can only contain letters."
                    }
                },
                lastName: {
                    presence: true,
                    format: {
                        pattern: "[a-zA-Z_]+",
                        message: "can only contain letters."
                    }
                },
                description: {
                    presence: true
                },
                address: {
                    presence: true,
                    format: {
                    pattern: "^[0-9]+ .+$",
                    message: "must be valid: House Number, Street, City, State, Zip Code."
                    }
                },
                email: {
                    presence: true,
                    email: true
                },
                password: {
                    presence: true,
                    length: {
                        minimum: 6,
                        message: 'must be atleast 6 characters.'
                    }
                },
                confirm: {
                    presence: true,
                    equality: "password"
                }
            };
            User.findOne({email: request.body.email}, function (error, result){
                if(error){
                     response.writeHead(500);
                     response.end(error);
                } else {
                    if(!result){
                            var validation = validate({
                                firstName: request.body.firstName,
                                lastName: request.body.lastName,
                                description: request.body.description,
                                address: request.body.address,
                                email: request.body.email,
                                password: request.body.password,
                                confirm: request.body.confirmPassword
                        }, constraints);
                        if(validation){
                            response.json(validation);
                            return;
                        } else {
                             var user = new User({
                                firstName: request.body.firstName,
                                lastName: request.body.lastName,
                                description: request.body.description,
                                googleDir: request.body.googleDir,
                                address: request.body.address,
                                location: request.body.location,
                                email: request.body.email,
                                password: request.body.password,
                                created_at: moment().format('MMM Do YYYY'),
                                date: new Date()
                            });

                            //save the user into the DB
                             user.save(function (error){
                                if(error){
                                     response.writeHead(500);
                                     response.end(error);
                                } else {
                                    User.findOne({email:request.body.email}, function (error, result){
                                        if(error){
                                             response.writeHead(500);
                                             response.end(error);
                                        } else {
                                            response.json({
                                                logged_in: true,
                                                user: {
                                                     firstName: result.firstName,
                                                     lastName: result.lastName,
                                                     description: result.description,
                                                     location: result.location,
                                                     address: result.address,
                                                     googleDir: result.googleDir,
                                                     email: result.email,
                                                     created_at: result.created_at,
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        response.json({logged_in: false, emailTaken: "Email is already taken."});
                    }
                }
            });
        },

        //add the community name and id to the user's collection after they have specified the community they want to belong to
        addCommunity: function (request, response){
            if(request.body.joined === null){
                 User.findOneAndUpdate(
                    {email: request.body.user.email},
                    {$set:{_community: request.body.community._id}},
                    {$set:{community: request.body.community.name}}, function (error, result){
                     if(error){
                          response.writeHead(500);
                          response.end(error);
                     }else {
                        var community_id = result._community;
                        var user_id = result._id;
                        var fullName = result.firstName + " " + result.lastName;
                        var description = result.description;
                        var date_joined = result.created_at;
                        var email = result.email;
                        Community.findOne({name: request.body.community.name}, function (error, result){
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
                                      //return the user information so it can be used on the community profile page
                                       response.json({
                                        addedCommunity: true,
                                        info: {
                                            name: result.memberFullName,
                                            description: result.userDescription,
                                            joined: result.date_joined
                                        },
                                        community_reference: result,
                                        userEmail: email
                                        });
                                    }
                                });
                            }
                        });
                       
                     }
                 });
            } else {
                response.json({addedCommunity: false, alreadyAdded: "You already joined a community"});
            }
        },



        //Log user in upon passing the below validations
        login: function (request, response){
            User.findOne({email: request.body.email}).populate('_community').exec(function(error, result){
                if(error || result === null){
                    response.json({logged_in: false, error: "Invalid Username or Password."});
                } else {
                    if(result.password === request.body.password){
                        if(!result._community){
                            response.json({
                                logged_in: true,
                                result: result,
                                user:result
                            });
                        } else if (result._community){
                        response.json({
                            logged_in: true,
                            info:{
                                 name: result._community.memberFullName,
                                 description: result._community.userDescription,
                                 joined: result._community.date_joined
                            },
                            user: result
                        });
                     }
                    } else {
                        response.json({logged_in: false, error: "Invalid Username or Password."});
                    }
                }
            });
            
        }
    };
})();










