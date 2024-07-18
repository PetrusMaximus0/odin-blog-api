import Post from '../models/post';

export const searchQuery = async (
	query: string,
	pageNumber: number,
	numberOfItems: number,
	showHidden: boolean = false
) => {
	const allPosts = await Post.aggregate()
		.search({
			index: 'postSearch',
			text: {
				query: query,
				path: {
					wildcard: '*',
				},
			},
		})
		.match(showHidden ? {} : { hidden: false })
		.exec();

	//
	const lastPage = (pageNumber + 1) * numberOfItems >= allPosts.length;
	const posts = allPosts.slice(
		pageNumber * numberOfItems,
		numberOfItems + pageNumber * numberOfItems
	);
	//

	return { allPosts: posts, lastPage: lastPage };
};

export const dateQuery = async (
	date: string,
	pageNumber: number,
	numberOfItems: number,
	showHidden: boolean = false
) => {
	const query = {
		date: {
			$gte: date,
			$lt: `${parseInt(date) + 1}`,
		},
		hidden: showHidden,
	};

	const [totalItems, allPosts] = await Promise.all([
		Post.countDocuments(query),
		Post.find(
			query,
			'date title description timeToRead headerImage comments hidden'
		)
			.sort({ date: -1, title: -1 })
			.skip(pageNumber * numberOfItems)
			.limit(numberOfItems)
			.exec(),
	]);
	const lastPage = (pageNumber + 1) * numberOfItems >= totalItems;
	return { allPosts, lastPage };
};

export const arbitraryQuery = async (
	queryType: string,
	query: string,
	pageNumber: number,
	numberOfItems: number,
	showHidden: boolean = false
) => {
	const postQuery = {
		[queryType]: query,
		hidden: showHidden,
	};

	//
	const [totalItems, allPosts] = await Promise.all([
		Post.countDocuments(postQuery),
		Post.find(
			postQuery,
			'date title description timeToRead headerImage comments hidden'
		)
			.sort({ date: -1, title: -1 })
			.skip(pageNumber * numberOfItems)
			.limit(numberOfItems)
			.exec(),
	]);
	const lastPage = (pageNumber + 1) * numberOfItems >= totalItems;
	return { allPosts, lastPage };
};
