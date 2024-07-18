import { Router } from 'express';
import * as postController from '../controllers/postController';
import * as CMSController from '../controllers/CMSController';

const router = Router();

// PROTECTED ROUTES
// GET Get a list of all posts, including hidden posts.
router.get('/admin/all', CMSController.blogposts_admin_GET);

// Gets a list of all categories and all posts with only the date field populated. Includes hidden posts.
router.get('/admin/shortlist', CMSController.adminShortlist_GET);

// POST Create a post.
router.post('/new', CMSController.create_blogpost_POST);

// Read post by ID
router.get('/:postid/admin', CMSController.read_blogpost_admin_GET);

// DELETE Delete a post.
router.delete('/:postid', CMSController.delete_blogpost_DELETE);

// GET Edit a post by id
router.get('/:postid/edit', CMSController.update_blogpost_GET);

// PUT Edit a post by id
router.put('/:postid/edit', CMSController.update_blogpost_PUT);

// DELETE Delete a comment by id
router.delete(
	'/:postid/comment/:commentid',
	CMSController.delete_comment_DELETE
);

// Publish an unpublished Post
router.put('/:postid/publish', CMSController.publish_blogpost_PUT);

// Publish an unpublished Post
router.put('/:postid/hide', CMSController.hide_blogpost_PUT);

// UNPROTECTED ROUTES
// GET Get a list of all posts
router.get('/', postController.blogposts_GET);

// Gets a list of all categories and all posts with only the date field populated.
router.get('/shortlist', postController.shortlist_GET);

// Read post by ID
router.get('/:postid', postController.read_blogpost_GET);

// Post comment on blogpost
router.post('/:postid/comment/', postController.new_comment_POST);

export default router;
