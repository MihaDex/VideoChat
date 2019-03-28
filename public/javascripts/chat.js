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
        
        $scope.error='';
        $scope.inputMsg='';
        $scope.call = function(){
            
        }

        var socket = io();

            socket.on('connect', function () {
                socket
                  .emit('authenticate', {token: authentication.getToken()}) //send the jwt
                  .on('authenticated', function () {

                    socket.on('users', function(data){
                        $scope.$apply(function() {
                            $scope.users = data;
                        });
                    })
                    // socket.on('newUser',function(name){
                    //     $scope.$apply(function(){
                    //         $scope.messages.push({name: name, msg: "Пользователь присоединился к чату"});
                    //     })
                    // })
                    // socket.on('userName',function(name){
                    //     console.log('hello'+name);
                    // })
                    socket.on('messageToClients', function(messages){
                        
                        $scope.$apply(function(){
                            $scope.messages = messages;
                        })
                    })
                    
                    $scope.send = function(){
                      $scope.errors='';
                      if($scope.inputMsg){
                        socket.emit('message',$scope.inputMsg)
                      }
                    }

                  })
                  .on('unauthorized', function(msg) {
                    console.log("unauthorized: " + JSON.stringify(msg.data));
                    throw new Error(msg.data.type);
                  })
              });
    }
})();