import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 lowercase">about the developer</h1>
        <div className="mb-6 text-lg text-text-primary lowercase">
          hey, i'm pranav karra. <br />
          <div className="flex flex-wrap gap-4 mt-2 mb-4">
            <a href="https://pranavkarra.me/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">website</a>
            <a href="https://www.linkedin.com/in/pranav-karra-09477228b/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">linkedin</a>
            <a href="https://github.com/Pranav-Karra-3301" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">github</a>
          </div>
          i was trying to find subleases for summer but everything was just in snapchat or facebook groups and was scattered all over, so i thought, why not make an aggregator? so i did.
        </div>
      </div>
    </div>
  );
} 