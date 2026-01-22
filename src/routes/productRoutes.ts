import { Router } from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct, downloadTemplate, uploadProducts } from '../controllers/productController';
import { authenticateToken } from '../middlewares/authMiddleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticateToken);

router.get('/template', downloadTemplate);
router.post('/upload', upload.single('file'), uploadProducts);

router.post('/', createProduct);
router.get('/', getProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
