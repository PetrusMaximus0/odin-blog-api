import Post from '../models/post';
import Comment from '../models/comment';
import Category from '../models/category';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import {
	searchQuery,
	dateQuery,
	arbitraryQuery,
} from '../middleware/queryHandlers';

export const blogposts_GET = [
	asyncHandler(async (req, res) => {
		const pageNumber: number = req.query.page
			? parseInt(req.query.page as string) - 1
			: 0;
		const numberOfItems: number = req.query.items
			? parseInt(req.query.items as string)
			: 3;

		if (req.query.queryType === 'search') {
			res.json(
				await searchQuery(
					req.query.query as string,
					pageNumber,
					numberOfItems
				)
			);
		} else if (req.query.queryType === 'date') {
			res.json(
				await dateQuery(
					req.query.query as string,
					pageNumber,
					numberOfItems
				)
			);
		} else {
			res.json(
				await arbitraryQuery(
					req.query.queryType as string,
					req.query.query as string,
					pageNumber,
					numberOfItems
				)
			);
		}
	}),
];

export const shortlist_GET = asyncHandler(async (_req, res) => {
	const [categories, posts] = await Promise.all([
		Category.find({})
			.sort({ name: 1 })
			.populate({ path: 'posts', match: { hidden: false }, select: '_id' })
			.exec(),
		Post.find({ hidden: false }, 'date').exec(),
	]);

	res.json({ posts, categories });
});

export const read_blogpost_GET = asyncHandler(async (req, res) => {
	//
	const blogPost = await Post.findOne({
		_id: req.params.postid,
		hidden: false,
	});

	//
	if (blogPost === null) {
		// Couldn't find the post or it is marked as hidden.
		res.sendStatus(404);
	} else {
		// Post found and not hidden, return the payload
		res.json(blogPost);
	}
});

export const new_comment_POST = [
	// Validate and sanitize the comment
	body('author').trim().escape(),
	body('text').trim().isLength({ min: 1, max: 300 }).escape(),

	asyncHandler(async (req, res) => {
		// Verify the blogpost ID is valid
		const blogPost = await Post.findById(req.params.postid).exec();

		if (blogPost === null || blogPost.hidden === true) {
			// Couldn't find the post or it is marked as hidden.
			res.sendStatus(404);
			return;
		}

		// Extract the errors from the comment form
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			// There are errors
			// Send back the form with sanitized values and errors.
			res.json({ errors: errors.array(), formData: req.body });
			return;
		}

		// The form data is valid
		const newComment = new Comment({
			author: req.body.author !== '' ? req.body.author : 'Anonymous User',
			text: req.body.text.replace(/&#x27;/g, "'"),
			date: new Date(),
		});

		//
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

		if (newCommentResp === null || newPost === null) {
			res.sendStatus(500);
			return;
		}
		res.json(newPost);
	}),
];
