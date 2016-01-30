var socket = io();
var socketId;


// store our path(s)
var paths = {};

// settings default
var settings = {
  'color': 'rgba(0,0,0,1)',
  'mode': 'pen',
  'size': 10,
  'opacity': 1
};

// drawing functions

function startPath(settings, position, socketId) {

  paths[socketId] = new Path();

  paths[socketId].strokeCap = 'round';
  paths[socketId].strokeJoin = 'round';

  loadSettings(settings, paths, socketId);

  paths[socketId].add(position);


}

function continuePath(position, socketId) {

  paths[socketId].add(position);

}

function endPath(position, socketId) {

  paths[socketId].add(position);
  paths[socketId].smooth();
  delete paths[socketId]

}


// socket drawing

function onMouseDown(event) {

  startPath(settings, event.point, socketId);
  socket.emit("startPath", settings, event.point, socketId);

}

function onMouseDrag(event) {

  continuePath(event.point, socketId);
  socket.emit("continuePath", event.point, socketId);

}

function onMouseUp(event) {

  endPath(event.point, socketId);
  socket.emit("endPath", event.point, socketId);

}




// 'other' sockets drawing

socket.on('startPath', function(settings, position, socketId) {

  // handling position output
  var newPos = {
    x: position[1],
    y: position[2]
  }

  startPath(settings, newPos, socketId);

})


socket.on('continuePath', function(position, socketId) {

  // handling position output
  var newPos = {
    x: position[1],
    y: position[2]
  }

  continuePath(newPos, socketId);
  view.draw();

})


socket.on('endPath', function(position, socketId) {

  // handling position output
  var newPos = {
    x: position[1],
    y: position[2]
  }

  endPath(newPos, socketId);
  view.draw();

})



// settings

function loadSettings(obj, paths, socketId) {

  paths[socketId].strokeColor = obj['color'];
  paths[socketId].strokeWidth = obj['size'];
  paths[socketId].opacity = obj['opacity'];

  if (obj['mode'] == 'erase') {
    paths[socketId].blendMode = 'destination-out';

    paths[socketId].opacity = 1;
    $('#opacity span').removeClass();
    $('#opacity span').addClass('op100');

  } else if (obj['mode'] == 'layer') {
    paths[socketId].blendMode = "destination-over";
  } else {
    paths[socketId].blendMode = 'normal';
  }

}


$(document).ready(function() {



  // room joiningrequest to make/join room

  $('#room-form').submit(function(e) {
    e.preventDefault();

    // retrieve username from username input field
    var roomName = $('#room-input').val();
    // send a join request
    socket.emit('joinReq', roomName);

    return false;
  });

  // response to make/join room
  socket.on('joinRoom', function(roomName) {

    socketId = socket.id;

   // remove the welcome box
   $('#join-room-window').fadeOut(200).remove();
   $('#room-name').html('Canvas name: <b>' + roomName + '</b>. ');

  //  if (state) {
  //    restoreSingleState(canvas, ctx, state);
  //  }

  });

  socket.on('updateSocketCount', function(amountInRoom) {
    $('#room-count').html('People here: <b>' + amountInRoom + '</b>.');
  });

  socket.on('roomNameError', function(errorMessage) {
    $('#roomname-error').html(errorMessage);
  });






  // settings and tools and stuff

  // change color
  $('.color-tile').click(function() {

    var color = $(this).css('background-color');
    settings['color'] = color;

    $('.color-tile').removeClass('active');
    $(this).addClass('active');

    // change to pen id erase was selected
    if (settings['mode'] == 'erase') {
      settings['mode'] = 'pen';
      $('#erase').removeClass('active');
      $('#pen').addClass('active');
    }

  });

  // change mode
  $('.mode-tile').click(function() {
    var mode = $(this).attr('id');
    settings['mode'] = mode;

    $('.mode-tile').removeClass('active');
    $(this).addClass('active');
  });

  // trash/clear canvas
  $('#trash').click(function() {
    socket.emit("clearCanvas");
  });

  socket.on('clearCanvas', function() {
    project.clear();
  });

  // change size
  $('.size-tile').click(function() {
    var size = $(this).find('.circle').css('height');
    settings['size'] = parseInt(size);

    $('.circle').removeClass('active');
    $(this).find('.circle').addClass('active');
  });

  // change opacity
  $('.opacity-tile').click(function() {

    var op = $('#opacity span').attr('class');

    $('#opacity span').removeClass();

    if (op == 'op100') {
      $('#opacity span').addClass('op75');
      settings['opacity'] = 0.75;
      $('.colors').css('opacity', '0.85');
    } else if (op == 'op75') {
      $('#opacity span').addClass('op50');
      settings['opacity'] = 0.50;
      $('.colors').css('opacity', '0.7');
    } else if (op == 'op50') {
      $('#opacity span').addClass('op25');
      settings['opacity'] = 0.25;
      $('.colors').css('opacity', '0.6');
    } else {
      $('#opacity span').addClass('op100');
      settings['opacity'] = 1;
      $('.colors').css('opacity', '1');
    }



  });

  // change layer
  $('#layer').click(function() {

    if ($(this).hasClass('under')) {
      settings['mode'] = 'pen';
      $(this).removeClass('under');
      $(this).addClass('above');
    } else {
      settings['mode'] = 'layer';
      $(this).addClass('under');
      $(this).removeClass('above');
    }

  });

  $('#layer').mouseenter(function() {
    if ($(this).hasClass('under')) {
      $('#layer svg').css('transform', 'rotateX(0deg)');
    } else {
      $('#layer svg').css('transform', 'rotateX(180deg)');
    }
  });

  $('#layer').mouseleave(function() {
    if ($(this).hasClass('under')) {
      $('#layer svg').css('transform', 'rotateX(180deg)');
    } else {
      $('#layer svg').css('transform', 'rotateX(0deg)');
    }
  });





});
