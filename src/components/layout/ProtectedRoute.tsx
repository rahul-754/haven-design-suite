import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '@/lib/api';

export const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                await api.getCurrentUser();
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-charcoal">
                <div className="text-ivory">Loading...</div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};
