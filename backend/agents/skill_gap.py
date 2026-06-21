from backend.agents.base_agent import BaseAgent
from backend.config import ROLE_BENCHMARKS
import json

SYSTEM_INSTRUCTION = """
You are a Skill Gap Analyzer Agent. Your task is to compare a student's resume profile against the benchmark requirements of their target career role.
Perform a smart semantic alignment: if a student lists "FastAPI" and the role requires "REST APIs", recognize them as a match.
You must output a valid JSON object with the following schema:
{
  "matching_skills": ["Skill 1", "Skill 2", ...],
  "missing_skills": ["Missing Skill 1", "Missing Skill 2", ...],
  "strengths": ["Strength 1", "Strength 2", ...],
  "weaknesses": ["Weakness 1", "Weakness 2", ...]
}

Be objective, helpful, and highly accurate. Focus on technical skills, tools, and methodologies.
Do not output any markdown formatting, explanation, or code blocks. Return ONLY raw JSON.
"""

class SkillGapAnalyzerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Skill Gap Analyzer Agent",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
    def analyze(self, student_profile: dict, target_role: str) -> dict:
        benchmark = ROLE_BENCHMARKS.get(target_role, {
            "technical_skills": [],
            "core_requirements": "General Software Engineering skills"
        })
        
        prompt = f"""
Target Role: {target_role}
Role Required Skills: {json.dumps(benchmark["technical_skills"])}
Role Description: {benchmark["core_requirements"]}

Student Profile:
- Skills: {json.dumps(student_profile.get("skills", []))}
- Experience: {json.dumps(student_profile.get("experience", []))}
- Education: {json.dumps(student_profile.get("education", []))}
- Certifications: {json.dumps(student_profile.get("certifications", []))}

Please perform the skill gap analysis and return the output matching the schema.
"""
        return self.query_llm_json(prompt)
