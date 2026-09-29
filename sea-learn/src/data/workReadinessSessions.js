// Quarter 2 of the Uplift Programme — Work Readiness & Professional Skills.
// Kept separate from `upliftSessions` (Quarter 1) so each quarter keeps its own
// completion criteria and certificate.
//
// IMPORTANT: `quiz.key` strings are storage keys. Learner scores are saved
// against them in localStorage and in `assignment_submissions`, so renaming one
// silently wipes that learner's pass — and their certificate with it. Change
// `quiz.title` (what the learner reads) and leave `quiz.key` frozen. The same
// applies to `reflection.slot` and `reflection.chapterId`.

export const workReadinessMeta = {
  quarter: 'Quarter 2',
  title: 'Work Readiness & Professional Skills',
  fullTitle: 'Quarter 2 of the Uplift Programme: Work Readiness & Professional Skills',
  partners: ['Social Enterprise Academy', 'Africa Forward'],
  introVideo: {
    id: 'haJKpNYjtGk',
    title: 'Work Readiness Intro',
    channel: 'Grind With Mangi',
  },
};

export const workReadinessSessions = [
  {
    id: 1,
    slug: 'building-career-resilience-in-sa',
    // Retitled to match what the session actually teaches: professional conduct
    // is half the content and was invisible in the old title.
    title: 'Career Resilience & Professional Conduct',
    duration: '45 min',
    learningOutcomes: [
      'Navigate job hunt fatigue and rejection without losing momentum.',
      'Identify and lean on community and professional support structures.',
      'Apply the professional conduct employers expect — punctuality, accountability, confidentiality and respect — from your first day.',
      'Practise resilience as a daily habit rather than treating it as a personality trait.',
    ],
    // Plays directly beneath the learning outcomes, ahead of the written content.
    outcomesVideo: {
      id: 'dIWDTrLXZBQ',
      title: 'The Reality of the Job Market in South Africa',
      channel: 'Grind With Mangi',
    },
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
        video: {
          id: 'OplQbxTYh44',
          title: 'Professional Conduct',
          channel: 'Grind With Mangi',
        },
      },
      {
        heading: 'Professional Conduct Practices',
        eyebrow: 'Being Professional',
        groups: [
          { label: 'Punctuality', points: ['Arrive on time for work, meetings, and deadlines.', 'Shows respect for others’ time and builds trust.'] },
          { label: 'Positive Attitude', points: ['Stay optimistic, even when things get tough.', 'A good attitude makes you more approachable and easier to work with.'] },
          { label: 'Clear Communication', points: ['Speak and write clearly, professionally, and respectfully.', 'Ask questions when unsure and confirm understanding.'] },
          { label: 'Dependability', points: ['Follow through on tasks and commitments.', 'Be someone your team can count on.'] },
          { label: 'Respect for Others', points: ['Treat everyone — regardless of role or background — with courtesy and professionalism.', 'Listen actively and avoid interrupting.'] },
          { label: 'Appropriate Appearance', points: ['Dress according to the workplace culture or dress code.', 'Maintain good hygiene and grooming.'] },
          { label: 'Confidentiality', points: ['Keep sensitive information private.', 'Don’t share company or client details without permission.'] },
          { label: 'Accountability', points: ['Own your actions, including mistakes.', 'Learn from feedback and take responsibility seriously.'] },
          { label: 'Teamwork', points: ['Collaborate well with others and contribute to group success.', 'Be willing to help and share credit.'] },
          { label: 'Adaptability', points: ['Be open to change and willing to learn new things.', 'Stay flexible when plans or priorities shift.'] },
          { label: 'Leverage Your Strengths', points: ['Use what you’re naturally good at to do your best work.'] },
          { label: 'Engage in Self-Care', points: ['Take care of your physical, mental, and emotional health.'] },
          { label: 'Professional Boundaries', points: ['Keep personal and professional lives separate.', 'Avoid gossip and maintain a respectful tone in all interactions.'] },
          { label: 'Take Initiative', points: ['Step up and do things without being told.'] },
          { label: 'Continuous Learning', points: ['Seek out opportunities to grow your skills and knowledge.', 'Stay curious and open to feedback.'] },
        ],
        reflection: {
          title: 'Reflection',
          saveable: true,
          slot: '1:conduct',
          chapterId: 511,
          questions: [
            'Of the professional conduct practices, which ones do you already apply? Identify how you can apply them better.',
            'Identify which of these practices you haven’t applied or applied poorly. Identify how you can apply them.',
          ],
          placeholder: 'Which practices are already strong, and which two will you work on?',
        },
      },
      {
        heading: 'Bouncing Back from Challenges, Stress, or Failure',
        // Myth/truth pair renders as two contrasting cards.
        contrast: {
          title: 'What is Resilience?',
          lead: 'Resilience means bouncing back from challenges, stress, or failure.',
          myth: { label: 'The myth', text: 'That it’s about avoiding problems.' },
          truth: { label: 'The truth', text: 'It’s about learning how to handle them and grow stronger.' },
        },
        // Expandable cards, each with its own accent. Kept separate from `groups`
        // so the plainer group lists elsewhere keep rendering as they are.
        strategies: [
          { icon: 'spark', accent: 'teal', label: 'Believe in yourself', points: ['Remind yourself: "I can handle this."', 'Focus on your strengths and past successes, even small ones.'] },
          { icon: 'hand', accent: 'sky', label: 'Ask for help', points: ['Talk to a mentor, teacher, or friend when things get tough.', 'Resilient people know they don’t have to do it all alone.'] },
          { icon: 'sun', accent: 'amber', label: 'Stay positive', points: ['Look for the lesson in every setback.', 'Practice gratitude — write down 3 good things each day.'] },
          { icon: 'heart', accent: 'emerald', label: 'Take care of your body', points: ['Sleep well, eat healthy, and move your body.', 'A strong body supports a strong mind.'] },
          { icon: 'steps', accent: 'violet', label: 'Keep going, even when it’s hard', points: ['Break big tasks into small steps.', 'Celebrate progress, not just perfection.'] },
          { icon: 'refresh', accent: 'rose', label: 'Learn from mistakes', points: ['Don’t fear failure — it’s part of learning.', 'Ask: "What can I do differently next time?"'] },
          { icon: 'branch', accent: 'indigo', label: 'Stay flexible', points: ['Be open to change and new ideas.', 'If Plan A doesn’t work, try Plan B — or even Plan Z!'] },
        ],
        remember: 'Resilience is like a muscle — the more you use it, the stronger it gets.',
        reflection: {
          title: 'Reflection',
          saveable: true,
          // Legacy identifiers. This was the first saveable reflection to ship,
          // so its storage keys stay exactly as they were.
          slot: '1',
          chapterId: 501,
          questions: ['Identify one aspect of bouncing back you can practice daily.'],
          placeholder: 'Which one will you practise daily, and how?',
        },
      },
    ],
    source: 'Professional conduct and bouncing back material adapted from the SK Online Academy Work Readiness workbook, 2025.',
    proTip: 'Lean on platforms like SA Youth and Harambee. They are specifically designed to support young South Africans and often provide data-free resources and micro-learning opportunities.',
    video: {
      id: 'af9Emi4PRCc',
      title: 'How to Handle Interview Rejection — Advice and Next Steps',
      channel: 'Aced',
      duration: '3:54',
    },
    actionItem: 'Write down three major challenges you’ve overcome in the past five years. Review this list whenever job hunting feels overwhelming to remind yourself of your inherent resilience.',
    takeaways: [
      'Rejection is data, not a verdict — ask for feedback and treat every interview as practice for the next one.',
      'Resilience is a habit you build by repetition, not a trait you are born with.',
      'Professional conduct is judged from your first day, not after probation.',
    ],
    quiz: {
      key: 'Quiz 1 — Building Career Resilience in SA',
      title: 'Quiz 1 — Career Resilience & Professional Conduct',
      questions: [
        {
          question: 'You’ve applied to 15 jobs this month on Harambee and haven’t heard back. What is the most resilient response?',
          options: [
            'Stop applying for a few months until the economy improves.',
            'Apply to another 50 adverts tonight without changing anything on your profile.',
            'Call the platform’s support line every day until they give you a job.',
            'Take a short break to rest, review and update your digital profile, and set a daily schedule for continuing the search.',
          ],
          correct: 3,
          explanation: 'Resilience is not stopping, and it is not applying harder at the same thing. Fifteen applications with no reply is information: usually the profile or the targeting needs work. Rest, adjust, then continue on a schedule you can sustain.',
        },
        {
          question: 'A recruiter tells you they decided to go with someone who had more experience. What is the best mindset?',
          options: [
            'Conclude that the system is rigged against young people.',
            'Politely ask for feedback on your interview and view the experience as practice for the next one.',
            'Argue with them over email to prove you are the better choice.',
            'Accept it quietly and avoid ever applying to that company again.',
          ],
          correct: 1,
          explanation: 'Asking for feedback turns a rejection into something you can use, and it keeps the door open. Plenty of people are eventually hired by a company that turned them down the first time.',
        },
        {
          question: 'Why is it important to set boundaries around your job hunting?',
          options: [
            'Because overworking leads to burnout, and a stressed mind performs poorly in interviews.',
            'Because applying to more than five jobs a week makes you look desperate.',
            'Because job hunting should only ever be done in the mornings.',
            'Because recruiters only respond to applications sent during office hours.',
          ],
          correct: 0,
          explanation: 'Job hunting has no natural finishing line, so without boundaries it expands to fill every hour. Protecting time to rest, upskill or volunteer is exactly what keeps you sharp when an interview finally comes.',
        },
        {
          question: 'Your manager points out that a report you submitted had several errors. You acknowledge the mistake and ask how to correct it. Which professional conduct practice is this?',
          options: [
            'Adaptability',
            'Accountability',
            'Confidentiality',
            'Punctuality',
          ],
          correct: 1,
          explanation: 'Accountability means owning your actions, including mistakes, and learning from feedback. Managers notice defensiveness; they promote people who take responsibility and fix things.',
        },
        {
          question: 'A friend asks you to send them a client list from the company you have just joined, "just to look at". What should you do?',
          options: [
            'Send it, since you are not selling it to anyone.',
            'Send it, but ask them to delete it afterwards.',
            'Decline — client information is confidential and may not be shared without permission.',
            'Ask a colleague to send it instead, so it does not come from you.',
          ],
          correct: 2,
          explanation: 'Confidentiality means company and client details stay inside the company unless you have permission to share them. Good intentions do not change that, and a breach is one of the fastest ways to lose a job.',
        },
      ],
    },
  },
  {
    id: 2,
    slug: 'time-management-and-professional-grooming',
    title: 'Time Management & Professional Grooming on a Budget',
    duration: '40 min',
    learningOutcomes: [
      'Master "Taxi Math" to ensure consistent punctuality despite infrastructure challenges.',
      'Apply time management principles — priorities, interruptions and procrastination — to a real week.',
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
        heading: 'Time Management Principles',
        groups: [
          { label: 'Attitude', points: ['Your mindset shapes how you use time.', 'Believe your time is valuable, stay positive, and take control of your schedule instead of letting it control you.'] },
          { label: 'Goals', points: ['Knowing what you want to achieve helps you focus.', 'Set short- and long-term goals, write them down, and review them often to stay motivated.'] },
          { label: 'Priorities', points: ['Not everything is equally important.', 'Use the "urgent vs. important" rule — focus on tasks that move you closer to your goals, not just what feels urgent.'] },
          { label: 'Analysing', points: ['Understand how you currently spend your time.', 'Track your activities for a few days and notice where time is wasted and where you can improve.'] },
          { label: 'Planning', points: ['Think ahead about what needs to be done.', 'Use a planner or app to map out your day/week, and break big tasks into smaller steps.'] },
          { label: 'Scheduling', points: ['Assign specific times to tasks.', 'Block time for studying, working, breaks, and fun — and stick to your schedule as much as possible.'] },
          { label: 'Interruptions', points: ['Distractions that break your focus.', 'Identify common ones (like your phone) and limit them — use "Do Not Disturb" or find a quiet space.'] },
          { label: 'Meetings', points: ['Time spent in group discussions or check-ins.', 'Be on time, stay focused, take notes; if leading, keep it short and clear.'] },
          { label: 'Paperwork (organizing)', points: ['Keeping documents and files in order.', 'Use folders (digital or physical), organize materials, and label everything clearly.'] },
          { label: 'Delegation', points: ['Sharing tasks with others when appropriate.', 'If working in a team, don’t try to do everything yourself — trust others and divide tasks fairly.'] },
          { label: 'Procrastination', points: ['Delaying tasks you should be doing now.', 'Start with small steps, use the "2-minute rule" (if it takes less than 2 minutes, do it now).'] },
          { label: 'Teamwork', points: ['Working well with others to manage time and tasks.', 'Communicate clearly, respect others’ time, and support each other to meet deadlines.'] },
        ],
        reflection: {
          title: 'Reflection',
          saveable: true,
          slot: '2:time-management',
          chapterId: 512,
          questions: [
            'Identify which time management principles you struggle with.',
            'Select a minimum of 2 per week and apply them daily.',
          ],
          placeholder: 'Which two will you apply this week, and what will you do differently each day?',
        },
      },
      {
        heading: 'Dressing for Success on a Budget',
        paragraphs: [
          '"Business casual" does not mean expensive designer labels. It means clean, neat, and unbranded. You can build a highly effective capsule wardrobe at affordable local retailers like Mr Price, Pep, or by thrifting in the CBD.',
        ],
        groups: [
          {
            label: 'Men — smart casual',
            points: [
              'A crisp white or blue button-down shirt — no jacket or tie needed.',
              'Dark chinos, neutral coloured pants or corduroys. Stay away from blue jeans for interviews.',
              'Clean, dark leather or suede shoes — anything you would wear to the gym is a no-go.',
            ],
          },
          {
            label: 'Women — smart casual',
            points: [
              'A neutral blouse or top; mild patterns work well too.',
              'Dark tailored pants or a knee-length skirt. Jeans look good, but some companies frown on them for interviews — better safe than sorry.',
              'Neat closed shoes or ballet flats.',
            ],
          },
          {
            label: 'The Golden Rule',
            points: [
              'Your clothes must be washed and properly ironed.',
              'Wrinkled clothes instantly look unprofessional, regardless of how much they cost.',
            ],
          },
        ],
      },
    ],
    source: 'Time management and dress code material adapted from the SK Online Academy Work Readiness workbook, 2025.',
    proTip: 'If load-shedding is scheduled for the morning, iron your clothes the night before!',
    actionItem: 'Use a map app (or local knowledge) to calculate the travel time to your nearest central business district during peak traffic (07:00 AM). Add 45 minutes to that time. That is your actual commute budget.',
    takeaways: [
      'Budget double your usual commute, then add 20 minutes so you arrive settled rather than breathless.',
      'Most "I have no time" problems are really priority and interruption problems.',
      'Neat, clean and unbranded beats expensive every time — and ironing costs nothing.',
    ],
    quiz: {
      key: 'Quiz 2 — Time Management & Professional Grooming',
      title: 'Quiz 2 — Time Management & Professional Grooming',
      questions: [
        {
          question: 'You have an interview at 08:30 AM in the city center. It usually takes 40 minutes by taxi. When should you leave your house?',
          options: ['07:50 AM', '07:15 AM', '08:00 AM', '07:40 AM'],
          correct: 1,
          explanation: 'Taxi Math doubles the usual trip and then adds buffer: 40 minutes becomes roughly 80, plus time to arrive about 20 minutes early. Leaving at 07:15 protects you against a strike, wet weather, or waiting for a taxi to fill.',
        },
        {
          question: 'You wake up for your first day of work and realize there is Stage 4 load-shedding and you can’t iron your shirt. What should you have done?',
          options: [
            'Called your boss to say you’ll be late because of Eskom.',
            'Worn the wrinkled shirt and apologized all day.',
            'Checked the EskomSePush app the night before and ironed your clothes in advance.',
            'Asked a neighbour with a generator to iron it that morning.',
          ],
          correct: 2,
          explanation: 'Load-shedding is scheduled and published in advance, which makes it a predictable problem rather than an emergency. Planning around the schedule is what separates a reliable employee from one who is always explaining.',
        },
        {
          question: 'Which of the following is an acceptable "business casual" outfit?',
          options: [
            'A neat, plain button-down shirt and dark, unripped chinos from Mr Price.',
            'Expensive designer trackpants and highly polished sneakers.',
            'A branded t-shirt and clean shorts.',
            'A full three-piece suit with a tie.',
          ],
          correct: 0,
          explanation: 'Business casual is about being clean, neat and unbranded — not about spending money. Price tags are invisible; creases are not. A three-piece suit is not wrong so much as over-dressed for most smart-casual workplaces.',
        },
        {
          question: 'You have a report due on Friday, and your phone keeps buzzing with group-chat messages. Which two time management principles are most directly at work here?',
          options: [
            'Delegation and Teamwork',
            'Priorities and Interruptions',
            'Meetings and Paperwork',
            'Attitude and Goals',
          ],
          correct: 1,
          explanation: 'The report is important but not yet urgent; the group chat feels urgent but is not important. Telling those apart is the "urgent vs. important" rule, and silencing the chat is managing Interruptions.',
        },
        {
          question: 'You keep putting off replying to a short email that would take about 90 seconds. What does the "2-minute rule" say you should do?',
          options: [
            'Schedule it for tomorrow morning when you are fresh.',
            'Delegate it to someone else on your team.',
            'Do it now, because it takes less than two minutes.',
            'Add it to a weekly batch of admin tasks.',
          ],
          correct: 2,
          explanation: 'A task under two minutes costs more to track, postpone and remember than it costs to simply finish. Clearing these immediately is what stops a short list turning into a heavy one.',
        },
      ],
    },
  },
  {
    id: 3,
    slug: 'professional-communication-and-digital-etiquette',
    title: 'Professional Communication & Digital Etiquette',
    duration: '30 min',
    learningOutcomes: [
      'Code-switch between casual vernacular and professional business English.',
      'Establish boundaries and professionalism on WhatsApp and phone calls.',
      'Audit your own digital presence the way a recruiter would see it.',
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
        reflection: {
          title: 'Reflection',
          saveable: true,
          slot: '3:digital-presence',
          chapterId: 513,
          questions: [
            'Open your WhatsApp profile now. What do your picture, status and display name say to a recruiter who has never met you?',
            'Write down one change you will make today.',
          ],
          placeholder: 'What does your profile say right now, and what will you change?',
        },
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
    takeaways: [
      'Every unknown number is a possible recruiter — answer it the way you want to be remembered.',
      'Code-switching adds a register for work; it does not replace who you are.',
      'Your WhatsApp picture and status are part of your application.',
    ],
    quiz: {
      key: 'Quiz 3 — Professional Communication & Digital Etiquette',
      title: 'Quiz 3 — Professional Communication & Digital Etiquette',
      questions: [
        {
          question: 'Your phone rings from an unknown 011 number while you are buying groceries in a noisy supermarket. How do you answer?',
          options: [
            '"Yebo, who is this?"',
            'Answer, listen, and shout over the background noise so they can hear you.',
            '"Hello, this is [Your Name]. I am in a noisy area—may I call you back in 5 minutes when I step outside?"',
            'Let it ring and wait to see whether they leave a voicemail.',
          ],
          correct: 2,
          explanation: 'Answering identifies you and shows you are reachable; asking to call back protects the quality of the conversation. Ignoring unknown numbers during a job hunt quietly costs you opportunities.',
        },
        {
          question: 'A recruiter WhatsApps you to ask if you are available for an interview tomorrow. How do you reply?',
          options: [
            '"Awe chief, 100% I’ll be there."',
            '"Good day. Yes, I am available tomorrow. Please let me know the time and platform. Thank you."',
            'Respond with a thumbs-up emoji.',
            '"Yes" — sent as six separate one-word messages.',
          ],
          correct: 1,
          explanation: 'A complete reply answers the question and asks for the detail you still need, which saves a whole round of messages and reads as organised.',
        },
        {
          question: 'Why is it important to code-switch in professional environments?',
          options: [
            'Because casual slang can be misinterpreted and lacks the formal respect expected in a corporate setting.',
            'Because employers prefer candidates who speak only one language.',
            'So that you can type messages faster to save data.',
            'Because slang is grammatically incorrect in every situation.',
          ],
          correct: 0,
          explanation: 'Code-switching means adding a register, not erasing who you are. Professional English is the shared language of the workplace, and your home language stays an asset — many employers actively look for it.',
        },
        {
          question: 'It is 21:00 on a Saturday and you have just thought of a great question for the recruiter. What is the professional move?',
          options: [
            'Send it now while it is fresh — recruiters appreciate enthusiasm.',
            'Draft it now and send it on Monday morning during office hours.',
            'Send it now, but apologise for the time in the message.',
            'Phone instead, since a call is more personal than a message.',
          ],
          correct: 1,
          explanation: 'Respecting office hours signals that you will respect boundaries as an employee too. Drafting it immediately means you keep the thought without intruding on someone’s weekend.',
        },
        {
          question: 'Why does this session ask you to audit your WhatsApp profile picture and status while job hunting?',
          options: [
            'Because recruiters are required by law to check your social media.',
            'Because a professional picture improves your connection speed.',
            'Because a recruiter who saves your number sees your picture and status before they ever meet you.',
            'Because WhatsApp ranks professional profiles higher in search results.',
          ],
          correct: 2,
          explanation: 'The moment a recruiter saves your number, your profile becomes part of their first impression — often before your CV is opened. It is the cheapest professional upgrade available to you.',
        },
      ],
    },
  },
  {
    id: 4,
    slug: 'modern-cvs-and-beating-the-ats-with-ai',
    title: 'Modern CVs & Beating the ATS with AI',
    duration: '35 min',
    learningOutcomes: [
      'Transition to a modern, 1-2 page digital CV format.',
      'Use AI tools ethically to tailor applications to Applicant Tracking Systems (ATS).',
      'Tailor a CV to a specific advert so that it survives keyword filtering.',
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
        reflection: {
          title: 'Reflection',
          saveable: true,
          slot: '4:hidden-experience',
          chapterId: 514,
          questions: [
            'Name one real thing you have done — paid, unpaid, at home, at church or at school — that has never appeared on your CV.',
            'Write it as one professional bullet point, using an action verb and a result.',
          ],
          placeholder: 'e.g. "Coordinated weekly stock counts for a family spaza shop, cutting shortages by tracking fast-selling lines."',
        },
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
    takeaways: [
      'An ATS reads your CV before a human does — use the employer’s own words.',
      'One to two pages, simple single-column layout, saved as a PDF.',
      'Use AI to translate real experience into professional language, never to invent it.',
    ],
    quiz: {
      key: 'Quiz 4 — Modern CVs & Beating the ATS with AI',
      title: 'Quiz 4 — Modern CVs & Beating the ATS with AI',
      questions: [
        {
          question: 'What is the primary purpose of an Applicant Tracking System (ATS)?',
          options: [
            'To check your credit score and criminal record.',
            'To design a pretty layout for your CV.',
            'To automatically schedule interviews with every applicant.',
            'To scan CVs for specific keywords and filter out unqualified applicants before a human reads them.',
          ],
          correct: 3,
          explanation: 'An ATS is a filter, not a reader. If your CV does not contain the words the employer used in their advert, a person may never see it — however strong your actual experience is.',
        },
        {
          question: 'Which of the following should you REMOVE from a modern CV?',
          options: [
            'Your contact number and email address.',
            'Bullet points detailing your responsibilities.',
            'A cover page, a photo of yourself, and your marital status.',
            'The names of the companies you have worked for.',
          ],
          correct: 2,
          explanation: 'Cover pages, photos and personal details add pages without adding evidence, and they can introduce bias before anyone has read your experience. Keep to one or two pages of what you have actually done.',
        },
        {
          question: 'When using AI (like ChatGPT) to help with your CV, what is the golden rule?',
          options: [
            'Tell the AI to make up 3 years of experience so you get the job.',
            'Only use the AI to format and translate your real experiences into the vocabulary of the job description.',
            'Copy and paste whatever the AI generates without reading it.',
            'Ask the AI to write your CV before you decide which job to apply for.',
          ],
          correct: 1,
          explanation: 'AI is a translator, not a source of experience. Invented experience collapses in the interview — and the interview is exactly where you have to defend every line on the page.',
        },
        {
          question: 'Which formatting choice is most likely to cause an ATS to misread your CV?',
          options: [
            'Simple headings such as "Work Experience" and "Education".',
            'Saving the document as a PDF.',
            'Laying out your history inside a multi-column table with graphics.',
            'Listing your achievements as short bullet points.',
          ],
          correct: 2,
          explanation: 'Tables, columns and images often scramble when the software flattens your CV to plain text — dates vanish, job titles merge into company names. Simple single-column layouts survive that conversion.',
        },
        {
          question: 'You are applying for five different junior admin roles. What does this session recommend?',
          options: [
            'Send the same CV to all five so your message stays consistent.',
            'Tailor the wording of each CV to the keywords in each advert.',
            'Apply only to the one you like most, to save effort.',
            'Write one very long CV covering every possible skill so it matches everything.',
          ],
          correct: 1,
          explanation: 'Each advert is its own keyword list. Tailoring is usually a ten-minute edit to your summary and bullet points — the cheapest way to move from filtered-out to shortlisted.',
        },
      ],
    },
  },
  {
    id: 5,
    slug: 'interview-preparation-and-execution',
    title: 'Interview Preparation & Execution',
    duration: '35 min',
    learningOutcomes: [
      'Master the STAR method for behavioral interview questions.',
      'Successfully navigate virtual interviews despite local infrastructure challenges.',
      'Plan around predictable local risks — load-shedding, data and noise — before an interview begins.',
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
        reflection: {
          title: 'Reflection',
          saveable: true,
          slot: '5:star-story',
          chapterId: 515,
          questions: [
            'Write a full STAR answer to: "Tell me about a time you had to overcome a sudden problem."',
            'Keep the Result specific — say what actually changed because of what you did.',
          ],
          placeholder: 'Situation… Task… Action… Result…',
        },
      },
    ],
    video: {
      id: 'resCGEf0cMU',
      title: '4 Tips for a Great Zoom Interview',
      channel: 'MherMardoyan Career Coach',
      duration: '2:40',
    },
    actionItem: 'Use your phone’s front camera to record a 1-minute video of yourself answering: "Tell me about a time you had to overcome a sudden problem." Watch it back to check your eye contact, lighting, and use of the STAR method.',
    takeaways: [
      'STAR is a structure for stories — and the Result is the proof that your actions worked.',
      'Front-lit, eye-level and steady beats an expensive camera every time.',
      'Name predictable risks in advance; how you recover is itself being assessed.',
    ],
    quiz: {
      key: 'Quiz 5 — Interview Preparation & Execution',
      title: 'Quiz 5 — Interview Preparation & Execution',
      questions: [
        {
          question: 'During a Zoom interview, your power suddenly trips due to unscheduled load-shedding, and your Wi-Fi dies. What is the best recovery?',
          options: [
            'Panic, assume you lost the job, and do nothing.',
            'Quickly switch to your mobile data, rejoin the call, apologize briefly, and smoothly pick up where you left off.',
            'Wait for the power to return in 2 hours and email them.',
            'Message afterwards to ask whether the whole interview can be restarted another day.',
          ],
          correct: 1,
          explanation: 'Interviewers in South Africa expect grid problems. What they are actually assessing is how you recover, so a calm, fast reconnection is itself evidence that you handle disruption well.',
        },
        {
          question: 'What does the "A" in the STAR method stand for, and why is it important?',
          options: [
            '"Action" - it explains exactly what steps YOU took to solve the problem.',
            '"Attitude" - it shows you are a positive person.',
            '"Apology" - it shows you take blame well.',
            '"Analysis" - it shows how carefully you studied the problem before acting.',
          ],
          correct: 0,
          explanation: 'Action is the part interviewers listen hardest for, and the part candidates rush through. Say "I" rather than "we" here — they are hiring you, not your old team.',
        },
        {
          question: 'Where is the best place to position your laptop/phone during a virtual interview?',
          options: [
            'On your lap while sitting on a couch.',
            'At eye-level, on a steady table, directly facing a window for natural light.',
            'In a dark room so you don’t get distracted.',
            'Below your face, angled upwards, so the interviewer can see your whole room.',
          ],
          correct: 1,
          explanation: 'Eye-level and front-lit is the difference between looking present and looking like a silhouette. A steady surface also spares the interviewer the motion of a handheld phone.',
        },
        {
          question: 'A candidate describes the situation, their task, and everything they did — then stops. Which part of STAR is missing, and why does it matter?',
          options: [
            'Situation — without it the story has no context.',
            'Task — without it nobody knows what was expected of them.',
            'Result — without it the interviewer never learns whether any of it worked.',
            'Nothing is missing; three parts are enough.',
          ],
          correct: 2,
          explanation: 'The Result is the proof. Quantify it wherever you can — "we submitted an hour early", "complaints halved" — because that is the line the interviewer repeats when the panel discusses you afterwards.',
        },
        {
          question: 'Your virtual interview is at 10:00 tomorrow, and load-shedding is scheduled for your area from 09:00 to 11:30. What is the best preparation?',
          options: [
            'Hope the schedule changes and proceed as normal.',
            'Say nothing, and join late once the power comes back.',
            'Email the recruiter today to explain, and either propose a slightly different time or confirm you have a data and power backup.',
            'Cancel and ask to be considered for a later intake.',
          ],
          correct: 2,
          explanation: 'Flagging a known risk in advance reads as planning, not as an excuse. Doing it the day before also gives the recruiter time to respond — doing it at 10:05 does not.',
        },
      ],
    },
  },
];

export const REQUIRED_WORK_READINESS_QUIZ_KEYS = workReadinessSessions.map((s) => s.quiz.key);
