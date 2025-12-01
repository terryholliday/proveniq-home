export type TrainingModule = {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  content: {
    heading: string;
    body: React.ReactNode;
  }[];
  quiz?: {
    questions: {
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }[];
  };
  roleplay?: {
    scenario: string;
  };
};

export const trainingModules: TrainingModule[] = [
  {
    id: 'elevator-pitch',
    title: 'The Elevator Pitch',
    description: 'Learn how to describe MyARK in 30 seconds and spark immediate interest.',
    level: 'Beginner',
    content: [
      {
        heading: 'The Core Concept',
        body: 'MyARK is the operating system for your physical assets. We turn your static possessions into a dynamic, manageable, and protected inventory.',
      },
      {
        heading: 'Key Differentiators',
        body: "Don't just say it's a home inventory app. Focus on what makes it unique: AI-powered valuation, insurance claim generation, and integrated legacy planning.",
      },
    ],
    quiz: {
      questions: [
        {
          id: 'q1',
          question: 'What is the primary concept of MyARK?',
          options: [
            'A simple photo album',
            'An operating system for physical assets',
            'A social network for collectors',
            'A basic spreadsheet app',
          ],
          correctIndex: 1,
          explanation: "Describing MyARK as an 'operating system' effectively communicates its comprehensive and dynamic nature.",
        },
      ],
    },
  },
  {
    id: 'handling-objections',
    title: 'Handling Objections',
    description: 'Master the art of turning customer skepticism into sales opportunities.',
    level: 'Intermediate',
    content: [
      {
        heading: "Objection: 'I already use an Excel sheet.'",
        body: "Acknowledge their effort first. Then, pivot to MyARK's advantages. An Excel sheet is static; MyARK is dynamic. It provides real-time market valuations, generates insurance reports with a click, and lets you attach photos, receipts, and even video stories to your items. Ask them, 'Can your spreadsheet tell you if your collectibles are trending up in value?'",
      },
      {
        heading: "Objection: 'This sounds too complicated.'",
        body: "Empathize with their concern about complexity. Then, highlight the AI Scanner. Explain, 'We designed it to be the opposite of complicated. You just take a picture, and our AI does most of the work for you, identifying the item and filling in the details. It’s as easy as using your phone’s camera.'",
      },
    ],
    quiz: {
      questions: [
        {
          id: 'ho_q1',
          question: "When a customer says they use a spreadsheet, what's the best first step?",
          options: [
            'Tell them spreadsheets are outdated.',
            'Immediately list all of MyARKs features.',
            'Acknowledge their existing system and effort.',
            'Ask for a copy of their spreadsheet.',
          ],
          correctIndex: 2,
          explanation: 'Acknowledging their current method shows respect and opens the door for a conversation about improvements rather than replacements.',
        },
        {
          id: 'ho_q2',
          question: "What is the strongest counter to the 'it's too complicated' objection?",
          options: [
            'Our detailed user guide.',
            'Our 24/7 customer support.',
            'The AI Scanner that automates data entry.',
            'The ability to export to CSV.',
          ],
          correctIndex: 2,
          explanation: 'The AI Scanner directly addresses the pain point of manual data entry, which is the root of perceived complexity.',
        },
      ],
    },
    roleplay: {
      scenario: "A potential customer tells you, 'I don’t really own anything valuable, so I don’t think I need this.' How do you respond?",
    },
  },
  {
    id: 'ecosystem-strategy',
    title: 'Ecosystem Strategy',
    description: 'Understand how MyARK connects with insurance, auctions, and legal services.',
    level: 'Advanced',
    content: [
      {
        heading: 'Beyond Inventory',
        body: "MyARK is a platform, not just a product. Our value multiplies when we connect the user's inventory data to external services. This is our key strategic advantage.",
      },
    ],
  },
];
