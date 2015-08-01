app.factory('communityProfileFactory', function ($http){
    var factory = {};

     //get all communities from the database to display on the community confirm
    factory.getCommunities = function(callback){
        $http.get('/all_profile').success(function (data){
            callback(data);
        });
    };

    //get all discussions from the database upon page load
    factory.getDiscussions = function (community, callback){
        $http.post('/all_discussions', community ).success(function(data){
            callback(data);
        });
    };

    //add a new discussion
    factory.newDiscussion = function(discussion, user, community, callback){
        $http.post('/new_discussion', {discussion: discussion, user: user, community: community}).success(function (data){
                callback(data);
        }).error(function (error){
                callback(error);
        });
    };

    //removes messagee if it was posted by the user him or herself.
    //user is only presented with the "Remove message" post if user._id and discussion._userId match up. 
    factory.removeMessage = function (discussion, callback){
        $http.post('/remove_discussion/:id', {id: discussion}).success(function (data){
                callback(data);
        }).error(function (error){
                callback(error);
        });
    };

    return factory;
});


app.controller('communityProfileController', function ($scope, $location, $compile, localStorageService, communityConfirmFactory, communityProfileFactory){
    //user info
    var user = localStorageService.get('user');
    //gets community information when the user creates a new commnunity
    var community = localStorageService.get('community');
    //gets information from the server when a user selects from the dropdown
    var existing = localStorageService.get('existing_community');
    //gets the object passed back containing the array of user names, descriptions, and dates joined
    var userInfo = localStorageService.get('userInfo');
    //get the userEmail of the person who joined the community via the dropdown
    var userEmail = localStorageService.get('userEmail');
    //gets the distance from the user to the community
    var commDistance = localStorageService.get('commMileage');
    //returns true of the user is logged in
    var logged_in = localStorageService.get('logged_in');
    $scope.logged_in = logged_in;
    //determines if the user currently has a community upon login, iniitally set to true, shows an info message if false and 
    //the above logged_in is true.
    var noCommunity = localStorageService.get('noCommunity');
    $scope.noCommunity = noCommunity;

    //call the communityConfirmFactory so we can get all communties to run when a user signs in, then compare the community name from the google
    //response with the loaded community name. if they match then set the scope of that matching community so we the distance the user is from
    //the community can be displayed in the google map.
    if(logged_in){
        var communities;
        communityConfirmFactory.getCommunities(function (communities){
            console.log(communities);
            for(var i = 0; i < communities.length; i++){
                if(communities[i].data.name === community.name){
                    $scope.distance = communities[i].distance;
                    $scope.$digest();
                }
            }
        });
    }

    var new_array = [];

    //if there is user information from the user choosing an existing community show the array of current members, otherwise show the new
    //community created by the current user. 
    if(userInfo){
        for(var i = 0; i < userInfo.name.length; i++){
            $scope.user = {};
            $scope.user.name = userInfo.name[i];
            $scope.user.description = userInfo.description[i];
            $scope.user.joined = userInfo.joined[i];
            new_array.push($scope.user);
        }
        $scope.user.userEmail = userEmail;

    } else if(community){
        $scope.memberNames = community.memberFullName;
        $scope.description = community.userDescription;
        $scope.dateJoined = community.date_joined;
    }
    //if there is an existing community already
    if(existing){
        $scope.community = existing;
        commDistance = localStorageService.get('commMileage');
        for(var i = 0; i < commDistance.length; i++){
        if(commDistance[i].data.name === community.name){
            $scope.distance = commDistance[i].distance;
            }
        }
    }

    //sets the new array to loop through to show all members in the commmunity
    $scope.communityMembers = new_array;
    //sets a user variable about the currently logged in user
    $scope.user = user;
    //holds information regarding the current community page
    $scope.community = community;

    //get all communities from the database
    communityProfileFactory.getCommunities(function(data){
        $scope.allCommunities = data;
    });


    //google maps geolocation
      var TILE_SIZE = 256;

      function bound(value, opt_min, opt_max) {
        if (opt_min !== null) value = Math.max(value, opt_min);
        if (opt_max !== null) value = Math.min(value, opt_max);
        return value;
      }

      function degreesToRadians(deg) {
        return deg * (Math.PI / 180);
      }

      function radiansToDegrees(rad) {
        return rad / (Math.PI / 180);
      }

      function MercatorProjection() {
        this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2, TILE_SIZE / 2);
        this.pixelsPerLonDegree_ = TILE_SIZE / 360;
        this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
      }

      MercatorProjection.prototype.fromLatLngToPoint = function(latLng,
          opt_point) {
        var me = this;
        var point = opt_point || new google.maps.Point(0, 0);
        var origin = me.pixelOrigin_;

        point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;

        // Truncating to 0.9999 effectively limits latitude to 89.189. This is
        // about a third of a tile past the edge of the world tile.
        var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999,
            0.9999);
        point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
            -me.pixelsPerLonRadian_;
        return point;
      };

      MercatorProjection.prototype.fromPointToLatLng = function(point) {
        var me = this;
        var origin = me.pixelOrigin_;
        var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
        var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
        var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
        return new google.maps.LatLng(lat, lng);
      };

      $scope.$on('mapInitialized', function(event, map) {
        var numTiles = 1 << map.getZoom();
        var projection = new MercatorProjection();
        $scope.chicago = map.getCenter();
        $scope.worldCoordinate = projection.fromLatLngToPoint($scope.chicago);
        $scope.pixelCoordinate = new google.maps.Point(
            $scope.worldCoordinate.x * numTiles,
            $scope.worldCoordinate.y * numTiles);
        $scope.tileCoordinate = new google.maps.Point(
            Math.floor($scope.pixelCoordinate.x / TILE_SIZE),
            Math.floor($scope.pixelCoordinate.y / TILE_SIZE));
      });

        //show all members in the community via a modal if there is more then 5 users
        $scope.showAll = function (){
             $scope.communityMembers = new_array;
        };

        //add a new discussion into the database and show it on the page with the callback
        $scope.newDiscussion = function (){
              communityProfileFactory.newDiscussion($scope.discussion, user, community, function(data){
                    $scope.discussions = data.communities.discussions;
                    $scope.discussion = "";
              });
        };

        //load all communities to the community profile page when the page loads
        communityProfileFactory.getDiscussions(community, function (data){
                 $scope.discussions = data[0].discussions;
            });

        //allows a user to remove a message only if he or she posted it
         $scope.removeMessage = function (discussion){
            communityProfileFactory.removeMessage(discussion._id, function (data){
                $scope.discussions.splice($scope.discussions.indexOf(data), 1);
            });
        };
         
        //log user out
        $scope.logout = function(){
            localStorageService.clearAll();
            $location.path('/');
        };
});