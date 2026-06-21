import { useState } from 'react';
import { Layers, ChevronRight, X, ListTodo, Wrench } from 'lucide-react';

const Projects = ({ analysisData }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  if (!analysisData || !analysisData.projects) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <Layers size={48} color="var(--text-dimmed)" style={{ marginBottom: '16px' }} />
        <h2>No Recommended Projects</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Please go to the <strong>Dashboard</strong>, upload a resume, and run the profile analysis first.
        </p>
      </div>
    );
  }

  return (
    <div className="projects-view">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Tailored Portfolio Projects</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
          Portfolio plans custom designed by the Project Agent to merge your current expertise with missing tech stacks.
        </p>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {analysisData.projects.map((proj, idx) => (
          <div key={idx} className="card job-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span className={`badge ${
                  proj.difficulty === 'Beginner' ? 'badge-success' : 
                  proj.difficulty === 'Intermediate' ? 'badge-blue' : 'badge-warning'
                }`} style={{ fontSize: '13px', padding: '4px 10px' }}>
                  {proj.difficulty}
                </span>
              </div>
              <h3 style={{ fontSize: '22px', marginBottom: '10px', fontWeight: '700' }}>{proj.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                {proj.description?.substring(0, 160)}...
              </p>
            </div>
            
            <div>
              <div style={{ marginBottom: '20px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-dimmed)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Tech Stack:</strong>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {proj.tech_stack?.map((tech, tIdx) => (
                    <span key={tIdx} className="badge" style={{ fontSize: '12px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px' }}>{tech}</span>
                  ))}
                </div>
              </div>
              
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '14px', height: '40px' }}
                onClick={() => setSelectedProject(proj)}
              >
                Explore Blueprint <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Backdrop and Content */}
      {selectedProject && (
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
            maxWidth: '700px', 
            width: '100%', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            position: 'relative',
            border: '1px solid var(--accent-primary)',
            boxShadow: '0 0 32px rgba(6, 182, 212, 0.25)',
            padding: '36px'
          }}>
            <button 
              onClick={() => setSelectedProject(null)}
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
            
            <h2 style={{ fontSize: '26px', marginBottom: '8px', paddingRight: '32px', fontWeight: '700' }}>{selectedProject.title}</h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <span className="badge badge-blue" style={{ fontSize: '13px', padding: '4px 10px' }}>{selectedProject.difficulty}</span>
              <span className="badge badge-purple" style={{ fontSize: '13px', padding: '4px 10px' }}>Portfolio Ready</span>
            </div>
            
            <p style={{ color: 'var(--text-main)', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              {selectedProject.description}
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Wrench size={18} color="var(--accent-primary)" /> Technology Stack
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedProject.tech_stack?.map((tech, idx) => (
                  <span key={idx} className="badge badge-blue" style={{ fontSize: '13px', padding: '6px 12px' }}>{tech}</span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <ListTodo size={18} color="var(--success)" /> Week-by-Week Construction Blueprint
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedProject.steps?.map((step, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ 
                      fontWeight: '800', 
                      color: 'var(--accent-primary)',
                      fontSize: '16px',
                      lineHeight: '1'
                    }}>
                      0{idx + 1}
                    </span>
                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
