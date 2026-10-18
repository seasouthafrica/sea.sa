// Uplift: E-commerce Basics — the third and final course in the Uplift
// programme, after the Digital Accelerator and Work Readiness.

export const ecommerceMeta = {
  quarter: 'Quarter 3',
  title: 'Uplift: E-commerce Basics',
  fullTitle: 'Uplift: E-commerce Basics',
  partners: ['Social Enterprise Academy', 'Africa Forward'],
  introVideo: {
    id: 'VnyZecULPzg',
    title: 'E-commerce Course Intro',
    channel: 'Grind With Mangi',
    duration: '0:50',
  },
};

export const ecommerceSessions = [
  {
    id: 1,
    slug: 'what-is-ecommerce',
    title: 'What Is E-commerce?',
    summary: 'What selling online actually means, where it came from, and what the South African market looks like today.',
    learningOutcomes: [
      'Explain what e-commerce is and the main ways people sell online.',
      'Describe how e-commerce grew from the first online transactions to today.',
      'Recognise the shape of the South African e-commerce market and its real constraints.',
    ],
    sections: [
      {
        heading: 'What e-commerce actually means',
        paragraphs: [
          'E-commerce is simply buying and selling goods or services over the internet, together with everything that makes that possible — the storefront, the payment, the delivery and the after-sales support. If money changes hands for something because of an online interaction, that is e-commerce.',
          'It is worth being clear that e-commerce is not one single thing. A person selling handmade candles through an Instagram page is doing e-commerce. So is a retailer running a warehouse that dispatches thousands of parcels a day. The difference is scale and systems, not category.',
        ],
        note: {
          type: 'fact',
          title: 'It is older than the web',
          text: 'In 1979 the English inventor Michael Aldrich connected a modified television to a computer over a telephone line and processed a transaction — what he called teleshopping. Online selling existed before the World Wide Web did.',
        },
        accordions: [
          {
            q: 'The three main ways to sell online',
            a: [
              'Your own store — a website you control, built on something like WordPress with WooCommerce or Shopify. Highest effort, lowest commission, and the customer relationship belongs to you.',
              'A marketplace — listing on a platform like Takealot where buyers already are. Fastest access to traffic, but you pay commission and compete directly on price beside similar products.',
              'Social commerce — selling through WhatsApp, Instagram or Facebook. Lowest barrier to entry and very common in South Africa, though it is manual and difficult to scale beyond a point.',
            ],
          },
          {
            q: 'Who sells to whom: B2C, B2B, C2C and D2C',
            a: [
              'B2C (business to consumer) — a shop selling to the public. The most familiar form.',
              'B2B (business to business) — selling to other companies, typically larger orders and invoiced terms.',
              'C2C (consumer to consumer) — individuals selling to each other, as on Facebook Marketplace or Gumtree.',
              'D2C (direct to consumer) — a manufacturer skipping retailers and selling straight to the public, keeping the margin a middleman would take.',
            ],
          },
        ],
      },
      {
        heading: 'Where it came from',
        paragraphs: [
          'The commercial internet opened up in the early 1990s, and the pieces that make online selling safe arrived quickly after. Secure transactions over the web became possible in 1994, and in 1995 both Amazon and eBay launched — one as a retailer, the other as a marketplace. Those two models still describe most of what exists today.',
          'The 2000s added the plumbing: payment gateways, reliable courier networks and broadband. The 2010s added the phone, which moved shopping from a desk to a pocket and made social platforms into sales channels. The pandemic years then compressed roughly a decade of adoption into a very short period, as people who had never shopped online were obliged to.',
        ],
        timeline: [
          { year: '1979', text: 'Michael Aldrich demonstrates teleshopping — the first online transaction.' },
          { year: '1991', text: 'The internet is opened to commercial use.' },
          { year: '1994', text: 'The first secure online purchase is completed using encryption.' },
          { year: '1995', text: 'Amazon and eBay launch, establishing the retailer and marketplace models.' },
          { year: '2000s', text: 'Payment gateways, couriers and broadband make online retail practical.' },
          { year: '2010s', text: 'Smartphones move shopping into the pocket; social becomes a sales channel.' },
          { year: '2020s', text: 'Lockdowns accelerate adoption sharply, including among first-time online shoppers.' },
        ],
      },
      {
        heading: 'E-commerce in South Africa',
        paragraphs: [
          'South Africa has a real and growing online retail market, but it behaves differently from the United States or Europe, and understanding those differences is what separates a seller who survives from one who does not.',
          'Takealot is the dominant local marketplace and is where a great many South Africans begin shopping online. Checkers Sixty60 changed expectations around grocery delivery speed. Fashion is well served by the likes of Superbalist and Mr Price. Alongside these sit thousands of small sellers trading through WhatsApp and Instagram without any formal storefront at all — a segment that is easy to overlook and genuinely large.',
          'The constraints are specific. Many customers do not have a conventional street address for delivery, which is why pick-up points and lockers matter so much here. Data is expensive, so heavy image-laden pages lose people. Trust is a real barrier — a buyer who has been scammed once is slow to try again — which is why reviews, clear returns policies and recognisable payment methods carry more weight locally than they might elsewhere.',
        ],
        note: {
          type: 'tip',
          title: 'Design for the customer you actually have',
          text: 'Keep pages light, show delivery cost and time early, and offer a payment method people recognise. A beautiful store that loads slowly on mobile data and asks for card details up front will lose South African buyers who would otherwise have bought.',
        },
        accordions: [
          {
            q: 'How South Africans pay online',
            a: [
              'Debit and credit cards — still the most common, usually with 3D Secure verification.',
              'Instant EFT — services such as Ozow and PayFast let a buyer pay straight from their bank account without a card.',
              'Mobile and QR payments — SnapScan and Zapper, widely recognised and trusted.',
              'Cash or card on delivery — still offered by some sellers, and it meaningfully lowers the trust barrier for first-time buyers.',
              'Buy now, pay later — increasingly common for higher-value items.',
            ],
          },
          {
            q: 'The real obstacles to selling online here',
            a: [
              'Delivery addressing — many areas lack formal street addresses, making pick-up points and lockers essential rather than optional.',
              'Data cost — every unnecessary megabyte is a reason for someone to close the tab.',
              'Trust — scam awareness is high, so proof matters: reviews, a real contact number, a clear returns policy.',
              'Logistics cost — courier fees can erase the margin on low-value items, so price delivery into your product from the start.',
              'Load-shedding — affects both your ability to operate and your customers ability to browse and pay.',
            ],
          },
        ],
      },
    ],
    video: {
      id: 'HU8vtRFGovM',
      title: 'Introduction to E-commerce',
      channel: 'Grind With Mangi',
      duration: '10:21',
    },
    quiz: {
      key: 'Quiz 1 — What Is E-commerce?',
      questions: [
        {
          question: 'Which of these best describes e-commerce?',
          options: [
            'Only large online retailers with warehouses and delivery fleets.',
            'Buying and selling goods or services over the internet, including the payment and delivery that make it work.',
            'Advertising a business on social media.',
            'Any business that has a website.',
          ],
          correct: 1,
        },
        {
          question: 'In 1979, Michael Aldrich demonstrated what is considered the first online transaction. What does this tell us?',
          options: [
            'E-commerce began with Amazon in the 1990s.',
            'Online selling existed before the World Wide Web.',
            'Online shopping was invented in South Africa.',
            'E-commerce only became possible once smartphones existed.',
          ],
          correct: 1,
        },
        {
          question: 'Which two companies launched in 1995 and established the retailer and marketplace models still used today?',
          options: ['Google and Facebook', 'Takealot and Checkers Sixty60', 'Amazon and eBay', 'Shopify and WooCommerce'],
          correct: 2,
        },
        {
          question: 'A seller lists products on Takealot rather than building their own website. What is the main trade-off?',
          options: [
            'They reach existing buyers quickly, but pay commission and compete on price beside similar products.',
            'They pay nothing and keep full control of the customer relationship.',
            'They cannot sell physical products at all.',
            'It is always cheaper than running your own store.',
          ],
          correct: 0,
        },
        {
          question: 'Why do pick-up points and lockers matter particularly in the South African market?',
          options: [
            'They are cheaper for the courier company.',
            'Many customers do not have a conventional street address for delivery.',
            'They are required by law.',
            'They allow sellers to avoid paying VAT.',
          ],
          correct: 1,
        },
        {
          question: 'Your store is image-heavy and slow to load. Why is this a bigger problem in South Africa than in some other markets?',
          options: [
            'South African browsers block large images.',
            'Data is expensive, so a heavy page gives people a reason to leave before they see your product.',
            'Search engines do not index image-heavy sites.',
            'It makes no real difference.',
          ],
          correct: 1,
        },
      ],
    },
  },
  {
    id: 2,
    slug: 'market-research-before-you-sell',
    title: 'Market Research Before You Sell',
    summary: 'How to find out whether anyone actually wants the product you have in mind — before you spend money on stock.',
    learningOutcomes: [
      'Explain why demand research comes before buying stock or building a store.',
      'Use free tools to test whether there is real demand for a product.',
      'Judge when a market is too crowded or too thin to be worth entering.',
    ],
    sections: [
      {
        heading: 'Check the demand before you buy the stock',
        paragraphs: [
          'Before you can start selling a product online you need to do market research and check whether there is demand for the product you have in mind — unless you are going to sell a product that you are manufacturing or producing yourself.',
          'That exception matters, but it is narrower than people assume. If you make the product, you are not betting someone else\'s stock money on a guess, so the risk of being wrong is lower. You still need research, though — not to decide whether to make it, but to decide what to charge, who to aim at, and how to describe it so that it sells.',
          'For everyone else — anyone buying stock to resell, importing, or dropshipping — research is the difference between a business and an expensive hobby. The most common way new online sellers lose money is buying stock they were confident about, which then sits in a room because nobody was actually looking for it. Confidence is not demand. Demand leaves evidence, and that evidence can be checked before you spend a cent.',
        ],
        note: {
          type: 'warning',
          title: 'Be sceptical of "winning product" lists',
          text: 'Social media is full of videos promising hot products to sell. By the time a product is on a public list, thousands of other sellers have seen the same video and are advertising the same item to the same people. The crowd itself destroys the margin.',
        },
      },
      {
        heading: 'How to check whether demand is real',
        paragraphs: [
          'You are looking for evidence that people are already trying to buy this, and that there is room for one more seller. These methods cost nothing but your time.',
        ],
        numbered: [
          { label: 'Search interest', text: 'Use Google Trends with the region set to South Africa. Is interest steady, rising, seasonal, or quietly dying? A flat line near zero is an answer.' },
          { label: 'Marketplace evidence', text: 'Search Takealot for the product. Are competitors there? Do listings show review counts? Reviews are proof of purchases, not just interest.' },
          { label: 'What people actually type', text: 'Start typing the product into Google or Takealot and read the autocomplete suggestions. Those are real searches by real people, and they tell you the words your customers use.' },
          { label: 'Competitor study', text: 'Find three sellers already doing it. Note their pricing, delivery cost, photography and what their reviews complain about. Complaints are the gap you can fill.' },
          { label: 'Talk to ten people', text: 'Ask ten potential customers what they currently use and what frustrates them. Ask what they last paid. Listen for the problem, not for politeness.' },
          { label: 'Validate before you commit', text: 'Put up a simple page or a WhatsApp catalogue and see whether anyone asks to buy. Interest expressed with a message is worth more than a hundred likes.' },
        ],
        accordions: [
          {
            q: 'Free tools worth using',
            a: [
              'Google Trends — compare search interest over time and filter to South Africa specifically.',
              'Google and Takealot autocomplete — free insight into the exact phrases buyers type.',
              'Takealot best sellers and review counts — evidence of what is actually moving.',
              'Facebook and Instagram search — see whether anyone is already advertising it locally.',
              'Your own WhatsApp contacts — the fastest honest feedback you will ever get.',
            ],
          },
          {
            q: 'Ten questions worth asking a potential customer',
            a: [
              'What do you use for this at the moment?',
              'Where did you buy it, and what did you pay?',
              'What annoys you most about the one you have?',
              'How often do you replace or repurchase it?',
              'What would make you switch to something else?',
              'Would you buy this online, or do you need to see it first?',
              'What delivery wait would be too long?',
              'What price would feel too cheap to trust?',
              'Who else do you know who buys this?',
              'If I had this available next week, would you want one?',
            ],
          },
        ],
      },
      {
        heading: 'Knowing when to walk away',
        paragraphs: [
          'Research is only useful if you are genuinely willing to act on a bad answer. Walking away from a product costs you an afternoon. Committing to the wrong one costs you your stock money and several months.',
        ],
        groups: [
          { label: 'No search interest', points: ['Nobody is looking for it. You would be paying to create demand from zero, which is expensive and slow.'] },
          { label: 'Dominated by entrenched sellers', points: ['Established competitors with thousands of reviews and better pricing. You cannot out-compete them on their own terms as a newcomer.'] },
          { label: 'Margin dies after delivery', points: ['Work out your true cost including courier fees and returns. If a R150 item costs R90 to land and R60 to deliver, you do not have a business.'] },
          { label: 'Fragile or perishable', points: ['Breakage and spoilage turn every delivery into a potential refund. Avoid these until your logistics are solid.'] },
        ],
      },
    ],
    video: {
      id: 'Wy_GTCVKskc',
      title: 'Product and Market Research',
      channel: 'Grind With Mangi',
      duration: '7:55',
    },
    quiz: {
      key: 'Quiz 2 — Market Research Before You Sell',
      questions: [
        {
          question: 'When is it acceptable to start selling without first researching demand?',
          options: [
            'Whenever you feel confident about the product.',
            'If you are manufacturing or producing the product yourself — though research still guides your pricing and positioning.',
            'If the product is cheap to buy.',
            'Never, under any circumstances.',
          ],
          correct: 1,
        },
        {
          question: 'Which tool lets you compare search interest for a product over time, filtered to South Africa?',
          options: ['Google Trends', 'Microsoft Excel', 'WhatsApp Business', 'Canva'],
          correct: 0,
        },
        {
          question: 'Why are review counts on a marketplace listing more useful than view counts?',
          options: [
            'Reviews are easier to find.',
            'Reviews are evidence of actual purchases, not just interest.',
            'Views are always fake.',
            'Reviews show the seller\'s profit margin.',
          ],
          correct: 1,
        },
        {
          question: 'You find a product on a "winning products to sell" video. What is the main risk?',
          options: [
            'The product is probably illegal.',
            'Thousands of other sellers saw the same video and are advertising the same item to the same people, which destroys the margin.',
            'The video is always wrong about the product.',
            'There is no risk — these lists are researched for you.',
          ],
          correct: 1,
        },
        {
          question: 'An item costs you R90 to land and R60 to deliver, and you plan to sell it for R150. What does the research tell you?',
          options: [
            'Raise the price to R160 and proceed.',
            'The margin dies after delivery costs — this is not yet a viable product.',
            'Delivery costs do not count as a business expense.',
            'Sell it anyway and make the money back on volume.',
          ],
          correct: 1,
        },
        {
          question: 'What is the strongest early signal that demand is real?',
          options: [
            'Friends saying it is a good idea.',
            'A high number of likes on a social media post.',
            'Someone messaging to ask how they can buy it.',
            'The product trending in another country.',
          ],
          correct: 2,
        },
      ],
    },
  },
  {
    id: 3,
    slug: 'build-your-store',
    title: 'Build Your Store with WordPress, WooCommerce and AI',
    summary: 'Turning the validated idea into an actual shop you control — and where AI genuinely saves you time.',
    learningOutcomes: [
      'Describe what WordPress and WooCommerce are and when a self-hosted store makes sense.',
      'List what you need in place before you can accept your first order.',
      'Use AI to speed up product content without letting it invent claims.',
    ],
    sections: [
      {
        heading: 'Why your own store, and why WooCommerce',
        paragraphs: [
          'A marketplace rents you an audience. Your own store means you own the shopfront, the customer list and the margin — and nobody can change the commission or suspend you without warning.',
          'WordPress is the software that runs the website. WooCommerce is the free plugin that turns it into a shop: products, a cart, checkout, orders, delivery rules and tax. Together they are the most common way in the world to run a store you actually own, and because they are open source there is no monthly platform fee — you pay for hosting and a domain, not for permission to trade.',
        ],
        accordions: [
          {
            q: 'What you need before you can take an order',
            a: [
              'A domain name — your address, ideally short and easy to say over the phone.',
              'Hosting — where the site lives. A local host often means a faster site for South African visitors.',
              'WordPress and WooCommerce — the site and the shop layer.',
              'A payment gateway — PayFast, Ozow, Yoco or Stripe, so you can actually be paid.',
              'A delivery plan — courier rates, pick-up points, and clear delivery costs shown before checkout.',
              'Legal basics — returns policy, contact details and terms. These also build the trust that converts browsers into buyers.',
            ],
          },
          {
            q: 'Where AI genuinely helps — and where it does not',
            a: [
              'Helps: drafting product descriptions from your own bullet points, writing category pages, generating FAQ answers, suggesting a site structure, and rewriting copy for a different audience.',
              'Helps: turning one good product description into fifty consistent ones, which is the tedious part of launching a catalogue.',
              'Does not help: inventing specifications, materials, dimensions or claims. If you did not give it the fact, do not publish the fact.',
              'Does not help: product photography of a physical item you are actually shipping. Customers notice, and misleading images drive returns.',
            ],
          },
        ],
        note: {
          type: 'tip',
          title: 'Write one description properly, then scale it',
          text: 'Write your best product description by hand, then give it to the AI as the example to match for the rest of your catalogue. You get consistency and tone without typing the same thing a hundred times — and the facts stay yours.',
        },
      },
    ],
    video: {
      id: 'WVdusjfGWqM',
      title: 'How to Create an E-Commerce Store in South Africa',
      channel: 'Grind With Mangi',
      duration: '19:25',
    },
    actionItem: 'Register a domain name you would be happy to say out loud on a phone call, and write one complete product description by hand — the one you will use as the example for everything else.',
  },
  {
    id: 4,
    slug: 'driving-traffic-and-sales',
    title: 'Driving Traffic and Making the Sale',
    summary: 'A store with no visitors is a closed shop. Where traffic comes from, and why visitors leave without buying.',
    learningOutcomes: [
      'Identify the main channels that bring visitors to an online store.',
      'Plan a small paid campaign with a defined objective, audience and budget.',
      'Diagnose why visitors arrive and leave without buying.',
    ],
    sections: [
      {
        heading: 'Where visitors actually come from',
        paragraphs: [
          'Building the store is the part people enjoy. Getting anyone to visit it is the part that decides whether the business works. Traffic is not one thing — it comes from several channels, each with a different cost and a different speed.',
        ],
        groups: [
          { label: 'Search (SEO)', points: ['People actively looking for what you sell. Slow to build, free once it works, and the most durable channel there is.'] },
          { label: 'Paid ads', points: ['Meta and Google. Instant traffic that stops the moment you stop paying. Best used once you know what converts.'] },
          { label: 'Social content', points: ['Organic posts and short video. Cheap but demands consistency; one viral post is luck, a habit is a channel.'] },
          { label: 'WhatsApp and community', points: ['Groups, status updates and direct messages. Underrated in South Africa and often the highest-converting channel a small seller has.'] },
          { label: 'Email and repeat buyers', points: ['The cheapest sale is to someone who already bought. Collect addresses from day one.'] },
        ],
        note: {
          type: 'fact',
          title: 'Paid traffic exposes problems, it does not fix them',
          text: 'If your product page does not convert organic visitors, paying for more visitors simply loses money faster. Fix the page first, then buy traffic to it.',
        },
      },
      {
        heading: 'Why visitors leave without buying',
        paragraphs: [
          'Most people who abandon a purchase are not rejecting your product. They hit a specific obstacle, and nearly all of them are fixable without spending money.',
        ],
        accordions: [
          {
            q: 'The usual reasons a sale is lost',
            a: [
              'Delivery cost appears late — a price that changes at checkout feels like a trick. Show it early.',
              'No trust signals — no reviews, no contact number, no returns policy, so the buyer assumes risk.',
              'Slow pages on mobile data — people leave before the product loads.',
              'Too many checkout steps, or forcing account creation before purchase.',
              'Unclear delivery time — "we will be in touch" is not an answer to "when will it arrive?"',
              'Payment method they do not recognise or trust.',
            ],
          },
          {
            q: 'A simple first campaign',
            a: [
              'Pick one objective. Traffic or sales — not both, and not "awareness" when what you need is orders.',
              'Pick one audience and keep it narrow enough to learn something.',
              'Set a small daily budget you can afford to lose entirely while you learn.',
              'Run one clear creative with a single message and an obvious call to action.',
              'Give it long enough to produce data, then change one thing at a time.',
            ],
          },
        ],
      },
    ],
    video: {
      id: 'Qs_p21vLp1A',
      title: 'How to Get Traffic to a New Website',
      channel: 'Ahrefs',
      duration: '9:37',
    },
    simulator: {
      id: 'meta-ads',
      heading: 'Meta Ads Simulator',
      intro: 'Plan a campaign the way you would in Meta Ads Manager — objective, audience, budget and creative — and see the estimated reach and cost before you spend anything real. Nothing here charges you; it is a practice run.',
    },
    actionItem: 'Use the simulator to plan one campaign for a product you would actually sell. Write down the objective, the audience and the daily budget, then work out how many sales you would need to break even.',
  },
];

