import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, minLenght: 1, maxLenght: 100 },
	password: { type: String, required: true },
	isAdmin: { type: Boolean, required: true },
	posts: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'post' }],
});

export default mongoose.model('user', userSchema);
