const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	name: { type: String, maxLength: 100, minLength: 1, required: true },
	posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'posts' }],
});

module.exports = mongoose.model('category', categorySchema);
