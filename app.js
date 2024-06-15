const express = require('express');
const logger = require('morgan');
const cors = require('cors');

// Security
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

//
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const categoryRouter = require('./routes/categories');
//

//
const mongoose = require('mongoose');

// Set up a mongo connection
const main = async () => {
	console.log('Attemping to connect to mongodb...');
	await mongoose.connect(process.env.MONGODB_URI);
	console.log('Connected.');
};
main().catch((err) => {
	console.log('Connection error', err);
	console.log('Retrying...');
	main();
});

//
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet());
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 50,
	})
);

// CORS
const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

if (app.get('env') === 'production') {
	app.use((err, req, res, next) => {
		res.status(500).send('Server Error');
	});
}

//
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoryRouter);

module.exports = app;
