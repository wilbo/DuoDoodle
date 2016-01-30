module.exports = function (io) {


var rooms = [];


io.on('connection', function(socket) {


  /*
    joining rooms
  */

  socket.on('joinReq', function(roomName) {

  	// roomname validation. checks for empty, length, symbols, or if already taken.
  	if (roomName == '') {
  		io.to(socket.id).emit('roomNameError', 'please name your canvas');
  	} else if (roomName.length > 16) {
  		io.to(socket.id).emit('roomNameError', 'The name you provided is too long.');
  	} else if (containsSymbol(roomName)) {
  		io.to(socket.id).emit('roomNameError', 'Your canvas name may only contain letters and numbers.');
  	} else if (getSocketCountInRoom(roomName) >= 5) {
  		io.to(socket.id).emit('roomNameError', 'Sorry, this canvas is too busy');
  	} else {

  		// let user join room
      socket.join(roomName);

      // store roomname on socket
			socket.roomName = roomName;

  		if (rooms.indexOf(roomName) == -1) {

        // joining new room
        console.log('joining new room');

  			// making new room
  			rooms.push(roomName);

  			// give user acces to room
  			io.to(socket.id).emit('joinRoom', roomName);

  		} else {

  			// joining existing room
  			console.log('joining existing room');

      	// give user acces to room
				io.to(socket.id).emit('joinRoom', roomName);

  		}

      // update socket count
      var socketCount = getSocketCountInRoom(socket.roomName);
      io.in(socket.roomName).emit('updateSocketCount', socketCount);


      // // debug info
      // roomInfo = io.sockets.adapter.rooms[roomName];
      // console.log(roomInfo);
      // console.log(rooms);

  	}

  });


    /*
      Drawing
    */

    socket.on( 'startPath', function(settings, position, socketId) {
      socket.broadcast.to(socket.roomName).volatile.emit( 'startPath', settings, position, socketId );
    });

    socket.on( 'continuePath', function( position, socketId) {
      socket.broadcast.to(socket.roomName).volatile.emit( 'continuePath', position, socketId );
    });

    socket.on( 'endPath', function( position, socketId) {
      socket.broadcast.to(socket.roomName).emit( 'endPath', position, socketId );
    });

    socket.on('clearCanvas', function() {
      io.in(socket.roomName).emit("clearCanvas");
    });



    /*
      Disconnecting
    */

    socket.on('disconnect', function() {

  	  // only if it was a socket in a room
    	if (socket.roomName) {

        // update socket count
        var socketCount = getSocketCountInRoom(socket.roomName);
        io.in(socket.roomName).emit('updateSocketCount', socketCount);

        // if 0 in room, remove room from array
        if (socketCount == 0) {
        	var i = rooms.indexOf(socket.roomName);
        	rooms.splice(i, 1);
      }



  	}

  	// console.log(rooms);

  });


});


/*
  Helper functions
*/

// sockets in room counter
function getSocketCountInRoom(roomName) {
  var roomInfo;
  var output;

  if (roomName) {
    roomInfo = io.sockets.adapter.rooms[roomName];
    if  (roomInfo && roomInfo.length) {
      output = roomInfo.length;
    }
  }

  if (typeof output == 'undefined') {
    output = 0;
  }

  return output;
}

// check if the a string has symbols
function containsSymbol(val) {
	var charArray = val.toLowerCase().split('');
	var allowedCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

	for (var i=0; i < charArray.length; i++) {
			if (allowedCharacters.indexOf(charArray[i]) == -1) {
				return true;
			}
	}

	return false;
}

// check if a value is inside an object
function roomNameTaken(array, val) {
	for (var i = array.length - 1; i >= 0; i--) {
    if (array[i].toLowerCase() == val.toLowerCase()) {
      return true;
    }
  }
  return false;
}





}
