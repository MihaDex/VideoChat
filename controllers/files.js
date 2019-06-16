var mongoose = require('mongoose');
var Videos = mongoose.model('Video');


module.exports.index = function(req,res){
    
    res.render('files',{title: 'Файлы'});
};

module.exports.files = function(req,res){
    Videos.find({},function(err,data){
        if(err){
            console.log(err);
        } else {
            res.status(200);
            res.json(data.reverse());        }
    })
};