"use client";

import { Alert, AlertType, AlertCategory } from "@/services/alertService";
import { cn } from "@/lib/utils";
import {
  Bell,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Archive,
  RefreshCcw,
  Check,
  Eye,
  EyeOff,
  Zap,
  CreditCard,
  UserPlus,
  ShieldAlert,
  Mail,
  Clock
} from "lucide-react";
import { formatRelativeTime } from "@/lib/time";
import { useState, useRef, useEffect } from "react";

interface NotificationCardProps {
  alert: Alert;
  onMarkRead: (id: number) => void;
  onMarkUnread: (id: number) => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
}

export const NotificationCard = ({
  alert,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onArchive,
  onRestore
}: NotificationCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: AlertType, category: AlertCategory) => {
    if (type === 'critical') return <ShieldAlert className="w-5 h-5" />;

    switch (category) {
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'registration': return <UserPlus className="w-5 h-5" />;
      case 'security': return <ShieldAlert className="w-5 h-5" />;
      case 'delivery': return <Mail className="w-5 h-5" />;
      case 'student': return <UserPlus className="w-5 h-5" />;
      default:
        switch (type) {
          case 'success': return <CheckCircle2 className="w-5 h-5" />;
          case 'warning': return <AlertTriangle className="w-5 h-5" />;
          default: return <Info className="w-5 h-5" />;
        }
    }
  };

  const getTypeStyles = (type: AlertType) => {
    switch (type) {
      case 'critical': return "bg-rose-50 text-rose-600 border-rose-100";
      case 'warning': return "bg-amber-50 text-amber-600 border-amber-100";
      case 'success': return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default: return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <div className={cn(
      "group relative flex gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300",
      !alert.is_read ? "bg-white border-blue-100 shadow-md ring-1 ring-blue-50" : "bg-slate-50/50 border-slate-100",
      alert.is_archived && "opacity-75"
    )}>
      {/* Indicator for Unread */}
      {!alert.is_read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-blue-600 rounded-r-full" />
      )}

      {/* Icon */}
      <div className={cn(
        "shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105",
        getTypeStyles(alert.type)
      )}>
        {getIcon(alert.type, alert.category)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "font-bold text-sm sm:text-base truncate",
              !alert.is_read ? "text-slate-900" : "text-slate-600"
            )}>
              {alert.title || "Notification"}
            </h4>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
              getTypeStyles(alert.type)
            )}>
              {alert.category}
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <Clock size={10} />
            {formatRelativeTime(alert.created_at)}
          </span>
        </div>

        <p className={cn(
          "text-sm leading-relaxed mb-3",
          !alert.is_read ? "text-slate-700 font-medium" : "text-slate-500"
        )}>
          {alert.message}
        </p>

        {/* Mobile quick actions */}
        <div className="flex sm:hidden items-center gap-3">
           {!alert.is_read ? (
             <button onClick={() => onMarkRead(alert.id)} className="text-xs font-bold text-blue-600">Mark as read</button>
           ) : (
             <button onClick={() => onMarkUnread(alert.id)} className="text-xs font-bold text-slate-500">Mark unread</button>
           )}
           <button onClick={() => onDelete(alert.id)} className="text-xs font-bold text-rose-500">Delete</button>
        </div>
      </div>

      {/* Desktop Actions Menu */}
      <div className="hidden sm:block relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all"
        >
          <MoreVertical size={18} className="text-slate-400" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {!alert.is_read ? (
              <button
                onClick={() => { onMarkRead(alert.id); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Eye size={16} className="text-blue-500" /> Mark as read
              </button>
            ) : (
              <button
                onClick={() => { onMarkUnread(alert.id); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <EyeOff size={16} className="text-slate-400" /> Mark as unread
              </button>
            )}

            {!alert.is_archived ? (
              <button
                onClick={() => { onArchive(alert.id); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Archive size={16} className="text-amber-500" /> Archive
              </button>
            ) : (
              <button
                onClick={() => { onRestore(alert.id); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <RefreshCcw size={16} className="text-emerald-500" /> Restore
              </button>
            )}

            <div className="h-px bg-slate-100 my-1" />

            <button
              onClick={() => { if(confirm('Delete permanently?')) onDelete(alert.id); setShowMenu(false); }}
              className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
