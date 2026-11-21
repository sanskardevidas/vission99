import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-premium-ivory">
      <div className="bg-deep-black pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">{title}</h1>
          <p className="mt-3 text-stone-gray font-sans text-sm">Last updated: {updated}</p>
        </div>
      </div>
      <article className="max-w-3xl mx-auto px-6 py-10 md:py-14 font-sans text-charcoal leading-relaxed space-y-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-champagne-gold [&_a]:underline">
        {children}
        <p className="pt-6 text-sm text-muted-gray">
          Questions? Write to <a href="mailto:info@vission99.com">info@vission99.com</a> or go back to the{' '}
          <Link to="/">home page</Link>.
        </p>
      </article>
    </main>
  );
}
