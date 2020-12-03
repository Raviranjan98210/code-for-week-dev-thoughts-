const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },

  title: {
    type: String,
    required: true,
  },

  name: {
    type: String,
  },
  avatar: {
    type: String,
  },

  images: [
    {
      url: {
        type: String,
        required: true,
      },

      caption: {
        type: String,
      },
    },
  ],

  text: {
    type: String,
  },

  link: {
    type: String,
  },

  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],

  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },

      text: {
        type: String,
        required: true,
      },

      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model("post", PostSchema);
