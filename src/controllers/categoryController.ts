import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import verifyToken from './verifyToken';
import Post from '../models/post';
import Category from '../models/category';
import { NextFunction, Request, RequestHandler, Response } from 'express';

const validateCategory: RequestHandler[] = [
	body('name').trim().isLength({ min: 1, max: 100 }).escape(),
	(req: Request, res: Response, next: NextFunction) => {
		// Validate and Sanitize Fields
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors, return the sanitized form submission values
			res.status(400).json({
				name: req.body.name,
				errors: errors.array(),
			});
			return;
		}
		next();
	},
];

export const create_category_POST: RequestHandler[] = [
	verifyToken,
	...validateCategory,
	asyncHandler(async (req: Request, res: Response) => {
		const newCategory = new Category({
			name: req.body.name,
		});

		await newCategory.save();
		res.status(201).json({
			authData: req.body.authData,
			category: newCategory,
		});
	}),
];

export const update_category_PUT: RequestHandler[] = [
	verifyToken,
	...validateCategory,
	asyncHandler(async (req: Request, res: Response) => {
		const updateCategory = await Category.findByIdAndUpdate(req.params.id, {
			name: req.body.name,
		});
		if (updateCategory === null) {
			res.sendStatus(404);
			return;
		}
		res.status(200).json({
			authData: req.body.authData,
			category: updateCategory,
		});
	}),
];

export const read_category_GET = asyncHandler(
	async (_req: Request, res: Response) => {
		const categories = await Category.find({}).exec();
		res.json({ categories });
	}
);

export const delete_category_DELETE: RequestHandler[] = [
	verifyToken,
	asyncHandler(async (req: Request, res: Response) => {
		//
		const [deletedCategory, updatedPosts] = await Promise.all([
			Category.findByIdAndDelete(req.params.id).exec(),
			Post.updateMany({}, { $pull: { categories: req.params.id } }),
		]);

		//
		if (deletedCategory === null) {
			res.sendStatus(404);
			return;
		}

		res.status(204).json({ deletedCategory, updatedPosts });
	}),
];
