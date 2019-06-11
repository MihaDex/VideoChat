var mongoose = require( 'mongoose' );

var messagesSchema = new mongoose.Schema({
    room: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: new Date()
    },
    author: {
        type: String,
        required: true
      },
    text: {
        type: String,
        required: true
      },
  });

  messagesSchema.methods.getAllFromRoom = function(room){
    return messagesSchema.find({room: room});
  };

  mongoose.model('Message', messagesSchema);