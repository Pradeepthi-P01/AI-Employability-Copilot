import { useEffect, useState, useCallback } from 'react';
import { Briefcase, Check, AlertTriangle, ExternalLink, X } from 'lucide-react';

const JobBoard = ({ studentProfile, addLog }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [applyJob, setApplyJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    addLog(`[Job Matching Agent] Fetching jobs matching user's active profile...`);
    try {
      const response = await fetch(`http://localhost:8000/api/jobs?student_id=${studentProfile.student_id}`);
      if (!response.ok) {
        throw new Error("Failed to match jobs.");
      }
      const data = await response.json();
      setJobs(data);
      addLog(`[Job Matching Agent] Matched ${data.length} potential career tracks.`);
    } catch (err) {
      console.error(err);
      addLog(`[System Error] ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [studentProfile, addLog]);

  useEffect(() => {
    if (studentProfile) {
      const timer = setTimeout(() => {
        fetchJobs();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [studentProfile, fetchJobs]);

  if (!studentProfile) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <Briefcase size={48} color="var(--text-dimmed)" style={{ marginBottom: '16px' }} />
        <h2>Profile Not Configured</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Please go to the <strong>Dashboard</strong> and upload a resume before browsing career listings.
        </p>
      </div>
    );
  }

  // Client-side filtering logic
  const filteredJobs = jobs.filter(job => {
    // 1. Filter Location
    if (locationFilter !== 'All') {
      const loc = job.location.toLowerCase();
      if (locationFilter === 'Remote' && !loc.includes('remote')) return false;
      if (locationFilter === 'Hybrid' && !loc.includes('hybrid')) return false;
      if (locationFilter === 'On-site' && (loc.includes('remote') || loc.includes('hybrid'))) return false;
    }
    // 2. Filter Type
    if (typeFilter !== 'All') {
      if (job.job_type !== typeFilter) return false;
    }
    return true;
  });

  const handleApplyClick = (job) => {
    addLog(`[System] Opening application options for ${job.title} at ${job.company}...`);
    setApplyJob(job);
  };

  return (
    <div className="job-board-view">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Matched Internships & Positions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
          Aligning your current parsed skills with our simulated database of job listings. Rank calculated by the Matching Agent.
        </p>
      </div>

      {/* Filter Options */}
      <div className="card" style={{ 
        display: 'flex', 
        gap: '24px', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        padding: '20px 28px', 
        marginBottom: '24px',
        borderRadius: '10px'
      }}>
        <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '16px' }}>Filter Results:</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '500' }}>Location Type:</label>
          <select 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ 
              height: '38px', 
              padding: '0 12px', 
              fontSize: '14px', 
              width: '150px',
              backgroundColor: '#0b0f19',
              color: 'var(--text-main)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px'
            }}
          >
            <option value="All">All Locations</option>
            <option value="Remote">Remote Only</option>
            <option value="Hybrid">Hybrid Only</option>
            <option value="On-site">On-site Only</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '500' }}>Position Type:</label>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ 
              height: '38px', 
              padding: '0 12px', 
              fontSize: '14px', 
              width: '160px',
              backgroundColor: '#0b0f19',
              color: 'var(--text-main)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px'
            }}
          >
            <option value="All">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
        
        {filteredJobs.length !== jobs.length && (
          <span style={{ fontSize: '14px', color: 'var(--accent-primary)', fontWeight: '500' }}>
            Showing {filteredJobs.length} of {jobs.length} matches
          </span>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Querying database parameters and evaluating fit indexes...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredJobs.map((job) => (
            <div key={job.id} className="card grid-3" style={{ alignItems: 'flex-start', padding: '28px' }}>
              
              {/* Job Details Column */}
              <div style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '22px', marginBottom: '8px', fontWeight: '700' }}>{job.title}</h3>
                <p style={{ fontWeight: '600', color: 'var(--accent-primary)', fontSize: '16px', marginBottom: '12px' }}>
                  {job.company} — <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>{job.location}</span>
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span className="badge" style={{ fontSize: '13px', padding: '4px 10px' }}>{job.experience_level}</span>
                  <span className="badge badge-blue" style={{ fontSize: '13px', padding: '4px 10px' }}>{job.job_type}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
                  {job.description}
                </p>
              </div>

              {/* Match Fit Analysis Column */}
              <div style={{ 
                borderLeft: '1px solid rgba(255,255,255,0.08)', 
                paddingLeft: '28px', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                justifyContent: 'space-between',
                width: '100%'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Match Alignment</span>
                    <span className="job-match-badge" style={{ fontSize: '18px', fontWeight: '800' }}>{job.match_percentage}% Fit</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {job.matching_skills?.length > 0 && (
                      <div>
                        <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Check size={14} /> Matching Skills
                        </span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {job.matching_skills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="badge badge-success" style={{ fontSize: '12px', padding: '4px 10px' }}>{skill}</span>
                          ))}
                          {job.matching_skills.length > 4 && <span className="badge" style={{ fontSize: '12px', padding: '4px 8px' }}>+{job.matching_skills.length - 4}</span>}
                        </div>
                      </div>
                    )}
                    
                    {job.missing_skills?.length > 0 && (
                      <div>
                        <span style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <AlertTriangle size={14} /> Missing Skills
                        </span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {job.missing_skills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="badge badge-warning" style={{ fontSize: '12px', padding: '4px 10px' }}>{skill}</span>
                          ))}
                          {job.missing_skills.length > 4 && <span className="badge" style={{ fontSize: '12px', padding: '4px 8px' }}>+{job.missing_skills.length - 4}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn" 
                  style={{ width: '100%', fontSize: '14px', height: '42px', marginTop: '16px' }}
                  onClick={() => handleApplyClick(job)}
                >
                  Apply Now <ExternalLink size={16} />
                </button>
              </div>

            </div>
          ))}
          {filteredJobs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>No suitable jobs matched the current filters. Try relaxing your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Apply Options Modal */}
      {applyJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ 
            maxWidth: '500px', 
            width: '100%', 
            position: 'relative',
            border: '1px solid var(--accent-primary)',
            boxShadow: '0 0 32px rgba(6, 182, 212, 0.25)',
            padding: '36px',
            textAlign: 'center'
          }}>
            <button 
              onClick={() => setApplyJob(null)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={24} />
            </button>

            <Briefcase size={40} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', marginBottom: '8px', fontWeight: '700' }}>Apply for Position</h2>
            <p style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{applyJob.title}</p>
            <p style={{ color: 'var(--accent-primary)', fontSize: '15px', marginBottom: '24px' }}>{applyJob.company} — {applyJob.location}</p>

            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.4' }}>
              Search and apply for this role on your preferred job search engine or professional platform:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn" 
                style={{ width: '100%', fontSize: '15px', height: '44px' }}
                onClick={() => {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(applyJob.company + " " + applyJob.title + " career apply")}`, "_blank");
                  setApplyJob(null);
                }}
              >
                Apply via Google Jobs Aggregator <ExternalLink size={16} />
              </button>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '15px', height: '44px', border: '1px solid #0077B5', color: '#0077B5', background: 'rgba(0, 119, 181, 0.05)' }}
                onClick={() => {
                  window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(applyJob.title + " " + applyJob.company)}`, "_blank");
                  setApplyJob(null);
                }}
              >
                Search on LinkedIn <ExternalLink size={16} />
              </button>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '15px', height: '44px', border: '1px solid #FF6F00', color: '#FF6F00', background: 'rgba(255, 111, 0, 0.05)' }}
                onClick={() => {
                  window.open(`https://www.indeed.com/jobs?q=${encodeURIComponent(applyJob.title + " " + applyJob.company)}`, "_blank");
                  setApplyJob(null);
                }}
              >
                Search on Indeed <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
