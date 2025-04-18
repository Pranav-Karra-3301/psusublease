import React from 'react';

const roadmap = [
  {
    date: 'April 2025',
    items: [
      'Use AI input to analyze images and make the listing',
      'Maps implementation so that listings are visible on the map',
    ],
  },
  {
    date: 'May 2025',
    items: [
      'Use Claude and Mixtral API to process lease documents for more detail',
      'Forward Facebook groups here',
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-12">
        {/* Timeline (left) */}
        <div className="md:w-1/4 w-full md:sticky md:top-24 flex flex-col items-start">
          <h1 className="text-3xl font-bold mb-8">Roadmap</h1>
          <div className="relative pl-4 border-l-4 border-primary h-full">
            {roadmap.map((entry, idx) => (
              <div key={entry.date} className="mb-12 flex items-center">
                <div className="absolute -left-2 w-4 h-4 bg-primary rounded-full border-4 border-white"></div>
                <div className="ml-4 text-lg font-semibold text-primary">{entry.date}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Descriptions (right) */}
        <div className="md:w-3/4 w-full flex flex-col gap-16">
          {roadmap.map((entry, idx) => (
            <div key={entry.date} id={entry.date.replace(/\s/g, '-').toLowerCase()} className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-primary mb-4">{entry.date}</h2>
              <ul className="list-disc pl-6 space-y-2">
                {entry.items.map((item, i) => (
                  <li key={i} className="text-lg text-text-primary">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 