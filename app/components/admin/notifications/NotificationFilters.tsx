"use client";

import { AlertFilters, AlertType, AlertCategory } from "@/services/alertService";
import { cn } from "@/lib/utils";
import { Search, X, Filter } from "lucide-react";
import { useState, useEffect } from "react";

interface NotificationFiltersProps {
  filters: AlertFilters;
  onFilterChange: (filters: AlertFilters) => void;
  unreadCount: number;
}

export const NotificationFilters = ({ filters, onFilterChange, unreadCount }: NotificationFiltersProps) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ ...filters, search: searchValue, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFilterChange]);

  const tabs = [
    { id: 'all', label: 'All', count: null },
    { id: 'unread', label: 'Unread', count: unreadCount > 0 ? unreadCount : null },
    { id: 'archived', label: 'Archived', count: null },
  ];

  const categories: AlertCategory[] = ['system', 'registration', 'payment', 'student', 'security', 'delivery'];
  const types: AlertType[] = ['info', 'success', 'warning', 'critical'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange({ ...filters, status: tab.id as any, page: 1 })}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                (filters.status || 'all') === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Filter size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Filter By:</span>
        </div>

        <select
          value={filters.category || "all"}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value === "all" ? undefined : e.target.value, page: 1 })}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>

        <select
          value={filters.type || "all"}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value === "all" ? undefined : e.target.value, page: 1 })}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Severities</option>
          {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        {(filters.category || filters.type || filters.search) && (
          <button
            onClick={() => {
              setSearchValue("");
              onFilterChange({ status: filters.status, page: 1 });
            }}
            className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
