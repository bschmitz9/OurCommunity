app.factory('usersFactory', function ($http){
    var factory = {};
    var users = [];

    //add a new user to the database if validations pass on the server side
    factory.addUser = function (user, callback){
            geocoder = new google.maps.Geocoder();
            var address = user.address;
            geocoder.geocode( { 'address': address}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                   user.location = results[0].geometry.location;
                   if(user.location.G && user.location.K){
                      var A = user.location.G;
                      var F = user.location.K;
                   } else {
                      var A = user.location.A;
                      var F = user.location.F;
                   }
                   var origin = new google.maps.LatLng(A, F);
                   var destinations = new google.maps.LatLng(A, F);
                   var service = new google.maps.DistanceMatrixService();
                    service.getDistanceMatrix(
                     {
                        origins: [origin],
                        destinations: [destinations],
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.IMPERIAL,
                    }, get_results);

                    function get_results (response, status){
                        if (status != google.maps.DistanceMatrixStatus.OK) {
                             alert('Error was: ' + status);
                         } else {
                            user.googleDir = response.originAddresses[0];
                            $http.post('/new_user', user).success(function (data){
                                callback(data);
                            }).error(function (error){
                                callback(error);
                            });
                        }
                    }
                }
            });
        };

    //add a user from the second sign up page
     factory.addUser2 = function (user, callback){
            geocoder = new google.maps.Geocoder();
            var address = user.address;
            geocoder.geocode( { 'address': address}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                    user.location = results[0].geometry.location;
                     if(user.location.G && user.location.K){
                      var A = user.location.G;
                      var F = user.location.K;
                   } else {
                      var A = user.location.A;
                      var F = user.location.F;
                   }
                    var origin = new google.maps.LatLng(A, F);
                    var destinations = new google.maps.LatLng(A, F);
                    var service = new google.maps.DistanceMatrixService();
                    service.getDistanceMatrix(
                     {
                        origins: [origin],
                        destinations: [destinations],
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.IMPERIAL,
                    }, get_results);

                    function get_results (response, status){
                        if (status != google.maps.DistanceMatrixStatus.OK) {
                             alert('Error was: ' + status);
                         } else {
                            user.googleDir = response.originAddresses[0];
                            $http.post('/new_user', user).success(function (data){
                                callback(data);
                            }).error(function (error){
                                callback(error);
                            });
                        }
                    }
                }
             });
        };

    //log user in if passes back end validations
    factory.login = function (user, callback){
            $http.post('/current_user', user).success(function (data){
                callback(data);
            }).error(function (error){
                callback(error);
            });
        };
        return factory;
    });

