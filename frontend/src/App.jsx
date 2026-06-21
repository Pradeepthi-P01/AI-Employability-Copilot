import { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  FolderGit2, 
  MessageSquare, 
  Briefcase 
} from 'lucide-react';

// Views
import Dashboard from './views/Dashboard';
import Roadmap from './views/Roadmap';
import Projects from './views/Projects';
import MockInterview from './views/MockInterview';
import JobBoard from './views/JobBoard';

// Components
import ParticleCanvas from './components/ParticleCanvas';

import './App.css'; // Will be empty, but good to preserve imports

const API_BASE = window.location.port === '5173' ? 'http://localhost:8000' : '';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentProfile, setStudentProfile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const triggerAnalysis = async (selectedRole) => {
    if (!studentProfile) return;
    setLoading(false);
    setLoading(true);
    addLog(`[Gap Analyzer] Starting skills audit targeting: ${selectedRole}...`);
    addLog(`[Gap Analyzer] Comparing current skills with standard benchmark profiles...`);
    
    try {
      const response = await fetch(`${API_BASE}/api/analyze-gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentProfile.student_id,
          target_role: selectedRole
        })
      });

      if (!response.ok) {
        throw new Error("Analysis request failed.");
      }

      const data = await response.json();
      setAnalysisData(data);
      addLog(`[Scoring Agent] Calculated Employability Score: ${data.employability_score}/100.`);
      addLog(`[Scoring Agent] breakdown: Tech: ${data.score_breakdown?.technical}, Exp: ${data.score_breakdown?.experience}, Proj: ${data.score_breakdown?.projects}`);
      addLog(`[Roadmap Agent] Compiled 3-Month transition learning timeline.`);
      addLog(`[Project Agent] Formulated ${data.projects?.length} custom coding portfolios.`);
    } catch (err) {
      console.error(err);
      addLog(`[System Error] ${err.message}`);
      alert("Failed to analyze profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            studentProfile={studentProfile}
            setStudentProfile={setStudentProfile}
            analysisData={analysisData}
            setAnalysisData={setAnalysisData}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            triggerAnalysis={triggerAnalysis}
            addLog={addLog}
            loading={loading}
          />
        );
      case 'roadmap':
        return <Roadmap analysisData={analysisData} />;
      case 'projects':
        return <Projects analysisData={analysisData} />;
      case 'interview':
        return (
          <MockInterview 
            studentProfile={studentProfile} 
            targetRole={targetRole} 
            addLog={addLog} 
          />
        );
      case 'jobs':
        return <JobBoard studentProfile={studentProfile} addLog={addLog} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.svg" alt="CareerCopilot Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span className="logo-text" style={{ fontSize: '20px' }}>Career Copilot</span>
          </div>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
            disabled={!studentProfile || !analysisData}
            style={{ opacity: (!studentProfile || !analysisData) ? 0.5 : 1, cursor: (!studentProfile || !analysisData) ? 'not-allowed' : 'pointer' }}
          >
            Skill Roadmap
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
            disabled={!studentProfile || !analysisData}
            style={{ opacity: (!studentProfile || !analysisData) ? 0.5 : 1, cursor: (!studentProfile || !analysisData) ? 'not-allowed' : 'pointer' }}
          >
            Recommended Projects
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveTab('interview')}
            disabled={!studentProfile}
            style={{ opacity: !studentProfile ? 0.5 : 1, cursor: !studentProfile ? 'not-allowed' : 'pointer' }}
          >
            Mock Interview
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
            disabled={!studentProfile}
            style={{ opacity: !studentProfile ? 0.5 : 1, cursor: !studentProfile ? 'not-allowed' : 'pointer' }}
          >
            Matched Jobs
          </button>
        </div>
      </div>
      
      {/* Main Panel Content */}
      <div className="main-content">
        {/* Floating particles layer */}
        <ParticleCanvas />
        {/* Soft brand accent glows positioned behind main cards */}
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
        <div className="bg-glow bg-glow-3"></div>
        {renderActiveView()}
      </div>
    </div>
  );
}

export default App;
