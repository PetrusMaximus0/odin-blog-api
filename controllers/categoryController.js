const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Category = require('../models/category');
const verifyToken = require('./verifyToken');
const Post = require('../models/post');

const categoryValidationChain = [
	body('name').trim().isLength({ min: 1, max: 100 }).escape(),
];
const validateCategory = (req, res, next) => {
	// Validate and Sanitize Fields
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// There are errors, return the sanitized form submission values
		res.status(400).json({
			name: req.body.name,
			errors: errors.array(),
		});
	}
	next();
};

exports.new_category_POST = [
	verifyToken,
	categoryValidationChain,
	validateCategory,
	asyncHandler(async (req, res, next) => {
		const newCategory = Category({
			name: req.body.name,
		});

		await newCategory.save();
		res.status(201).json({ authData: req.authData, category: newCategory });
	}),
];

exports.edit_category_PUT = [
	verifyToken,
	categoryValidationChain,
	validateCategory,
	asyncHandler(async (req, res, next) => {
		const updateCategory = await Category.findByIdAndUpdate(req.params.id, {
			name: req.body.name,
		});
		if (updateCategory === null) {
			res.sendStatus(404);
		}
		res.sendStatus(201);
	}),
];

exports.read_category_GET = asyncHandler(async (req, res, next) => {
	const categories = await Category.find({}).exec();
	res.json({ categories });
});

exports.delete_category_DELETE = [
	verifyToken,
	asyncHandler(async (req, res, next) => {
		//
		const [deletedCategory, updatedPosts] = await Promise.all([
			Category.findByIdAndDelete(req.params.id).exec(),
			Post.updateMany({}, { $pull: { categories: req.params.id } }),
		]);

		//
		if (deletedCategory === null) {
			console.log('Category was null!');
		}

		console.log(updatedPosts);

		res.status(204).json({ deletedCategory, updatedPosts });
	}),
];