//User Controller that handles login and registration of a user
app.controller('usersController', function ($scope, $http, $location, localStorageService, usersFactory){
    $scope.error = {};
    $scope.data = {};
    //Add a new user to the to the database if he or she passes both front and back end validations.
    $scope.addUser = function (){
        usersFactory.addUser($scope.newUser, function (data){
            if(data.logged_in){
                if(data.user.location.G && data.user.location.K){
                     localStorageService.set('A',data.user.location.G);
                     localStorageService.set('F',data.user.location.K);
                     localStorageService.set('user', data.user);
                     $scope.data.user = data.user;
                     $location.path('/confirm_community');
                } else {
                    localStorageService.set('A',data.user.location.A);
                    localStorageService.set('F',data.user.location.F);
                    localStorageService.set('user', data.user);
                    $scope.data.user = data.user;
                    $location.path('/confirm_community');
                }
            } else {
                if(data.firstName){
                    $scope.error.firstName = data.firstName;
                }
                if(data.lastName){
                    $scope.error.lastName = data.lastName;
                }
                if(data.address){
                    $scope.error.address = data.address;
                }
                if(data.email){
                    $scope.error.email = data.email;
                }
                if(data.emailTaken){
                    $scope.error.emailTaken = data.emailTaken;
                }
                if(data.password){
                    $scope.error.password = data.password;
                }
                if(data.confirm){
                    $scope.error.confirm = data.confirm;
                }
                $location.path('/');
            }
        });
    };

    //register user from the alternative sign up page
    $scope.addUser2 = function (){
        usersFactory.addUser2($scope.newUser, function (data){
            if(data.logged_in){
                if(data.user.location.G && data.user.location.K){
                     localStorageService.set('A',data.user.location.G);
                     localStorageService.set('F',data.user.location.K);
                     localStorageService.set('user', data.user);
                     $scope.data.user = data.user;
                     $location.path('/confirm_community');
                } else {
                    localStorageService.set('A',data.user.location.A);
                    localStorageService.set('F',data.user.location.F);
                    localStorageService.set('user', data.user);
                    $scope.data.user = data.user;
                    $location.path('/confirm_community');
                }
            } else {
                if(data.firstName){
                    $scope.error.firstName = data.firstName;
                }
                if(data.lastName){
                    $scope.error.lastName = data.lastName;
                }
                if(data.address){
                    $scope.error.address = data.address;
                }
                if(data.email){
                    $scope.error.email = data.email;
                }
                if(data.emailTaken){
                    $scope.error.emailTaken = data.emailTaken;
                }
                if(data.password){
                    $scope.error.password = data.password;
                }
                if(data.confirm){
                    $scope.error.confirm = data.confirm;
                }
                $location.path('/signup2');
            }
        });
    };

    //user login
    $scope.login = function (){
        usersFactory.login($scope.user, function (data){
               if(data.logged_in){
                //if a user has not joined a community, redirect the user to the community confirm page
                //also need to account for Google sending back Lat Long coordinates of G/K or A/F
                    if(!data.user._community){
                        if(data.user.location.G && data.user.location.K){
                             localStorageService.set('logged_in', true);
                             localStorageService.set('A', data.user.location.G);
                             localStorageService.set('F', data.user.location.K);
                             localStorageService.set('user', data.user);
                             localStorageService.set('userInfo', data.info);
                             localStorageService.set('noCommunity', true);
                             $location.path('/confirm_community');
                        } else {
                             localStorageService.set('logged_in', true);
                             localStorageService.set('A', data.user.location.A);
                             localStorageService.set('F', data.user.location.F);
                             localStorageService.set('user', data.user);
                             localStorageService.set('userInfo', data.info);
                             localStorageService.set('noCommunity', true);
                             $location.path('/confirm_community');
                        }
                    } else if (data.user._community){
                //if a user has joined a community, redirect the user to that community page.
                //also need to account for Google sending back Lat Long coordinates of G/K or A/F
                        if(data.user.location.G && data.user.location.K){
                                localStorageService.set('logged_in', true);
                                localStorageService.set('A', data.user.location.G);
                                localStorageService.set('F', data.user.location.K);
                                localStorageService.set('user', data.user);
                                localStorageService.set('community', data.user._community);
                                localStorageService.set('userInfo', data.info);
                                $scope.data.user = data.user;
                                $location.path('/community/data.user._community._id');
                        } else {
                                localStorageService.set('logged_in', true);
                                localStorageService.set('A', data.user.location.A);
                                localStorageService.set('F', data.user.location.F);
                                localStorageService.set('user', data.user);
                                localStorageService.set('community', data.user._community);
                                localStorageService.set('userInfo', data.info);
                                $scope.data.user = data.user;
                                $location.path('/community/data.user._community._id');
                        }
                    }
               } else {
                    $scope.data.error = data.error;
            }
        });
    };

    $scope.testSignin = function (){
        var user = {};
        user.email = "testeremail@gmail.com";
        user.password = "Password";
        usersFactory.login(user, function (data){
           //if a user has not joined a community, redirect the user to the community confirm page
          //also need to account for Google sending back Lat Long coordinates of G/K or A/F
            if(!data.user._community){
                if(data.user.location.G && data.user.location.K){
                         localStorageService.set('logged_in', true);
                         localStorageService.set('A', data.user.location.G);
                         localStorageService.set('F', data.user.location.K);
                         localStorageService.set('user', data.user);
                         localStorageService.set('userInfo', data.info);
                         localStorageService.set('noCommunity', true);
                         $location.path('/confirm_community');
                    } else {
                         localStorageService.set('logged_in', true);
                         localStorageService.set('A', data.user.location.A);
                         localStorageService.set('F', data.user.location.F);
                         localStorageService.set('user', data.user);
                         localStorageService.set('userInfo', data.info);
                         localStorageService.set('noCommunity', true);
                         $location.path('/confirm_community');
                    }
            } else if (data.user._community){
            //if a user has joined a community, redirect the user to that community page.
            //also need to account for Google sending back Lat Long coordinates of G/K or A/F
               if(data.user.location.G && data.user.location.K){
                          localStorageService.set('logged_in', true);
                          localStorageService.set('A', data.user.location.G);
                          localStorageService.set('F', data.user.location.K);
                          localStorageService.set('user', data.user);
                          localStorageService.set('community', data.user._community);
                          localStorageService.set('userInfo', data.info);
                          $scope.data.user = data.user;
                          $location.path('/community/data.user._community._id');
                        } else {
                          localStorageService.set('logged_in', true);
                          localStorageService.set('A', data.user.location.A);
                          localStorageService.set('F', data.user.location.F);
                          localStorageService.set('user', data.user);
                          localStorageService.set('community', data.user._community);
                          localStorageService.set('userInfo', data.info);
                          $scope.data.user = data.user;
                          $location.path('/community/data.user._community._id');
                        }
                }
         });
    };

});






