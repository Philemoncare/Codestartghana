"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  AlertCircle,
  Info,
  AlertTriangle,
  Check,
  Trash2,
  X,
  Filter,
  CheckCheck,
  RefreshCw,
  Clock
} from "lucide-react";
import { alertService, Alert } from "@/services/alertService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await alertService.getAlerts(filter !== 'all' ? { type: filter } : {});
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts(true);
    // Polling every 30 seconds for real-time feel
    const interval = setInterval(() => fetchAlerts(), 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const unreadCount = alerts.filter(a => !a.is_read).length;

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
      toast.success("All alerts marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all alerts?")) return;
    try {
      await alertService.clearAll();
      setAlerts([]);
      toast.success("All alerts cleared");
    } catch (error) {
      toast.error("Failed to clear alerts");
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'critical': return "text-red-600 bg-red-50 border-red-100";
      case 'warning': return "text-amber-600 bg-amber-50 border-amber-100";
      default: return "text-blue-600 bg-blue-50 border-blue-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[140] bg-slate-900/20 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-none" onClick={() => setIsOpen(false)} />
          <div className={cn(
            "fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-[400px] bg-white border border-slate-200 rounded-3xl shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
            "max-h-[80vh] sm:max-h-[600px] flex flex-col"
          )}>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h3 className="font-black text-slate-900 text-xs sm:text-sm tracking-tight uppercase">System Alerts</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Real-time Monitoring</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => { setIsRefreshing(true); fetchAlerts(true); }}
                  className={cn("p-2 text-slate-400 hover:text-slate-900 transition-all", isRefreshing && "animate-spin")}
                >
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-2 sm:p-3 border-b border-slate-50 flex gap-2 overflow-x-auto shrink-0 no-scrollbar">
              {['all', 'critical', 'warning', 'info'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                    filter === t
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              {loading ? (
                <div className="p-10 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <RefreshCw className="animate-spin text-blue-600" size={24} />
                    <div className="absolute inset-0 blur-lg bg-blue-400/20 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Logs...</span>
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 border border-dashed border-slate-200">
                    <Bell size={24} />
                  </div>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-tight">No alerts found</p>
                  <p className="text-slate-400 text-[10px] mt-1 italic">The system is currently stable.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-4 sm:p-5 transition-all hover:bg-slate-50/80 group relative",
                        !alert.is_read && "bg-blue-50/20"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                          getTypeStyles(alert.type)
                        )}>
                          {getTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-start gap-2">
                            <p className={cn(
                              "text-[11px] sm:text-xs font-bold leading-relaxed tracking-tight",
                              alert.is_read ? "text-slate-500" : "text-slate-900"
                            )}>
                              {alert.message}
                            </p>
                            {!alert.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2.5">
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                              <Clock size={10} />
                              {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                            <div className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100",
                              alert.source === 'system' ? "text-blue-600 bg-blue-50" :
                              alert.source === 'admin' ? "text-slate-600" : "text-emerald-600 bg-emerald-50"
                            )}>
                              {alert.source}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute right-4 bottom-4 flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {!alert.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-100"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {alerts.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/80 grid grid-cols-2 gap-3 shrink-0">
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95"
                >
                  <CheckCheck size={14} /> Read All
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-95"
                >
                  <Trash2 size={14} /> Clear All
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
