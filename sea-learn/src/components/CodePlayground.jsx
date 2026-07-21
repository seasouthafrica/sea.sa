import { useEffect, useRef, useState } from 'react';
import SimulatorSaveBar from './SimulatorSaveBar';

const CHALLENGES = [
  // ── HTML ──
  {
    id: 'html-1',
    phase: 'HTML',
    title: 'Your First Heading',
    instruction: 'Create a heading that says "Hello World" using the <h1> tag.',
    starterCode: '<!-- Type your HTML below -->\n\n',
    hint: '<h1>Hello World</h1>',
    validate: (doc) => {
      const h1 = doc.querySelector('h1');
      return h1 && h1.textContent.trim().toLowerCase().includes('hello world');
    },
    successMsg: 'You created your first HTML heading!',
  },
  {
    id: 'html-2',
    phase: 'HTML',
    title: 'Add a Paragraph',
    instruction: 'Add a paragraph below the heading that describes yourself or your business. Use the <p> tag.',
    starterCode: '<h1>Hello World</h1>\n\n<!-- Add a paragraph below -->\n',
    hint: '<h1>Hello World</h1>\n<p>I am learning web development.</p>',
    validate: (doc) => {
      const h1 = doc.querySelector('h1');
      const p = doc.querySelector('p');
      return h1 && p && p.textContent.trim().length > 5;
    },
    successMsg: 'Paragraphs hold the body content of your page — like ribs holding organs!',
  },
  {
    id: 'html-3',
    phase: 'HTML',
    title: 'Create a List',
    instruction: 'Add an unordered list (<ul>) with at least 3 items (<li>) — list three skills you want to learn.',
    starterCode: '<h1>Skills I Want to Learn</h1>\n<p>Here are the digital skills on my list:</p>\n\n<!-- Add your list below -->\n',
    hint: '<h1>Skills I Want to Learn</h1>\n<p>Here are the digital skills on my list:</p>\n<ul>\n  <li>Digital Marketing</li>\n  <li>Web Development</li>\n  <li>AI Tools</li>\n</ul>',
    validate: (doc) => {
      const items = doc.querySelectorAll('ul li');
      return items.length >= 3;
    },
    successMsg: 'Lists organise information — essential for menus, features, and navigation!',
  },
  {
    id: 'html-4',
    phase: 'HTML',
    title: 'Add a Link & Image',
    instruction: 'Add a link (<a>) to any website using href, and an image (<img>) using src. For the image you can use: https://placehold.co/300x200',
    starterCode: '<h1>My First Web Page</h1>\n<p>Welcome to my site!</p>\n\n<!-- Add a link and image below -->\n',
    hint: '<h1>My First Web Page</h1>\n<p>Welcome to my site!</p>\n<a href="https://google.com">Visit Google</a>\n<img src="https://placehold.co/300x200" alt="Placeholder">',
    validate: (doc) => {
      const a = doc.querySelector('a[href]');
      const img = doc.querySelector('img[src]');
      return a && img;
    },
    successMsg: 'Links and images connect the web together — you\'ve built the skeleton!',
  },
  // ── CSS ──
  {
    id: 'css-1',
    phase: 'CSS',
    title: 'Add Colour & Font',
    instruction: 'Add a <style> tag and change the body background colour and the h1 text colour. Try any colours you like!',
    starterCode: '<style>\n  /* Add your CSS here */\n  \n</style>\n\n<h1>My Styled Page</h1>\n<p>This page is getting a makeover!</p>',
    hint: '<style>\n  body {\n    background-color: #1a1a2e;\n    color: white;\n  }\n  h1 {\n    color: #e94560;\n  }\n</style>\n\n<h1>My Styled Page</h1>\n<p>This page is getting a makeover!</p>',
    validate: (doc) => {
      const style = doc.querySelector('style');
      return style && style.textContent.includes('background') && style.textContent.includes('color');
    },
    successMsg: 'You just applied the "skin" to your website — CSS colours bring personality!',
  },
  {
    id: 'css-2',
    phase: 'CSS',
    title: 'Style a Card',
    instruction: 'Style the <div> to look like a card: add padding, border-radius, background-color, and box-shadow.',
    starterCode: '<style>\n  body {\n    background: #f0f0f0;\n    font-family: Arial, sans-serif;\n    padding: 40px;\n  }\n  .card {\n    /* Style this card */\n    \n  }\n</style>\n\n<div class="card">\n  <h2>Digital Marketing</h2>\n  <p>Learn to grow audiences and attract paying clients through social media and content creation.</p>\n</div>',
    hint: '<style>\n  body {\n    background: #f0f0f0;\n    font-family: Arial, sans-serif;\n    padding: 40px;\n  }\n  .card {\n    background: white;\n    padding: 24px;\n    border-radius: 16px;\n    box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n  }\n  h2 { color: #009da0; }\n</style>\n\n<div class="card">\n  <h2>Digital Marketing</h2>\n  <p>Learn to grow audiences and attract paying clients through social media and content creation.</p>\n</div>',
    validate: (doc) => {
      const style = doc.querySelector('style');
      const text = style ? style.textContent : '';
      return text.includes('padding') && text.includes('border-radius') && (text.includes('background') || text.includes('box-shadow'));
    },
    successMsg: 'Cards are everywhere — Instagram posts, product listings, dashboards. You just built one!',
  },
  {
    id: 'css-3',
    phase: 'CSS',
    title: 'Layout with Flexbox',
    instruction: 'Use display: flex on the .container to place the three boxes side by side. Add gap to space them out.',
    starterCode: '<style>\n  body { font-family: Arial, sans-serif; padding: 20px; }\n  .container {\n    /* Make this a flex container */\n    \n  }\n  .box {\n    background: #009da0;\n    color: white;\n    padding: 24px;\n    border-radius: 12px;\n    text-align: center;\n    flex: 1;\n  }\n</style>\n\n<div class="container">\n  <div class="box">HTML</div>\n  <div class="box">CSS</div>\n  <div class="box">JavaScript</div>\n</div>',
    hint: '<style>\n  body { font-family: Arial, sans-serif; padding: 20px; }\n  .container {\n    display: flex;\n    gap: 16px;\n  }\n  .box {\n    background: #009da0;\n    color: white;\n    padding: 24px;\n    border-radius: 12px;\n    text-align: center;\n    flex: 1;\n  }\n</style>\n\n<div class="container">\n  <div class="box">HTML</div>\n  <div class="box">CSS</div>\n  <div class="box">JavaScript</div>\n</div>',
    validate: (doc) => {
      const style = doc.querySelector('style');
      return style && style.textContent.includes('display') && style.textContent.includes('flex');
    },
    successMsg: 'Flexbox is how modern websites create responsive layouts — you\'re thinking like a developer!',
  },
  // ── JavaScript ──
  {
    id: 'js-1',
    phase: 'JavaScript',
    title: 'Make a Button Work',
    instruction: 'Add a <script> that changes the heading text when the button is clicked. Use document.querySelector and addEventListener.',
    starterCode: '<h1 id="title">Click the button!</h1>\n<button id="btn">Change Text</button>\n\n<script>\n  // Make the button change the heading text\n  \n</script>',
    hint: '<h1 id="title">Click the button!</h1>\n<button id="btn">Change Text</button>\n\n<script>\n  document.getElementById("btn").addEventListener("click", function() {\n    document.getElementById("title").textContent = "You clicked it! 🎉";\n  });\n</script>',
    validate: (doc) => {
      const script = doc.querySelector('script');
      return script && script.textContent.includes('addEventListener') || (script && script.textContent.includes('onclick'));
    },
    successMsg: 'You gave your website a heartbeat — JavaScript responds to user actions!',
  },
  {
    id: 'js-2',
    phase: 'JavaScript',
    title: 'Toggle Dark Mode',
    instruction: 'Write JavaScript that toggles a "dark" class on the body when the button is clicked. The CSS is already set up for you.',
    starterCode: '<style>\n  body {\n    font-family: Arial, sans-serif;\n    padding: 40px;\n    transition: all 0.3s;\n  }\n  body.dark {\n    background: #1a1a2e;\n    color: #eee;\n  }\n  button {\n    padding: 12px 24px;\n    border: none;\n    border-radius: 8px;\n    background: #009da0;\n    color: white;\n    font-size: 16px;\n    cursor: pointer;\n  }\n</style>\n\n<h1>Dark Mode Toggle</h1>\n<p>Click the button to switch between light and dark mode.</p>\n<button id="toggle">Toggle Dark Mode</button>\n\n<script>\n  // Toggle the "dark" class on the body\n  \n</script>',
    hint: '<style>\n  body {\n    font-family: Arial, sans-serif;\n    padding: 40px;\n    transition: all 0.3s;\n  }\n  body.dark {\n    background: #1a1a2e;\n    color: #eee;\n  }\n  button {\n    padding: 12px 24px;\n    border: none;\n    border-radius: 8px;\n    background: #009da0;\n    color: white;\n    font-size: 16px;\n    cursor: pointer;\n  }\n</style>\n\n<h1>Dark Mode Toggle</h1>\n<p>Click the button to switch between light and dark mode.</p>\n<button id="toggle">Toggle Dark Mode</button>\n\n<script>\n  document.getElementById("toggle").addEventListener("click", function() {\n    document.body.classList.toggle("dark");\n  });\n</script>',
    validate: (doc) => {
      const script = doc.querySelector('script');
      return script && script.textContent.includes('classList') && script.textContent.includes('toggle');
    },
    successMsg: 'You built a real feature used by millions of apps — HTML + CSS + JS working as one living organism!',
  },
  {
    id: 'js-3',
    phase: 'JavaScript',
    title: 'Build a Counter',
    instruction: 'Create a counter that increases when you click "+" and decreases when you click "−". Display the count in the <span>.',
    starterCode: '<style>\n  body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }\n  .counter { font-size: 64px; font-weight: bold; color: #009da0; margin: 20px 0; }\n  button { padding: 12px 24px; margin: 0 8px; border: none; border-radius: 8px; font-size: 24px; cursor: pointer; }\n  .minus { background: #e53e3e; color: white; }\n  .plus { background: #38a169; color: white; }\n</style>\n\n<h1>Counter App</h1>\n<div class="counter"><span id="count">0</span></div>\n<button class="minus" id="minus">−</button>\n<button class="plus" id="plus">+</button>\n\n<script>\n  let count = 0;\n  // Make the buttons work\n  \n</script>',
    hint: '<style>\n  body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }\n  .counter { font-size: 64px; font-weight: bold; color: #009da0; margin: 20px 0; }\n  button { padding: 12px 24px; margin: 0 8px; border: none; border-radius: 8px; font-size: 24px; cursor: pointer; }\n  .minus { background: #e53e3e; color: white; }\n  .plus { background: #38a169; color: white; }\n</style>\n\n<h1>Counter App</h1>\n<div class="counter"><span id="count">0</span></div>\n<button class="minus" id="minus">−</button>\n<button class="plus" id="plus">+</button>\n\n<script>\n  let count = 0;\n  document.getElementById("plus").addEventListener("click", function() {\n    count++;\n    document.getElementById("count").textContent = count;\n  });\n  document.getElementById("minus").addEventListener("click", function() {\n    count--;\n    document.getElementById("count").textContent = count;\n  });\n</script>',
    validate: (doc) => {
      const script = doc.querySelector('script');
      const text = script ? script.textContent : '';
      return text.includes('addEventListener') && (text.includes('count++') || text.includes('count +=') || text.includes('count = count + 1'));
    },
    successMsg: 'You just built an interactive app! Skeleton + Skin + Organs = a complete, living website.',
  },
];

