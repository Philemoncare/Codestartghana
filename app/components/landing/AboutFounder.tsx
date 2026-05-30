import { Github, Linkedin, Twitter, Mail, MapPin, Code, LineChart, Cpu, GraduationCap, Lightbulb } from "lucide-react";
import Image from "next/image";

export const AboutFounder = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-24">

          {/* Visual Area - Layered Multi-Image Gallery */}
          <div className="flex-1 relative w-full">
            <div className="relative h-[400px] sm:h-[600px] w-full">

              {/* Main Primary Image */}
              <div className="absolute top-0 left-0 w-[90%] sm:w-[85%] h-[90%] sm:h-[85%] z-20 group">
                <div className="absolute inset-0 bg-blue-600 rounded-[2rem] sm:rounded-[2.5rem] rotate-2 scale-[1.02] opacity-5 group-hover:rotate-0 transition-transform duration-500" />
                <div className="relative h-full w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-2xl bg-slate-100">
                  <Image
                    src="/images/me.jpg"
                    alt="Philemon Melabah"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>

              {/* Secondary Layered Image 1 */}
              <div className="absolute bottom-0 right-0 w-[50%] sm:w-[45%] h-[50%] sm:h-[45%] z-30 group animate-float">
                <div className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border-4 border-white shadow-2xl bg-slate-200">
                  <Image
                    src="/images/one.jpg"
                    alt="Founder Learning"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-1/2 -left-4 sm:-left-10 -translate-y-1/2 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-premium border border-slate-100 z-50 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600">
                  <GraduationCap size={16} />
                </div>
                <div className="pr-1 sm:pr-2">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400">Student</p>
                  <p className="text-[10px] sm:text-xs font-black text-slate-900">Leader</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Founder & Lead Builder</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                About <span className="text-blue-600">Philemon.</span>
              </h2>
            </div>

            <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed">
              <p>
                I am a passionate and growth-driven student with interests in data management, analytics, technology, and digital innovation. I combine leadership, creativity, and problem-solving skills to organize projects, manage teams, and create impactful solutions.
              </p>
              <p>
                With experience in student leadership, communication, and tech training, I am committed to continuous learning and helping others grow through collaboration and knowledge sharing. My goal is to build meaningful solutions, develop strong technical skills, and contribute positively to every environment I work in.
              </p>
              <p className="text-slate-900 font-bold flex items-center justify-center lg:justify-start gap-2 pt-2">
                🚀 Building practical learning experiences through CodeStart Ghana.
              </p>
            </div>

            {/* Core Interests Grid */}
            <div className="pt-4">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 text-center lg:text-left">Core Interests</p>
               <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <InterestChip icon={<LineChart size={14} />} label="Data Analytics" />
                  <InterestChip icon={<Code size={14} />} label="Software Engineering" />
                  <InterestChip icon={<Lightbulb size={14} />} label="Digital Innovation" />
                  <InterestChip icon={<Cpu size={14} />} label="Product Development" />
                  <InterestChip icon={<GraduationCap size={14} />} label="Tech Education" />
               </div>
            </div>

            {/* Professional Connectivity */}
            <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
               <div className="flex items-center gap-4">
                  <SocialLink href="https://www.linkedin.com/in/philemon-melabah-ba0148317" icon={<Linkedin size={20} />} />
                  <SocialLink href="https://github.com/Philemoncare" icon={<Github size={20} />} />
                  <SocialLink href="https://x.com/braphilemon1?s=21" icon={<Twitter size={20} />} />
                  <SocialLink href="mailto:favmoms440@gmail.com" icon={<Mail size={20} />} />
               </div>
               <div className="flex items-center gap-3 text-slate-400">
                  <MapPin size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Takoradi, Ghana</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const InterestChip = ({ icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all cursor-default group">
    <span className="text-slate-400 group-hover:text-blue-500">{icon}</span>
    {label}
  </div>
);

const SocialLink = ({ href, icon }: { href: string; icon: any }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-50 transition-all active:scale-95"
  >
    {icon}
  </a>
);
