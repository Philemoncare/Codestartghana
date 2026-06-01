import { StudentNavbar } from "@/components/student/StudentNavbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBFBFE]">
      <StudentNavbar />
      {children}
    </div>
  );
}
