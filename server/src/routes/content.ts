import express, { Request, Response } from 'express';
import { SiteContent } from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get site content (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { key } = req.query;

        if (key) {
            const content = await SiteContent.findOne({ key });
            if (!content) {
                return res.status(404).json({ error: 'Content not found' });
            }
            return res.json(content);
        }

        // Return all content
        const allContent = await SiteContent.find();
        const contentMap: any = {};
        allContent.forEach(item => {
            contentMap[item.key] = item.value;
        });
        res.json(contentMap);
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// Update site content (admin only)
router.put('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { key, value } = req.body;

        if (!key || value === undefined) {
            return res.status(400).json({ error: 'Key and value are required' });
        }

        const content = await SiteContent.findOneAndUpdate(
            { key },
            { key, value, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        res.json(content);
    } catch (error) {
        console.error('Update content error:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});

// Bulk update content (admin only)
router.post('/bulk', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const updates = req.body;

        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ error: 'Invalid content data' });
        }

        const promises = Object.entries(updates).map(([key, value]) =>
            SiteContent.findOneAndUpdate(
                { key },
                { key, value, updatedAt: new Date() },
                { upsert: true, new: true }
            )
        );

        await Promise.all(promises);
        res.json({ message: 'Content updated successfully' });
    } catch (error) {
        console.error('Bulk update content error:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});

export default router;
