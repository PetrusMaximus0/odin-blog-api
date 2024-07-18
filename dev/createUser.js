const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Set up a mongo connection
const main = async () => {
	console.log('Attemping to connect to mongodb...');
	await mongoose.connect(process.env.MONGODB_URI);
	console.log('Connected.');
};

main().catch((err) => {
	console.log('Connection error', err);
	console.log('Retrying...');
	main();
});

(async () => {
	try {
		await User.deleteOne({ username: 'admin' });
		const blogPoster = new User({
			username: 'admin',
			password: await bcrypt.hash(process.env.ADMINPW, 10),
			isAdmin: true,
		});
		await blogPoster.save();
		console.log('Done');
		mongoose.connection.close();
	} catch (error) {
		console.log('Error', error);
	}
})();
