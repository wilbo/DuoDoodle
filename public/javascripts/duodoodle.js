
// get connection
var socket = io();

// local user data
var socketId;
var canvasName;

// store our path(s)
var paths = {};

// settings default
var settings = {
  'color': 'rgba(0,0,0,1)',
  'mode': 'pen',
  'layer': 'above',
  'size': 10,
  'opacity': 1
};

/*
  Drawing functions
*/

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

  // only smooth path when drawing, erasing should be precise
  if (settings['mode'] != 'erase') {
      paths[socketId].simplify();
  }

  delete paths[socketId]

}


/*
  this socket drawing
*/

function onMouseDown(event) {

  startPath(settings, event.point, socketId);
  socket.emit("startPath", settings, event.point, socketId);

}

var wait = false;
var throttling = 10;

function onMouseDrag(event) {


  continuePath(event.point, socketId);

  // throttle the emit for performance
  if(!wait){

    socket.emit("continuePath", event.point, socketId);

    wait = true;
    setTimeout(function(){
      wait = false;
    }, throttling);
  }

}

function onMouseUp(event) {

  endPath(event.point, socketId);
  socket.emit("endPath", event.point, socketId);

}



/*
  'other' sockets drawing
*/

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



/*
  Load settings function
*/

function loadSettings(obj, paths, socketId) {

  paths[socketId].strokeColor = obj['color'];
  paths[socketId].strokeWidth = obj['size'];
  paths[socketId].opacity = obj['opacity'];

  if (obj['mode'] == 'erase') {

    paths[socketId].blendMode = 'destination-out';
    paths[socketId].opacity = 1;

  } else if (obj['mode'] == 'pen') {

    // mode pen has 2 versions, above and under
    if (obj['layer'] == 'above') {
      paths[socketId].blendMode = 'normal';
    } else {
      paths[socketId].blendMode = "destination-over";
    }

  }

}

/*
  Jquery stuff
*/

$(document).ready(function() {


  // join room on ready

  var path = window.location.pathname;
  var roomName = path.substring(3);

  socket.emit('joinReq', roomName);

  /*
    room joiningrequest to make/join room
  */

  // response to make/join room
  socket.on('joinRoom', function(roomName) {

    socketId = socket.id;
    canvasName = roomName;

   // remove the welcome box
   $('#join-room-window').fadeOut(200).remove();
   $('#room-name').html('Canvas name: <b>' + roomName + '</b>. ');


  });

  socket.on('updateSocketCount', function(amountInRoom) {
    $('#room-count').html('People here: <b>' + amountInRoom + '</b>.');
  });







  /*
    settings and tools and stuff
  */

  // hide/show ui
  $('#hide-ui').click(function() {
    $(this).toggleClass('hidden');
    $('#top-control, #left-control').toggleClass('hidden');
    $('#room-info').toggleClass('hidden');
    $('.tile-option').fadeOut(200);
  });

  var color;

  function updateActiveColor(clr) {
    // change active color
    $('.mode-tile svg path').css('fill', '');
    $('.size-tile svg path').css('fill', '');

    $('.mode-tile.active svg path').css('fill', clr);
    $('.size-tile.active svg path').css('fill', clr);
  }

  // change color
  $('.color-tile').click(function() {

    color = $(this).css('background-color');
    settings['color'] = color;

    $('.color-tile').removeClass('active');
    $(this).addClass('active');

    updateActiveColor(color);


    // change to pen id erase was selected
    if (settings['mode'] == 'erase') {
      settings['mode'] = 'pen';
      $('#erase').removeClass('active');
      $('#pen').addClass('active');
      updateActiveColor(color);
    }

  });

  // change mode
  $('.mode-tile').click(function() {

    var mode = $(this).attr('id');
    settings['mode'] = mode;

    $('.mode-tile').removeClass('active');
    $(this).addClass('active');

    updateActiveColor(color);

  });

  // trash/clear canvas
  $('#trash').click(function() {
    project.clear();
    paper.view.draw();
  });

  // hide all option tiles when drawing
  $('body').mousedown(function() {
    $('.tile-option').fadeOut(200);
  });

  // download canvas png
  $('#download').click(function() {
    $('#option-png, #option-svg').fadeToggle(200);
  });

  $('#option-png').click(function() {
    paper.view.draw();
    paper.view.element.toBlob(function(blob) { saveAs(blob, canvasName + '.png');});
  });

  $('#option-svg').click(function() {
    downloadAsSVG(canvasName);
  });

  // change size
  $('.size-tile').click(function() {

    var tile = $(this).attr('id');

    $('.size-tile').removeClass('active');

    if (tile == 'size-s') {
      $(this).addClass('active');
      settings['size'] = 5;
    } else if (tile == 'size-n') {
      $(this).addClass('active');
      settings['size'] = 10;
    } else if (tile == 'size-m') {
      $(this).addClass('active');
      settings['size'] = 17;
    } else if (tile == 'size-l') {
      $(this).addClass('active');
      settings['size'] = 25;
    }

    updateActiveColor(color);

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
      settings['layer'] = 'above';
      $(this).removeClass('under');
      $(this).addClass('above');
    } else {
      settings['layer'] = 'under';
      $(this).addClass('under');
      $(this).removeClass('above');
    }

  });

  // layer tile animations
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


  /*
    misc
  */

  // window resize warning
  $( window ).resize(function() {
    $( "#resize-warning" ).html("You resized the page. Reload it for more accurate drawing.");
  });

  // confirm close window
  // window.onbeforeunload = confirmExit;
  // function confirmExit() {
  //   return "Are you sure you want to close your canvas?";
  // }

  // download as svg
  var downloadAsSVG = function (fileName) {

    //currently name doesn't seem to work in some browsers.
     if(!fileName) {
         fileName = "my_duodoodle.svg";
     }

     var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));

     var link = document.createElement("a");
     link.download = fileName;
     link.href = url;
     link.click();
  }



});
