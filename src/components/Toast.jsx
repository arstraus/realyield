import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_TYPES = {
    success: {
        icon: CheckCircle,
        className: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        iconClass: 'text-emerald-500',
    },
    error: {
        icon: AlertCircle,
        className: 'bg-red-50 border-red-200 text-red-800',
        iconClass: 'text-red-500',
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-amber-50 border-amber-200 text-amber-800',
        iconClass: 'text-amber-500',
    },
    info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        iconClass: 'text-blue-500',
    },
};

const Toast = ({ id, type, message, onClose }) => {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 4000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${config.className} animate-slide-in`}
            role="alert"
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconClass}`} />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, message }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message) => addToast('success', message),
        error: (message) => addToast('error', message),
        warning: (message) => addToast('warning', message),
        info: (message) => addToast('info', message),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
                {toasts.map(t => (
                    <Toast
                        key={t.id}
                        id={t.id}
                        type={t.type}
                        message={t.message}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
