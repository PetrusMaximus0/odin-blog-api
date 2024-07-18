import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
	author: { type: String, required: false },
	text: { type: String, required: true, minLength: 1, maxLength: 300 },
	date: { type: Date, required: true },
});

export default mongoose.model('comment', commentSchema);
