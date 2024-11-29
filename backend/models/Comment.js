const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  texto: String,
  tag: String,
  localizacao: {
    latitude: Number,
    longitude: Number
  },
  data: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Comment', CommentSchema);
