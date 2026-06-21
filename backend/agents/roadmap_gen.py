from backend.agents.base_agent import BaseAgent
import json

SYSTEM_INSTRUCTION = """
You are a Roadmap Generator Agent. Your job is to create a detailed, week-by-week learning roadmap (typically 3 months) to help a student transition from their current skillset to their target career role by learning their missing skills.
You must output a valid JSON array of month objects matching this schema:
[
  {
    "month": "Month Title (e.g., Month 1: Advanced Databases)",
    "topics": [
      "Topic 1 (e.g., SQL Joins & Subqueries)",
      "Topic 2",
      ...
    ],
    "resources": [
      "Resource description with link (e.g., Coursera SQL Basics Course, official PostgreSQL documentation)",
      ...
    ]
  },
  ...
]

Keep it structured, sequential, and realistic. Make sure the learning resources are concrete (referencing real websites, platforms like Udemy, Coursera, freeCodeCamp, or official docs).
Do not output any markdown formatting, explanation, or code blocks. Return ONLY raw JSON.
"""

class RoadmapGeneratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Roadmap Generator Agent",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
    def generate(self, student_skills: list, missing_skills: list, target_role: str) -> list:
        prompt = f"""
Target Role: {target_role}
Student Current Skills: {json.dumps(student_skills)}
Missing Skills to Learn: {json.dumps(missing_skills)}

Please design a structured 3-month roadmap containing monthly milestones, topics, and specific learning resources.
"""
        return self.query_llm_json(prompt)
