import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
	name: { type: String, maxLength: 100, minLength: 1, required: true },
	posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }],
});

export default mongoose.model('category', categorySchema);
