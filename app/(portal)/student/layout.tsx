import { StudentNavbar } from "@/components/student/StudentNavbar";
import { StudentBottomNav } from "@/components/student/StudentBottomNav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBFBFE] flex flex-col pb-20 lg:pb-0">
      <StudentNavbar />
      <div className="flex-1">
        {children}
      </div>
      <StudentBottomNav />
    </div>
  );
}

