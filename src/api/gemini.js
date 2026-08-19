// ============================================================
// Gemini API Client — direct REST fetch
// Key format: AQ.xxx used as ?key= query parameter (NOT Bearer)
// ============================================================

const BASE = 'https://generativelanguage.googleapis.com';

// ── API Key management ────────────────────────────────────────
export const getApiKey = () =>
  localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';

export const hasApiKey = () => Boolean(getApiKey());
export const saveApiKey = (key) => localStorage.setItem('gemini_api_key', key.trim());
export const clearSavedKey = () => localStorage.removeItem('gemini_api_key');

// ── Models in priority order (confirmed available) ────────────
// gemini-3.5-flash is real and available for this key
const MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
];

// ── Core REST caller (query key only — Bearer does NOT work) ──
async function callModel(model, prompt, apiKey) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 8192, temperature: 0.3 },
  });

  // Try v1beta then v1 with query key
  for (const version of ['v1beta', 'v1']) {
    try {
      const res = await fetch(
        `${BASE}/${version}/models/${model}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
      if (res.status === 429) {
        // Rate limited — wait and retry once
        console.warn(`429 on ${model}/${version}, waiting 3s…`);
        await new Promise(r => setTimeout(r, 3000));
        const retry = await fetch(
          `${BASE}/${version}/models/${model}:generateContent?key=${apiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
        );
        if (retry.ok) {
          const d = await retry.json();
          const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (t) return t;
        }
        if (retry.status === 429) throw Object.assign(new Error('RATE_LIMITED'), { status: 429 });
      }
      if (res.status === 404) throw Object.assign(new Error('MODEL_NOT_FOUND'), { status: 404 });
    } catch (e) {
      if (e.status === 429 || e.status === 404) throw e;
    }
  }
  throw Object.assign(new Error('FAILED'), { status: 500 });
}

// ── Test a key ────────────────────────────────────────────────
export const testApiKey = async (key) => {
  if (!key?.trim()) return { ok: false, error: 'No key provided.' };
  for (const model of MODELS.slice(0, 3)) {
    try {
      const text = await callModel(model, 'Say "ok".', key.trim());
      if (text) return { ok: true, model };
    } catch (e) {
      if (e.status === 429) return { ok: true, model, warning: 'Rate limited — key valid, wait a moment' };
      if (e.status === 404) continue;
    }
  }
  return { ok: false, error: 'Could not connect. Check your key or wait a minute for rate limit to reset.' };
};

// ── Request Queue — 600ms gap prevents 429 bursts ────────────
let _queue = Promise.resolve();
const enqueue = (fn) => {
  _queue = _queue.then(() => new Promise(res => setTimeout(res, 600))).then(fn);
  return _queue;
};

