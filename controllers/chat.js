var mongoose = require('mongoose');
var Message = mongoose.model('Message');

var message = new Message();
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
  };

module.exports.index = function(req,res){
    res.render('chat',{title: 'Чат'});
};

module.exports.test = function(req, res){
    var message = new Message();
    message.room = "all";
    message.author = "Михаил dex-max89@mail.ru"
    message.text = "Привет!"; 
    message.save(function(err){
        if(err){
            sendJSONresponse(res, 404, err);
        } else {
            sendJSONresponse(res, 201, {"status":"ok"});
        }
    })
}