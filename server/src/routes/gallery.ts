import express, { Request, Response } from 'express';
import { GalleryImage } from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadGallery } from '../middleware/upload';
import cloudinary from '../config/cloudinary';

const router = express.Router();

// Get all gallery images (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        const filter: any = {};
        if (category && category !== 'all') {
            filter.category = category;
        }

        const images = await GalleryImage.find(filter).sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        console.error('Get gallery images error:', error);
        res.status(500).json({ error: 'Failed to fetch gallery images' });
    }
});

// Upload gallery image (admin only)
router.post('/', authenticate, requireAdmin, uploadGallery.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, category, description } = req.body;

        if (!title || !category || !req.file) {
            return res.status(400).json({ error: 'Title, category, and image are required' });
        }

        const imageUrl = (req.file as any).path;
        const cloudinaryId = (req.file as any).filename;

        const galleryImage = new GalleryImage({
            title,
            category,
            imageUrl,
            cloudinaryId,
            description: description || '',
        });

        await galleryImage.save();
        res.status(201).json(galleryImage);
    } catch (error) {
        console.error('Upload gallery image error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Delete gallery image (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const image = await GalleryImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(image.cloudinaryId);

        await GalleryImage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete gallery image error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

export default router;
