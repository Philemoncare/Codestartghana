import { Github, Linkedin, Twitter, Mail, MapPin, ShieldCheck, Quote, GraduationCap } from "lucide-react";
import Image from "next/image";

export const AboutFounder = () => {
  return (
    <section id="about" className="py-24 md:py-40 bg-white relative overflow-hidden">
      {/* Subtle Background Branding */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">

          {/* Left Side: Precision Overlapping Layout */}
          <div className="w-full lg:w-[45%] flex justify-center px-4 sm:px-0">
            <div className="relative w-64 h-[360px] sm:w-80 sm:h-[480px]">

              {/* Main Large Image (Checkered Sweater) */}
              <div className="absolute inset-0 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border-4 border-slate-50 shadow-2xl z-0">
                <Image
                  src="/images/me.jpg"
                  alt="Philemon Melabah"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Foreground Small Image (Blue Shirt) - Now visible on all devices */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-12 w-40 h-52 sm:w-48 sm:h-60 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 sm:border-8 border-white shadow-2xl z-20">
                <Image
                  src="/images/one.jpg"
                  alt="Philemon Melabah Portrait"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating Founder Badge (Centered Bottom Overlay) */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3 z-30 animate-in fade-in zoom-in duration-1000">
                 <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <ShieldCheck size={16} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 pr-1">Founder</span>
              </div>
            </div>
          </div>

            {/* Social Links under image for mobile/desktop profile feel */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 lg:hidden">
               <SocialIcon href="https://www.linkedin.com/in/philemon-melabah-ba0148317" icon={<Linkedin size={18} />} label="LinkedIn" />
               <SocialIcon href="https://github.com/Philemoncare" icon={<Github size={18} />} label="GitHub" />
               <SocialIcon href="mailto:favmoms440@gmail.com" icon={<Mail size={18} />} label="Email" />
            </div>

          {/* Right Side: Professional Branding Content */}
          <div className="w-full lg:w-[55%] space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">
                About <span className="text-blue-600">CodeStart Ghana</span>
              </h2>
            </div>

            <div className="relative">
               <Quote className="absolute -top-6 -left-6 text-blue-50 w-12 h-12 -z-10 rotate-180" />
               <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed italic">
                 "Our mission is to bridge the gap between academic theory and the fast-paced reality of the tech industry. CodeStart Ghana exists to empower the next generation of engineers through intensive, project-driven training."
               </p>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
              CodeStart Ghana was built on the principle of practical mastery. We focus on transforming ambitious students into professional developers by teaching not just code, but the engineering mindset required to build scalable, real-world solutions.
            </p>

            {/* Desktop Professional Links */}
            <div className="pt-8 border-t border-slate-100 hidden lg:flex flex-wrap justify-start gap-4">
               <SocialIcon href="https://www.linkedin.com/in/philemon-melabah-ba0148317" icon={<Linkedin size={18} />} label="LinkedIn" />
               <SocialIcon href="https://github.com/Philemoncare" icon={<Github size={18} />} label="GitHub" />
               <SocialIcon href="https://x.com/braphilemon1?s=21" icon={<Twitter size={18} />} label="Twitter" />
               <SocialIcon href="mailto:favmoms440@gmail.com" icon={<Mail size={18} />} label="Email" />
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3 text-slate-400">
               <MapPin size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Takoradi, Ghana</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SocialIcon = ({ href, icon, label }: { href: string; icon: any; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:bg-white hover:text-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-50 transition-all active:scale-95"
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{label}</span>
  </a>
);
