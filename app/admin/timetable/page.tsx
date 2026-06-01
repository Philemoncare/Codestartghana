"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { adminService } from "@/services/adminService";
import {
  Plus, Trash2, Edit2, Save, X, Calendar, Clock,
  BookOpen, Loader2, LayoutGrid, List, FileText, AlertCircle, CheckCircle2, Upload, Image as ImageIcon
} from "lucide-react";
import { notify } from "@/lib/notify";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface TimetableEntry {
  id: number;
  day: string;
  time: string;
  topic: string;
  description?: string;
}

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [timetableImage, setTimetableImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    day: "Monday",
    time: "",
    topic: "",
    description: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch timetable sessions
      try {
        const timetableData = await adminService.getTimetable();
        if (timetableData && timetableData.error === 'TABLE_MISSING') {
          setIsTableMissing(true);
          setTimetable([]);
        } else {
          setTimetable(Array.isArray(timetableData) ? timetableData : []);
          setIsTableMissing(false);
        }
      } catch (tError: any) {
        console.error("Timetable Registry Fetch Error:", tError);
        if (tError.message?.includes('TABLE_MISSING')) {
          setIsTableMissing(true);
        } else {
          notify.error("Registry Sync Failed", "Failed to load session registry from server.");
        }
      }

      // Fetch timetable graphic setting separately
      try {
        const settingData = await adminService.getSetting('timetable_image');
        if (settingData && settingData.value) {
          setTimetableImage(settingData.value);
        }
      } catch (sError) {
        console.error("Timetable Graphic Fetch Error:", sError);
        // We don't toast here as it's non-critical if the graphic is just missing
      }

    } catch (error: any) {
      console.error("General Sync Error:", error);
      notify.error("Critical Failure", "Unable to sync with server services.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      notify.warning("Image Too Large", "Please keep it under 2MB.");
      return;
    }

    setUploadingImage(true);
    const tid = notify.loading("Uploading timetable graphic...");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          await adminService.updateSetting('timetable_image', base64);
          setTimetableImage(base64);
          notify.success("Graphic Updated", "Timetable graphic updated successfully!");
        } catch (error) {
          notify.error("Upload Failed", "Failed to save the image to database.");
        } finally {
          setUploadingImage(false);
          notify.dismiss(tid);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      notify.error("Process Fault", "An error occurred while reading the file.");
      setUploadingImage(false);
      notify.dismiss(tid);
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove the timetable graphic?")) return;
    try {
      await adminService.updateSetting('timetable_image', "");
      setTimetableImage(null);
      notify.success("Graphic Removed", "Timetable graphic has been cleared.");
    } catch (error) {
      notify.error("Action Failed", "Unable to remove the image.");
    }
  };

  const handleRepairDatabase = async () => {
    setLoading(true);
    const tid = notify.loading("Rebuilding database schema...");
    try {
      const res = await fetch('/api/admin/setup');
      const data = await res.json();
      if (data.success) {
        notify.success("Schema Restored", "Database repaired successfully!");
        setIsTableMissing(false);
        fetchData();
      } else {
        throw new Error(data.error || "Repair failed");
      }
    } catch (error: any) {
      notify.error("Repair Failed", error.message);
    } finally {
      setLoading(false);
      notify.dismiss(tid);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateForm = () => {
    if (!formData.topic.trim()) {
      notify.warning("Input Missing", "Course title is required");
      return false;
    }
    if (!formData.time.trim()) {
      notify.warning("Input Missing", "Time slot is required");
      return false;
    }
    return true;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const tid = notify.loading("Publishing session to schedule...");

    try {
      const response = await adminService.addTimetableEntry(formData);

      if (response && (response.error === 'TABLE_MISSING' || response.message?.includes('TABLE_MISSING'))) {
        setIsTableMissing(true);
        notify.error("Database table missing", "Please click the repair button.");
        return;
      }

      notify.success("Session Published", "The schedule has been updated successfully.");

      setFormData({ day: "Monday", time: "", topic: "", description: "" });
      setIsAdding(false);

      // Optimistic update or refetch
      if (response && response.data) {
        setTimetable(prev => [...prev, response.data].sort((a, b) => a.id - b.id));
      } else {
        fetchData();
      }
    } catch (error: any) {
      notify.error("Publication Failed", error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
      notify.dismiss(tid);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!validateForm()) return;

    setSubmitting(true);
    const tid = notify.loading("Saving changes...");

    try {
      const response = await adminService.updateTimetableEntry({ id, ...formData });

      notify.success("Changes Saved", "Session details updated.");

      setEditingId(null);

      if (response && response.data) {
        setTimetable(prev => prev.map(item => item.id === id ? response.data : item));
      } else {
        fetchData();
      }
    } catch (error: any) {
      notify.error("Update Failed", "Failed to update session details.");
    } finally {
      setSubmitting(false);
      notify.dismiss(tid);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this session from the timetable? This action cannot be undone.")) return;

    const tid = notify.loading("Removing session...");
    try {
      await adminService.deleteTimetableEntry(id);
      notify.success("Record Deleted", "Session removed from schedule.");
      setTimetable(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      notify.error("Deletion Failed", "Unable to remove session record.");
    } finally {
      notify.dismiss(tid);
    }
  };

  const startEditing = (session: TimetableEntry) => {
    setEditingId(session.id);
    setFormData({
      day: session.day,
      time: session.time,
      topic: session.topic,
      description: session.description || ""
    });
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelAction = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ day: "Monday", time: "", topic: "", description: "" });
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
             Curriculum Flow
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Training Timetable</h1>
          <p className="text-slate-500 font-medium mt-2">Manage weekly learning sessions and real-time portal updates.</p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 group shrink-0"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            Create New Session
          </button>
        )}
      </div>

      {/* Form Section - Modern Card */}
      {(isAdding || editingId) && (
        <div className="animate-in zoom-in-95 duration-500">
           <div className="bg-white border-2 border-blue-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
              <div className="p-8 md:p-12">
                 <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                       {editingId ? <Edit2 size={24} className="text-blue-600" /> : <Plus size={24} className="text-blue-600" />}
                       {editingId ? "Modify Existing Session" : "Schedule New Learning Block"}
                    </h2>
                    <button onClick={cancelAction} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                       <X size={24} />
                    </button>
                 </div>

                 <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(editingId); } : handleAdd} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Day of Week</label>
                          <select
                            value={formData.day}
                            onChange={e => setFormData({...formData, day: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                          >
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                       </div>

                       <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session / Course Title</label>
                          <div className="relative">
                             <BookOpen size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input
                               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                               value={formData.topic}
                               onChange={e => setFormData({...formData, topic: e.target.value})}
                               placeholder="e.g. Advanded React State Patterns"
                               required
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Time Slot</label>
                          <div className="relative">
                             <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input
                               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                               value={formData.time}
                               onChange={e => setFormData({...formData, time: e.target.value})}
                               placeholder="e.g. 1:00 PM - 3:30 PM"
                               required
                             />
                          </div>
                       </div>

                       <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brief Description (Optional)</label>
                          <div className="relative">
                             <FileText size={18} className="absolute left-5 top-5 text-slate-400" />
                             <textarea
                               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all min-h-[60px] resize-none"
                               value={formData.description}
                               onChange={e => setFormData({...formData, description: e.target.value})}
                               placeholder="Optional notes about what will be covered..."
                             />
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                       <button
                         type="button"
                         onClick={cancelAction}
                         className="px-8 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
                       >
                          Discard
                       </button>
                       <button
                         type="submit"
                         disabled={submitting}
                         className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                          {editingId ? "Update Session" : "Confirm & Publish"}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Timetable List Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Timetable Graphic</h3>
           <div className="h-px flex-1 bg-slate-100" />
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
           <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/2 space-y-6">
                 <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Visual Schedule</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                       Upload a high-quality graphic or PDF scan of the weekly timetable. This will be prominently displayed in the student dashboard.
                    </p>
                 </div>

                 <div className="flex gap-4">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                       {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                       {timetableImage ? "Change Graphic" : "Upload Graphic"}
                    </button>
                    {timetableImage && (
                       <button
                         onClick={handleRemoveImage}
                         className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                       >
                          Remove
                       </button>
                    )}
                 </div>
                 <input
                   type="file"
                   ref={imageInputRef}
                   className="hidden"
                   accept="image/*"
                   onChange={handleImageUpload}
                 />
              </div>

              <div className="w-full md:w-1/2 min-h-[200px] bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                 {timetableImage ? (
                    <img src={timetableImage} alt="Timetable" className="w-full h-full object-contain" />
                 ) : (
                    <div className="text-center p-10 space-y-3">
                       <ImageIcon size={40} className="text-slate-300 mx-auto" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No graphic uploaded</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4 px-2 pt-6">
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Session Registry</h3>
           <div className="h-px flex-1 bg-slate-100" />
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{timetable.length} Active Blocks</span>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-32" />
                <div className="pt-4 flex justify-end gap-2">
                   <Skeleton className="h-8 w-8 rounded-lg" />
                   <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : isTableMissing ? (
          <div className="bg-rose-50 border-2 border-dashed border-rose-200 rounded-[2.5rem] p-20 text-center animate-in fade-in duration-1000">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <AlertCircle size={40} className="text-rose-500" />
             </div>
             <h4 className="text-xl font-bold text-slate-900 mb-2">Database Table Missing</h4>
             <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">The timetable system requires a database update to function correctly.</p>
             <button
               onClick={handleRepairDatabase}
               className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
             >
               Repair Database Table
             </button>
          </div>
        ) : timetable.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center animate-in fade-in duration-1000">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Calendar size={40} className="text-slate-200" />
             </div>
             <h4 className="text-xl font-bold text-slate-900 mb-2">No Training Sessions Found</h4>
             <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">Begin building your curriculum by adding your first learning session above.</p>
             <button onClick={() => setIsAdding(true)} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Add First Block</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetable.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 relative flex flex-col justify-between",
                  editingId === session.id && "ring-2 ring-blue-500 bg-blue-50/20 border-blue-500"
                )}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                      {session.day}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(session)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(session.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <h4 className="text-xl font-black text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                    {session.topic}
                  </h4>

                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <Clock size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">{session.time}</span>
                  </div>

                  {session.description && (
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 italic border-l-2 border-slate-100 pl-4 py-1">
                      {session.description}
                    </p>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">ID: #00{session.id}</span>
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <LayoutGrid size={14} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
