import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';

const router = Router();

// POST Create a new category
router.post('/', categoryController.create_category_POST);

// PUT Edit a category name
router.put('/:id', categoryController.update_category_PUT);

// GET all categories
router.get('/', categoryController.read_category_GET);

// DELETE a category by ID
router.delete('/:id', categoryController.delete_category_DELETE);

export default router;
