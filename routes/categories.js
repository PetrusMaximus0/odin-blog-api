var express = require('express');
var router = express.Router();

const categoryController = require('../controllers/categoryController');

// POST Create a new category
router.post('/', categoryController.new_category_POST);

// PUT Edit a category name
router.put('/:id', categoryController.edit_category_PUT);

// GET all categories
router.get('/', categoryController.read_category_GET);

// DELETE a category by ID
router.delete('/:id', categoryController.delete_category_DELETE);

module.exports = router;
