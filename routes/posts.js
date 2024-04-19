const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Read list of all posts
router.get('/', postController.blogposts_GET);

//GET Create a post.
router.get('/new', postController.new_blogpost_GET);

// POST Create a post.
router.post('/new', postController.new_blogpost_POST);

// Read post by ID
router.get('/:postid', postController.read_blogpost_GET);

// DELETE Delete a post.
router.delete('/:postid/delete', postController.delete_blogpost_DELETE);

module.exports = router;
