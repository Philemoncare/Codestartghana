import { Hero } from "@/components/landing/Hero";
import { Curriculum } from "@/components/landing/Curriculum";
import { AboutFounder } from "@/components/landing/AboutFounder";
import { FAQ } from "@/components/landing/FAQ";
import { Globe, Laptop, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Hero />

      <AboutFounder />

      {/* Benefits Section - Fully Responsive Grid */}
      <section className="py-20 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
              <BenefitCard
                icon={<Zap className="text-blue-600" size={24} />}
                title="Practical Engineering"
                description="Learn through hands-on development, real projects, collaborative workflows, and modern engineering practices."
              />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '200ms' }}>
              <BenefitCard
                icon={<Laptop className="text-blue-600" size={24} />}
                title="Mentorship & Guidance"
                description="Receive support, reviews, and technical direction throughout the learning journey."
              />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '300ms' }}>
              <BenefitCard
                icon={<Globe className="text-blue-600" size={24} />}
                title="Career-Oriented Learning"
                description="Build practical projects and strengthen your portfolio using industry-relevant technologies."
              />
            </div>
          </div>
        </div>
      </section>

      <Curriculum />

      <FAQ />

      {/* CTA Section - Mobile Optimized Padding & Typography */}
      <section className="py-24 md:py-32 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Ready to build real-world engineering skills?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
            Join a practical engineering-focused learning environment designed to help developers grow through projects, mentorship, and consistent technical practice.
          </p>
          <div className="pt-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-2xl active:scale-95"
            >
              Enroll for 2026 Cohort
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const BenefitCard = ({ icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="space-y-4 p-4 sm:p-0 bg-white sm:bg-transparent rounded-2xl border border-slate-100 sm:border-none shadow-sm sm:shadow-none">
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 sm:bg-white border border-slate-200 shadow-sm text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
      {icon}
    </div>
    <div className="space-y-1.5">
      <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium text-xs sm:text-base">{description}</p>
    </div>
  </div>
);
