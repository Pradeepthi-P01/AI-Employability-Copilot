import { useState } from 'react';
import { MessageSquare, Play, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const MockInterview = ({ studentProfile, targetRole, addLog }) => {
  const [session, setSession] = useState(null); // { interview_id, questions }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState([]); // [{ sender: 'recruiter'|'student', text: '', evaluation: null }]
  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [expandedEvaluation, setExpandedEvaluation] = useState({});

  const startInterview = async () => {
    if (!studentProfile) return;
    setStarting(true);
    setMessages([]);
    setCurrentQuestionIndex(0);
    addLog(`[Recruiter Agent] Fetching target profiles and missing skills...`);
    addLog(`[Recruiter Agent] Compiling technical mock questions for ${targetRole}...`);

    try {
      const response = await fetch("http://localhost:8000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentProfile.student_id,
          target_role: targetRole
        })
      });

      if (!response.ok) {
        throw new Error("Failed to start mock interview.");
      }

      const data = await response.ok ? await response.json() : {};
      setSession(data);
      addLog(`[Recruiter Agent] Interview session created. Session ID: ${data.interview_id}`);
      
      // Post the first question in chat
      if (data.questions && data.questions.length > 0) {
        setMessages([
          { 
            sender: 'recruiter', 
            text: `Welcome! I'm your AI recruiter for the ${targetRole} position today. I have generated a series of technical questions based on your profile gaps. Let's begin.\n\nHere is your first question:\n\n"${data.questions[0]}"`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      addLog(`[System Error] ${err.message}`);
      alert(err.message);
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    if (!userAnswer.trim() || submitting || !session) return;
    
    const textToSend = userAnswer.trim();
    setUserAnswer("");
    setSubmitting(true);
    addLog(`[Recruiter Agent] Submitted answer. Analyzing response...`);
    
    // Add user answer to chat history
    setMessages(prev => [...prev, { sender: 'student', text: textToSend }]);
    
    try {
      const response = await fetch("http://localhost:8000/api/interview/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interview_id: session.interview_id,
          question_index: currentQuestionIndex,
          answer: textToSend
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer.");
      }

      const evalData = await response.json();
      addLog(`[Recruiter Agent] Recruiter rated response: ${evalData.rating}/10.`);
      
      // Render evaluation message
      setMessages(prev => [...prev, {
        sender: 'recruiter',
        text: `Got it. Thank you for your response. Let's evaluate your answer.`,
        evaluation: evalData
      }]);

      // Move to next question or complete interview
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < session.questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'recruiter',
            text: `Question ${nextIndex + 1}:\n\n"${session.questions[nextIndex]}"`
          }]);
        }, 1500);
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'recruiter',
            text: `We have completed all technical questions! Thank you for participating. Your final average rating is ${evalData.overall_score}/100. Feel free to start a new mock interview to practice different questions.`
          }]);
          addLog(`[Recruiter Agent] Mock interview session completed successfully. Final score logged.`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      addLog(`[System Error] ${err.message}`);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEvalExpanded = (idx) => {
    setExpandedEvaluation(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!studentProfile) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <MessageSquare size={48} color="var(--text-dimmed)" style={{ marginBottom: '16px' }} />
        <h2>Profile Not Configured</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Please go to the <strong>Dashboard</strong> and upload a resume before starting an interview session.
        </p>
      </div>
    );
  }

  return (
    <div className="interview-view">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Interactive Recruiter Simulator</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Run structured simulated technical interviews targeting your specific profile gaps for the <strong>{targetRole}</strong> role.
        </p>
      </div>

      {!session ? (
        <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
          <MessageSquare size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
          <h2>Ready to Begin?</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
            The Recruiter Agent will read your gaps and generate 4 customized technical questions testing your conceptual and coding capabilities.
          </p>
          <button className="btn" onClick={startInterview} disabled={starting}>
            <Play size={16} /> {starting ? "Preparing rec room..." : "Start Mock Interview"}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ 
            padding: '16px 24px', 
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.01)'
          }}>
            <h3 style={{ fontSize: '15px' }}>Interviewing for: <span style={{ color: 'var(--accent-primary)' }}>{targetRole}</span></h3>
            <span className="badge badge-purple">Question {Math.min(currentQuestionIndex + 1, session.questions.length)} of {session.questions.length}</span>
          </div>

          <div className="chat-container">
            <div className="chat-history">
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div className={`chat-bubble ${msg.sender}`}>
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} style={{ marginBottom: line ? '8px' : '0px' }}>{line}</p>
                    ))}
                  </div>

                  {msg.evaluation && (
                    <div className="card" style={{ 
                      maxWidth: '80%', 
                      alignSelf: 'flex-start', 
                      marginTop: '8px', 
                      padding: '16px', 
                      background: 'rgba(16, 185, 129, 0.02)',
                      borderColor: 'rgba(16, 185, 129, 0.2)'
                    }}>
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => toggleEvalExpanded(idx)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={16} color="var(--success)" />
                          <strong style={{ fontSize: '13px' }}>AI Rating: {msg.evaluation.rating}/10</strong>
                        </div>
                        {expandedEvaluation[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      
                      {expandedEvaluation[idx] && (
                        <div style={{ marginTop: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Critique:</span>
                            <p style={{ color: 'var(--text-main)', marginTop: '2px', lineHeight: '1.4' }}>{msg.evaluation.critique}</p>
                          </div>
                          <div>
                            <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Model Answer:</span>
                            <pre style={{ 
                              background: '#05070c', 
                              padding: '10px', 
                              borderRadius: '4px', 
                              color: 'var(--success)', 
                              whiteSpace: 'pre-wrap', 
                              fontSize: '11px',
                              marginTop: '4px',
                              fontFamily: 'monospace'
                            }}>{msg.evaluation.ideal_answer}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {submitting && (
                <div style={{ alignSelf: 'flex-start', color: 'var(--text-dimmed)', fontSize: '12px', fontStyle: 'italic', paddingLeft: '8px' }}>
                  Recruiter is analyzing your response...
                </div>
              )}
            </div>

            <div className="chat-input-area">
              <textarea 
                className="chat-input" 
                placeholder="Type your technical answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={submitting || currentQuestionIndex >= session.questions.length && messages[messages.length-1]?.sender === 'recruiter' && !messages[messages.length-1]?.evaluation}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                className="btn" 
                onClick={handleSend}
                disabled={submitting || !userAnswer.trim()}
                style={{ width: '48px', height: '48px', padding: 0 }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
