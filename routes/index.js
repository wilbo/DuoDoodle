var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'DuoDoodle',
    partials: {
  	    'undo': 'icon-undo.svg',
  		  'redo': 'icon-redo.svg',
  		  'trash': 'icon-trash.svg',
  		  'pen': 'icon-pen.svg',
  		  'eraser': 'icon-eraser.svg',
  		  'github': 'icon-github.svg',
  		  'layer': 'icon-layer.svg',
        'opacity': 'icon-opacity.svg'
      }
    });
});

module.exports = router;
