
import React from 'react';

const Careers: React.FC = () => {
  const jobs = [
    { title: 'Senior Fashion Designer', team: 'Design', location: 'Mumbai, India', type: 'Full-time' },
    { title: 'E-commerce Manager', team: 'Operations', location: 'Remote', type: 'Full-time' },
    { title: 'Graphic Design Intern', team: 'Creative', location: 'Delhi, India', type: 'Internship' },
    { title: 'Customer Experience Associate', team: 'Success', location: 'Bengaluru, India', type: 'Part-time' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 animate-in fade-in duration-700">
      <div className="max-w-3xl mb-20">
        <h1 className="text-5xl font-serif font-bold tracking-tight mb-6">Join the Collective</h1>
        <p className="text-xl text-gray-500 leading-relaxed">
          We’re looking for visionaries, craftsmen, and disruptors. At VOGUE, your work directly impacts the livelihoods of traditional artisans while shaping the future of global fashion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
        <div className="space-y-12">
          <div className="bg-gray-50 p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">The Culture</h3>
            <p className="text-gray-600 leading-relaxed">
              We value curiosity over conformity. Our team is a mix of tech innovators and heritage experts working under one roof. We offer competitive pay, equity, and a 'work-from-anywhere' policy for many roles.
            </p>
          </div>
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1522071823991-b9671f9d7d1f?q=80&w=1000&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
              alt="Team collaborating" 
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-8 border-b pb-4">Open Positions</h3>
          <div className="divide-y divide-gray-100">
            {jobs.map((job, idx) => (
              <div key={idx} className="group py-8 flex justify-between items-center hover:bg-gray-50 px-4 transition-colors cursor-pointer">
                <div>
                  <h4 className="text-lg font-medium group-hover:underline">{job.title}</h4>
                  <div className="flex space-x-4 mt-2 text-xs text-gray-400 uppercase tracking-widest">
                    <span>{job.team}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="text-gray-300 group-hover:text-black transition-colors">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm text-gray-400">
            Don't see a role that fits? Email us at <span className="text-black font-bold">careers@vogue.in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Careers;