// ── Main caller with model fallback ──────────────────────────
async function callWithFallback(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_API_KEY');

  let lastError;
  for (const model of MODELS) {
    try {
      console.log(`Trying ${model}…`);
      const text = await callModel(model, prompt, apiKey);
      console.log(`✅ ${model} succeeded`);
      return text;
    } catch (e) {
      lastError = e;
      if (e.status === 429) {
        console.warn(`Still rate limited on ${model}, waiting 5s…`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      if (e.status === 404) {
        console.warn(`${model} not found, trying next…`);
        continue;
      }
      continue;
    }
  }
  throw lastError || new Error('All models failed. Please check your API key.');
}

// ── Repair + parse truncated JSON ────────────────────────────
const repairJSON = (raw) => {
  // Close any unclosed strings, arrays, objects
  let result = raw;
  // Remove trailing comma before attempting repair
  result = result.replace(/,\s*$/, '');

  // Count open brackets and braces
  let inString = false;
  let escape = false;
  const stack = [];
  for (let i = 0; i < result.length; i++) {
    const ch = result[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"' && !escape) { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }

  // If we're inside an unclosed string, close it
  if (inString) result += '"';

  // Close any open brackets/braces in reverse order
  while (stack.length) result += stack.pop();

  return result;
};

const safeParseJSON = (text) => {
  // Extract from code fences if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let raw = match ? match[1] : text;
  raw = raw.trim();

  // Direct parse first
  try { return JSON.parse(raw); } catch (_) {}

  // Repair and try again
  try { return JSON.parse(repairJSON(raw)); } catch (_) {}

  // Last resort: find the last complete top-level object by scanning backwards
  const lastBrace = raw.lastIndexOf('}');
  if (lastBrace > 0) {
    try { return JSON.parse(raw.slice(0, lastBrace + 1)); } catch (_) {}
  }

  throw new Error('Could not parse AI response as JSON. Please retry.');
};

// ── Prompts ───────────────────────────────────────────────────
const prompts = {
  overview: (company) => `
You are a placement expert for BTech students. Provide a detailed company overview for ${company}.
Return ONLY valid JSON:
{
  "name": "${company}",
  "fullName": "full official company name",
  "founded": "year",
  "headquarters": "city, country",
  "ceo": "current CEO name",
  "employees": "approx number",
  "revenue": "annual revenue",
  "marketCap": "market cap",
  "industry": "industry sector",
  "stockSymbol": "ticker or N/A",
  "description": "2-3 sentence company description for a student",
  "mission": "company mission statement",
  "cultureHighlights": ["highlight1", "highlight2", "highlight3", "highlight4"],
  "techStack": ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"],
  "officeLocations": ["City1", "City2", "City3"],
  "recentNews": ["news item 1", "news item 2", "news item 3"],
  "whyJoin": ["reason1", "reason2", "reason3"],
  "glassdoorRating": "X.X/5",
  "avgPackageFresher": "X-Y LPA"
}`,

  products: (company) => `
List the major products and services of ${company} for a BTech student.
Return ONLY valid JSON:
{
  "products": [
    {
      "name": "Product Name",
      "category": "Cloud/AI/Consumer/Enterprise/Hardware",
      "description": "1-2 sentence description",
      "techBehind": ["tech1", "tech2"],
      "marketPosition": "market position"
    }
  ],
  "keyRevenueSources": ["source1", "source2", "source3"],
  "competitors": [{"name": "company", "segment": "segment"}],
  "innovationAreas": ["area1", "area2", "area3"]
}`,

  hiring: (company) => `
Describe the complete hiring process of ${company} for BTech freshers.
Return ONLY valid JSON:
{
  "processType": "On-campus / Off-campus / Both",
  "totalRounds": 4,
  "avgDuration": "2-4 weeks",
  "rounds": [
    {
      "roundNum": 1,
      "name": "Round Name",
      "type": "Online Test / Technical / HR / System Design",
      "duration": "90 minutes",
      "description": "detailed description of this round",
      "tips": ["tip1", "tip2"],
      "difficulty": "Easy / Medium / Hard",
      "eliminationRate": "60%"
    }
  ],
  "eligibilityCriteria": ["criteria1", "criteria2"],
  "preferredColleges": "NIRF Top 100 / Any / Tier 1 only",
  "hiringSeasons": ["August-September", "January-February"],
  "salaryBands": [
    {"role": "Software Engineer", "ctc": "X-Y LPA", "base": "X LPA", "bonus": "upto X LPA"}
  ],
  "insiderTips": ["tip1", "tip2", "tip3"]
}`,

  roles: (company) => `
List all roles ${company} hires BTech freshers for. Be comprehensive.
Return ONLY valid JSON:
{
  "roles": [
    {
      "title": "Software Development Engineer",
      "department": "Engineering",
      "description": "what this role does day to day",
      "skills": ["Python", "DSA", "System Design"],
      "interviewFocus": ["DSA", "Low Level Design"],
      "avgCTC": "20-45 LPA",
      "growthPath": "SDE I → SDE II → Senior SDE → Principal SDE",
      "dayToDay": ["task1", "task2", "task3"],
      "difficulty": "High",
      "openings": "High",
      "remotePolicy": "Hybrid / Remote / On-site",
      "requiredDegree": "B.Tech CS/ECE/EEE/IT"
    }
  ]
}
Provide at least 6 different roles across Engineering, Data, ML, QA, DevOps etc.`,

  roleDetail: (company, role) => `
You are a placement expert. Generate a concise prep guide for "${role}" at ${company}.
Return ONLY valid JSON with NO markdown, NO extra text:
{
  "role": "${role}",
  "company": "${company}",
  "overview": "2-sentence role description",
  "salaryRange": "X-Y LPA",
  "openingsCount": "~N per year",
  "remotePolicy": "Hybrid/Remote/On-site",
  "interviewProcess": {
    "totalRounds": 4,
    "overview": "Brief description of ${company} interview process for ${role}",
    "rounds": [
      {"roundNum":1,"name":"Online Assessment","type":"Coding","duration":"90 min","platform":"HackerRank","description":"2 DSA problems + MCQ","whatToExpect":["2 medium DSA problems","CS MCQ"],"tips":["Practice on HackerRank"],"difficulty":"Medium"},
      {"roundNum":2,"name":"Technical Round 1","type":"Technical","duration":"60 min","platform":"Zoom","description":"DSA + CS fundamentals","whatToExpect":["Live coding","CS theory"],"tips":["Think aloud"],"difficulty":"Hard"},
      {"roundNum":3,"name":"Technical Round 2","type":"Technical","duration":"60 min","platform":"Zoom","description":"System design + projects","whatToExpect":["Design discussion","Project deep dive"],"tips":["Know your projects"],"difficulty":"Hard"},
      {"roundNum":4,"name":"HR Round","type":"HR","duration":"30 min","platform":"Zoom","description":"Cultural fit","whatToExpect":["Behavioral Qs","Offer discussion"],"tips":["Research ${company} values"],"difficulty":"Easy"}
    ]
  },
  "topicsToPrepare": [
    {"subject":"DSA","importance":"High","specificTopics":["Arrays","Trees","DP","Graphs"],"timeNeeded":"4 weeks"},
    {"subject":"System Design","importance":"Medium","specificTopics":["Caching","Load Balancing","Databases"],"timeNeeded":"2 weeks"},
    {"subject":"CS Fundamentals","importance":"Medium","specificTopics":["OS","DBMS","CN"],"timeNeeded":"2 weeks"}
  ],
  "skillsToHighlight": ["DSA","Problem Solving","System Design","CS Fundamentals","Communication"],
  "resumeTips": ["Quantify impact in every bullet","Use action verbs: Built, Designed, Optimized","List projects with tech stack and GitHub link"],
  "insiderTips": ["Focus on DSA for first 2 months","Practice on exact platform ${company} uses","Research ${company} recent news before HR round"],
  "commonMistakes": ["Jumping to code without discussing approach","Ignoring time/space complexity","Not asking clarifying questions"]
}`,

  subjects: (company) => `List important CS subjects for ${company} placements with priority. Return ONLY valid JSON:
{
  "subjects": [
    {"name": "DSA","importance": "High","weightage": 35,"topics": ["Arrays","Trees","DP"],"reason": "why this matters for ${company}","prepTime": "6-8 weeks"}
  ],
  "overallTip": "one key tip"
}`,

  dsa: (company) => `DSA preparation guide for ${company} placements. Return ONLY valid JSON:
{
  "focusAreas": ["area1","area2"],
  "companyPattern": "description of ${company} DSA pattern",
  "topics": [
    {"name": "Arrays","importance": "High","frequency": "Very Common","subtopics": ["Two Pointers","Sliding Window"],"mustDoProblems": [{"title": "Two Sum","difficulty": "Easy","category": "Arrays"}],"timeToLearn": "3 days"}
  ],
  "prepTips": ["tip1","tip2"],
  "platforms": ["LeetCode","Codeforces"]
}`,

  os: (company) => `OS topics for ${company} placement. Return ONLY valid JSON:
{"companyFocus": "how OS matters here","topics": [{"name": "Topic","importance": "High","subtopics": ["s1"],"keyQuestions": ["q1"],"conceptsToMaster": ["c1"]}],"prepTips": ["tip1"]}`,

  dbms: (company) => `DBMS topics for ${company} placement. Return ONLY valid JSON:
{"companyFocus": "how DBMS is tested","topics": [{"name": "Topic","importance": "High","subtopics": ["s1"],"keyQuestions": ["q1"],"sqlQueries": ["scenario1"]}],"prepTips": ["tip1"]}`,

  cn: (company) => `Computer Networks topics for ${company} placement. Return ONLY valid JSON:
{"companyFocus": "how CN is tested","topics": [{"name": "Topic","importance": "High","subtopics": ["s1"],"keyQuestions": ["q1"]}],"prepTips": ["tip1"]}`,

  interviewQs: (company) => `
You are a placement mentor building a practice question set for a BTech fresher preparing for ${company}.
You do not have live access to any forum or website — do not claim these are confirmed real questions from a
specific candidate report. Instead, generate realistic, well-constructed PRACTICE questions in the style and
difficulty typically seen at companies like ${company} for this role level, drawing on general knowledge of
${company}'s tech stack, industry, and known interview format (rounds, focus areas).
Return ONLY valid JSON:
{
  "technical": [
    {"question": "realistic technical question in ${company}'s typical style", "answer": "detailed model answer with example", "topic": "DSA/OOP/OS/DBMS/CN/System Design", "difficulty": "Easy/Medium/Hard", "frequency": "Very Common/Common/Rare"}
  ],
  "dsa": [
    {"question": "realistic DSA/coding question matching ${company}'s typical difficulty", "answer": "full solution approach with complexity", "topic": "Arrays/Trees/DP/Graphs/etc", "difficulty": "Easy/Medium/Hard", "frequency": "Very Common/Common/Rare"}
  ],
  "systemDesign": [
    {"question": "system design question relevant to ${company}'s domain", "answer": "detailed design approach with components", "topic": "System Design", "difficulty": "Medium/Hard", "frequency": "Common/Rare"}
  ],
  "hr": [
    {"question": "HR question", "answer": "tailored model answer mentioning ${company}'s publicly known values", "tip": "how to approach this for ${company}"}
  ],
  "behavioral": [
    {"question": "behavioral question using STAR format", "answer": "STAR format model answer", "trait": "leadership/teamwork/problem-solving/communication", "tip": "t"}
  ]
}
Provide EXACTLY:
- 12 technical questions (OOP, OS, DBMS, CN, concepts)
- 10 DSA questions (do not invent LeetCode links — omit them)
- 5 system design questions (if relevant to ${company} freshers, else 2)
- 8 HR questions
- 6 behavioral questions
Do not fabricate specifics you're not confident about (exact round names, exact dates, named employees). If unsure, keep it general rather than inventing detail.`,

  codingQs: (company) => `Coding questions for ${company}. Return ONLY valid JSON:
{"codingPattern": "pattern description","questions": [{"title": "Title","difficulty": "Medium","category": "Arrays","description": "problem","sampleInput": "input","sampleOutput": "output","constraints": "1<=n<=10^5","hint": "hint","approach": "approach","timeComplexity": "O(n)","spaceComplexity": "O(1)","frequency": "Common","tags": ["tag1"]}]}
Provide 10 questions (3 Easy, 5 Medium, 2 Hard).`,

  resumeTips: (company) => `Resume tips for ${company}. Return ONLY valid JSON:
{"atsKeywords": ["k1","k2","k3","k4","k5","k6"],"dos": [{"tip": "t","reason": "r","example": "e"}],"donts": [{"tip": "t","reason": "r"}],"projectTips": ["t1","t2"],"skillsToHighlight": ["s1","s2","s3"],"resumeFormat": "format description","sampleBullets": [{"bad": "bad","good": "good"}],"coverLetterTips": ["t1","t2"]}`,

  roadmap: (company) => `You are a placement mentor building a genuinely thorough, week-by-week preparation roadmap for a
BTech student targeting ${company}. This roadmap must stand on its own as a real study plan — detailed enough that
someone could follow it for 12 weeks without needing anything else. Do not pad with generic filler; every task
should be concrete and actionable.

Return ONLY a raw JSON object (no markdown, no explanation).
Format:
{
  "totalWeeks": 12,
  "phases": [
    {
      "phase": 1,
      "title": "Programming Basics",
      "weeks": "Week 1-2",
      "goal": "1-2 sentence goal for this phase",
      "hoursPerDay": 3,
      "topics": ["Core language syntax (choose C++, Java, or Python)", "Object-Oriented Programming: classes, inheritance, polymorphism, encapsulation", "Basic I/O, recursion, and time complexity intuition"],
      "milestone": "what the student should be able to do by the end of this phase",
      "dailyPlan": [
        {"day":"Day 1","topic":"string","deadline":"End of day","morningTask":"string","afternoonTask":"string","eveningTask":"string","checklist":["item1","item2","item3"]}
      ]
    },
    {
      "phase": 2,
      "title": "Data Structures & Algorithms",
      "weeks": "Week 3-7",
      "goal": "string",
      "hoursPerDay": 4,
      "topics": ["Arrays & Strings", "Linked List", "Stack & Queue", "Trees & BST", "Graphs (BFS/DFS)", "Dynamic Programming", "Recursion & Backtracking"],
      "difficulty": "High",
      "milestone": "string",
      "dailyPlan": [
        {"day":"Day 1","topic":"string","deadline":"End of day","morningTask":"string","afternoonTask":"string","eveningTask":"string","checklist":["item1","item2","item3"]}
      ]
    },
    {
      "phase": 3,
      "title": "CS Core Subjects",
      "weeks": "Week 8-9",
      "goal": "string",
      "hoursPerDay": 3,
      "topics": ["Operating Systems", "DBMS & SQL", "Computer Networks", "OOP concepts deep-dive"],
      "keyConceptsPerSubject": [
        {"subject": "Operating Systems", "mustKnow": ["Process vs Thread", "Deadlock", "CPU Scheduling", "Memory Management"]},
        {"subject": "DBMS", "mustKnow": ["Normalization", "Indexing", "Transactions & ACID", "Joins & SQL queries"]},
        {"subject": "Computer Networks", "mustKnow": ["OSI Model", "TCP vs UDP", "HTTP/HTTPS", "DNS"]}
      ],
      "milestone": "string",
      "dailyPlan": [
        {"day":"Day 1","topic":"string","deadline":"End of day","morningTask":"string","afternoonTask":"string","eveningTask":"string","checklist":["item1","item2","item3"]}
      ]
    },
    {
      "phase": 4,
      "title": "Projects",
      "weeks": "Week 10",
      "goal": "string",
      "beginnerProjects": ["project idea 1", "project idea 2"],
      "intermediateProjects": ["project idea 1", "project idea 2"],
      "advancedProjects": ["project idea 1", "project idea 2"],
      "milestone": "string"
    },
    {
      "phase": 5,
      "title": "Resume Building",
      "weeks": "Week 11 (parallel with other phases)",
      "goal": "string",
      "atsOptimizationTips": ["tip1", "tip2", "tip3"],
      "resumeMistakesToAvoid": ["mistake1", "mistake2", "mistake3"],
      "milestone": "string"
    },
    {
      "phase": 6,
      "title": "Interview Preparation",
      "weeks": "Week 12",
      "goal": "string",
      "hrQuestionTopics": ["topic1", "topic2", "topic3"],
      "behavioralQuestionTopics": ["topic1", "topic2", "topic3"],
      "technicalRoundTips": ["tip1", "tip2", "tip3"],
      "mockInterviewPlan": ["step1", "step2", "step3"],
      "milestone": "string"
    }
  ],
  "weeklySchedule": {"Monday":"DSA","Tuesday":"CS Core","Wednesday":"DSA Practice","Thursday":"System Design","Friday":"Mock Interview","Saturday":"Revision","Sunday":"Rest / Light Revision"},
  "examDayTips": ["tip1","tip2","tip3"]
}
Rules:
- Phases 1-3 need exactly 6 dailyPlan entries each (Day 1-6), with real, specific tasks — not "study DSA" but "solve 5 array problems on two-pointer technique, focusing on Two Sum and Container With Most Water patterns."
- Phases 4-6 don't need dailyPlan (they're less day-granular) but need the specific fields shown above filled in with real substance.
- Do NOT invent specific URLs, "confirmed" company statistics, or named resources you're not confident are real — describe tasks in terms of topics/skills, not fabricated links. Real resource links are attached separately by the platform.
- Keep company-specific framing general (e.g. "companies at ${company}'s scale typically value...") rather than claiming to know ${company}'s exact internal process.
- Return ONLY the JSON, nothing else`,

  resources: (company) => `Best resources for ${company} BTech fresher placement prep.
Return ONLY valid JSON. You do not have live web access — only use URLs you are highly confident are real, stable
pages (well-known tag/category pages, official documentation, homepages of major well-known platforms like
LeetCode, GeeksforGeeks, YouTube, GitHub). Do NOT invent specific blog post slugs, article URLs, or course IDs you
aren't certain exist — a wrong specific-looking URL is worse than a general one. When unsure, link to a stable
category/search page instead of guessing an exact article:
{
  "books": [
    {"name": "n", "author": "a", "subject": "s", "level": "Intermediate", "why": "why this helps for ${company}-style prep", "free": false, "amazonUrl": "https://www.amazon.in/s?k=ENCODED+book+title", "pdfUrl": null}
  ],
  "websites": [
    {"name": "n", "url": "a real, stable page you're confident exists (tag/category page is fine)", "subject": "s", "description": "what on this page helps", "free": true}
  ],
  "courses": [
    {"name": "n", "platform": "p", "url": "real platform URL you're confident exists", "subject": "s", "level": "Intermediate", "free": false, "duration": "20 hours"}
  ],
  "githubRepos": [
    {"name": "n", "url": "https://github.com/user/repo — only well-known repos you're confident are real", "description": "d", "stars": "10k+"}
  ],
  "practiceLinks": [
    {"name": "n", "url": "a real, stable practice page (tag/category page is fine)", "description": "what to practice here", "focus": "f"}
  ]
}
Provide: 4 books, 8 websites, 5 courses, 4 repos, 5 practice links. Fewer, verified-feeling links beat many invented-looking ones.`,

  strategy: (company) => `Strategy to crack ${company}. Return ONLY valid JSON:
{"overview": "strategic overview","whatCompanyValues": ["v1","v2","v3"],"commonMistakes": [{"mistake": "m","fix": "f","impact": "High"}],"differentiators": ["d1","d2","d3"],"timeAllocation": [{"area": "DSA","percentage": 40,"rationale": "r"},{"area": "System Design","percentage": 20,"rationale": "r"},{"area": "CS Fundamentals","percentage": 20,"rationale": "r"},{"area": "Projects","percentage": 10,"rationale": "r"},{"area": "HR/Soft Skills","percentage": 10,"rationale": "r"}],"insiderTips": ["t1","t2","t3","t4"],"redFlags": ["f1","f2"],"successStories": ["s1","s2"]}`,

  // ── Aptitude (company+role specific) ─────────────────────
  aptitude: (company, role) => `
You are an aptitude expert for campus placements. Generate realistic practice aptitude questions for ${company} - ${role} role,
in the style and difficulty typically used by companies of this type. You do not have live access to any forum — describe
the test pattern as a realistic estimate based on common formats for similar companies, not as a confirmed fact.
Return ONLY valid JSON:
{
  "companyPattern": "Realistic estimate of ${company}'s likely aptitude test format (duration, sections, question count) — phrase as a general expectation, not a confirmed fact",
  "testPlatform": "Platform used (AMCAT/Cocubes/HackerEarth/HackerRank/Company portal)",
  "quantitative": [
    {
      "question": "A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less. Find the speed of the train.",
      "options": ["A) 40 km/h", "B) 45 km/h", "C) 50 km/h", "D) 60 km/h"],
      "answer": "A) 40 km/h",
      "solution": "Step-by-step solution with formula",
      "topic": "Time & Speed/Profit & Loss/Percentage/etc",
      "difficulty": "Easy/Medium/Hard",
      "frequency": "Very Common/Common/Rare"
    }
  ],
  "logical": [
    {
      "question": "actual logical reasoning question",
      "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
      "answer": "correct option",
      "solution": "step by step reasoning",
      "topic": "Coding-Decoding/Blood Relations/Syllogism/Series/etc",
      "difficulty": "Easy/Medium/Hard",
      "frequency": "Very Common/Common/Rare"
    }
  ],
  "verbal": [
    {
      "question": "actual verbal ability question",
      "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
      "answer": "correct option",
      "solution": "explanation",
      "topic": "Reading Comprehension/Fill in Blanks/Synonyms/Grammar/etc",
      "difficulty": "Easy/Medium/Hard",
      "frequency": "Very Common/Common/Rare"
    }
  ],
  "prepTips": ["tip specifically for ${company} aptitude test"],
  "importantTopics": [{"topic": "Percentage", "weight": "25%", "mustDo": true}],
  "cutoffInfo": "a realistic estimate of typical cutoff range for this type of role/company — phrase as an estimate, not a fact"
}
Provide EXACTLY: 15 quantitative, 12 logical, 10 verbal questions, matched to the general difficulty level ${company} is known for.
Do not fabricate specifics you're not confident about.`,

  // ── Mock Test — one section at a time (keeps each response small
  // enough to stay well under maxOutputTokens, avoiding truncation) ──
  mockTestSection: (company, role, sectionName, count) => `
Generate ${count} realistic "${sectionName}" mock-test questions for ${company} - ${role}, matched to the general
difficulty and style ${company} is known for. These are practice questions, not reproductions of a real test.
Return ONLY a valid JSON array (no other text, no markdown fences):
[
  {
    "id": 1,
    "question": "full question text",
    "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
    "answer": "B",
    "solution": "detailed step-by-step solution",
    "topic": "specific topic within ${sectionName}",
    "marks": 1,
    "negativeMarks": 0.25
  }
]
Provide EXACTLY ${count} questions, ids 1 through ${count}, matched to ${company}'s general difficulty level for the ${sectionName} section.`,

  // ── Extra interview questions batch 2 ─────────────────────
  interviewQs2: (company, role) => `
You are a placement mentor. Provide ADDITIONAL practice interview questions for ${company} - ${role || 'Software Engineer'} role.
These are BATCH 2 — provide DIFFERENT questions from the standard set, covering more advanced topics.
Return ONLY valid JSON:
{
  "technical": [
    {"question": "advanced technical question in ${company}'s typical style", "answer": "detailed answer", "topic": "OOP/OS/DBMS/CN/System Design", "difficulty": "Medium/Hard", "frequency": "Common/Rare"}
  ],
  "dsa": [
    {"question": "DSA question matching ${company}'s typical difficulty", "answer": "solution with time/space complexity", "topic": "Graphs/DP/Trees/etc", "difficulty": "Medium/Hard", "frequency": "Common/Rare"}
  ],
  "situational": [
    {"question": "situational/scenario-based question", "answer": "model answer", "tip": "how to approach this type at ${company}"}
  ]
}
Provide 15 technical, 10 DSA, 5 situational questions. These must be DIFFERENT from basic questions.`,

  // ── Extra interview questions batch 3 ─────────────────────
  interviewQs3: (company, role) => `
Provide ADVANCED and ROLE-SPECIFIC interview questions for ${company} - ${role || 'Software Engineer'} role.
These are BATCH 3 — focus on deep technical, system design, and role-specific scenarios.
Return ONLY valid JSON:
{
  "advanced_technical": [
    {"question": "deep technical question", "answer": "comprehensive answer", "topic": "topic", "difficulty": "Hard", "frequency": "Rare"}
  ],
  "system_design": [
    {"question": "system design question relevant to ${company}'s domain", "answer": "detailed design approach with components, scalability, trade-offs", "components": ["Load Balancer", "Database", "Cache"], "difficulty": "Hard"}
  ],
  "role_specific": [
    {"question": "${role}-specific technical question", "answer": "detailed answer", "why": "why ${company} asks this for ${role} role"}
  ]
}
Provide 10 advanced technical, 8 system design, 8 role-specific questions.`,
};

// ── Category-specific batch fetcher ──────────────────────────
// Generates fresh questions per category, called per load-more click
const categoryPrompt = (company, role, category, batchNum) => {
  const focus = [
    'fundamental to intermediate concepts',
    'advanced and tricky edge cases',
    'real interview gotchas and follow-up questions',
    'expert-level deep-dive questions',
    'scenario-based and practical application',
    'comparison and trade-off questions'
  ][(batchNum - 1) % 6];

  const catConfig = {
    technical: {
      n: 20,
      desc: 'core CS technical questions (OOP, OS, DBMS, CN, System Design concepts)',
      schema: `[{"question":"q","answer":"detailed answer","topic":"OOP/OS/DBMS/CN/System Design","difficulty":"Easy/Medium/Hard","frequency":"Very Common/Common/Rare"}]`,
    },
    dsa: {
      n: 15,
      desc: 'DSA and coding problems in the style this company is known for',
      schema: `[{"question":"Problem description","answer":"full solution with time/space complexity analysis","topic":"Arrays/Trees/DP/Graphs/etc","difficulty":"Easy/Medium/Hard","frequency":"Very Common/Common/Rare","hint":"one-line hint"}]`,
    },
    hr: {
      n: 15,
      desc: 'HR and motivational questions tailored to this company culture',
      schema: `[{"question":"q","answer":"model answer mentioning company values","tip":"how to make this answer stand out at this company","trait":"honesty/ambition/culture-fit/etc"}]`,
    },
    behavioral: {
      n: 15,
      desc: 'STAR-format behavioral questions assessing soft skills',
      schema: `[{"question":"q","answer":"full STAR format answer (Situation, Task, Action, Result)","trait":"leadership/teamwork/problem-solving/communication/adaptability","tip":"t"}]`,
    },
    systemDesign: {
      n: 10,
      desc: 'system design questions relevant to this company and role',
      schema: `[{"question":"Design X system","answer":"detailed design covering: requirements, components, scalability, trade-offs","components":["Load Balancer","Cache","DB"],"difficulty":"Medium/Hard","frequency":"Common/Rare"}]`,
    },
    aptitude: {
      n: 20,
      desc: 'aptitude MCQ questions similar to this company online assessment',
      schema: `[{"question":"q","options":["A","B","C","D"],"answer":"correct option text","solution":"step-by-step solution","category":"Quant/Logical/Verbal","difficulty":"Easy/Medium/Hard"}]`,
    },
    roleSpecific: {
      n: 15,
      desc: `role-specific technical questions for ${role} at ${company}`,
      schema: `[{"question":"q","answer":"detailed answer","why":"why this is asked for this role","difficulty":"Easy/Medium/Hard"}]`,
    },
  };

  const cfg = catConfig[category] || catConfig.technical;
  return `You are a placement mentor. Generate BATCH ${batchNum} of ${category} practice interview questions for ${role} role at ${company}.
Focus on: ${focus}.
These must be DIFFERENT from standard basic questions (this is batch ${batchNum}).
Tailor them to ${company}'s known tech stack, domain, and role level — but present them as realistic practice
questions, not as confirmed reports from a specific candidate or forum.
Return ONLY valid JSON array (no other text):
${cfg.schema}
Generate EXACTLY ${cfg.n} questions, well-constructed and helpful. Do NOT repeat questions from previous batches.`;
};


// ── Core fetch (with retry + fallback) ────────────────────────
export const fetchSection = (company, section) =>
  enqueue(async () => {
    const prompt = prompts[section]?.(company);
    if (!prompt) throw new Error(`Unknown section: ${section}`);
    const text = await callWithFallback(prompt);
    return safeParseJSON(text);
  });

// ── Force-reload (bypass cache, used by Refresh button) ───────
export const fetchSectionForce = (company, section) =>
  enqueue(async () => {
    const prompt = prompts[section]?.(company);
    if (!prompt) throw new Error(`Unknown section: ${section}`);
    const text = await callWithFallback(prompt);
    return safeParseJSON(text);
  });

// ── Fetch aptitude (company + role specific) ─────────────────
export const fetchAptitude = (company, role) =>
  enqueue(async () => {
    const text = await callWithFallback(prompts.aptitude(company, role));
    return safeParseJSON(text);
  });

// ── Mock test section config — static metadata, only the questions
// themselves are AI-generated (one small request per section) ──────
export const MOCK_TEST_SECTIONS = [
  { key: 'aptitude',  name: 'Aptitude',          duration: '30 min', count: 10 },
  { key: 'logical',   name: 'Logical Reasoning', duration: '20 min', count: 7 },
  { key: 'verbal',    name: 'Verbal Ability',    duration: '15 min', count: 6 },
  { key: 'technical', name: 'Technical',         duration: '25 min', count: 7 },
];

// ── Fetch one mock-test section's questions (company + role specific) ──
export const fetchMockTestSection = (company, role, sectionKey) =>
  enqueue(async () => {
    const cfg = MOCK_TEST_SECTIONS.find(s => s.key === sectionKey);
    if (!cfg) throw new Error(`Unknown mock test section: ${sectionKey}`);
    const text = await callWithFallback(prompts.mockTestSection(company, role, cfg.name, cfg.count));
    const parsed = safeParseJSON(text);
    return Array.isArray(parsed) ? parsed : (parsed?.questions || []);
  });

// ── Fetch more interview questions (batches 2 & 3) ────────────
export const fetchMoreQuestions = (company, role, batch = 2) =>
  enqueue(async () => {
    const key = batch === 3 ? 'interviewQs3' : 'interviewQs2';
    const text = await callWithFallback(prompts[key](company, role));
    return safeParseJSON(text);
  });

// ── Generic AI call (for AI Interview feature) ────────────────
export const fetchRaw = (prompt) =>
  enqueue(async () => callWithFallback(prompt));

// ── Role Detail ───────────────────────────────────────────────
export const fetchRoleDetail = (company, role) =>
  enqueue(async () => {
    const text = await callWithFallback(prompts.roleDetail(company, role));
    return safeParseJSON(text);
  });

// ── Category Batch (unlimited load more per tab) ──────────────
// category: 'technical' | 'dsa' | 'hr' | 'behavioral' | 'systemDesign' | 'aptitude' | 'roleSpecific'
// batchNum: 1, 2, 3... (increments each load more click)
export const fetchCategoryBatch = (company, role, category, batchNum = 1) =>
  enqueue(async () => {
    const prompt = categoryPrompt(company, role, category, batchNum);
    const text   = await callWithFallback(prompt);
    // Result is a JSON array
    const parsed = safeParseJSON(text);
    return Array.isArray(parsed) ? parsed : (parsed?.questions || parsed?.items || []);
  });

// ── ATS Resume Analyzer ───────────────────────────────────────
export const analyzeResume = (company, role, resumeText) =>
  enqueue(async () => {
    const prompt = `You are an ATS expert analyzing a resume for ${company} - ${role} position.
Return ONLY valid JSON:

Resume:
"""
${resumeText.slice(0, 3000)}
"""

{
  "overallScore": 72,
  "atsFriendliness": 80,
  "keywordMatch": 65,
  "formatScore": 85,
  "impactScore": 60,
  "verdict": "Good",
  "summary": "2-3 sentence assessment",
  "matchedKeywords": ["k1","k2","k3"],
  "missingKeywords": ["m1","m2","m3","m4"],
  "strengths": ["s1","s2","s3"],
  "improvements": [
    {"section": "Skills","issue": "issue","fix": "fix","priority": "High"}
  ],
  "sectionScores": {"education": 80,"skills": 70,"experience": 60,"projects": 75,"achievements": 65},
  "atsWarnings": ["w1","w2"],
  "finalTip": "most important tip"
}`;
    const text = await callWithFallback(prompt);
    return safeParseJSON(text);
  });

