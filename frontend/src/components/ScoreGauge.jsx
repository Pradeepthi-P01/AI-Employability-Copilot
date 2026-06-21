import { useEffect, useState } from 'react';

const ScoreGauge = ({ score }) => {
  const [currentScore, setCurrentScore] = useState(0);
  
  useEffect(() => {
    const end = parseInt(score) || 0;
    if (end === 0) {
      setTimeout(() => setCurrentScore(0), 0);
      return;
    }
    
    let start = 0;
    const duration = 1000; // 1 second animation
    const stepTime = Math.abs(Math.floor(duration / end));
    
    const timer = setInterval(() => {
      start += 1;
      setCurrentScore(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [score]);

  // SVG calculations for radial progress
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="score-gauge-container">
      <svg className="gauge-svg" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle 
          className="gauge-bg"
          cx="80" 
          cy="80" 
          r={radius} 
          strokeWidth={strokeWidth}
        />
        
        {/* Fill circle */}
        <circle 
          className="gauge-fill"
          cx="80" 
          cy="80" 
          r={radius} 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      
      {/* Centered Score text */}
      <div className="gauge-text">
        <span className="gauge-number">{currentScore}</span>
        <span className="gauge-label">Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
