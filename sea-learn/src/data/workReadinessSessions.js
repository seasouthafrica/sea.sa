// Quarter 2 of the Uplift Programme — Work Readiness & Professional Skills.
// Kept separate from `upliftSessions` (Quarter 1) so each quarter keeps its own
// completion criteria and certificate.

export const workReadinessMeta = {
  quarter: 'Quarter 2',
  title: 'Work Readiness & Professional Skills',
  fullTitle: 'Quarter 2 of the Uplift Programme: Work Readiness & Professional Skills',
  partners: ['Social Enterprise Academy', 'Africa Forward'],
  // Deliberately not a YouTube link — a custom intro video is to be embedded here.
  introVideo: null,
  introVideoNote: 'Embed the custom programme intro video here. Do not use a YouTube link.',
};

export const workReadinessSessions = [
  {
    id: 1,
    slug: 'building-career-resilience-in-sa',
    title: 'Building Career Resilience in SA',
    learningOutcomes: [
      'Navigate job hunt fatigue and rejection without losing momentum.',
      'Identify and lean on community and professional support structures.',
    ],
    sections: [
      {
        heading: 'The Reality of the Hustle',
        paragraphs: [
          'Looking for work in South Africa is a full-time job in itself. The national unemployment rate means you are competing against many others, which can lead to application fatigue and "ghosting" (when recruiters never reply). Resilience is the mental toughness required to keep waking up and applying, even when opportunities seem scarce.',
        ],
      },
      {
        heading: 'Reframing Rejection',
        paragraphs: [
          'Rejection is rarely personal. Often, a company has internal candidates, the budget got cut, or you simply didn’t match the exact algorithm of their hiring software. Treat every "no" as data. If you get rejected after an interview, you have proven your CV works—now you just need to practice your interview skills. Protect your mental health by setting boundaries: allocate specific hours for job hunting, and use the rest of your day to upskill, volunteer, or rest.',
        ],
      },
    ],
    proTip: 'Lean on platforms like SA Youth and Harambee. They are specifically designed to support young South Africans and often provide data-free resources and micro-learning opportunities.',
    video: {
      id: 'af9Emi4PRCc',
      title: 'How to Handle Interview Rejection — Advice and Next Steps',
      channel: 'Aced',
      duration: '3:54',
    },
    actionItem: 'Write down three major challenges you’ve overcome in the past five years. Review this list whenever job hunting feels overwhelming to remind yourself of your inherent resilience.',
    quiz: {
      key: 'Quiz 1 — Building Career Resilience in SA',
      questions: [
        {
          question: 'You’ve applied to 15 jobs this month on Harambee and haven’t heard back. What is the most resilient response?',
          options: [
            'Stop applying for a few months until the economy improves.',
            'Call the platform’s support line every day until they give you a job.',
            'Take a short break to rest, review and update your digital profile, and set a daily schedule for continuing the search.',
          ],
          correct: 2,
        },
        {
          question: 'A recruiter tells you they decided to go with someone who had more experience. What is the best mindset?',
          options: [
            'Conclude that the system is rigged against young people.',
            'Politely ask for feedback on your interview and view the experience as practice for the next one.',
            'Argue with them over email to prove you are the better choice.',
          ],
          correct: 1,
        },
        {
          question: 'Why is it important to set boundaries around your job hunting?',
          options: [
            'So you have more time to watch TV.',
            'Because overworking leads to burnout, and a stressed mind performs poorly in interviews.',
            'Recruiters only read emails sent at exactly 9:00 AM.',
          ],
          correct: 1,
        },
      ],
    },
  },
  {
    id: 2,
    slug: 'time-management-and-professional-grooming',
    title: 'Time Management & Professional Grooming on a Budget',
    learningOutcomes: [
      'Master "Taxi Math" to ensure consistent punctuality despite infrastructure challenges.',
      'Build a professional wardrobe using affordable local retailers.',
    ],
    sections: [
      {
        heading: 'The "Taxi Math" of Commuting',
        paragraphs: [
          'In a corporate setting, 9:00 AM means you are seated and working by 9:00 AM. In South Africa, "African time" has no place in the workplace. Commuting involves heavy variables: taxi strikes, wet weather traffic, Golden Arrow bus delays, and train issues. To survive this, you must learn "Taxi Math." If your commute usually takes 45 minutes, budget 90. Arriving 20 minutes early allows you to cool down, grab coffee, and mentally prepare.',
        ],
      },
      {
        heading: 'Dressing for Success on a Budget',
        paragraphs: [
          '"Business casual" does not mean expensive designer labels. It means clean, neat, and unbranded. You can build a highly effective capsule wardrobe at affordable local retailers like Mr Price, Pep, or by thrifting in the CBD.',
        ],
        bullets: [
          { label: 'Men', text: 'A crisp white or blue button-down shirt from Pep, dark chinos, and clean, dark shoes.' },
          { label: 'Women', text: 'Dark tailored pants or a knee-length skirt, a modest blouse, and neat closed shoes.' },
          { label: 'The Golden Rule', text: 'Your clothes must be washed and properly ironed. Wrinkled clothes instantly look unprofessional, regardless of how much they cost.' },
        ],
      },
    ],
    proTip: 'If load-shedding is scheduled for the morning, iron your clothes the night before!',
    video: {
      id: '_KZJ69AHXZQ',
      title: 'Updating a business casual wardrobe on a limited budget',
      channel: 'Age With Style Coach',
      duration: '3:46',
    },
    actionItem: 'Use a map app (or local knowledge) to calculate the travel time to your nearest central business district during peak traffic (07:00 AM). Add 45 minutes to that time. That is your actual commute budget.',
    quiz: {
      key: 'Quiz 2 — Time Management & Professional Grooming',
      questions: [
        {
          question: 'You have an interview at 08:30 AM in the city center. It usually takes 40 minutes by taxi. When should you leave your house?',
          options: ['07:50 AM', '07:15 AM', '08:00 AM'],
          correct: 1,
        },
        {
          question: 'You wake up for your first day of work and realize there is Stage 4 load-shedding and you can’t iron your shirt. What should you have done?',
          options: [
            'Called your boss to say you’ll be late because of Eskom.',
            'Worn the wrinkled shirt and apologized all day.',
            'Checked the EskomSePush app the night before and ironed your clothes in advance.',
          ],
          correct: 2,
        },
        {
          question: 'Which of the following is an acceptable "business casual" outfit?',
          options: [
            'A neat, plain button-down shirt and dark, unripped chinos from Mr Price.',
            'Expensive designer trackpants and highly polished sneakers.',
            'A branded t-shirt and clean shorts.',
          ],
          correct: 0,
        },
      ],
    },
  },
  {
    id: 3,
    slug: 'professional-communication-and-digital-etiquette',
    title: 'Professional Communication & Digital Etiquette',
    learningOutcomes: [
      'Code-switch between casual vernacular and professional business English.',
      'Establish boundaries and professionalism on WhatsApp and phone calls.',
    ],
    sections: [
      {
        heading: 'Telephonic Etiquette',
        paragraphs: [
          'When you are job hunting, every unknown number could be a recruiter. Answer the phone professionally in a quiet space: "Hello, this is [Your Name] speaking." Speak clearly, actively listen, and if you are in a noisy taxi, politely ask: "I am currently in transit, may I please call you back in 10 minutes when I am in a quiet space?"',
        ],
      },
      {
        heading: 'WhatsApp in the Workplace',
        paragraphs: [
          'WhatsApp is heavily used in South African business, but it is not a casual group chat.',
        ],
        bullets: [
          { label: 'No Slang', text: 'Avoid terms like "awe," "chief," "boss," or "mzansi" when speaking to recruiters or managers.' },
          { label: 'Profile Audit', text: 'Ensure your WhatsApp profile picture is neat and your status is professional.' },
          { label: 'Boundaries', text: 'Respect office hours. Do not WhatsApp a recruiter at 9:00 PM on a Saturday.' },
        ],
      },
    ],
    template: {
      title: 'Template for messaging a recruiter on WhatsApp',
      body: 'Good morning Mr. Ndlovu. My name is [Your Name]. I am following up on the junior admin position I applied for on SA Youth. Please let me know if you require any further information from me. Thank you.',
    },
    video: {
      id: 'qkNWTW3raGE',
      title: 'How to Answer the Phone At Work (Like a Pro)',
      channel: 'Adriana Girdler',
      duration: '3:40',
    },
    actionItem: 'Audit your WhatsApp profile right now. Change your profile picture to a clear, friendly headshot (against a plain wall) and update your bio to something professional.',
    quiz: {
      key: 'Quiz 3 — Professional Communication & Digital Etiquette',
      questions: [
        {
          question: 'Your phone rings from an unknown 011 number while you are buying groceries in a noisy supermarket. How do you answer?',
          options: [
            '"Yebo, who is this?"',
            'Answer, listen, and shout over the background noise so they can hear you.',
            '"Hello, this is [Your Name]. I am in a noisy area—may I call you back in 5 minutes when I step outside?"',
          ],
          correct: 2,
        },
        {
          question: 'A recruiter WhatsApps you to ask if you are available for an interview tomorrow. How do you reply?',
          options: [
            '"Awe chief, 100% I’ll be there."',
            '"Good day. Yes, I am available tomorrow. Please let me know the time and platform. Thank you."',
            'Respond with a thumbs-up emoji.',
          ],
          correct: 1,
        },
        {
          question: 'Why is it important to code-switch in professional environments?',
          options: [
            'Because casual slang can be misinterpreted and lacks the formal respect expected in a corporate setting.',
            'Because you should hide your true culture.',
            'So that you can type messages faster to save data.',
          ],
          correct: 0,
        },
      ],
    },
  },
  {
    id: 4,
    slug: 'modern-cvs-and-beating-the-ats-with-ai',
    title: 'Modern CVs & Beating the ATS with AI',
    learningOutcomes: [
      'Transition to a modern, 1-2 page digital CV format.',
      'Use AI tools ethically to tailor applications to Applicant Tracking Systems (ATS).',
    ],
    sections: [
      {
        heading: 'The Modern CV',
        paragraphs: [
          'The days of a 5-page CV with a cover page, a photo of your face, and a copy of your ID attached are over. Modern companies use Applicant Tracking Systems (ATS) to scan CVs for keywords before a human ever reads them. Your CV must be a sleek, 1-2 page digital document (saved as a PDF). Focus on transferable skills, clear headings, and simple formatting (no complex tables or graphics, as they confuse ATS software).',
        ],
      },
      {
        heading: 'Using AI as Your Co-Pilot',
        paragraphs: [
          'You can use free tools like ChatGPT or Google Gemini to help format your CV and match the job description. The goal is not to lie or let the AI make up experience. The goal is to let the AI help you frame your actual skills using the employer’s vocabulary.',
        ],
      },
    ],
    prompt: {
      title: 'Your AI Prompt Toolkit',
      subtitle: 'Copy/paste this into ChatGPT',
      body: 'I am applying for a [Insert Job Title] role. Here is the job description: [Paste Description]. Here are my skills and past experiences: [Type your real experience here, even informal work]. Please rewrite my experience into 5 professional bullet points that highlight how my skills match the keywords in this job description. Keep the tone professional but realistic. Do not invent any experience I haven’t mentioned.',
    },
    video: {
      id: '-0ZHoBZ_BzM',
      title: 'Build a Job-Winning Resume Using AI the Right Way',
      channel: 'Real Demo',
      duration: '11:06',
    },
    actionItem: 'Create a free account on ChatGPT or Gemini. Paste the prompt above using a job advert from Harambee or LinkedIn, and update your CV with the generated bullet points.',
    quiz: {
      key: 'Quiz 4 — Modern CVs & Beating the ATS with AI',
      questions: [
        {
          question: 'What is the primary purpose of an Applicant Tracking System (ATS)?',
          options: [
            'To check your credit score and criminal record.',
            'To scan CVs for specific keywords and filter out unqualified applicants before a human reads them.',
            'To design a pretty layout for your CV.',
          ],
          correct: 1,
        },
        {
          question: 'Which of the following should you REMOVE from a modern CV?',
          options: [
            'Your contact number and email address.',
            'Bullet points detailing your responsibilities.',
            'A cover page, a photo of yourself, and your marital status.',
          ],
          correct: 2,
        },
        {
          question: 'When using AI (like ChatGPT) to help with your CV, what is the golden rule?',
          options: [
            'Tell the AI to make up 3 years of experience so you get the job.',
            'Only use the AI to format and translate your real experiences into the vocabulary of the job description.',
            'Copy and paste whatever the AI generates without reading it.',
          ],
          correct: 1,
        },
      ],
    },
  },
  {
    id: 5,
    slug: 'interview-preparation-and-execution',
    title: 'Interview Preparation & Execution',
    learningOutcomes: [
      'Master the STAR method for behavioral interview questions.',
      'Successfully navigate virtual interviews despite local infrastructure challenges.',
    ],
    sections: [
      {
        heading: 'The STAR Method',
        paragraphs: [
          'When an interviewer asks, "Tell me about a time you handled a difficult situation," they want a structured story. Use STAR:',
        ],
        bullets: [
          { label: 'S - Situation', text: 'Set the scene. (e.g., "We were working on a group project, and Stage 6 load-shedding hit.")' },
          { label: 'T - Task', text: 'What was your responsibility? ("I was responsible for finalizing the presentation by 5 PM.")' },
          { label: 'A - Action', text: 'What did you do? ("I immediately coordinated with the team on a WhatsApp group, delegated offline tasks, and walked to a local mall with backup power to upload the final document.")' },
          { label: 'R - Result', text: 'What was the outcome? ("We submitted the project an hour early and received positive feedback.")' },
        ],
      },
      {
        heading: 'The Virtual Interview (Zoom/Teams)',
        paragraphs: ['Remote interviews are the new standard.'],
        numbered: [
          { label: 'Data & Power', text: 'Buy a dedicated 1-day data bundle just for the interview. Check your load-shedding schedule (EskomSePush). If your area goes dark, email the recruiter the day before to warn them or ask to reschedule slightly.' },
          { label: 'Lighting & Sound', text: 'Sit facing a window so natural light hits your face. Find the quietest room possible and blur your background in the app settings to hide any domestic clutter.' },
        ],
      },
    ],
    video: {
      id: 'resCGEf0cMU',
      title: '4 Tips for a Great Zoom Interview',
      channel: 'MherMardoyan Career Coach',
      duration: '2:40',
    },
    actionItem: 'Use your phone’s front camera to record a 1-minute video of yourself answering: "Tell me about a time you had to overcome a sudden problem." Watch it back to check your eye contact, lighting, and use of the STAR method.',
    quiz: {
      key: 'Quiz 5 — Interview Preparation & Execution',
      questions: [
        {
          question: 'During a Zoom interview, your power suddenly trips due to unscheduled load-shedding, and your Wi-Fi dies. What is the best recovery?',
          options: [
            'Panic, assume you lost the job, and do nothing.',
            'Quickly switch to your mobile data, rejoin the call, apologize briefly for the SA grid, and smoothly pick up where you left off.',
            'Wait for the power to return in 2 hours and email them.',
          ],
          correct: 1,
        },
        {
          question: 'What does the "A" in the STAR method stand for, and why is it important?',
          options: [
            '"Action" - it explains exactly what steps YOU took to solve the problem.',
            '"Attitude" - it shows you are a positive person.',
            '"Apology" - it shows you take blame well.',
          ],
          correct: 0,
        },
        {
          question: 'Where is the best place to position your laptop/phone during a virtual interview?',
          options: [
            'On your lap while sitting on a couch.',
            'At eye-level, on a steady table, directly facing a window for natural light.',
            'In a dark room so you don’t get distracted.',
          ],
          correct: 1,
        },
      ],
    },
  },
];

export const REQUIRED_WORK_READINESS_QUIZ_KEYS = workReadinessSessions.map((s) => s.quiz.key);
