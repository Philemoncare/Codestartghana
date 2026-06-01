"use client";

import { useState, useEffect, useCallback } from "react";
import { alertService, Alert, AlertFilters, AlertsResponse } from "@/services/alertService";
import { NotificationCard } from "./NotificationCard";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationSkeleton, NotificationListSkeleton } from "./NotificationSkeleton";
import { toast } from "sonner";
import { Loader2, Inbox, Trash2, Archive, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const NotificationCenter = () => {
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AlertFilters>({
    page: 1,
    limit: 20,
    status: 'all'
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await alertService.getAlerts(filters);
      setData(response);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAction = async (action: any, ids?: number[]) => {
    const targetIds = ids || selectedIds;
    if (targetIds.length === 0 && !action.includes('all')) return;

    setBulkActionLoading(true);
    try {
      await alertService.performAction(action, targetIds);
      toast.success(`Action ${action.replace('_', ' ')} successful`);
      fetchAlerts();
      if (!ids) setSelectedIds([]);
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDelete = async (ids: number | number[]) => {
    const targetIds = Array.isArray(ids) ? ids : [ids];
    if (targetIds.length === 0) return;

    try {
      if (Array.isArray(ids)) {
        await alertService.deleteMultiple(ids);
        setSelectedIds([]);
      } else {
        await alertService.deleteAlert(ids);
      }
      toast.success("Notification(s) deleted");
      fetchAlerts();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear these notifications? This action cannot be undone.")) return;
    try {
      await alertService.clearAll(filters.status === 'archived' ? 'archived' : 'all');
      toast.success("Notifications cleared");
      fetchAlerts();
    } catch (error) {
      toast.error("Clear failed");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.length === data.alerts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.alerts.map(a => a.id));
    }
  };

  const unreadCount = data?.alerts.filter(a => !a.is_read).length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <NotificationFilters
          filters={filters}
          onFilterChange={setFilters}
          unreadCount={unreadCount}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-300">
          <span className="text-xs font-black uppercase tracking-widest">{selectedIds.length} Selected</span>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <button onClick={() => handleAction('mark_read')} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-emerald-400" title="Mark Read">
              <CheckCircle2 size={18} />
            </button>
            <button onClick={() => handleAction('archive')} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-amber-400" title="Archive">
              <Archive size={18} />
            </button>
            <button onClick={() => handleDelete(selectedIds)} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-rose-400" title="Delete">
              <Trash2 size={18} />
            </button>
          </div>
          <button onClick={() => setSelectedIds([])} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Cancel</button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSelectAll}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2"
          >
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              selectedIds.length > 0 && selectedIds.length === data?.alerts.length ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
            )}>
              {selectedIds.length > 0 && <CheckCircle2 size={10} className="text-white" />}
            </div>
            Select All
          </button>

          {filters.status === 'unread' && (
            <button
              onClick={() => handleAction('mark_all_read')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <button
          onClick={handleClearAll}
          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-2"
        >
          <Trash2 size={14} />
          {filters.status === 'archived' ? 'Empty Trash' : 'Clear All'}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 min-h-[400px]">
        {loading ? (
          <NotificationListSkeleton count={Number(filters.limit) || 5} />
        ) : !data || data.alerts.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center px-10">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-200">
              <Inbox size={40} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">No notifications found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              {filters.search ? `No results for "${filters.search}"` : "You're all caught up! No notifications to display at the moment."}
            </p>
            {Object.keys(filters).length > 2 && (
               <button
                 onClick={() => setFilters({ page: 1, limit: 20, status: 'all' })}
                 className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
               >
                 Reset Filters
               </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="flex gap-4">
                <div className="pt-5 hidden sm:block">
                  <button
                    onClick={() => toggleSelect(alert.id)}
                    className={cn(
                      "w-5 h-5 rounded border transition-all flex items-center justify-center",
                      selectedIds.includes(alert.id) ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-100" : "bg-white border-slate-200 hover:border-blue-400"
                    )}
                  >
                    {selectedIds.includes(alert.id) && <CheckCircle2 size={12} className="text-white" />}
                  </button>
                </div>
                <div className="flex-1">
                  <NotificationCard
                    alert={alert}
                    onMarkRead={(id) => handleAction('mark_read', [id])}
                    onMarkUnread={(id) => handleAction('mark_unread', [id])}
                    onArchive={(id) => handleAction('archive', [id])}
                    onRestore={(id) => handleAction('restore', [id])}
                    onDelete={(id) => handleDelete(id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-50 transition-all hover:shadow-md"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            disabled={filters.page === data.pagination.totalPages}
            onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-50 transition-all hover:shadow-md"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
