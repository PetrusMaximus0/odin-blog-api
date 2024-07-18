import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import verifyToken from './verifyToken';

export const login_POST = asyncHandler(async function (req, res) {
	// The form should bring in a username and a password.
	const user = await User.findOne({ username: req.body.username }).exec();
	if (!user) {
		res.status(401).send({ error: 'No user with this username.' });
		return;
	}
	const result = await bcrypt.compare(req.body.password, user.password);
	if (!result) {
		//
		res.status(401).send({ error: 'Wrong password' });
		return;
	}

	//
	if (!process.env.SECRET) {
		res.sendStatus(500);
		return;
	}

	// User exists and password is correct. Obtain token and send to client.
	jwt.sign(
		{ user: user.username },
		process.env.SECRET,
		{
			expiresIn: '1h',
		},
		(err, token) => {
			if (err) {
				res.send(err);
			} else {
				res.json({
					// Token should be stored locally with client.
					token: token,
				});
			}
		}
	);
});

export const validateToken_GET = [
	verifyToken,
	asyncHandler((req, res) => {
		res.json(req.body.authData);
	}),
];

export const newuser_POST = [
	// Validate and Sanitize
	body('username')
		.trim()
		.isAlphanumeric()
		.withMessage(
			'Usernames must consist of single words composed of alphanumeric characters'
		)
		.isLength({ min: 1, max: 100 })
		.escape(),
	body('password').trim().isLength({ min: 1, max: 100 }).escape(),
	asyncHandler(async function (req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors, render the form again with errors and sanitized values
			res.send({
				user: {
					username: req.body.username,
					password: '',
				},
				errors: errors.array(),
			});
		}

		// Check if the user exists already.
		const user = await User.findOne({ username: req.body.username }).exec();
		if (user) {
			res.status(403).send({
				error: 'This username is not available',
			});
			return;
		}

		// Create a new user and save to the database.
		const newUser = new User({
			username: req.body.username,
			password: await bcrypt.hash(req.body.password, 10),
			isAdmin: false,
			posts: [],
		});

		await newUser.save();

		// send success message
		res.status(201).send({ message: 'success' });
	}),
];
