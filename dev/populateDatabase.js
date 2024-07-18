const mongoose = require('mongoose');
const Post = require('../models/post');
const Category = require('../models/category');
const User = require('../models/user');
const blogPosts = [
	{
		author: 'Mr Poppins',
		title: 'Gear Up: Innovations in Industrial Efficiency',
		timeToRead: '1',
		categories: ['Automation'],
		hidden: false,
		description: 'Explore cutting-edge gears revolutionizing productivity.',
		text: 'In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. ',
		headerImage:
			'https://images.pexels.com/photos/1145434/pexels-photo-1145434.jpeg',
	},
	{
		author: 'Gearhead Jiggles',
		title: 'The Future of Machinery: Advanced Gear Technologies',
		timeToRead: '2',
		categories: ['Industrial Machinery'],
		hidden: false,
		description: 'Discover how gears are shaping the industrial landscape.',
		text: 'In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. ',
		headerImage:
			'https://images.pexels.com/photos/2239655/pexels-photo-2239655.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		author: 'Sir Gearium',
		title: 'Precision in Motion: Engineering the Perfect Gear',
		timeToRead: '3',
		categories: ['Industrial Machinery'],
		hidden: false,
		description: 'Unveiling the artistry behind precision-engineered gears.',
		text: 'In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. ',
		headerImage:
			'https://images.pexels.com/photos/3856702/pexels-photo-3856702.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		author: 'Jumbo Jimbo',
		title: 'Strength in Design: High-Performance Industrial Gears',
		timeToRead: '4',
		categories: ['Transportation and Infrastructure'],
		hidden: false,
		description:
			'Dive into the durability of gears forged from high-strength materials.',
		text: 'In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. ',
		headerImage:
			'https://images.pexels.com/photos/2880872/pexels-photo-2880872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		author: 'Jumbo Jimbo',
		title: 'Smart Solutions: Harnessing Intelligence in Gearing',
		timeToRead: '5',
		categories: ['Industrial Machinery', 'Automation'],
		hidden: false,
		description: 'Learn how smart gears are optimizing industrial processes.',
		text: 'In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. ',
		headerImage:
			'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		author: 'Sir Gearium',
		title: 'Adaptive Gearboxes: Evolving Machinery for Tomorrow',
		timeToRead: '6',
		categories: ['Industrial Machinery', 'Automation'],
		hidden: false,
		description:
			'Explore the versatility of adaptive gearboxes in modern manufacturing.',
		text: 'In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. ',
		headerImage:
			'https://images.pexels.com/photos/7568428/pexels-photo-7568428.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		author: 'Mr Poppins',
		title: 'Gear Mastery: Unraveling the Secrets of Industrial Precision',
		timeToRead: '7',
		categories: [
			'Industrial Machinery',
			'Energy Management',
			'Transportation and Infrastructure',
		],
		hidden: false,
		description:
			' Delve into the intricate world of industrial precision as we uncover the hidden mechanisms behind flawlessly engineered gears.',
		text: 'In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. In the ever-evolving landscape of industrial machinery, innovation reigns supreme. From the heart of production floors to the pulse of manufacturing processes, the driving force behind efficiency and precision often lies within the intricate design of gears. Today, we delve into the realm of industrial machinery to uncover the marvels of cutting-edge gears that are reshaping the very foundation of production. ',
		headerImage:
			'https://images.pexels.com/photos/7254428/pexels-photo-7254428.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
];

const categories = [
	{
		name: 'Automation',
		posts: [],
	},
	{
		name: 'Industrial Machinery',
		posts: [],
	},
	{
		name: 'Energy Management',
		posts: [],
	},
	{
		name: 'Advanced Materials',
		posts: [],
	},
	{
		name: 'Transportation and Infrastructure',
		posts: [],
	},
];

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

(async () => {
	try {
		// Delete all the blogposts, delete all the categories
		const [deletePosts, deleteCategories] = await Promise.all([
			mongoose.connection.dropCollection('posts'),
			mongoose.connection.dropCollection('categories'),
			mongoose.connection.dropCollection('comments'),
		]);

		// Create categories
		const newCategories = [];
		categories.forEach((category) => {
			newCategories.push(
				new Category({
					name: category.name,
					posts: [],
				})
			);
		});
		const insertedCategory = await Category.insertMany(newCategories);

		// Create the new blogposts
		const newBlogPosts = [];
		blogPosts.forEach((post) => {
			const addCategories = [];
			post.categories.forEach((category) => {
				const index = insertedCategory.findIndex((element) => {
					return element.name === category;
				});
				if (index !== -1) {
					addCategories.push(insertedCategory[index]._id);
				} else {
					console.log("Couldn't find the category.", category);
				}
			});
			const randomYear = () => {
				return `${2020 + Math.floor(Math.random() * 10) - 3}`;
			};
			newBlogPosts.push(
				new Post({
					author: post.author,
					title: post.title,
					text: post.text,
					description: post.description,
					date: new Date(randomYear()),
					timeToRead: post.timeToRead,
					comments: [],
					categories: addCategories,
					hidden: post.hidden,
					headerImage: post.headerImage,
				})
			);
		});
		const insertedPosts = await Post.insertMany(newBlogPosts);

		// Update Cats to Link to Posts
		const updateCategories = async () => {
			for (let i = 0; i < insertedPosts.length; i += 1) {
				const updatedCats = await Category.updateMany(
					{
						_id: { $in: insertedPosts[i].categories },
					},
					{ $push: { posts: insertedPosts[i]._id } }
				).exec();
			}
		};
		await updateCategories();

		// Attribute Posts to author
		const Author = User.find({});

		//
		console.log('Done');
		mongoose.connection.close();
	} catch (error) {
		console.log('Error', error);
	}
})();
