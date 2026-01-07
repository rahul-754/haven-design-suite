import express, { Request, Response } from 'express';
import { Appointment } from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Book appointment (public)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, phone, email, date, time, address, city, requirement } = req.body;

        if (!name || !phone || !date || !time || !address || !city || !requirement) {
            return res.status(400).json({
                error: 'Name, phone, date, time, address, city, and requirement are required'
            });
        }

        const appointment = new Appointment({
            name,
            phone,
            email: email || undefined,
            date: new Date(date),
            time,
            address,
            city,
            requirement,
            status: 'pending',
        });

        await appointment.save();
        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// Get all appointments (admin only)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { status, search, date } = req.query;

        const filter: any = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (date) {
            const startDate = new Date(date as string);
            const endDate = new Date(date as string);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = { $gte: startDate, $lt: endDate };
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Update appointment status (admin only)
router.patch('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { status, notes } = req.body;

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (status) appointment.status = status;
        if (notes !== undefined) appointment.notes = notes;

        await appointment.save();
        res.json(appointment);
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

// Delete appointment (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
});

export default router;
