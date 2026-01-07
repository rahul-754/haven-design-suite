import express, { Request, Response } from 'express';
import { Product } from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadProduct } from '../middleware/upload';
import cloudinary from '../config/cloudinary';

const router = express.Router();

// Get all products (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, status, search } = req.query;

        const filter: any = {};

        // Only show active products to public, admins can see all
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            filter.status = 'active';
        } else if (status) {
            filter.status = status;
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product (public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product (admin only)
router.post('/', authenticate, requireAdmin, uploadProduct.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, category, price, description } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({ error: 'Name, category, and price are required' });
        }

        const imageUrl = req.file ? (req.file as any).path : '';
        const cloudinaryId = req.file ? (req.file as any).filename : '';

        const product = new Product({
            name,
            category,
            price: parseFloat(price),
            description: description || '',
            image: imageUrl,
            cloudinaryId,
            status: 'active',
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product (admin only)
router.put('/:id', authenticate, requireAdmin, uploadProduct.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, category, price, description } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update fields
        if (name) product.name = name;
        if (category) product.category = category;
        if (price) product.price = parseFloat(price);
        if (description !== undefined) product.description = description;

        // Update image if new one uploaded
        if (req.file) {
            // Delete old image from Cloudinary if exists
            if (product.cloudinaryId) {
                await cloudinary.uploader.destroy(product.cloudinaryId);
            }
            product.image = (req.file as any).path;
            product.cloudinaryId = (req.file as any).filename;
        }

        product.updatedAt = new Date();
        await product.save();

        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Toggle product visibility (admin only)
router.patch('/:id/visibility', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.status = product.status === 'active' ? 'hidden' : 'active';
        await product.save();

        res.json(product);
    } catch (error) {
        console.error('Toggle visibility error:', error);
        res.status(500).json({ error: 'Failed to toggle visibility' });
    }
});

// Delete product (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete image from Cloudinary
        if (product.cloudinaryId) {
            await cloudinary.uploader.destroy(product.cloudinaryId);
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
