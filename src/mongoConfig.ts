#!/usr/bin/env node
import mongoose, { MongooseError } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function initializeMongoServer() {
	let mongoURI = '';
	if (process.env.NODE_ENV === 'development') {
		// This is a development environment, use a MongoDb memory server URI.
		const mongoServer = await MongoMemoryServer.create();
		mongoURI = mongoServer.getUri();
	} else if (
		process.env.MONGODB_URI &&
		process.env.NODE_ENV === 'production'
	) {
		// Production environment, set the data base URI from MongoDb
		mongoURI = process.env.MONGODB_URI!;
	} else {
		console.error(
			'The NODE_ENV variable is incorrectly defined or the MongoDB URI is invalid.'
		);
		process.exit(1);
	}

	// Setup the event listeners
	mongoose.connection.on('connecting', () => {
		console.log('Attempting to connect to MongoDB server...');
	});

	mongoose.connection.on('error', async (e) => {
		console.log(e);
		if (e.message.code === 'ETIMEDOUT') {
			await mongoose.connect(mongoURI);
		}
	});

	mongoose.connection.on('open', () => {
		console.log('Connected.');
	});

	// Attempt connection. Initial errors should be handled here according to the mongoose docs.
	mongoose.connect(mongoURI).catch((error) => {
		if (error instanceof MongooseError) {
			console.error('Connection failed', error.message);
		}
	});
}
