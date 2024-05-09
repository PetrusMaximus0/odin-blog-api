const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, minLenght: 1, maxLenght: 100 },
	password: { type: String, required: true },
	isAdmin: { type: Boolean, required: true },
	posts: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'post' }],
});

module.exports = mongoose.model('user', userSchema);
