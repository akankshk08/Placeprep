// ============================================================
// Topic Learning API — subtopics, resources, quizzes
// (deep AI notes/explanations live in AI Learning Hub, not here —
// see src/components/sections/AILearningHub.jsx)
// Uses fetchRaw from gemini.js (goes through the same queue + fallback)
// ============================================================
import { fetchRaw } from './gemini';

// Helper — calls Gemini and auto-parses JSON
async function callJSON(prompt) {
  const text = await fetchRaw(prompt);
  // Strip markdown fences if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let raw = (match ? match[1] : text).trim();
  try { return JSON.parse(raw); } catch (_) {}
  // Repair unclosed brackets
  const stack = [];
  let inStr = false, esc = false;
  for (const ch of raw) {
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }
  if (inStr) raw += '"';
  while (stack.length) raw += stack.pop();
  try { return JSON.parse(raw); } catch (_) {}
  throw new Error('Could not parse AI response. Please retry.');
}

// ── 1. Fetch Subtopics for a topic ────────────────────────────
export const fetchSubtopics = (company, topic) =>
  callJSON(`
You are a placement expert for BTech students targeting ${company}.
List all important subtopics under the topic: "${topic}" that a student needs to master for ${company} interviews.
Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "name": "Subtopic Name",
    "description": "One sentence — what this subtopic covers",
    "estimatedTime": "30 min",
    "importance": "High"
  }
]
Include 12-18 subtopics. Be comprehensive — cover all practical sub-areas of "${topic}".
Importance must be one of: "High", "Medium", "Low".
`);

// ── 2. Fetch Learning Resources for a subtopic ────────────────
export const fetchSubtopicResources = (company, topic, subtopic) =>
  callJSON(`
You are a placement expert. Recommend the best learning resources for the subtopic: "${subtopic}" (under topic: "${topic}") for a BTech student targeting ${company}.
Return ONLY valid JSON (no markdown fences):
{
  "officialDocs": [
    { "title": "Documentation title", "url": "https://...", "description": "Why this is useful" }
  ],
  "youtubeVideos": [
    { "title": "Video title", "channel": "Channel name", "url": "https://www.youtube.com/watch?v=VALID_ID", "duration": "20 min", "description": "What you will learn" }
  ],
  "articles": [
    { "title": "Article title", "source": "Site name", "url": "https://...", "description": "Summary" }
  ],
  "githubRepos": [
    { "title": "Repo name", "url": "https://github.com/owner/repo", "stars": "12k", "description": "What it contains" }
  ],
  "cheatSheets": [
    { "title": "Cheat sheet name", "url": "https://...", "description": "What is covered" }
  ],
  "interactiveSites": [
    { "title": "Site name", "url": "https://...", "description": "How to practice here" }
  ]
}
Provide 2-3 items per category. Use real, widely-trusted URLs only.
`);

// ── 3. Generate Quiz for a subtopic ───────────────────────────
export const fetchSubtopicQuiz = (company, topic, subtopic) =>
  callJSON(`
You are a placement interview expert for ${company}. Generate a 15-question quiz for: "${subtopic}" (under topic: "${topic}").
Return ONLY valid JSON (no markdown fences):
{
  "subtopic": "${subtopic}",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this is correct"
    },
    {
      "id": 2,
      "type": "truefalse",
      "question": "Statement to evaluate",
      "correct": true,
      "explanation": "Why true or false"
    },
    {
      "id": 3,
      "type": "fillinblank",
      "question": "The command ___ is used to list files in Linux",
      "correct": "ls",
      "explanation": "Why this is the answer"
    },
    {
      "id": 4,
      "type": "scenario",
      "question": "You are asked to... what do you do?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1,
      "explanation": "Why this is correct in this scenario"
    },
    {
      "id": 5,
      "type": "interview",
      "question": "Explain the difference between X and Y",
      "correct": "Model answer",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "explanation": "What a complete answer should include"
    }
  ]
}
Generate exactly 15 questions: 5 MCQ, 3 True/False, 3 Fill-in-the-Blank, 2 Scenario-based, 2 Interview-style.
Make questions progressively harder. All about "${subtopic}" specifically.
`);
