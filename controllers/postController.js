const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const Comment = require('../models/comment');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Category = require('../models/category');

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

exports.blogposts_GET = [
	asyncHandler(async (req, res, next) => {
		console.log(req.query);
		const pageNumber = req.query.page ? parseInt(req.query.page) - 1 : 0;
		const query = { hidden: false };
		if (req.query.queryType) {
			query[`${req.query.queryType}`] = req.query.query;
		}
		const allPosts = await Post.find(
			query,
			'date title description timeToRead headerImage comments'
		)
			.sort({ date: -1, title: -1 })
			.skip(pageNumber * parseInt(req.query.items))
			.limit(parseInt(req.query.items))
			.exec();
		res.json(allPosts);
	}),
];

exports.shortlist_GET = asyncHandler(async (req, res, next) => {
	const categories = await Category.find({}).sort({ name: 1 }).exec();
	const posts = await Post.find({ hidden: false }, 'categories date').exec();
	res.json({ posts, categories });
});

exports.blogposts_admin_GET = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		const allPosts = await Post.find({}).sort({ date: -1 }).exec();
		res.json(allPosts);
	}),
];

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
	body('author').trim().isLength({ min: 1, max: 100 }).escape(),
	body('timeToRead').trim().isLength({ min: 1, max: 3 }).escape(),
	body('hidden').isBoolean(),
	asyncHandler(async (req, res, next) => {
		// Validate and sanitize fields
		// Extract validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// If errors then rerender blogpost form.
			res.json({
				postData: {
					author: req.body.author,
					title: req.body.title,
					text: req.body.text,
					timeToRead: req.body.timeToRead,
					hidden: req.body.hidden,
				},
				errors: errors.array(),
			});
		}
		// No errors then store the blog post in database and redirect to the blogpost list.
		const newBlogPost = Post({
			author: req.body.author,
			title: req.body.title,
			text: req.body.text,
			date: new Date(),
			timeToRead: req.body.timeToRead,
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
	res.json(blogPost);
});

exports.delete_blogpost_DELETE = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		// This can be simplified by storing a reference in the comment to the parent blogpost.
		// In that case we trade storage with one less request.
		const blogpost = await Post.findById(req.params.postid).exec();
		const allCommentsDeleted = await Comment.deleteMany({
			_id: { $in: blogpost.comments },
		}).exec();
		const deletedBlogPost = await Post.findByIdAndDelete(
			req.params.postid
		).exec();
		res.json({
			deletedBlogPost: deletedBlogPost,
			deleteCount: allCommentsDeleted,
		});
	}),
];

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
				date: new Date(),
			});
			console.log(newComment);
			const [newCommentResp, newPost] = await Promise.all([
				newComment.save(),
				Post.findByIdAndUpdate(
					req.params.postid,
					{
						$push: { comments: newComment },
					},
					{ new: true }
				)
					.populate('comments')
					.exec(),
			]);
			res.json(newPost);
		}
	}),
];

exports.edit_blogpost_GET = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		const blogpost = await Post.findById(req.params.postid).exec();
		res.json({
			Response: 'Load the blogpost to edit',
			ID: req.params.postid,
			Blogpost: blogpost,
		});
	}),
];

exports.edit_blogpost_PUT = [
	verifyToken,
	body('title').trim().isLength({ min: 1, max: 100 }).escape(),
	body('text').trim().isLength({ min: 1, max: 1000 }).escape(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.json({ Message: 'There are errors', errors: errors });
		}
		const blogpost = await Post.findByIdAndUpdate(req.params.postid, {
			title: req.body.title,
			text: req.body.text,
		}).exec();
		res.json({
			Response: 'Edit blogpost',
			blogpost: blogpost,
		});
	}),
];

exports.delete_comment_DELETE = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		const commentDeleted = await Comment.findByIdAndDelete(
			req.params.commentid
		).exec();
		const blogPost = await Post.updateOne(
			{ comments: req.params.commentid },
			{ $pull: { comments: req.params.commentid } }
		).exec();
		if (commentDeleted === null && blogPost === null) {
			res.status(404).json({
				Response: 'Couldnt find the comment to delete.',
			});
		}
		res.json({
			Response: 'Delete comment',
			Id: req.params.commentid,
			commentDeleted: commentDeleted,
			blogpost: blogPost,
		});
	}),
];
