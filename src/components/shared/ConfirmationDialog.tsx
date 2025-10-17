import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	isOpen,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	onConfirm,
	onCancel,
	type = 'warning',
  loading = false,
}) => {
	if (!isOpen) return null;

	const getIconColor = () => {
		switch (type) {
			case 'danger': return 'text-red-500';
			case 'warning': return 'text-amber-500';
			case 'info': return 'text-blue-500';
			default: return 'text-amber-500';
		}
	};

	const getConfirmButtonStyle = () => {
		switch (type) {
			case 'danger': return 'bg-red-500 hover:bg-red-600';
			case 'warning': return 'bg-amber-500 hover:bg-amber-600';
			case 'info': return 'bg-blue-500 hover:bg-blue-600';
			default: return 'bg-amber-500 hover:bg-amber-600';
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
				<button
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
					onClick={onCancel}
					aria-label="Close dialog"
				>
					<X className="w-5 h-5" />
				</button>
				<div className="flex items-center gap-3 mb-4">
					<AlertTriangle className={`w-6 h-6 ${getIconColor()}`} />
					<h3 className="text-lg font-bold">{title}</h3>
				</div>
				<p className="mb-6 text-gray-700">{message}</p>
				<div className="flex gap-4 justify-end">
					<button
						className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 ${getConfirmButtonStyle()}`}
						onClick={onConfirm}
						disabled={loading}
					>
						{loading && (
							<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
							</svg>
						)}
						{confirmText}
					</button>
					<button
						className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
						onClick={onCancel}
					>
						{cancelText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationDialog;