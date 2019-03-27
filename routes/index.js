var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Чат' });
});
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Регистрация' });
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Войти' });
});
router.get('/chat', function(req, res, next) {
  res.render('chat', { title: 'Чат' });
});
module.exports = router;
