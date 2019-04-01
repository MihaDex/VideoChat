(function(){
    var localVideo = document.querySelector('#localVideo'); 
    var remoteVideo = document.querySelector('#remoteVideo'); 
    var yourConn; 
    var stream;
    var callName;


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
        console.log(navigator);
        $scope.openCall = function(name){
                callName = name;
               // Prefer camera resolution nearest to 1280x720.
                var constraints = { audio: true, video: { width: 1280, height: 720 } }; 

                navigator.mediaDevices.getUserMedia(constraints)
                .then(function(mediaStream) {
                var video = document.querySelector('video');
                video.srcObject = mediaStream;
                video.onloadedmetadata = function(e) {
                    video.play();
                };
                })
                .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
        }
        $scope.callBtn = function () { 
            var callToUsername = callName;
             
            if (callToUsername.length > 0) { 
             
               connectedUser = callToUsername;
                 
               // create an offer 
               yourConn.createOffer(function (offer) { 
                  send({ 
                     type: "offer", 
                     offer: offer 
                  }); 
                     
                  yourConn.setLocalDescription(offer); 
               }, function (error) { 
                  alert("Error when creating an offer"); 
               });
                 
            } 
         };
        $scope.closeBtn = function(){
            connectedUser = null; 
            remoteVideo.src = null; 
             
            yourConn.close(); 
            yourConn.onicecandidate = null; 
            yourConn.onaddstream = null; 
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