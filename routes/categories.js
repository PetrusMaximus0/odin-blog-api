var express = require('express');
var router = express.Router();

const categoryController = require('../controllers/categoryController');

// POST Create a new category
router.post('/', categoryController.new_category_POST);

// PUT Edit a category name
router.put('/:_id', categoryController.edit_category_PUT);

// GET all categories
router.get('/', categoryController.read_category_GET);

module.exports = router;
