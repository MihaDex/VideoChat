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
    // //this socket is authenticated, we are good to handle more events from it.
    // console.log('hello! ' + socket.decoded_token.name);
    var users = [];
    for (var key in io.sockets.sockets) {
        console.log(io.sockets.sockets[key].decoded_token.name);
        // if (io.sockets.sockets[key].username === data.nick) {
        //   io.sockets.sockets[key].emit("msg", data.msg);
        users.push({name: io.sockets.sockets[key].decoded_token.name, msg: ""});
        }
    //     
    //   }
      io.emit('users', users);
  });
}