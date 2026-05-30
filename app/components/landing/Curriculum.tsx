import { Layout, Code2, Database, ChevronRight } from "lucide-react";

const curriculumItems = [
  {
    title: "Web Foundations",
    description: "Understand the core technologies of the web including semantic HTML, responsive CSS systems, accessibility, and modern layouts.",
    icon: <Layout size={24} />,
    topics: ["Semantic HTML5", "CSS3 & Flexbox", "Tailwind CSS", "Responsive Design", "Accessibility Basics"],
  },
  {
    title: "JavaScript & React",
    description: "Learn modern JavaScript development and build dynamic applications using React and component-based architecture.",
    icon: <Code2 size={24} />,
    topics: ["ES6+ JavaScript", "DOM Manipulation", "React Fundamentals", "Hooks & State", "API Consumption"],
  },
  {
    title: "Next.js & Fullstack",
    description: "Build production-style applications with routing, backend integration, authentication, and PostgreSQL databases.",
    icon: <Database size={24} />,
    topics: ["Next.js App Router", "Server Components", "PostgreSQL", "API Routes", "Authentication Systems"],
  },
];

export const Curriculum = () => {
  return (
    <section id="curriculum" className="py-20 md:py-32 bg-white border-y border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-3xl mb-12 md:mb-24 space-y-4">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Syllabus</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight text-balance">
            4-Week Intensive <br />
            <span className="text-blue-600">Engineering Syllabus.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            A fast-paced, high-impact learning path designed to move students from foundations into modern development using real-world projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {curriculumItems.map((item, idx) => (
            <div
              key={item.title}
              style={{ animationDelay: `${idx * 150}ms` }}
              className="p-8 md:p-10 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50/50 hover:-translate-y-1.5 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-xl group-hover:shadow-blue-100 transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight uppercase">{item.title}</h3>
              <p className="text-slate-500 mb-10 leading-relaxed font-medium text-sm md:text-base">{item.description}</p>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                {item.topics.map((topic) => (
                  <div key={topic} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <ChevronRight size={12} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-slate-700 font-bold">{topic}</span>
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
