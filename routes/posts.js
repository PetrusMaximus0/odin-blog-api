const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// GET Get a list of all posts
router.get('/', postController.blogposts_GET);

// GET Get a list of all posts, including hidden posts.
router.get('/admin/all', postController.blogposts_admin_GET);

// Gets a list of all categories and all posts with only the date field populated.
router.get('/shortlist', postController.shortlist_GET);

// Gets a list of all categories and all posts with only the date field populated. Includes hidden posts.
router.get('/admin/shortlist', postController.shortlist_GET);

// POST Create a post.
router.post('/new', postController.new_blogpost_POST);

// Read post by ID
router.get('/:postid', postController.read_blogpost_GET);

// Read post by ID
router.get('/:postid/admin', postController.read_blogpost_admin_GET);

// Post comment on blogpost
router.post('/:postid/comment/', postController.new_comment_POST);

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

// Publish an unpublished Post
router.put('/:postid/publish', postController.publish_blogpost_PUT);

// Publish an unpublished Post
router.put('/:postid/hide', postController.hide_blogpost_PUT);

module.exports = router;
