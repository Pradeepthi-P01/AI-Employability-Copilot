from backend.agents.base_agent import BaseAgent
import json

SYSTEM_INSTRUCTION = """
You are an Employability Scoring Agent. Your task is to calculate a student's career readiness score (0-100) for a target role.
The scoring must be divided into four dimensions:
1. Technical Skills (40% weight): Depth and breadth of relevant tech stack.
2. Experience (25% weight): Internships, hands-on roles, work history.
3. Project Experience (20% weight): Portfolio projects, practical coding achievements.
4. Education & Credentials (15% weight): Degree relevance, courses, certifications.

You must output a valid JSON object matching this schema:
{
  "breakdown": {
    "technical": 80,  -- Score from 0 to 100
    "experience": 60,  -- Score from 0 to 100
    "projects": 75,   -- Score from 0 to 100
    "education": 70   -- Score from 0 to 100
  },
  "rationales": {
    "technical": "Brief explanation for the technical score...",
    "experience": "Brief explanation for the experience score...",
    "projects": "Brief explanation for the project score...",
    "education": "Brief explanation for the education score..."
  }
}

Be realistic. A freshman student with no internships should get a low experience score but could have a high technical or project score.
Do not output any markdown formatting, explanation, or code blocks. Return ONLY raw JSON.
"""

class EmployabilityScoringAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Employability Scoring Agent",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
    def calculate(self, student_profile: dict, target_role: str, gap_analysis: dict) -> dict:
        prompt = f"""
Target Role: {target_role}

Student Profile:
- Current Skills: {json.dumps(student_profile.get("skills", []))}
- Experience: {json.dumps(student_profile.get("experience", []))}
- Education: {json.dumps(student_profile.get("education", []))}
- Certifications: {json.dumps(student_profile.get("certifications", []))}

Gap Analysis Results:
- Matching Skills: {json.dumps(gap_analysis.get("matching_skills", []))}
- Missing Skills: {json.dumps(gap_analysis.get("missing_skills", []))}
- Strengths: {json.dumps(gap_analysis.get("strengths", []))}
- Weaknesses: {json.dumps(gap_analysis.get("weaknesses", []))}

Please evaluate the scores and rationales, then return the JSON response.
"""
        result = self.query_llm_json(prompt)
        
        # Calculate overall weighted score
        breakdown = result.get("breakdown", {})
        tech = breakdown.get("technical", 0)
        exp = breakdown.get("experience", 0)
        proj = breakdown.get("projects", 0)
        edu = breakdown.get("education", 0)
        
        overall_score = round(tech * 0.40 + exp * 0.25 + proj * 0.20 + edu * 0.15)
        result["overall_score"] = overall_score
        
        return result
