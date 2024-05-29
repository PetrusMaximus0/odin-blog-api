const Post = require('../models/post');
const Comment = require('../models/comment');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Category = require('../models/category');
const verifyToken = require('./verifyToken');

exports.blogposts_GET = [
	asyncHandler(async (req, res, next) => {
		const pageNumber = req.query.page ? parseInt(req.query.page) - 1 : 0;
		const numberOfItems = req.query.items ? parseInt(req.query.items) : 3;

		if (req.query.queryType === 'search') {
			const allPosts = await Post.aggregate()
				.search({
					index: 'postSearch',
					text: {
						query: req.query.query,
						path: {
							wildcard: '*',
						},
					},
				})
				.match({ hidden: false })
				.exec();

			//
			const lastPage = (pageNumber + 1) * numberOfItems >= allPosts.length;
			const posts = allPosts.slice(
				pageNumber * numberOfItems,
				numberOfItems + pageNumber * numberOfItems
			);
			//
			res.json({ allPosts: posts, lastPage });
		} else {
			const query = { hidden: false };
			if (req.query.queryType) {
				query[`${req.query.queryType}`] = req.query.query;
			}
			const [totalItems, allPosts] = await Promise.all([
				Post.countDocuments(query),
				Post.find(
					query,
					'date title description timeToRead headerImage comments'
				)
					.sort({ date: -1, title: -1 })
					.skip(pageNumber * numberOfItems)
					.limit(numberOfItems)
					.exec(),
			]);
			const lastPage = (pageNumber + 1) * numberOfItems >= totalItems;
			res.json({ allPosts, lastPage });
		}
	}),
];

exports.shortlist_GET = asyncHandler(async (req, res, next) => {
	const [categories, posts] = await Promise.all([
		Category.find({})
			.sort({ name: 1 })
			.populate({ path: 'posts', match: { hidden: false }, select: '_id' })
			.exec(),
		Post.find({ hidden: false }, 'date').exec(),
	]);

	res.json({ posts, categories });
});

exports.adminShortlist_GET = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		const [categories, posts] = await Promise.all([
			Category.find({})
				.sort({ name: 1 })
				.populate({ path: 'posts', match: { hidden: true }, select: '_id' })
				.exec(),
			Post.find({ hidden: false }, 'date').exec(),
		]);

		res.json({ posts, categories });
	}),
];

exports.blogposts_admin_GET = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		const pageNumber = req.query.page ? parseInt(req.query.page) - 1 : 0;
		const numberOfItems = req.query.items ? parseInt(req.query.items) : 3;

		if (req.query.queryType === 'search') {
			const allPosts = await Post.aggregate()
				.search({
					index: 'postSearch',
					text: {
						query: req.query.query,
						path: {
							wildcard: '*',
						},
					},
				})
				.exec();

			//
			const lastPage = (pageNumber + 1) * numberOfItems >= allPosts.length;
			const posts = allPosts.slice(
				pageNumber * numberOfItems,
				numberOfItems + pageNumber * numberOfItems
			);
			//
			res.json({ allPosts: posts, lastPage });
		} else {
			const query = {};
			if (req.query.queryType) {
				query[`${req.query.queryType}`] = req.query.query;
			}
			const [totalItems, allPosts, categories] = await Promise.all([
				Post.countDocuments(query),
				Post.find(
					query,
					'date title description timeToRead headerImage comments hidden'
				)
					.sort({ date: -1, title: -1 })
					.skip(pageNumber * numberOfItems)
					.limit(numberOfItems)
					.exec(),
				Category.find({}).exec(),
			]);

			const lastPage = (pageNumber + 1) * numberOfItems >= totalItems;
			console.log({ allPosts, lastPage, categories });
			res.json({ allPosts, lastPage, categories });
		}
	}),
];

exports.new_blogpost_GET = [
	verifyToken,
	(req, res, next) => {
		res.json({ authData: req.authData, message: 'Get new blogpost form.' });
	},
];

const validatePostForm = [
	body('author')
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage("The author's name must not exceed 100 characters")
		.escape(),
	body('title')
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage('The title must not exceed 100 characters')
		.escape(),
	body('text')
		.trim()
		.isLength({ min: 1, max: 10000 })
		.withMessage('The blogpost text must not exceed 1000 characters')
		.escape(),
	body('description')
		.trim()
		.isLength({ min: 1, max: 200 })
		.withMessage('The post description must not exceed 200 characters')
		.escape(),
	body('timeToRead')
		.trim()
		.isLength({ min: 1, max: 3 })
		.withMessage(
			'The time to read must be between 1 and 3 digits, in minutes'
		)
		.escape(),
	body('categories').isArray({ min: 1 }),
	body('categories.*')
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage('Atleast one category must be chosen for a blogpost')
		.escape(),
	body('hidden').isBoolean(),
	body('headerImage')
		.trim()
		.isLength({ min: 1 })
		.withMessage('A link for a header image must be provided')
		.escape(),
];

exports.new_blogpost_POST = [
	verifyToken,
	validatePostForm,
	asyncHandler(async (req, res, next) => {
		// Validate and sanitize fields
		// Extract validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// If errors then rerender blogpost form.
			res.status(400).json({
				postData: {
					author: req.body.author,
					title: req.body.title,
					text: req.body.text,
					description: req.body.description,
					timeToRead: req.body.timeToRead,
					categories: req.body.categories,
					hidden: req.body.hidden,
					headerImage: req.body.headerImage,
				},
				errors: errors.array(),
			});
			return;
		}
		// No errors then store the blog post in database and redirect to the blogpost list.
		const newBlogPost = Post({
			author: req.body.author,
			title: req.body.title,
			text: req.body.text,
			description: req.body.description,
			date: new Date(),
			timeToRead: req.body.timeToRead,
			comments: [],
			categories: req.body.categories,
			hidden: req.body.hidden,
			headerImage: req.body.headerImage,
		});

		await newBlogPost.save();
		res.status(201).json({ authData: req.authData, post: newBlogPost });
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
		const categories = await Category.find({}).exec();
		res.json({
			categories: categories,
			blogpost: blogpost,
		});
	}),
];

exports.edit_blogpost_PUT = [
	verifyToken,
	validatePostForm,
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.json({ Message: 'There are errors', errors: errors });
		}
		const post = await Post.findByIdAndUpdate(req.params.postid, {
			author: req.body.author,
			title: req.body.title,
			text: req.body.text,
			description: req.body.description,
			date: new Date(),
			timeToRead: req.body.timeToRead,
			categories: req.body.categories,
			hidden: req.body.hidden,
			headerImage: req.body.headerImage,
		}).exec();
		res.json({
			post: post,
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