export const REQUIRED_ECOMMERCE_QUIZ_KEYS = ecommerceSessions
  .filter((s) => s.quiz)
  .map((s) => s.quiz.key);

export const ecommerceConclusion = {
  heading: 'Congratulations — you have reached the end of Uplift',
  paragraphs: [
    'Congratulations on reaching the final section of the Uplift programme. We are glad you have made it this far.',
    'This journey started with the Digital Accelerator, where you learned the basics of creating a logo and building a website. The second course taught you work readiness — how to present yourself, communicate professionally and prepare properly for an interview. And now you have learned what e-commerce is, how to research a market before committing money to it, how to build your own store, and how to drive traffic to it and convert that traffic into sales.',
    'What you are holding now is a set of skills that work together. You can identify an opportunity, validate it, build something to serve it, and bring customers to it. Our hope is that you will use these skills to create income opportunities for yourself and to make yourself stand out in the marketplace — whether that means launching your own store, taking these capabilities into a job, or offering them as a service to businesses that need them.',
    'Once again, from the Social Enterprise Academy South Africa — congratulations.',
  ],
  journey: [
    { course: 'Digital Accelerator', text: 'Market research, logo and brand design, building a website with AI, and running digital campaigns.' },
    { course: 'Work Readiness', text: 'Career resilience, professional conduct, communication, modern CVs and interview preparation.' },
    { course: 'E-commerce Basics', text: 'What e-commerce is, validating demand, building your own store, and driving traffic that converts.' },
  ],
};

export const ecommerceResources = [
  { title: 'Google Trends', url: 'https://trends.google.com', description: 'Compare search interest for a product over time and filter it to South Africa.' },
  { title: 'WooCommerce Documentation', url: 'https://woocommerce.com/documentation/', description: 'Official guides for setting up products, payments, shipping and tax.' },
  { title: 'Takealot', url: 'https://www.takealot.com', description: 'South Africa\'s largest marketplace — useful for researching competitors, pricing and reviews.' },
  { title: 'Meta Business Help Centre', url: 'https://www.facebook.com/business/help', description: 'Official guidance on setting up and running Facebook and Instagram ad campaigns.' },
  { title: 'Payfast', url: 'https://payfast.io', description: 'Widely used South African payment gateway — card, instant EFT and more.' },
  { title: 'Ozow', url: 'https://ozow.com', description: 'Instant EFT payments, letting buyers pay straight from their bank without a card.' },
];
