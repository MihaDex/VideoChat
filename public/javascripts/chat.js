(function(){
    
    angular
        .module('VideoChat')
        .controller('chatCtrl', chatCtrl)

    function chatCtrl($scope, authentication){
        if(authentication.isLoggedIn()){
            $scope.auth=true;
        }else{
            $scope.auth=false;
        }
        
        var socket = io();

            socket.on('connect', function () {
                socket
                  .emit('authenticate', {token: authentication.getToken()}) //send the jwt
                  .on('authenticated', function () {
                    socket.on('users', function(data){
                        console.log(data);
                        $scope.$apply(function() {
                            $scope.users = data;
                        });
                    })
                  })
                  .on('unauthorized', function(msg) {
                    console.log("unauthorized: " + JSON.stringify(msg.data));
                    throw new Error(msg.data.type);
                  })
              });
    }
})();