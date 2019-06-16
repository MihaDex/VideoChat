var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

var ctrlIndex = require('../controllers/index');
var ctrlLogin = require('../controllers/login');
var ctrlRegister = require('../controllers/register');
var ctrlChat = require('../controllers/chat');
var ctrlFiles = require('../controllers/files');

/* GET  pages. */
router.get('/',ctrlIndex.index);
router.get('/register', ctrlRegister.index);
router.get('/login', ctrlLogin.index);
router.get('/chat', ctrlChat.index);
router.get('/files', ctrlFiles.index);
// router.get('/test', ctrlChat.test);

/* POST  pages. */
router.post('/register', ctrlRegister.register);
router.post('/login', ctrlLogin.login);
router.post('/uploadFile', ctrlChat.uploadFile);
router.post('/files', ctrlFiles.files);
module.exports = router;
