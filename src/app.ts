import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

//
import { initializeMongoServer } from './mongoConfig';

//
import categoriesRouter from './routes/categories';
import usersRouter from './routes/users';
import postsRouter from './routes/posts';

// Connect to the mongo db server
initializeMongoServer();

//
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet());
app.use(
	rateLimit({
		windowMs: 1 * 60 * 1000,
		max: 50,
	})
);

// CORS
const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

//
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoriesRouter);

// Obfuscate errors when the environment is production
/*
if (app.get('env') === 'production') {
	app.use((_req, res) => {
		res.status(500).send('Server Error');
	});
}*/

export default app;
