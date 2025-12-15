import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    confirmVariant = "primary" // 'primary' | 'danger'
}) => {
    if (!isOpen) return null;

    const buttonStyles = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        danger: "bg-red-600 text-white hover:bg-red-700"
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4">
                <div className="flex items-start space-x-4">
                    {confirmVariant === 'danger' && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonStyles[confirmVariant]}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
