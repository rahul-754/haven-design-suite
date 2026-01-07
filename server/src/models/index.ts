import mongoose, { Schema, Document } from 'mongoose';

// User Model
export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'user';
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);

// Product Model
export interface IProduct extends Document {
    name: string;
    category: string;
    price: number;
    description: string;
    status: 'active' | 'hidden';
    image: string;
    cloudinaryId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'hidden'], default: 'active' },
    image: { type: String, required: true },
    cloudinaryId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

// Enquiry Model
export interface IEnquiry extends Document {
    name: string;
    phone: string;
    email?: string;
    city: string;
    requirement: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
    notes?: string;
    createdAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    city: { type: String, required: true },
    requirement: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'closed'], default: 'new' },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

// Appointment Model
export interface IAppointment extends Document {
    name: string;
    phone: string;
    email?: string;
    date: Date;
    time: string;
    address: string;
    city: string;
    requirement: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    requirement: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

// Gallery Image Model
export interface IGalleryImage extends Document {
    title: string;
    category: string;
    imageUrl: string;
    cloudinaryId: string;
    description?: string;
    createdAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>({
    title: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export const GalleryImage = mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);

// Site Content Model
export interface ISiteContent extends Document {
    key: string;
    value: any;
    updatedAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
});

export const SiteContent = mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);
