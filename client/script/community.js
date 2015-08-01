app.factory('communityConfirmFactory', function ($http, localStorageService){
    var factory = {};
    //get the lat and long of the user's address so that it can be used below in the getCommunities response from the server
    var A = localStorageService.get('A');
    var F = localStorageService.get('F');
    var newLocation = {};
    newLocation.A = A;
    newLocation.F = F;
    var origin = new google.maps.LatLng(A, F);

    //get all communities from the database to display on the community confirm
    factory.getCommunities = function(callback){
            $http.get('/all_communities').success(function (data){
            var destinations = [];
            for(var i = 0; i < data.length; i++){
                //google gives back a location response with Lat Long properties of either 'G/K' or 'A/F'
                if(data[i].location.G & data[i].location.K){
                    var A = data[i].location.G;
                    var F = data[i].location.K;
                } else {
                    var A = data[i].location.A;
                    var F = data[i].location.F;
                }
                destinations.push(new google.maps.LatLng(A,F));
            }
            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
            {
                origins: [origin],
                destinations: destinations,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL,
            }, get_results);


            //callback used to filter the results from the google matrix. If the results match and the community is within 10 miles then we push 
            //the addresses object into the communityDistances array.
            function get_results(response, status){
                var communityDistances = [];
                if (status != google.maps.DistanceMatrixStatus.OK) {
                    alert('Error was: ' + status);
                } else {
                    var commInfo = [];
                    //check to see if the community is less then or equal to 10 miles away (distance from google is in meters)
                    for(var i = 0; i < response.destinationAddresses.length; i++){
                        if(response.rows[0].elements[i].distance.value <= 16093.4){
                            for(var j = 0; j < data.length; j++){
                                if(response.destinationAddresses[i] === data[j].googleDir){
                                        var information = {};
                                        information.data = data[j];
                                        information.distance = response.rows[0].elements[i].distance.text;
                                        commInfo.push(information);
                                        }
                                    }
                                }
                            }
                            callback(commInfo);
                       }
                     }
                 });
    };

    //send the community information to the server
    factory.addCommunity = function (community, user, member, callback){
            geocoder = new google.maps.Geocoder();
            var address = community.address;
             geocoder.geocode( { 'address': address}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                   community.location = results[0].geometry.location;
                   if(community.location.G && community.location.K){
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
                            community.googleDir = response.originAddresses[0];
                            $http.post('/new_community', {community: community, user: user, member: member}).success(function (data){
                                callback(data);
                             }).error(function (error){
                                 callback(error);
                            });
                        }
                     }
                }
             });
         };

    //user selects an existing community to join
    factory.userAdded = function (community, user, joined, callback){
        $http.post('/user_added', {community: community, user: user, joined: joined}).success(function (data){
            callback(data);
        }).error(function (error){
            callback(error);
        });
    };
    return factory;
});


app.controller('communityConfirmController', function ($scope, $location, localStorageService, communityConfirmFactory){
    //store the user so we can use the information across multiple pages
    var user = localStorageService.get('user');
    $scope.user = user;


    //scope objects to store return data from the server
    $scope.data = {};
    $scope.error = {};

    //get all communities from the database
    communityConfirmFactory.getCommunities(function(data){
        localStorageService.set('commMileage', data);
        $scope.allCommunities = data;
        $scope.$digest();
    });
   

    //add a new community to the database, created by the user
    //store the newly added community in local storage so we can access the information in the community profile page
    $scope.addCommunity = function (){
            var member = localStorageService.get('community_id');
            communityConfirmFactory.addCommunity($scope.community, user, member, function (data){
                if(data.communityAdded){
                    $scope.data.community = data.community;
                    localStorageService.set('community', data.community);
                    localStorageService.set('community_id', data);

                    $location.path('/community');
                } else {
                    if(data.Taken){
                        $scope.error.nameTaken = data.nameTaken;
                    }
                    if(data.addressTaken){
                        $scope.error.addressTaken = data.addressTaken;
                    }
                    if(data.alreadyJoined){
                        $scope.error.alreadyMember = data.alreadyJoined;
                    }
                    if(data.name[0]){
                        $scope.error.nameInvalid = data.name[0];
                    }
                    if(data.address[0]){
                        $scope.error.addressInvalid = data.address[0];
                    }
                }
        });
    };

    //user select an existing community from the dropdown
    //store the newly added community in local storage so we can access the information in the community profile page
    $scope.userAdded = function (){
            var name = $scope.community.communityName;
            for (var community in $scope.allCommunities){
             if($scope.allCommunities[community].data.name === name){
                    var getInfo = $scope.allCommunities[community].data;
                    localStorageService.set('community', getInfo);
                }
            }
            var joined = localStorageService.get('community_id');
            communityConfirmFactory.userAdded(getInfo, user, joined, function (data){
                    localStorageService.set('userInfo', data.info);
                    localStorageService.set('existing_community', data.community_reference);
                    localStorageService.set('community_id', data);
                    localStorageService.set('userEmail', data.userEmail);
                    if(data.addedCommunity === false){
                        $scope.error.alreadyJoined = "You have already joined a community.";
                        $location.path('/confirm_community');
                    } else {
                        $location.path('/community');
                    }
            });
    };

    //user requests more information via the button on the community confirm page
    $scope.moreInfo = function (name){
        for (var community in $scope.allCommunities){
            if($scope.allCommunities[community].data.name === name){
                var getInfo = $scope.allCommunities[community];
                $scope.communityInfo = getInfo;
            }
        }
    };


    // google maps geolocation
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


    //log user out
    $scope.logout = function(){
        localStorageService.clearAll();
        $location.path('/');
    };

});