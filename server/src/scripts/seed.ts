import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Product, SiteContent } from '../models';
import { connectDB } from '../config/database';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('🌱 Starting database seed...');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await SiteContent.deleteMany({});

        // Create admin user
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
        const admin = new User({
            email: process.env.ADMIN_EMAIL || 'admin@artisanhome.in',
            password: hashedPassword,
            name: 'Admin User',
            role: 'admin',
        });
        await admin.save();
        console.log('✅ Admin user created');

        // Create sample products
        const products = [
            {
                name: 'Royal Velvet Drapes',
                category: 'Curtains',
                price: 12500,
                description: 'Luxurious velvet drapes with elegant gold trim.',
                status: 'active',
                image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
            },
            {
                name: 'Milano Modular Sofa',
                category: 'Sofas',
                price: 85000,
                description: 'Contemporary modular sofa with premium fabric upholstery.',
                status: 'active',
                image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
            },
            {
                name: 'Elegant Roman Blinds',
                category: 'Blinds',
                price: 8200,
                description: 'Classic Roman blinds with blackout lining.',
                status: 'active',
                image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800',
            },
            {
                name: 'Classic Linen Curtains',
                category: 'Curtains',
                price: 9800,
                description: 'Natural linen curtains with delicate texture.',
                status: 'active',
                image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
            },
            {
                name: 'Contemporary L-Sofa',
                category: 'Sofas',
                price: 125000,
                description: 'Spacious L-shaped sofa for modern living rooms.',
                status: 'active',
                image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
            },
        ];

        await Product.insertMany(products);
        console.log('✅ Sample products created');

        // Create default site content
        const defaultContent = [
            { key: 'hero_title', value: 'Transform Your Space' },
            { key: 'hero_subtitle', value: 'Luxury Interior Design & Premium Furnishings' },
            { key: 'about_title', value: 'About ArtisanHome' },
            { key: 'about_description', value: 'We create beautiful, functional spaces that reflect your unique style.' },
        ];

        await SiteContent.insertMany(defaultContent);
        console.log('✅ Default site content created');

        console.log('\n🎉 Database seeded successfully!');
        console.log(`\n📧 Admin Login:`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
