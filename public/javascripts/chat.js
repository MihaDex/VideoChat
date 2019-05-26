(function(){
    var localVideo = document.querySelector('#localVideo'); 
    var remoteVideo = document.querySelector('#remoteVideo'); 
    var pc; 
    var stream;
    var callName;
    var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    var server = {
        iceServers: [
            {url: "stun:23.21.150.121"},
            {url: "stun:stun.l.google.com:19302"},
            {url: "turn:numb.viagenie.ca", credential: "your password goes here", username: "example@example.com"}
        ]
    };
    var options = {
        optional: [
            {DtlsSrtpKeyAgreement: true}, // требуется для соединения между Chrome и Firefox
            {RtpDataChannels: true} // требуется в Firefox для использования DataChannels API
        ]
    }

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
        var serverSend;
        var roomJoin;
        var socket = io();
       

            socket.on('connect', function () {
                socket
                  .emit('authenticate', {token: authentication.getToken()}) //send the jwt
                  .on('authenticated', function () {

                    socket.on('users', function(data){
                        
                        data = data.filter(element => {
                            if(element.id != socket.id){
                                return true;
                            }
                        });
                        $scope.$apply(function() {
                            
                            $scope.users = data;
                        });
                    })

                    socket.on('messageToClients', function(messages){
                        $scope.$apply(function(){
                            $scope.messages = messages;
                        })
                    })
                    socket.on('openCall', function(msg){
                        // console.log(msg);
                        // socket.emit('pm','answer');
                        // var constraints = { audio: true, video: { width: 1280, height: 720 } }; 

                        socket.emit('leaveall');

                        $("#exampleModalCenter").modal('show');
                            
                        var constraints = {video: true }; 
                        
                        // navigator.mediaDevices.getUserMedia(constraints)
                        navigator.mediaDevices.getDisplayMedia(constraints)
                        .then(function(mediaStream) {
                        var video = document.querySelector('video');
                        video.srcObject = mediaStream;
                        video.onloadedmetadata = function(e) {
                            video.play();
                        };

                       
                        pc = new PeerConnection(server,options);
                        pc.addStream(mediaStream);
                        pc.onaddstream = function (e) { 
                            remoteVideo.srcObject = e.stream; 
                        };
                        pc.onicecandidate = function (event) { 
                            if (event.candidate) { 
                                serverSend({ 
                                type: "candidate", 
                                candidate: event.candidate 
                            }); 
                            } 
                        };
                            
                        

                        })
                        .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
                    })

                    socket.on('send',function(msg){
                        console.log(msg);
                        switch(msg.type){
                            case "candidate":
                                handleCandidate(msg.candidate);
                                break;
                            case "answer":
                                handleAnswer(msg.answer);
                                break;
                            case "offer":
                            handleOffer(msg.offer);
                            break;
                        }
                    })

                    roomJoin = function(obj){
                        if(obj){
                            socket.emit('roomJoin', {'name': obj.id});
                        }
                    };

                    serverSend = function(msg){
                        // if(callName){
                        //     msg.name = callName;
                        // }
                        console.log(msg);
                        socket.emit('serverSend',msg);
                    };
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

        $scope.openCall = function(id){
                // callName = name;
               // Prefer camera resolution nearest to 1280x720.

                roomJoin({
                    id: id,
                });

                // var constraints = { audio: true, video: { width: 1280, height: 720 } }; 
                var constraints = {video: true }; 
                
                // navigator.mediaDevices.getUserMedia(constraints)
                navigator.mediaDevices.getDisplayMedia(constraints)
                .then(function(mediaStream) {
                var video = document.querySelector('video');
                video.srcObject = mediaStream;
                video.onloadedmetadata = function(e) {
                    video.play();
                };

                pc = new PeerConnection(server,options);
                pc.addStream(mediaStream);
                pc.onaddstream = function (e) { 
                    remoteVideo.srcObject = e.stream; 
                 };
                pc.onicecandidate = function (event) { 
                    if (event.candidate) { 
                        serverSend({ 
                          type: "candidate", 
                          candidate: event.candidate 
                       }); 
                    } 
                 };

                })
                .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
        }
        $scope.callBtn = function () { 
            console.log('rew');
            // var callToUsername = callName;
            // if (callToUsername.length > 0) { 
             
            //    connectedUser = callToUsername;
                 
            //    // create an offer 
               pc.createOffer(function (offer) { 
                serverSend({ 
                     type: "offer", 
                     offer: offer 
                  }); 
                     
                  pc.setLocalDescription(offer); 
               }, function (error) { 
                  alert("Error when creating an offer"); 
               });
                 
            
         };
        $scope.closeBtn = function(){
            connectedUser = null; 
            remoteVideo.src = null; 
            serverSend({ 
                type: "leave" 
             });  
            pc.close(); 
            pc.onicecandidate = null; 
            pc.onaddstream = null; 
        }

        //when somebody sends us an offer 
        function handleOffer(offer) { 
            
            pc.setRemoteDescription(new SessionDescription(offer));
            
            //create an answer to an offer 
            pc.createAnswer(function (answer) { 
                pc.setLocalDescription(answer); 
                
            serverSend({ 
                type: "answer", 
                answer: answer 
            }); 
                
            }, function (error) { 
            alert("Error when creating an answer"); 
            }); 
        };
        
        //when we got an answer from a remote user
        function handleAnswer(answer) { 
            pc.setRemoteDescription(new SessionDescription(answer)); 
        };
        
        //when we got an ice candidate from a remote user 
        function handleCandidate(candidate) { 
            pc.addIceCandidate(new IceCandidate(candidate)); 
        };

        
    }
})();