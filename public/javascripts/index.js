$(document).ready(function() {
  
  $('#room-form').submit(function(e) {
    e.preventDefault();

    var roomName = $('#room-input').val().toLowerCase();
    var $error = $('#roomname-error');

    // validate
    if (roomName == '') {
      $error.html('please name your canvas');
      return false;

    } else if (roomName.length > 16) {
      $error.html('The name you provided is too long.');
      return false;

    } else if (containsSymbol(roomName)) {
      $error.html('Your canvas name may only contain letters and numbers.');
      return false;

    }

    // redirect to canvas
    var original = window.location.toString();
    window.location.href = original + roomName;

    return false;
  });


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


});
