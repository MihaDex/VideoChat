var socketioJwt   = require("socketio-jwt");

var mongoose = require('mongoose');
var Message = mongoose.model('Message');

var message = new Message();

var users = [];
var messages = [];
var rooms =['all','one','two'];
var getUsers;
var checkUsers;
var room = '';

function createMessage(text, socket, callback){
    var room = socket.currentRoom;
    var message = new Message();
    message.room = room;
    message.author = socket.decoded_token.name+" "+socket.decoded_token.email;
    message.text = text; 
    message.save(function(err){
        if(err){
            socket.emit("error",err);
            callback(false);
        } else {
            socket.emit("messages", {"type":"ok"});
            callback(true);
        }
    })
}

function getMessages(room, callback){
    Message.find({"room": room}, function(err, messages){
        if(err){
            callback(err,true);
        } else {
            callback(messages.reverse());
        }
    })
}
module.exports = function(io){
    // io.use(socketioJwt.authorize({
    //     secret: process.env.JWT_SECRET,
    //     handshake: true,
    //     callback: false
    //   }));

    //   io.on('connection', function (socket) {
               
    //     console.log('hello! ', socket.decoded_token.name);

    //     socket.on('disconnect', function(){
    //         console.log('bb');
    //     })
    //   })
    
    io.sockets
  .on('connection', socketioJwt.authorize({
    secret: process.env.JWT_SECRET,
    timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {
    getMessages('all',function(status){
        if(status){
            getMessages('all',function(msg,err=false){
                if(err){
                    socket.emit("error",msg);
                }else{
                    socket.emit("messages",msg);
                }
            });
        }});
    getUsers = function(room){
        console.log(room);
        users = [];
        if('sockets' in io.sockets.adapter.rooms[room]){
            for (var key in io.sockets.adapter.rooms[room].sockets) {
                if(io.sockets.sockets[key].decoded_token.name){
                users.push({name: io.sockets.sockets[key].decoded_token.name, id:io.sockets.sockets[key].id, msg: ""});
            }}
        }
    }

    checkUsers = function(room){
        var visiters =[];
        io.of('/').in(room).clients((error, clients) => {
            if (error) throw error;
            console.log(clients);
            if(clients.length > 0){
                for(client in clients){
                    if("decoded_token" in io.sockets.sockets[clients[client]]){
                        visiters.push({name: io.sockets.sockets[clients[client]].decoded_token.name+" "+io.sockets.sockets[clients[client]].decoded_token.email, id:io.sockets.sockets[clients[client]].id, msg: ""});
                    }
                }
                io.sockets.in(room).emit('users', visiters);
            }
          });
    }

    // if(users.length == 0){
    //     users.push({id: socket.id, token: socket.decoded_token})
    // }
    // users.forEach(function(v, i , users){
    //     if(users[i].id == socket.id && users[i].token._id == socket.decoded_token._id ){
    //         console.log('da');
    //     } else{
    //         console.log('net');
    //         users.push({id: socket.id, token: socket.decoded_token})
    //     }
    // });
    socket.join('all');
    socket.currentRoom = "all";
    // getUsers('all');
    // console.log(users);
    checkUsers('all');
        // console.log(socket.id);
        // if(key.id  !=  socket.id){
        //     console.log('test');
        //     users.push({id: socket.id,token: socket.decoded_token});
        // } 
    
        // console.log(users);
        //messages.push({name: name, msg: "Пользователь присоединился к чату"});
        // for (var key in io.sockets.sockets) {
        //     console.log('test');    
        //     // users.push({name: io.sockets.sockets[key].decoded_token.name, msg: "", id: socket.id});
        //     }

        function sendTo(room,obj){
            console.log('typey: ',obj.type);
            console.log(obj);
            socket.broadcast.to(room).emit('send',obj);
            // socket.broadcast.emit('send',obj);

        }
        socket.on('join', function(room){
            console.log(room);
            for(i in rooms){
                if(rooms[i] == room){
                    socket.join(room);
                    socket.currentRoom = room;
                    checkUsers(rooms[i]);
                    getMessages(rooms[i],function(msg,err=false){
                        if(err){
                            socket.emit("error",msg);
                        }else{
                            socket.emit('messages', msg);
                        }
                    });
                }else{
                    socket.leave(rooms[i]);
                    checkUsers(rooms[i]);                   
                }
            }
            
        });
        socket.on('roomJoin', function(msg){
            room = msg.name;
            socket.join(room);
            io.sockets.sockets[room].join(room);
            
            getUsers(room);
            io.to(room).emit('users', users);

            io.to(room).emit('openCall', 'test');

        })
        // socket.on('leaveall', function(){
        //     socket.leave('all');
        //     getUsers('all');
        //     io.to('all').emit('users', users);
        // })
        socket.on('serverSend', function(data){
            
            console.log(data);
            switch (data.type) {
                case "offer": 
                
                sendTo(room,{ 
                    type: "offer", 
                    offer: data.offer
                }); 
            
                
                break;
                
            case "answer": 
               
                sendTo(room,{ 
                    type: "answer", 
                    answer: data.answer 
                }); 
                 
                    
                break; 
                
            case "candidate": 
               
                sendTo(room,{ 
                    type: "candidate", 
                    candidate: data.candidate 
                }); 
                
                    
                break;
                
            case "leave": 
                
                sendTo(room,{ 
                    type: "leave" 
                }); 
                
                    
                break;
                
            default: 
                sendTo(room,{ 
                type: "error", 
                message: "Command not found: " + data.type 
                }); 
                    
                break; 
            }
        });

        socket.on('message', function(msg){
            // messages.push({name: socket.decoded_token.name, msg: msg});
            // io.sockets.emit('messageToClients',messages);
            createMessage(msg,socket,function(status){
                if(status){
                    getMessages(socket.currentRoom,function(msg,err=false){
                        if(err){
                            socket.emit("error",msg);
                        }else{
                            io.sockets.emit("messages",msg);
                        }
                    });
                }
            });
        });
        socket.on('serverSend1', function(data){
            switch (data.type) {
                case "offer": 
                //for ex. UserA wants to call UserB 
                console.log("Sending offer to: ", data.name);
                    
                //if UserB exists then send him offer details 
                var conn = users[data.name]; 
                    
                if(conn != null) { 
                //setting that UserA connected with UserB 
                connection.otherName = data.name; 
                        
                sendTo(conn, { 
                    type: "offer", 
                    offer: data.offer, 
                    name: connection.name 
                }); 
                }
				
                break;
				
            case "answer": 
                console.log("Sending answer to: ", data.name); 
                //for ex. UserB answers UserA 
                var conn = users[data.name]; 
                    
                if(conn != null) { 
                connection.otherName = data.name; 
                sendTo(conn, { 
                    type: "answer", 
                    answer: data.answer 
                }); 
                } 
                    
                break; 
				
            case "candidate": 
                console.log("Sending candidate to:",data.name); 
                var conn = users[data.name];
                    
                if(conn != null) { 
                sendTo(conn, { 
                    type: "candidate", 
                    candidate: data.candidate 
                }); 
                } 
                    
                break;
				
            case "leave": 
                console.log("Disconnecting from", data.name); 
                var conn = users[data.name]; 
                conn.otherName = null; 
                    
                //notify the other user so he can disconnect his peer connection 
                if(conn != null) {
                sendTo(conn, { 
                    type: "leave" 
                }); 
                }
                    
                break;
				
            default: 
                sendTo(connection, { 
                type: "error", 
                message: "Command not found: " + data.type 
                }); 
                    
                break; 
            }
        });

         

        // io.emit('users', users);

        socket.on('disconnect', function() {
            // users.splice(users.indexOf(socket), 1);
            checkUsers('all');
        });
    })
}