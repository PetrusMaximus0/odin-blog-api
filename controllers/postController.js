const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const Comment = require('../models/comment');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

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
	body('title').trim().isLength({ min: 1, max: 100 }).escape(),
	body('text').trim().isLength({ min: 1, max: 1000 }).escape(),
	body('hidden').isBoolean(),
	asyncHandler(async (req, res, next) => {
		// Validate and sanitize fields
		// Extract validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// If errors then rerender blogpost form.
			res.json({
				postData: {
					title: req.body.title,
					text: req.body.text,
					hidden: req.body.hidden,
				},
				errors: errors.array(),
			});
		}
		// No errors then store the blog post in database and redirect to the blogpost list.
		const newBlogPost = Post({
			title: req.body.title,
			text: req.body.text,
			timeStamp: new Date(),
			comments: [],
			hidden: req.body.hidden,
		});

		await newBlogPost.save();
		res.json({ authData: req.authData, post: newBlogPost });
	}),
];

exports.read_blogpost_GET = asyncHandler(async (req, res, next) => {
	//
	const blogPost = await Post.findById(req.params.postid)
		.populate('comments')
		.exec();

	//
	if (blogPost === null || blogPost.hidden === true) {
		// Couldn't find the post or it is marked as hidden.
		res.sendStatus(404);
		return;
	}

	// Post found and not hidden, return the payload
	res.json({
		blogPost: blogPost,
		Message: 'Here is the blog post you requested!',
	});
});

exports.delete_blogpost_DELETE = (req, res, next) => {
	res.send(`Delete post with id: ${req.params.postid}`);
};

exports.new_comment_POST = [
	// Validate and sanitize the comment
	body('author').trim().escape(),
	body('text').trim().isLength({ min: 1, max: 300 }).escape(),

	asyncHandler(async (req, res, next) => {
		// Verify the blogpost ID is valid
		const blogPost = await Post.findById(req.params.postid).exec();

		if (blogPost === null || blogPost.hidden === true) {
			// Couldn't find the post or it is marked as hidden.
			res.sendStatus(404);
		}

		// Extract the errors from the comment form
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			// There are errors
			// Send back the form with sanitized values and errors.
			console.log('Errors in form validation', errors);
			res.json({ errors: errors.array(), formData: req.body });
		} else {
			// The form data is valid
			const newComment = Comment({
				author: req.body.author !== '' ? req.body.author : 'Anonymous User',
				text: req.body.text,
				timeStamp: new Date(),
			});
			console.log(newComment);
			await Promise.all([
				newComment.save(),
				Post.findByIdAndUpdate(req.params.postid, {
					$push: { comments: newComment },
				}),
			]);
			res.redirect(`/posts/${req.params.postid}`);
		}
	}),
];
