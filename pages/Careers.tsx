import React, { useState } from 'react';
import { OPEN_POSITIONS } from '../constants';

interface JobApplicationModalProps {
  job: typeof OPEN_POSITIONS[0] | null;
  onClose: () => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    certificates: '',
    cv: null as File | null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Application Submitted:', { ...formData, position: job.title });
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
        <div className="p-8 md:p-12 overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-black hover:text-white transition-all z-20"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          {isSubmitted ? (
            <div className="text-center py-20 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/20 text-white">
                <i className="fa-solid fa-check text-3xl"></i>
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4">Application Received</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
                Our team will review your application for the <span className="text-black font-bold">{job.title}</span> position and get back to you soon.
              </p>
              <button
                onClick={onClose}
                className="mt-12 bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all"
              >
                Return to Careers
              </button>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-zinc-400 uppercase">Apply for</h3>
                <h4 className="text-4xl font-serif font-bold tracking-tight leading-none text-black">{job.title}</h4>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-zinc-50 border-none px-6 py-4 rounded-xl focus:ring-1 focus:ring-black transition-all outline-none text-sm font-medium"
                      placeholder="e.g. Sebastian Vael"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-50 border-none px-6 py-4 rounded-xl focus:ring-1 focus:ring-black transition-all outline-none text-sm font-medium"
                      placeholder="identity@collective.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-zinc-50 border-none px-6 py-4 rounded-xl focus:ring-1 focus:ring-black transition-all outline-none text-sm font-medium"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Education Details</label>
                    <input
                      required
                      type="text"
                      value={formData.education}
                      onChange={e => setFormData({ ...formData, education: e.target.value })}
                      className="w-full bg-zinc-50 border-none px-6 py-4 rounded-xl focus:ring-1 focus:ring-black transition-all outline-none text-sm font-medium"
                      placeholder="e.g. B.Des in Fashion"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Additional Certificates (Optional)</label>
                  <input
                    type="text"
                    value={formData.certificates}
                    onChange={e => setFormData({ ...formData, certificates: e.target.value })}
                    className="w-full bg-zinc-50 border-none px-6 py-4 rounded-xl focus:ring-1 focus:ring-black transition-all outline-none text-sm font-medium"
                    placeholder="e.g. Adobe Certified Expert"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">CV / Portfolio (PDF)</label>
                  <div className="relative group">
                    <input
                      required
                      type="file"
                      accept=".pdf"
                      onChange={e => setFormData({ ...formData, cv: e.target.files?.[0] || null })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border border-dashed border-zinc-200 group-hover:border-black transition-all rounded-2xl p-8 text-center flex flex-col items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-all">
                        <i className={`fa-solid ${formData.cv ? 'fa-file-pdf text-emerald-500' : 'fa-cloud-arrow-up'}`}></i>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-black">
                        {formData.cv ? formData.cv.name : 'Click to Upload Portfolio'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all shadow-xl active:scale-[0.98]"
                >
                  Submit Application
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Careers: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<typeof OPEN_POSITIONS[0] | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 animate-in fade-in duration-700">
      <div className="max-w-3xl mb-20 text-center mx-auto md:text-left md:mx-0">
        <h1 className="text-6xl font-serif font-black tracking-tighter mb-8 leading-none">THE COLLECTIVE <br /><span className="text-zinc-300">FUTURE.</span></h1>
        <p className="text-xl text-gray-400 font-light leading-relaxed max-w-2xl">
          We’re looking for visionaries, craftsmen, and disruptors. At GS Garments, your work directly impacts the livelihoods of traditional artisans while shaping the future of global fashion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mb-32 items-start">
        <div className="space-y-16">
          <div className="bg-zinc-50 border border-zinc-100 p-12 rounded-3xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-black">The Culture Ecosystem</h3>
            <p className="text-gray-500 leading-relaxed font-serif italic text-lg mb-8">
              "We value curiosity over conformity. Our team is a mix of tech innovators and heritage experts working under one roof."
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We offer competitive compensation, equity participation, and a 'curate-from-anywhere' policy for many roles. We believe in the precision of craft and the fluidity of modern work.
            </p>
          </div>
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-3xl shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
              alt="Team collaborating"
            />
          </div>
        </div>

        <div className="space-y-16">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-zinc-400 flex items-center gap-4">
              OPEN VOLUMES <span className="w-12 h-[1px] bg-zinc-200"></span>
            </h3>
            <div className="divide-y divide-zinc-100">
              {OPEN_POSITIONS.map((job, idx) => (
                <div
                  key={idx}
                  className="group py-10 border-b border-zinc-100 last:border-none transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-serif font-bold tracking-tight text-zinc-800 group-hover:text-black transition-colors">{job.title}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                        <span className="bg-zinc-50 px-2 py-1">{job.team}</span>
                        <span className="flex items-center">•</span>
                        <span className="text-zinc-500">{job.location}</span>
                        {job.salary && (
                          <>
                            <span className="flex items-center">•</span>
                            <span className="text-emerald-600 font-bold">{job.salary}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-500 flex-shrink-0"
                    >
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </button>
                  </div>

                  {job.responsibilities && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start gap-3 text-[11px] text-zinc-500 leading-relaxed font-light">
                          <span className="w-1 h-1 rounded-full bg-zinc-200 mt-1.5 shrink-0"></span>
                          {resp}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <JobApplicationModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
};

export default Careers;
