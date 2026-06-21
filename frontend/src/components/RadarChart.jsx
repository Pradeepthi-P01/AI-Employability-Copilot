

const RadarChart = ({ data }) => {
  // We expect data to be an object with keys: values. Example:
  // { "Technical": 75, "Projects": 80, "Experience": 40, "Academic": 85, "Role Match": 70 }
  
  const skills = Object.keys(data);
  const values = Object.values(data);
  const N = skills.length;
  
  if (N === 0) {
    return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;
  }
  
  const width = 360;
  const height = 360;
  const cx = width / 2;
  const cy = height / 2;
  const r = 115; // Max radius
  
  // Calculate coordinates for a given value (0-100) at axis index i
  const getCoordinates = (i, value) => {
    const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
    const x = cx + (r * (value / 100)) * Math.cos(angle);
    const y = cy + (r * (value / 100)) * Math.sin(angle);
    return { x, y };
  };
  
  // Generate background circles/concentric polygons
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map(level => {
    const points = [];
    for (let i = 0; i < N; i++) {
      const { x, y } = getCoordinates(i, level);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  });
  
  // Generate student score polygon path
  const scorePoints = [];
  for (let i = 0; i < N; i++) {
    const val = values[i] || 0;
    const { x, y } = getCoordinates(i, val);
    scorePoints.push(`${x},${y}`);
  }
  const scorePath = scorePoints.join(' ');
  
  // Generate label coordinates
  const labels = skills.map((skill, i) => {
    // Offset the text slightly outward
    const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
    const offsetR = r + 24;
    const x = cx + offsetR * Math.cos(angle);
    const y = cy + offsetR * Math.sin(angle);
    
    // Anchor alignment adjustments
    let textAnchor = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    if (Math.cos(angle) < -0.1) textAnchor = 'end';
    
    return { name: skill, x, y, textAnchor };
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <svg width={width} height={height}>
        {/* Concentric grid lines */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        ))}
        
        {/* Axis lines */}
        {Array.from({ length: N }).map((_, i) => {
          const outer = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Student Data polygon */}
        <polygon
          points={scorePath}
          fill="rgba(6, 182, 212, 0.2)"
          stroke="#06b6d4"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))' }}
        />
        
        {/* Data points */}
        {scorePoints.map((pt, idx) => {
          const [x, y] = pt.split(',').map(Number);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="4"
              fill="#14b8a6"
              stroke="#fff"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Labels */}
        {labels.map((lbl, idx) => (
          <text
            key={idx}
            x={lbl.x}
            y={lbl.y}
            textAnchor={lbl.textAnchor}
            fill="var(--text-muted)"
            fontSize="13px"
            fontWeight="600"
            fontFamily="inherit"
            dy="4px"
          >
            {lbl.name}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default RadarChart;
