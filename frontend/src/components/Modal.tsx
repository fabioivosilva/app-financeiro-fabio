import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-surface-card rounded-card shadow-card-hover w-full max-w-lg mx-4 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-headline-md text-on-surface">{title}</h3>
          <button 
            onClick={onClose}
            className="text-outline hover:text-error transition-colors p-1"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
