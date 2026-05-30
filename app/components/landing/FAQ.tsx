"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "When does the next cohort begin?",
    answer: "Enrollment for the next cohort is currently ongoing. Sessions begin once admissions are finalized and selected students are onboarded."
  },
  {
    question: "Do I need prior experience?",
    answer: "No. The 4-week curriculum is designed to support beginners while also helping intermediate learners strengthen practical engineering skills in a fast-paced environment."
  },
  {
    question: "What is the tuition fee?",
    answer: "The full program fee is GHS 450. This includes training sessions, mentorship, project reviews, and learning resources."
  },
  {
    question: "Is the program online or physical?",
    answer: "The program supports both remote learning and scheduled in-person sessions depending on the cohort structure and availability."
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-500 font-medium">Everything you need to know about the bootcamp.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} style={{ animationDelay: `${index * 100}ms` }} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
              <FAQItem question={faq.question} answer={faq.answer} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("bg-white border rounded-[2rem] overflow-hidden transition-all duration-500", isOpen ? "border-blue-600 shadow-xl shadow-blue-50/50 scale-[1.01]" : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md")}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 text-left flex items-center justify-between gap-4 group"
      >
        <span className="font-black text-slate-900 uppercase tracking-tight text-lg">{question}</span>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isOpen ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100")}>
          {isOpen ? <Minus size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
        </div>
      </button>
      {isOpen && (
        <div className="px-8 pb-8 text-slate-600 font-bold leading-relaxed animate-in fade-in slide-in-from-top-2 duration-500 text-sm md:text-base">
          {answer}
        </div>
      )}
    </div>
  );
};
