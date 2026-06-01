"use client";

import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
           <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                variant === "danger" ? "bg-red-50 text-red-600" :
                variant === "warning" ? "bg-amber-50 text-amber-600" :
                "bg-blue-50 text-blue-600"
              )}>
                 <AlertTriangle size={24} />
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                 <X size={20} />
              </button>
           </div>

           <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
           <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {description}
           </p>

           <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                 {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg",
                  variant === "danger" ? "bg-red-600 text-white hover:bg-red-700 shadow-red-100" :
                  variant === "warning" ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100" :
                  "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
                )}
              >
                 {isLoading ? "Processing..." : confirmText}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
