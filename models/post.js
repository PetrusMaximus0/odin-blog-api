const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	title: { type: String, maxLenght: 100, minLenght: 1, required: true },
	text: { type: String, maxLenght: 1000, minLenght: 1, required: true },
	timeStamp: { type: Date, required: true },
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
	hidden: { type: Boolean, required: true },
});

module.exports = mongoose.model('post', postSchema);
