"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Bell,
  X,
  RefreshCw,
  Clock,
  CheckCheck,
  Zap,
  Inbox,
  ArrowRight,
  ShieldAlert,
  Info,
  CreditCard,
  UserPlus
} from "lucide-react";
import { alertService, Alert } from "@/services/alertService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/time";

export function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertService.getAlerts({ limit: 5, status: 'unread' });
      setAlerts(data.alerts);
      setUnreadCount(data.pagination.total);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await alertService.updateAlert(id, { is_read: true });
      setAlerts(prev => prev.filter(a => a.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const getIcon = (type: string, category: string) => {
    switch (category) {
      case 'payment': return <CreditCard size={16} />;
      case 'registration': return <UserPlus size={16} />;
      case 'security': return <ShieldAlert size={16} />;
      default: return <Zap size={16} />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'critical': return "bg-rose-50 text-rose-600 border-rose-100";
      case 'warning': return "bg-amber-50 text-amber-600 border-amber-100";
      case 'success': return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default: return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-3 rounded-2xl transition-all duration-300 active:scale-95",
          isOpen ? "bg-slate-900 text-white shadow-xl" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
        )}
      >
        <Bell size={20} className={cn(unreadCount > 0 && !isOpen && "animate-bounce-slow")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 w-auto sm:w-[400px] bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[1000] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-300",
          "max-h-[80vh]"
        )}>
          <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Recent Alerts</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{unreadCount} Unread Notifications</p>
            </div>
            <button
              onClick={() => { setLoading(true); fetchAlerts(); }}
              className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading...</span>
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-12 text-center px-8">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-200">
                  <Inbox size={24} />
                </div>
                <p className="text-xs font-bold text-slate-500">No unread notifications</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                        getStyles(alert.type)
                      )}>
                        {getIcon(alert.type, alert.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <p className="text-xs font-bold text-slate-900 truncate pr-4">{alert.title || alert.message}</p>
                           <button
                             onClick={() => handleMarkAsRead(alert.id)}
                             className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-blue-600 transition-all"
                           >
                             <CheckCheck size={14} />
                           </button>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{alert.message}</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-2 flex items-center gap-1">
                          <Clock size={10} />
                          {formatRelativeTime(alert.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/notifications"
            onClick={() => setIsOpen(false)}
            className="p-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
          >
            See All Notifications <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
