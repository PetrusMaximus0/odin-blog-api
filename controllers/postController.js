const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const asyncHandler = require('express-async-handler');

// Verify if the local token is valid.
verifyToken = (req, res, next) => {
	const bearerHeader = req.headers['authorization'];
	if (typeof bearerHeader !== 'undefined') {
		const bearerToken = bearerHeader.split(' ')[1];
		req.token = bearerToken;
	} else {
		res.status(403).send('Token verification failed.');
	}
	// Verify the local token
	jwt.verify(
		req.token,
		process.env.SECRET,
		{ expiresIn: '120s' },
		(err, authData) => {
			if (err) {
				res.status(403).send(err);
			} else {
				req.authData = authData;
				next();
			}
		}
	);
};

exports.blogposts_GET = asyncHandler(async (req, res, next) => {
	const allPosts = await Post.find({ hidden: false })
		.sort({ timeStamp: -1 })
		.exec();
	res.json(allPosts);
});

exports.new_blogpost_GET = [
	verifyToken,
	(req, res, next) => {
		res.json({ authData: req.authData, message: 'Get new blogpost form.' });
	},
];

exports.new_blogpost_POST = [
	verifyToken,
	(req, res, next) => {
		// Validate and sanitize fields
		// Extract validation errors
		// If errors then rerender blogpost form.
		// No errors then store the blog post in database and redirect to the blogpost list.
		res.json({ authData: req.authData, message: 'Posted blogpost.' });
	},
];

exports.read_blogpost_GET = (req, res, next) => {
	res.send(`Read post with id: ${req.params.postid}`);
};

exports.delete_blogpost_DELETE = (req, res, next) => {
	res.send(`Delete post with id: ${req.params.postid}`);
};
