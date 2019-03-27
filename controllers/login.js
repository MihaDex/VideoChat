var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.login = function(req, res) {
    if(!req.body.email || !req.body.password) {
      sendJSONresponse(res, 400, {
        "message": "Необходимо заполнить все поля"
      });
      return;
    }
  
    passport.authenticate('local', function(err, user, info){
      var token;
  
      if (err) {
        sendJSONresponse(res, 404, err);
        return;
      }
  
      if(user){
        token = user.generateJwt();
        sendJSONresponse(res, 200, {
          "token" : token
        });
      } else {
        sendJSONresponse(res, 401, info);
      }
    })(req, res);
};

module.exports.index = function(req,res){
    res.render('login',{title: 'Войти'});
};