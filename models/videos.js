var mongoose = require( 'mongoose' );

var videosSchema = new mongoose.Schema({
    room: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: new Date()
    },
    videos: [
      {
        author: String,
        url: String,
        comment: String,
      }
    ],
  });

  videosSchema.methods.getAllFromRoom = function(room){
    return videosSchema.find({room: room});
  };

  mongoose.model('Video', videosSchema);