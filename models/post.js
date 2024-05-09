const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	author: { type: String, maxLength: 100, minLenght: 1, required: true },
	title: { type: String, maxLenght: 100, minLenght: 1, required: true },
	text: { type: String, maxLenght: 1000, minLenght: 1, required: true },
	description: { type: String, maxLenght: 200, minLenght: 1, required: true },
	date: { type: Date, required: true },
	timeToRead: { type: String, maxLength: 10, minLength: 1, required: true },
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
	categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],
	hidden: { type: Boolean, required: true },
	headerImage: { type: String, required: true },
});

module.exports = mongoose.model('post', postSchema);
