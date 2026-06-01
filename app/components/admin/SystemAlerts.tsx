"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Bell,
  AlertCircle,
  Info,
  AlertTriangle,
  Check,
  Trash2,
  X,
  RefreshCw,
  Clock,
  CheckCheck,
  Zap,
  CreditCard,
  UserPlus,
  ShieldAlert,
  Inbox
} from "lucide-react";
import { alertService, Alert } from "@/services/alertService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterTab = 'all' | 'unread' | 'system' | 'student' | 'admin';

export function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      // We fetch all and filter locally for a more snappy feel,
      // but we could also fetch with filters if the list is huge.
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts(true);
    const interval = setInterval(() => fetchAlerts(), 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !alert.is_read;
      return alert.source === activeTab;
    });
  }, [alerts, activeTab]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await alertService.markAsRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (error) {
      toast.error("Failed to mark alert as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllRead();
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Permanently clear all notifications?")) return;
    try {
      await alertService.clearAll();
      setAlerts([]);
      toast.success("Notification center cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const getSourceIcon = (source: string, type: string) => {
    if (type === 'critical') return <ShieldAlert size={18} />;

    switch (source) {
      case 'system': return <Zap size={18} />;
      case 'student': return <UserPlus size={18} />;
      case 'admin': return <ShieldAlert size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getSourceStyles = (source: string, type: string) => {
    if (type === 'critical') return "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100";
    if (type === 'warning') return "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100";

    switch (source) {
      case 'system': return "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100";
      case 'student': return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100";
      case 'admin': return "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100 shadow-slate-100";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-3 rounded-2xl transition-all duration-300 active:scale-95 group",
          isOpen ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
        )}
      >
        <Bell size={22} className={cn(unreadCount > 0 && !isOpen && "animate-bounce-slow")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-in zoom-in duration-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none" onClick={() => setIsOpen(false)} />

          {/* Notification Panel */}
          <div className={cn(
            "fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 w-auto sm:w-[480px] bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-[1010] overflow-hidden flex flex-col transition-all duration-500",
            "max-h-[85vh] sm:max-h-[700px] animate-in fade-in slide-in-from-top-4"
          )}>

            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
              <div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight uppercase">Activity Stream</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Live Monitoring System</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsRefreshing(true); fetchAlerts(true); }}
                  className={cn("p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:shadow-md rounded-xl transition-all", isRefreshing && "animate-spin")}
                  title="Refresh stream"
                >
                  <RefreshCw size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-lg active:scale-90">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-4 border-b border-slate-50 flex gap-2 overflow-x-auto shrink-0 no-scrollbar">
              {(['all', 'unread', 'system', 'student', 'admin'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border capitalize",
                    activeTab === tab
                      ? "bg-slate-900 text-white shadow-lg border-slate-900"
                      : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  )}
                >
                  {tab === 'all' ? 'All Activity' : tab === 'student' ? 'Student' : tab}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                    <Zap className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={24} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing...</span>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="py-24 px-10 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200 border-2 border-dashed border-slate-100">
                    <Inbox size={32} />
                  </div>
                  <h4 className="text-slate-900 font-black uppercase tracking-tight mb-2">No notifications found</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed italic">Everything is quiet in the {activeTab === 'all' ? 'command center' : activeTab + ' logs'}.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredAlerts.map((alert, index) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-5 sm:p-6 transition-all hover:bg-slate-50 group relative animate-in fade-in slide-in-from-bottom-2",
                        !alert.is_read && "bg-blue-50/10 border-l-4 border-l-blue-600",
                        "duration-300"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3",
                          getSourceStyles(alert.source, alert.type)
                        )}>
                          {getSourceIcon(alert.source, alert.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                    getSourceStyles(alert.source, alert.type)
                                  )}>
                                    {alert.source}
                                  </span>
                                  {!alert.is_read && (
                                     <span className="flex h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                  )}
                               </div>
                               <p className={cn(
                                 "text-sm font-bold leading-snug tracking-tight transition-colors",
                                 alert.is_read ? "text-slate-500" : "text-slate-900"
                               )}>
                                 {alert.message}
                               </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              <Clock size={12} className="text-slate-300" />
                              {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                            </div>

                            {/* Action Buttons (Inline for mobile/desktop) */}
                            <div className="ml-auto flex items-center gap-1">
                              {!alert.is_read && (
                                <button
                                  onClick={() => handleMarkAsRead(alert.id)}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100 active:scale-90"
                                  title="Acknowledge"
                                >
                                  <CheckCheck size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(alert.id)}
                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 active:scale-90"
                                title="Dismiss"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bulk Actions Footer */}
            {alerts.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-4 shrink-0">
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className={cn(
                    "flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    unreadCount > 0 ? "text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-xl" : "text-slate-300 cursor-not-allowed"
                  )}
                >
                  <CheckCheck size={16} /> Mark All Read
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm hover:shadow-rose-100 active:scale-95"
                >
                  <Trash2 size={16} /> Clear Console
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
