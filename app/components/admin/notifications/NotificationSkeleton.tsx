export const NotificationSkeleton = () => {
  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/30 animate-pulse">
      <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-200" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded-md w-1/3" />
          <div className="h-3 bg-slate-100 rounded-md w-20" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded-md w-full" />
          <div className="h-3 bg-slate-200 rounded-md w-2/3" />
        </div>
        <div className="h-2 bg-slate-100 rounded-md w-24" />
      </div>
    </div>
  );
};

export const NotificationListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
};
