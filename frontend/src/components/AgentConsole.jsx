import { useEffect, useRef } from 'react';

const AgentConsole = ({ logs = [] }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Auto-scroll to bottom of logs
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  // Style logs dynamically based on content keywords
  const formatLog = (log) => {
    if (log.includes('[Resume Parser]')) {
      return <span className="log-entry agent">{log}</span>;
    } else if (log.includes('[Scoring Agent]') || log.includes('[Gap Analyzer]')) {
      return <span className="log-entry info">{log}</span>;
    } else if (log.includes('[Roadmap Agent]') || log.includes('[Project Agent]')) {
      return <span className="log-entry success">{log}</span>;
    }
    return <span className="log-entry">{log}</span>;
  };

  return (
    <div className="agent-console">
      <div className="agent-console-header">
        <span>AI Copilot Logs</span>
        <span style={{ fontSize: '9px', color: 'var(--success)' }}>● ONLINE</span>
      </div>
      <div className="agent-logs" ref={containerRef}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-dimmed)', fontStyle: 'italic' }}>
            Awaiting user action...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="log-line" style={{ display: 'flex', gap: '4px' }}>
              <span style={{ color: 'var(--text-dimmed)' }}>&gt;</span>
              {formatLog(log)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentConsole;
