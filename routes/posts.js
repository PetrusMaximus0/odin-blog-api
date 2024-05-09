const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Read list of all posts
router.get('/', postController.blogposts_GET);

// Read a list of all categories and all posts
router.get('/shortlist', postController.shortlist_GET);

// GET Get a list of all posts, including hidden posts.
router.get('/admin/all', postController.blogposts_admin_GET);

// GET Create a post.
router.get('/new', postController.new_blogpost_GET);

// POST Create a post.
router.post('/new', postController.new_blogpost_POST);

// Read post by ID
router.get('/:postid', postController.read_blogpost_GET);

// Post comment on blogpost
router.post('/:postid/comment/new', postController.new_comment_POST);

// DELETE Delete a post.
router.delete('/:postid', postController.delete_blogpost_DELETE);

// GET Edit a post by id
router.get('/:postid/edit', postController.edit_blogpost_GET);

// PUT Edit a post by id
router.put('/:postid/edit', postController.edit_blogpost_PUT);

// DELETE Delete a comment by id
router.delete(
	'/:postid/comment/:commentid',
	postController.delete_comment_DELETE
);

module.exports = router;
