var socketioJwt   = require("socketio-jwt");

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

        var name = socket.decoded_token.name;
        var users = [];
        var messages = [];
        //messages.push({name: name, msg: "Пользователь присоединился к чату"});

        socket.on('message', function(msg){
            messages.push({name: name, msg: msg});
            io.sockets.emit('messageToClients',messages);
        });

        for (var key in io.sockets.sockets) {
            if(io.sockets.sockets[key].decoded_token.name){
            users.push({name: io.sockets.sockets[key].decoded_token.name, msg: ""});
        }}
        io.emit('users', users);
    });
}