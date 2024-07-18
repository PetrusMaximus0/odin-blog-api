import { NextFunction, Request, Response } from 'express';
import jwt, { Jwt, VerifyErrors } from 'jsonwebtoken';

// Verify if the local token is valid.
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	// Extract the token
	const bearerHeader = req.headers['authorization'];
	if (typeof bearerHeader === 'undefined') {
		res.status(404).send('Token verification failed.');
		return;
	}
	const bearerToken = bearerHeader.split(' ')[1];

	//
	if (!process.env.SECRET) {
		res.sendStatus(500);
		return;
	}

	// Verify the local token
	jwt.verify(
		bearerToken,
		process.env.SECRET,
		{ ignoreExpiration: false, complete: true },
		(err: VerifyErrors | null, authData: Jwt | undefined) => {
			if (err) {
				res.status(401).send(err);
				return;
			} else {
				req.body.authData = authData;
				next();
			}
		}
	);
};

export default verifyToken;
