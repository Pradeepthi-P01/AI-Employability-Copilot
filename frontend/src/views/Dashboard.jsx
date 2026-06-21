import { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import RadarChart from '../components/RadarChart';

const Dashboard = ({ 
  studentProfile, 
  setStudentProfile, 
  analysisData, 
  setAnalysisData, 
  targetRole, 
  setTargetRole, 
  triggerAnalysis,
  addLog,
  loading
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    if (!selectedFile.name.endsWith('.pdf')) {
      alert("Only PDF files are supported.");
      return;
    }
    setUploading(true);
    addLog(`[Resume Parser] Initiating upload for ${selectedFile.name}...`);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to upload resume.");
      }

      const data = await response.json();
      setStudentProfile(data);
      addLog(`[Resume Parser] Successfully parsed ${data.name}'s profile.`);
      addLog(`[Resume Parser] Extracted ${data.skills?.length} skills and ${data.experience?.length} job experiences.`);
      
      // Clear previous analysis when a new resume is uploaded
      setAnalysisData(null);
    } catch (err) {
      console.error(err);
      addLog(`[System Error] ${err.message}`);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (!studentProfile) return;
    triggerAnalysis(targetRole);
  };

  // Convert analysis details for Radar Chart
  const getRadarData = () => {
    if (!analysisData) return {};
    const breakdown = analysisData.score_breakdown || {};
    return {
      "Technical": breakdown.technical || 50,
      "Projects": breakdown.projects || 50,
      "Experience": breakdown.experience || 50,
      "Education": breakdown.education || 50,
      "Alignment": Math.round((analysisData.matching_skills?.length / (analysisData.matching_skills?.length + analysisData.missing_skills?.length || 1)) * 100)
    };
  };

  return (
    <div className="dashboard-view">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Student Employability Copilot</h1>
        <p style={{ color: 'var(--text-muted)' }}>Identify gap markers, test code readiness, and optimize career matching using multi-agent intelligence.</p>
      </div>

      {!studentProfile ? (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', boxShadow: '0 0 40px rgba(6, 182, 212, 0.25)' }}>
          <h2 style={{ marginBottom: '16px' }}>Upload Your Resume</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Upload your PDF resume to start parsing skills, experience, and certifications.</p>
          
          <form 
            onDragEnter={handleDrag} 
            onSubmit={(e) => e.preventDefault()}
            className={`dropzone ${dragActive ? "active" : ""}`}
            style={{ minHeight: '200px' }}
          >
            <input 
              type="file" 
              id="input-file-upload" 
              className="file-input" 
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf"
            />
            <label htmlFor="input-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Upload size={48} color="var(--accent-primary)" style={{ marginBottom: '8px' }} />
              <div>
                <p style={{ fontWeight: '600' }}>Drag & Drop your resume here</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dimmed)' }}>or click to browse from files</p>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => document.getElementById('input-file-upload').click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Select PDF File"}
              </button>
            </label>
            {dragActive && <div className="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} style={{ position: 'absolute', width: '100%', height: '100%', top: '0px', left: '0px', borderRadius: '12px' }}></div>}
          </form>
        </div>
      ) : (
        <div>
          {/* Top Section: User Profile & Role Selector */}
          <div className="card grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '26px', marginBottom: '6px' }}>Welcome, {studentProfile.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '14px' }}>{studentProfile.email} | {studentProfile.phone}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-blue" style={{ fontSize: '13px', padding: '6px 12px' }}>Skills Extracted: {studentProfile.skills?.length}</span>
                <span className="badge badge-purple" style={{ fontSize: '13px', padding: '6px 12px' }}>Certs: {studentProfile.certifications?.length}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Target Career Goal</label>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <select 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{ height: '40px', flexGrow: 1, padding: '0 12px' }}
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="ML Engineer">ML Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UX/UI Designer">UX/UI Designer</option>
                  <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
                <button 
                  className="btn" 
                  onClick={handleAnalyzeClick} 
                  disabled={loading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {loading ? "Analyzing..." : "Analyze Profile"}
                </button>
              </div>
              <button className="btn btn-secondary" onClick={() => { setStudentProfile(null); setAnalysisData(null); }} style={{ fontSize: '12px', padding: '6px 12px' }}>
                Upload Different Resume
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h3 style={{ marginBottom: '8px' }}>AI Agents Collating Metrics...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Evaluating technical criteria, skill overlaps, and compiling roadmap assets.</p>
            </div>
          )}

          {!loading && analysisData && (
            <div>
              {/* Gauges and charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                  <h3 className="card-title" style={{ fontSize: '22px', marginBottom: '20px' }}>Employability Score</h3>
                  <ScoreGauge score={analysisData.employability_score} />
                </div>
                
                <div className="card" style={{ margin: 0 }}>
                  <h3 className="card-title" style={{ fontSize: '22px', marginBottom: '20px' }}>Multi-Dimensional Fit Mapping</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px', alignItems: 'center' }}>
                    <RadarChart data={getRadarData()} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ fontSize: '16px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Technical Skills:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{analysisData.score_breakdown?.technical}/100</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px', lineHeight: '1.4' }}>{analysisData.score_rationales?.technical}</p>
                      </div>
                      <div style={{ fontSize: '16px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Portfolio Projects:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{analysisData.score_breakdown?.projects}/100</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px', lineHeight: '1.4' }}>{analysisData.score_rationales?.projects}</p>
                      </div>
                      <div style={{ fontSize: '16px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Experience:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{analysisData.score_breakdown?.experience}/100</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px', lineHeight: '1.4' }}>{analysisData.score_rationales?.experience}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3 className="card-title" style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={20} color="var(--success)" /> Strengths & Competencies</h3>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px' }}>
                    {analysisData.strengths?.map((str, idx) => (
                      <li key={idx} style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>{str}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="card">
                  <h3 className="card-title" style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertTriangle size={20} color="var(--warning)" /> Identified Skill Gaps</h3>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', marginBottom: '20px' }}>
                    {analysisData.weaknesses?.map((weak, idx) => (
                      <li key={idx} style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>{weak}</li>
                    ))}
                  </ul>
                  <h4 style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--text-muted)' }}>Missing Technologies to Learn:</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {analysisData.missing_skills?.map((skill, idx) => (
                      <span key={idx} className="badge badge-purple" style={{ fontSize: '13px', padding: '6px 12px' }}>{skill}</span>
                    ))}
                    {analysisData.missing_skills?.length === 0 && (
                      <span style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--success)' }}>None! You match the benchmark stack.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!loading && !analysisData && (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Ready for gap analysis. Click the <strong>Analyze Profile</strong> button to begin.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
