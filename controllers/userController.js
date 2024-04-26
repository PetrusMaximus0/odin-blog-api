const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

exports.login_index = function (req, res, next) {
	res.redirect('/users/login');
};

exports.login_get = function (req, res, next) {
	res.send(`Render the login form for the user`);
};

exports.login_post = asyncHandler(async function (req, res, next) {
	// The form should bring in a username and a password.
	const user = await User.findOne({ username: req.body.username }).exec();
	if (!user) {
		res.status(403).send('No user with this username.');
		return;
	}
	const result = await bcrypt.compare(req.body.password, user.password);
	if (!result) {
		//
		res.status(403).send('Wrong password.');
		return;
	}
	// User exists and password is correct. Obtain token and send to client.
	jwt.sign(
		{ user: user },
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
