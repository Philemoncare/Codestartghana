"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Smartphone,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  RotateCcw,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

interface MessageLog {
  id: number;
  student_name: string;
  recipient: string;
  message: string;
  type: string;
  status: string;
  provider_response: string;
  created_at: string;
}

export default function MessageLogsPage() {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [retryingId, setRetryingId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/message-logs');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLogs(data);
    } catch (error: any) {
      toast.error("Failed to fetch message logs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRetry = async (id: number) => {
    setRetryingId(id);
    try {
      const res = await fetch('/api/admin/message-logs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Message resent successfully!");
        fetchLogs();
      } else {
        throw new Error(data.error || "Failed to retry");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setRetryingId(null);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.recipient?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (log.message?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (log.student_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || log.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Message Logs</h1>
          <p className="text-slate-500 font-medium">Monitoring outbound SMS and Email communication flow.</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Refresh Logs
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by student, recipient or content..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             {['all', 'sent', 'failed'].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cn(
                   "px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   filter === f
                     ? "bg-slate-900 text-white"
                     : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                 )}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recipient</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Message Body</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-full" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-10" /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                     <div className="space-y-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                           <Mail size={24} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No logs found</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <User size={16} />
                        </div>
                        <div className="font-bold text-slate-900 truncate max-w-[120px]">{log.student_name || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          {log.type === 'sms' ? <Smartphone size={16} /> : <Mail size={16} />}
                        </div>
                        <div className="font-bold text-slate-900">{log.recipient}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-xs font-medium leading-relaxed">
                        {log.message}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        log.status === 'sent'
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      )}>
                        {log.status === 'sent' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {log.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                        <Clock size={14} className="text-slate-300" />
                        {new Date(log.created_at).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {log.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all group"
                          title="Retry Sending"
                        >
                          <RotateCcw className={cn("transition-transform", retryingId === log.id && "animate-spin")} size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
