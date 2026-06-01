import { Layout, Code2, Database, ChevronRight, Globe, Github, Terminal } from "lucide-react";

const curriculumItems = [
  {
    title: "Web Foundations",
    description: "Understand the core technologies of the web including semantic HTML, responsive CSS systems, and modern layouts.",
    icon: <Globe size={24} />,
    topics: ["Semantic HTML5", "Modern CSS & Flexbox", "Tailwind CSS Architecture", "Responsive Systems"],
  },
  {
    title: "Logic & Engineering",
    description: "Learn modern JavaScript development and build dynamic applications using React and component-based logic.",
    icon: <Terminal size={24} />,
    topics: ["ES6+ Fundamentals", "Asynchronous Patterns", "React State Management", "API Consumption"],
  },
  {
    title: "Scale & Deployment",
    description: "Build production-style applications with routing, backend integration, and industrial deployment workflows.",
    icon: <Database size={24} />,
    topics: ["Next.js App Router", "Server Components", "PostgreSQL Design", "Vercel Deployment"],
  },
];

export const Curriculum = () => {
  return (
    <section id="curriculum" className="py-24 md:py-32 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">Program Architecture</h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">A structured engineering path designed for practical mastery and industry readiness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
          {curriculumItems.map((item, idx) => (
            <div
              key={item.title}
              className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-500/10 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 flex items-center justify-center mb-8 group-hover:text-blue-600 group-hover:shadow-lg group-hover:shadow-blue-100/50 transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight uppercase">{item.title}</h3>
              <p className="text-slate-500 mb-10 leading-relaxed font-medium text-sm">{item.description}</p>

              <div className="space-y-4 pt-8 border-t border-slate-100">
                {item.topics.map((topic) => (
                  <div key={topic} className="flex items-center gap-3">
                    <ChevronRight size={14} className="text-blue-600" />
                    <span className="text-[13px] text-slate-700 font-bold">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
