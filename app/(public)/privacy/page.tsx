import React from 'react';

export const metadata = {
  title: "Privacy Policy | CodeStart Ghana",
  description: "CodeStart Ghana values your privacy and is committed to protecting your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="pt-32 pb-20 px-5 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-bold">Last Updated: June 2026</p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium prose-li:text-slate-600 prose-li:font-medium">
          <p>CodeStart Ghana values your privacy and is committed to protecting your personal information.</p>

          <section className="mt-12 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">1. Information We Collect</h2>
            <p>We may collect:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Educational information</li>
              <li>Registration details submitted through our website</li>
            </ul>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">2. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process registrations</li>
              <li>Communicate training updates</li>
              <li>Provide support and learning resources</li>
              <li>Improve our services</li>
            </ul>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">3. Data Protection</h2>
            <p>We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, or misuse.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">4. Information Sharing</h2>
            <p>We do not sell, rent, or trade your personal information to third parties.</p>
            <p>Information may only be shared when required by law or necessary for providing our services.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">5. Cookies and Analytics</h2>
            <p>Our website may use cookies and analytics tools to improve user experience and understand website usage.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">6. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal information by contacting us.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">7. Updates to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page.</p>

            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-2">8. Contact Us</h2>
            <p>If you have questions regarding this Privacy Policy, please contact us through the official channels listed on the website.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
