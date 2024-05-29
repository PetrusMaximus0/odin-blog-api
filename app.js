const express = require('express');
const logger = require('morgan');
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

//
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoryRouter);

module.exports = app;
