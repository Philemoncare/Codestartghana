import { EnrollmentWizard } from "@/components/register/EnrollmentWizard";

export const metadata = {
  title: "Enrollment | CodeStart",
  description: "Join CodeStart and build real-world engineering skills through practical projects and mentorship.",
};

export default function RegisterPage() {
  return (
    <div className="py-12 md:py-20 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <EnrollmentWizard />
      </div>
    </div>
  );
}
