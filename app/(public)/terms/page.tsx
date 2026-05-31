import React from 'react';

export const metadata = {
  title: "Terms of Service | CodeStart Ghana",
  description: "Terms and conditions for participating in CodeStart Ghana training programs.",
};

export default function TermsPage() {
  return (
    <main className="pt-32 pb-20 px-5 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 font-bold">Last Updated: June 2026</p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium prose-li:text-slate-600 prose-li:font-medium">
          <p>Welcome to CodeStart Ghana. By registering for or participating in our training programs, you agree to the following terms and conditions.</p>

          <section className="mt-12 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">1. Acceptance of Terms</h2>
            <p>By accessing our website or enrolling in our training programs, you agree to comply with these Terms of Service.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">2. Training Services</h2>
            <p>CodeStart Ghana provides educational training in web development and related technology subjects. Training materials and content are provided for educational purposes only.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">3. Registration and Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Participants must provide accurate information during registration.</li>
              <li>All fees paid for training programs are non-transferable unless otherwise stated.</li>
              <li>Failure to complete payment may result in restricted access to training sessions and resources.</li>
            </ul>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">4. Participant Responsibilities</h2>
            <p>Participants are expected to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Attend sessions respectfully.</li>
              <li>Avoid disruptive behavior.</li>
              <li>Use learning materials for personal educational purposes only.</li>
              <li>Respect instructors and fellow participants.</li>
            </ul>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">5. Intellectual Property</h2>
            <p>All training materials, presentations, recordings, and resources remain the property of CodeStart Ghana unless otherwise stated.</p>
            <p>Participants may not reproduce, distribute, or sell training materials without permission.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">6. Limitation of Liability</h2>
            <p>While we strive to provide high-quality training, we do not guarantee employment, certification, or specific career outcomes.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">7. Changes to Services</h2>
            <p>CodeStart Ghana reserves the right to modify schedules, training content, or services when necessary.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">8. Contact Information</h2>
            <p>For questions regarding these Terms of Service, contact us through the details provided on the website.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
