var express = require('express');
var router = express.Router();


router.param('room', function (req, res, next, id) {
  next();
});

/* GET users listing. */
// router.get('/:room', function(req, res, next) {
//   var room = req.params.room;
//
//   res.send('respond with a resource');
// });

/* GET home page. */
router.get('/:room', function(req, res, next) {
  var room = req.params.room;
  res.render('room', {
    title: 'DuoDoodle',
    paperLocation: '/javascripts/',
    partials: {
  	    'undo': 'icon-undo.svg',
  		  'redo': 'icon-redo.svg',
  		  'trash': 'icon-trash.svg',
  		  'pen': 'icon-pen.svg',
  		  'eraser': 'icon-eraser.svg',
  		  'github': 'icon-github.svg',
  		  'layer': 'icon-layer.svg',
        'opacity': 'icon-opacity.svg',
        'download': 'icon-download.svg',
        'size-sa': 'icon-size-sa.svg',
        'size-na': 'icon-size-na.svg',
        'size-ma': 'icon-size-ma.svg',
        'size-la': 'icon-size-la.svg',
        'svg': 'icon-svg.svg',
        'png': 'icon-png.svg',
        'hide-ui': 'icon-hide-ui.svg'
      }
    });
});


module.exports = router;
