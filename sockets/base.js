module.exports = function (io) {


io.on('connection', function(socket) {

    // hello/goodbye
    io.emit('hello client', 'hello client');
    socket.on('hello server', function(msg) {
      console.log(msg);
    });

    // padding trough the draw data
    socket.on( 'startPath', function(settings, position, socketId ) {
      socket.broadcast.emit( 'startPath', settings, position, socketId );
    });

    socket.on( 'continuePath', function( position, socketId ) {
      socket.broadcast.emit( 'continuePath', position, socketId );
    });

    socket.on( 'endPath', function( position, socketId ) {
      socket.broadcast.emit( 'endPath', position, socketId );
    });

    socket.on('clearCanvas', function() {
      io.emit("clearCanvas");
    });

});


}
