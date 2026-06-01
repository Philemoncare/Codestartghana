"use client";

import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqData = [
  {
    question: "Who is this program for?",
    answer: "This program is designed for students, graduates, and aspiring developers who have a basic understanding of computer logic but want to build industry-ready engineering skills through practical project work."
  },
  {
    question: "What is the duration of the training?",
    answer: "The intensive cohort runs for 4 weeks. Sessions are held 3 times a week, focusing on deep technical implementation and collaborative development."
  },
  {
    question: "Is there a certificate after completion?",
    answer: "Yes. Upon successful completion of all modules and the final capstone project, you will receive an official CodeStart Engineering Certificate."
  },
  {
    question: "What stack will I learn?",
    answer: "We focus on the modern web stack: React, Next.js, TypeScript, PostgreSQL, and professional Git workflows."
  },
  {
    question: "Where is the training held?",
    answer: "The 2026 cohort will be held in Takoradi, Ghana. Specific location details are sent to approved students via the portal."
  }
];

export const FAQ = () => {
  const [activeIndex, setActiveLayer] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">Questions</h2>
          <p className="text-slate-500 font-medium">Common inquiries about the CodeStart ecosystem.</p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={cn(
                "group rounded-[2rem] transition-all duration-300 border",
                activeIndex === index
                  ? "bg-slate-50 border-blue-100"
                  : "bg-white border-slate-100 hover:border-slate-200"
              )}
            >
              <button
                onClick={() => setActiveLayer(activeIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left"
              >
                <span className={cn(
                  "text-base md:text-lg font-bold transition-colors",
                  activeIndex === index ? "text-blue-600" : "text-slate-900"
                )}>
                  {item.question}
                </span>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  activeIndex === index ? "bg-blue-600 text-white rotate-180" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                )}>
                  <ChevronDown size={18} />
                </div>
              </button>

              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                activeIndex === index ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="p-6 md:p-8 pt-0 text-slate-600 font-medium leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
