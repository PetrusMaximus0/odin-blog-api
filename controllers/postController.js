const Post = require('../models/post');
const Comment = require('../models/comment');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Category = require('../models/category');
const verifyToken = require('./verifyToken');

const searchQuery = async (
	query,
	pageNumber,
	numberOfItems,
	showHidden = false
) => {
	const allPosts = await Post.aggregate()
		.search({
			index: 'postSearch',
			text: {
				query: query,
				path: {
					wildcard: '*',
				},
			},
		})
		.match(showHidden ? {} : { hidden: false })
		.exec();

	//
	const lastPage = (pageNumber + 1) * numberOfItems >= allPosts.length;
	const posts = allPosts.slice(
		pageNumber * numberOfItems,
		numberOfItems + pageNumber * numberOfItems
	);
	//

	return { allPosts: posts, lastPage: lastPage };
};

const dateQuery = async (
	date,
	pageNumber,
	numberOfItems,
	showHidden = false
) => {
	const query = {
		date: {
			$gte: date,
			$lt: `${parseInt(date) + 1}`,
		},
	};

	// Don't show hidden posts
	if (!showHidden) {
		query.hidden = false;
	}

	const [totalItems, allPosts] = await Promise.all([
		Post.countDocuments(query),
		Post.find(
			query,
			'date title description timeToRead headerImage comments hidden'
		)
			.sort({ date: -1, title: -1 })
			.skip(pageNumber * numberOfItems)
			.limit(numberOfItems)
			.exec(),
	]);
	const lastPage = (pageNumber + 1) * numberOfItems >= totalItems;
	return { allPosts, lastPage };
};

const arbitraryQuery = async (
	queryType,
	query,
	pageNumber,
	numberOfItems,
	showHidden = false
) => {
	const postQuery = { [queryType]: query };

	// Don't show hidden posts
	if (!showHidden) {
		postQuery.hidden = false;
	}

	//
	const [totalItems, allPosts] = await Promise.all([
		Post.countDocuments(postQuery),
		Post.find(
			postQuery,
			'date title description timeToRead headerImage comments hidden'
		)
			.sort({ date: -1, title: -1 })
			.skip(pageNumber * numberOfItems)
			.limit(numberOfItems)
			.exec(),
	]);
	const lastPage = (pageNumber + 1) * numberOfItems >= totalItems;
	return { allPosts, lastPage };
};

exports.blogposts_GET = [
	asyncHandler(async (req, res, next) => {
		const pageNumber = req.query.page ? parseInt(req.query.page) - 1 : 0;
		const numberOfItems = req.query.items ? parseInt(req.query.items) : 3;

		if (req.query.queryType === 'search') {
			res.json(
				await searchQuery(req.query.query, pageNumber, numberOfItems)
			);
		} else if (req.query.queryType === 'date') {
			res.json(await dateQuery(req.query.query, pageNumber, numberOfItems));
		} else {
			res.json(
				await arbitraryQuery(
					req.query.queryType,
					req.query.query,
					pageNumber,
					numberOfItems
				)
			);
		}
	}),
];

