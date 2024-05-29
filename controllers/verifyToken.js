const jwt = require('jsonwebtoken');

// Verify if the local token is valid.
const verifyToken = (req, res, next) => {
	const bearerHeader = req.headers['authorization'];
	if (typeof bearerHeader !== 'undefined') {
		const bearerToken = bearerHeader.split(' ')[1];
		req.token = bearerToken;
	} else {
		res.status(404).send('Token verification failed.');
		return;
	}
	// Verify the local token
	jwt.verify(
		req.token,
		process.env.SECRET,
		{ expiresIn: '120s' },
		(err, authData) => {
			if (err) {
				res.status(401).send(err);
				return;
			} else {
				req.authData = authData;
				next();
			}
		}
	);
};

module.exports = verifyToken;
