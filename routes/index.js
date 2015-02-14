var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET wlM page. */
router.get('/wlM', function(req, res) {
  res.render('wlM', { title: 'Express' });
});

/* GET foreX page. */
router.get('/foreX', function(req, res) {
  res.render('foreX', { title: 'Express' });
});

/* GET ocT page. */
router.get('/ocT', function(req, res) {
  res.render('ocT', { title: 'Express' });
});

module.exports = router;