exports.blogposts_admin_GET = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		const pageNumber = req.query.page ? parseInt(req.query.page) - 1 : 0;
		const numberOfItems = req.query.items ? parseInt(req.query.items) : 3;

		if (req.query.queryType === 'search') {
			res.json(
				await searchQuery(req.query.query, pageNumber, numberOfItems, true)
			);
		} else if (req.query.queryType === 'date') {
			res.json(
				await dateQuery(req.query.query, pageNumber, numberOfItems, true)
			);
		} else {
			res.json(
				await arbitraryQuery(
					req.query.queryType,
					req.query.query,
					pageNumber,
					numberOfItems,
					true
				)
			);
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
				.populate({ path: 'posts', select: '_id' })
				.exec(),
			Post.find({}, 'date').exec(),
		]);

		res.json({ posts, categories });
	}),
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
					author: req.body.author.replace(/&#x27;/g, "'"),
					title: req.body.title.replace(/&#x27;/g, "'"),
					text: req.body.text.replace(/&#x27;/g, "'"),
					description: req.body.description.replace(/&#x27;/g, "'"),
					timeToRead: req.body.timeToRead,
					categories: req.body.categories.forEach((cat) =>
						cat.replace(/&#x27;/g, "'")
					),
					hidden: req.body.hidden,
					headerImage: req.body.headerImage
						.replace(/&#x2F;/g, '/')
						.replace(/&amp;/g, '&'),
				},
				errors: errors.array(),
			});
			return;
		}
		// No errors then store the blog post in database and redirect to the blogpost list.
		const newBlogPost = Post({
			author: req.body.author.replace(/&#x27;/g, "'"),
			title: req.body.title.replace(/&#x27;/g, "'"),
			text: req.body.text.replace(/&#x27;/g, "'"),
			description: req.body.description.replace(/&#x27;/g, "'"),
			date: new Date(),
			timeToRead: req.body.timeToRead,
			comments: [],
			categories: req.body.categories.forEach((cat) =>
				cat.replace(/&#x27;/g, "'")
			),
			hidden: req.body.hidden,
			headerImage: req.body.headerImage
				.replace(/&#x2F;/g, '/')
				.replace(/&amp;/g, '&'),
		});

		await newBlogPost.save();
		await Category.updateMany(
			{ _id: { $in: req.body.categories } },
			{ $addToSet: { posts: newBlogPost._id } }
		);

		res.status(201).json({ authData: req.authData, post: newBlogPost });
	}),
];

const getBlogpost = async (id, showHidden = false) => {
	const blogPost = await Post.findById(id).populate('comments').exec();
	if (showHidden === true || blogPost.hidden === false) {
		return blogPost;
	} else {
		return null;
	}
};

exports.read_blogpost_admin_GET = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		//
		const blogPost = await getBlogpost(req.params.postid, true);
		//
		if (blogPost === null) {
			// Couldn't find the post or it is marked as hidden.
			res.sendStatus(404);
		} else {
			// Post found and not hidden, return the payload
			res.json(blogPost);
		}
	}),
];

exports.read_blogpost_GET = asyncHandler(async (req, res, next) => {
	//
	const blogPost = await getBlogpost(req.params.postid);
	//
	if (blogPost === null) {
		// Couldn't find the post or it is marked as hidden.
		res.sendStatus(404);
	} else {
		// Post found and not hidden, return the payload
		res.json(blogPost);
	}
});

exports.delete_blogpost_DELETE = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		//Delete the comments
		const blogpost = await Post.findById(req.params.postid).exec();
		const allCommentsDeleted = await Comment.deleteMany({
			_id: { $in: blogpost.comments },
		}).exec();

		// Delete the blogpost
		const deletedBlogPost = await Post.findByIdAndDelete(
			req.params.postid
		).exec();

		// Remove the post IDs from the categories
		const updatedCategories = await Category.updateMany(
			{},
			{ $pull: { posts: req.params.postid } }
		);

		res.json({
			deletedBlogPost: deletedBlogPost,
			deleteCount: allCommentsDeleted,
			updatedCategories: updatedCategories,
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
			res.json({ errors: errors.array(), formData: req.body });
		} else {
			// The form data is valid
			const newComment = Comment({
				author: req.body.author !== '' ? req.body.author : 'Anonymous User',
				text: req.body.text.replace(/&#x27;/g, "'"),
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

		// Update the post with the new data.
		const post = await Post.findByIdAndUpdate(req.params.postid, {
			author: req.body.author.replace(/&#x27;/g, "'"),
			title: req.body.title.replace(/&#x27;/g, "'"),
			text: req.body.text.replace(/&#x27;/g, "'"),
			description: req.body.description.replace(/&#x27;/g, "'"),
			timeToRead: req.body.timeToRead,
			categories: req.body.categories.forEach((cat) =>
				cat.replace(/&#x27;/g, "'")
			),
			hidden: req.body.hidden,
			headerImage: req.body.headerImage
				.replace(/&#x2F;/g, '/')
				.replace(/&amp;/g, '&'),
		}).exec();

		// Remove the post references from all categories.
		await Category.updateMany({}, { $pull: { posts: post._id } });

		// Re add the post Id to the correct categories.
		await Category.updateMany(
			{ _id: { $in: req.body.categories } },
			{ $addToSet: { posts: post._id } }
		);

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

		res.status(201).json({
			Response: 'Delete comment',
			Id: req.params.commentid,
			commentDeleted: commentDeleted,
			blogpost: blogPost,
		});
	}),
];

exports.publish_blogpost_PUT = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		const result = await Post.findByIdAndUpdate(req.params.postid, {
			hidden: false,
		});

		if (!result) {
			res.sendStatus(404);
			return;
		}
		res.status(201).json(result);
	}),
];

exports.hide_blogpost_PUT = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		const result = await Post.findByIdAndUpdate(req.params.postid, {
			hidden: true,
		});
		if (!result) {
			res.sendStatus(404);
			return;
		}
		res.status(201).json(result);
	}),
];
