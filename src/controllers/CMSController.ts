import asyncHandler from 'express-async-handler';
import {
	searchQuery,
	dateQuery,
	arbitraryQuery,
} from '../middleware/queryHandlers';
import verifyToken from './verifyToken';
import Category from '../models/category';
import Post from '../models/post';
import Comment from '../models/comment';
import { body, validationResult } from 'express-validator';
import { RequestHandler } from 'express';

//
export const blogposts_admin_GET = [
	verifyToken,
	asyncHandler(async (req, res) => {
		const pageNumber = req.query.page
			? parseInt(req.query.page as string) - 1
			: 0;
		const numberOfItems = req.query.items
			? parseInt(req.query.items as string)
			: 3;

		if (req.query.queryType === 'search') {
			res.json(
				await searchQuery(
					req.query.query as string,
					pageNumber,
					numberOfItems,
					true
				)
			);
		} else if (req.query.queryType === 'date') {
			res.json(
				await dateQuery(
					req.query.query as string,
					pageNumber,
					numberOfItems,
					true
				)
			);
		} else {
			res.json(
				await arbitraryQuery(
					req.query.queryType as string,
					req.query.query as string,
					pageNumber,
					numberOfItems,
					true
				)
			);
		}
	}),
];

export const adminShortlist_GET = [
	verifyToken,
	asyncHandler(async (_req, res) => {
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

export const read_blogpost_admin_GET = [
	verifyToken,
	asyncHandler(async (req, res) => {
		//
		const blogPost = await Post.findById(req.params.id)
			.populate('comments')
			.exec();
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

export const delete_blogpost_DELETE = [
	verifyToken,
	asyncHandler(async (req, res) => {
		//Delete the comments
		const blogpost = await Post.findById(req.params.postid).exec();
		if (blogpost === null) {
			res.sendStatus(404);
			return;
		}

		//
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

export const update_blogpost_GET = [
	verifyToken,
	asyncHandler(async (req, res) => {
		const blogpost = await Post.findById(req.params.postid).exec();
		const categories = await Category.find({}).exec();
		res.json({
			categories: categories,
			blogpost: blogpost,
		});
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

export const create_blogpost_POST: RequestHandler[] = [
	verifyToken,
	...validatePostForm,
	asyncHandler(async (req, res) => {
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
					categories: req.body.categories.forEach((cat: string) =>
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
		const newBlogPost = new Post({
			author: req.body.author.replace(/&#x27;/g, "'"),
			title: req.body.title.replace(/&#x27;/g, "'"),
			text: req.body.text.replace(/&#x27;/g, "'"),
			description: req.body.description.replace(/&#x27;/g, "'"),
			date: new Date(),
			timeToRead: req.body.timeToRead,
			comments: [],
			categories: req.body.categories.forEach((cat: string) =>
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

		res.status(201).json({ authData: req.body.authData, post: newBlogPost });
	}),
];

export const update_blogpost_PUT: RequestHandler[] = [
	verifyToken,
	...validatePostForm,
	asyncHandler(async (req, res) => {
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
			categories: req.body.categories.forEach((cat: string) =>
				cat.replace(/&#x27;/g, "'")
			),
			hidden: req.body.hidden,
			headerImage: req.body.headerImage
				.replace(/&#x2F;/g, '/')
				.replace(/&amp;/g, '&'),
		}).exec();

		if (post === null) {
			res.sendStatus(404);
			return;
		}

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

export const delete_comment_DELETE = [
	verifyToken,
	asyncHandler(async (req, res) => {
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

export const publish_blogpost_PUT = [
	verifyToken,
	asyncHandler(async (req, res) => {
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

export const hide_blogpost_PUT = [
	verifyToken,
	asyncHandler(async (req, res) => {
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
