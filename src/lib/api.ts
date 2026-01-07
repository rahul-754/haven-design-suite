import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
                        window.location.href = '/admin/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(email: string, password: string) {
        const response = await this.client.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }

    async logout() {
        await this.client.post('/auth/logout');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    async getCurrentUser() {
        const response = await this.client.get('/auth/me');
        return response.data;
    }

    // Product endpoints
    async getProducts(params?: { category?: string; status?: string; search?: string }) {
        const response = await this.client.get('/products', { params });
        return response.data;
    }

    async getProduct(id: string) {
        const response = await this.client.get(`/products/${id}`);
        return response.data;
    }

    async createProduct(formData: FormData) {
        const response = await this.client.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async updateProduct(id: string, formData: FormData) {
        const response = await this.client.put(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async toggleProductVisibility(id: string) {
        const response = await this.client.patch(`/products/${id}/visibility`);
        return response.data;
    }

    async deleteProduct(id: string) {
        const response = await this.client.delete(`/products/${id}`);
        return response.data;
    }

    // Enquiry endpoints
    async submitEnquiry(data: any) {
        const response = await this.client.post('/enquiries', data);
        return response.data;
    }

    async getEnquiries(params?: { status?: string; search?: string }) {
        const response = await this.client.get('/enquiries', { params });
        return response.data;
    }

    async updateEnquiryStatus(id: string, status: string, notes?: string) {
        const response = await this.client.patch(`/enquiries/${id}/status`, { status, notes });
        return response.data;
    }

    async deleteEnquiry(id: string) {
        const response = await this.client.delete(`/enquiries/${id}`);
        return response.data;
    }

    // Appointment endpoints
    async bookAppointment(data: any) {
        const response = await this.client.post('/appointments', data);
        return response.data;
    }

    async getAppointments(params?: { status?: string; search?: string; date?: string }) {
        const response = await this.client.get('/appointments', { params });
        return response.data;
    }

    async updateAppointmentStatus(id: string, status: string, notes?: string) {
        const response = await this.client.patch(`/appointments/${id}/status`, { status, notes });
        return response.data;
    }

    async deleteAppointment(id: string) {
        const response = await this.client.delete(`/appointments/${id}`);
        return response.data;
    }

    // Gallery endpoints
    async getGalleryImages(params?: { category?: string }) {
        const response = await this.client.get('/gallery', { params });
        return response.data;
    }

    async uploadGalleryImage(formData: FormData) {
        const response = await this.client.post('/gallery', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async deleteGalleryImage(id: string) {
        const response = await this.client.delete(`/gallery/${id}`);
        return response.data;
    }

    // Content endpoints
    async getContent(key?: string) {
        const response = await this.client.get('/content', { params: { key } });
        return response.data;
    }

    async updateContent(key: string, value: any) {
        const response = await this.client.put('/content', { key, value });
        return response.data;
    }

    async bulkUpdateContent(updates: Record<string, any>) {
        const response = await this.client.post('/content/bulk', updates);
        return response.data;
    }
}

export const api = new ApiClient();
export default api;