const PHASE_COLORS = {
  HTML: { bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  CSS: { bg: 'bg-pink-500', light: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-800' },
  JavaScript: { bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
};

export default function CodePlayground({ userId }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [code, setCode] = useState(CHALLENGES[0].starterCode);
  const [showHint, setShowHint] = useState(false);
  const [passed, setPassed] = useState(false);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [srcdoc, setSrcdoc] = useState('');
  const textareaRef = useRef(null);

  const challenge = CHALLENGES[currentIdx];
  const colors = PHASE_COLORS[challenge.phase];
  const totalCompleted = completedSet.size;
  const progress = Math.round((totalCompleted / CHALLENGES.length) * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSrcdoc(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font-family:Arial,Helvetica,sans-serif;padding:16px;margin:0;}</style></head><body>${code}</body></html>`);
    }, 300);
    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    setCode(challenge.starterCode);
    setShowHint(false);
    setPassed(false);
  }, [currentIdx]);

  const checkAnswer = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${code}</body>`, 'text/html');
    if (challenge.validate(doc)) {
      setPassed(true);
      setCompletedSet((prev) => new Set([...prev, challenge.id]));
    } else {
      setPassed(false);
      const ta = textareaRef.current;
      if (ta) {
        ta.classList.add('shake');
        setTimeout(() => ta.classList.remove('shake'), 500);
      }
    }
  };

  const goNext = () => {
    if (currentIdx < CHALLENGES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      setCode(val.substring(0, start) + '  ' + val.substring(end));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-950 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <h3 className="font-bold text-white">Code Playground</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>{challenge.phase}</span>
          <span className="text-xs text-gray-400">{currentIdx + 1} / {CHALLENGES.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100">
        <div className={`h-full ${colors.bg} transition-all duration-500`} style={{ width: `${progress}%` }} />
      </div>

      {/* Challenge info */}
      <div className={`border-b ${colors.border} ${colors.light} px-5 py-4`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className={`text-lg font-bold ${colors.text}`}>{challenge.title}</h4>
            <p className="mt-1 text-sm text-slate-700">{challenge.instruction}</p>
          </div>
          {completedSet.has(challenge.id) && (
            <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">✓ Done</span>
          )}
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Code editor */}
        <div className="relative border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
            <span className="text-xs font-semibold text-slate-500">index.html</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="rounded-md bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-200"
              >
                {showHint ? 'Hide Hint' : '💡 Hint'}
              </button>
              <button
                onClick={() => { setCode(challenge.starterCode); setPassed(false); }}
                className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
              >
                ↺ Reset
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => { setCode(e.target.value); setPassed(false); }}
            onKeyDown={handleTab}
            className="playground-editor w-full resize-none bg-slate-950 p-4 font-mono text-sm leading-relaxed text-green-300 outline-none placeholder:text-slate-600"
            style={{ minHeight: '280px', height: '280px' }}
            spellCheck={false}
            placeholder="Type your code here..."
          />
          {showHint && (
            <div className="border-t border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 text-xs font-bold text-amber-800">Example solution:</p>
              <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs text-slate-700">{challenge.hint}</pre>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div>
          <div className="flex items-center border-b border-slate-100 bg-slate-50 px-4 py-2">
            <span className="text-xs font-semibold text-slate-500">Live Preview</span>
            <span className="ml-2 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <iframe
            srcDoc={srcdoc}
            title="Code Preview"
            sandbox="allow-scripts"
            className="w-full bg-white"
            style={{ minHeight: '280px', height: '280px' }}
          />
        </div>
      </div>

      {/* Success / Check */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-slate-50 px-5 py-4">
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <button
            onClick={goNext}
            disabled={currentIdx === CHALLENGES.length - 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>

        {passed ? (
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
              ✅ {challenge.successMsg}
            </span>
            {currentIdx < CHALLENGES.length - 1 && (
              <button
                onClick={goNext}
                className={`rounded-lg ${colors.bg} px-5 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90`}
              >
                Next Challenge →
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={checkAnswer}
            className={`rounded-lg ${colors.bg} px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90`}
          >
            Check My Code
          </button>
        )}
      </div>

      {/* Challenge Navigator */}
      <div className="border-t bg-white px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {CHALLENGES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setCurrentIdx(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                i === currentIdx
                  ? `${colors.bg} text-white shadow-md`
                  : completedSet.has(c.id)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={c.title}
            >
              {completedSet.has(c.id) ? '✓' : i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Save bar — visible once at least half challenges are done */}
      {userId && totalCompleted >= Math.ceil(CHALLENGES.length / 2) && (
        <div className="border-t px-5 py-4">
          <SimulatorSaveBar
            userId={userId}
            simId={51}
            label="Code Playground"
            snapshotData={{ completed: totalCompleted, total: CHALLENGES.length, challenges: [...completedSet] }}
            onReset={() => {
              setCompletedSet(new Set());
              setCurrentIdx(0);
              setCode(CHALLENGES[0].starterCode);
              setPassed(false);
              setShowHint(false);
            }}
          />
        </div>
      )}

      <style>{`
        .playground-editor::selection { background: rgba(0,157,160,0.3); }
        .shake { animation: shake 0.4s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
