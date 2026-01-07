import express, { Request, Response } from 'express';
import { Enquiry } from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Submit enquiry (public)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, phone, email, city, requirement } = req.body;

        if (!name || !phone || !city || !requirement) {
            return res.status(400).json({ error: 'Name, phone, city, and requirement are required' });
        }

        const enquiry = new Enquiry({
            name,
            phone,
            email: email || undefined,
            city,
            requirement,
            status: 'new',
        });

        await enquiry.save();
        res.status(201).json({ message: 'Enquiry submitted successfully', enquiry });
    } catch (error) {
        console.error('Submit enquiry error:', error);
        res.status(500).json({ error: 'Failed to submit enquiry' });
    }
});

// Get all enquiries (admin only)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { status, search } = req.query;

        const filter: any = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        console.error('Get enquiries error:', error);
        res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
});

// Update enquiry status (admin only)
router.patch('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { status, notes } = req.body;

        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        if (status) enquiry.status = status;
        if (notes !== undefined) enquiry.notes = notes;

        await enquiry.save();
        res.json(enquiry);
    } catch (error) {
        console.error('Update enquiry error:', error);
        res.status(500).json({ error: 'Failed to update enquiry' });
    }
});

// Delete enquiry (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        console.error('Delete enquiry error:', error);
        res.status(500).json({ error: 'Failed to delete enquiry' });
    }
});

export default router;
