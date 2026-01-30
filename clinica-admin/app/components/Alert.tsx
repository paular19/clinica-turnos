'use client';

import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    message: string;
    onClose?: () => void;
    autoClose?: boolean;
    duration?: number;
}

const alertStyles = {
    success: {
        container: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        text: 'text-green-800',
        Icon: CheckCircle,
    },
    error: {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        text: 'text-red-800',
        Icon: XCircle,
    },
    warning: {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        text: 'text-yellow-800',
        Icon: AlertCircle,
    },
    info: {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-800',
        Icon: Info,
    },
};

export default function Alert({
    type,
    message,
    onClose,
    autoClose = true,
    duration = 5000,
}: AlertProps) {
    const [isVisible, setIsVisible] = useState(true);
    const style = alertStyles[type];
    const IconComponent = style.Icon;

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className={`border rounded-lg p-4 ${style.container} flex items-start gap-3`}>
            <IconComponent className={`${style.icon} flex-shrink-0`} size={20} />
            <p className={`${style.text} flex-1 text-sm`}>{message}</p>
            {onClose && (
                <button
                    onClick={() => {
                        setIsVisible(false);
                        onClose();
                    }}
                    className={`${style.icon} hover:opacity-70`}
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
