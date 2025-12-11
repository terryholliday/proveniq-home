import React from 'react';

export type GuideCategory =
  | 'Getting Started'
  | 'Scanning & Items'
  | 'Organization'
  | 'Value & Market'
  | 'Insurance & Risk'
  | 'Legacy Planning'
  | 'Account & Data';

export interface GuideTopic {
  id: string;
  category: GuideCategory;
  title: string;
  summary: string;
  content: React.ReactNode;
  isPro?: boolean;
}

export const guideTopics: GuideTopic[] = [
  // Getting Started
  {
    id: 'welcome',
    category: 'Getting Started',
    title: 'Welcome to Proveniq Home',
    summary: 'An overview of your new digital command center for all your assets.',
    content: `Proveniq Home is more than just a home inventory app—it's the operating system for your physical world. It helps you document, value, protect, and manage the lifecycle of everything you own.
      
      From creating a detailed inventory for insurance purposes to planning your estate, Proveniq Home provides the tools to turn your static possessions into dynamic, manageable assets.
      
      Start by adding your first item to see how easy it is!`,
  },
  {
    id: 'first-scan',
    category: 'Getting Started',
    title: 'Your First Scan',
    summary: 'Learn how to add your first item using the AI Scanner.',
    content: `Adding an item is simple with our AI Scanner.
      
      1. Navigate to the 'Add Item' page.
      2. Use the AI Scanner card to either take a photo or upload one from your device.
      3. Our AI will analyze the image to identify the item and automatically populate details like Name, Category, and Description.
      4. Review the AI-generated details, make any necessary adjustments, and fill in any remaining fields like Purchase Price.
      5. Click 'Save Item', and you're done! The item is now in your ARK.`,
    isPro: true,
  },
  // Scanning & Items
  {
    id: 'scanning-best-practices',
    category: 'Scanning & Items',
    title: 'Scanning Best Practices',
    summary: 'Tips for getting the most accurate results from the AI Scanner.',
    content: `To ensure our AI can identify your items accurately, follow these simple photography tips. The better the photo, the better the results.`,
  },
  {
    id: 'ai-search',
    category: 'Scanning & Items',
    title: 'Searching with "Ask Your Ark"',
    summary: 'How to use natural language to find anything in your inventory.',
    content: `Forget complicated filters. The "Ask Your Ark" search bar lets you ask questions just like you would to a person. Our AI translates your query into a structured search to find exactly what you're looking for.
      
      You can try things like:
      - "What do I have that's worth over $1000?"
      - "Show me all electronics in the office."
      - "Find my book collection."
      - "Which items are currently on loan?"
      
      The AI understands context, value, location, and categories to give you precise results instantly.`,
    isPro: true,
  },
  // Organization
  {
    id: 'move-planner',
    category: 'Organization',
    title: 'Using the Move Planner',
    summary: 'Organize your next move with virtual boxes and smart labels.',
    content: 'The Move Planner (a Pro feature) helps you catalog the contents of your moving boxes digitally. Assign items to a box, give the box a destination room, and print a QR code label. When you arrive at your new home, simply scan the QR code to see a full list of what’s inside without opening the box.',
    isPro: true,
  },
  // Value & Market
  {
    id: 'market-trends',
    category: 'Value & Market',
    title: 'Understanding Market Value',
    summary: 'How Proveniq Home provides real-time market data for your items.',
    content: 'Proveniq Home uses AI to simulate searches across recent auction results and sales data to provide an estimated Market Value for your items. This helps you understand what your possessions are worth right now. For Pro users, we also provide Market Trend tags (e.g., "Trending Up," "Stable") and a list of comparable sales.',
    isPro: true,
  },
  // Insurance & Risk
  {
    id: 'disaster-sim',
    category: 'Insurance & Risk',
    title: 'Disaster Simulation Overview',
    summary: 'Assess your financial exposure by simulating household disasters.',
    content: 'The Risk Assessment Simulator is a powerful tool for understanding your financial preparedness. It can simulate events like a fire in the kitchen or a flood in the basement, calculating the total value of items that would be affected based on their assigned location. This helps you ensure you have adequate insurance coverage.',
    isPro: true,
},
  // Legacy Planning
  {
    id: 'legacy-planner',
    category: 'Legacy Planning',
    title: 'Legacy Planner & Beneficiaries',
    summary: 'Assign items to beneficiaries and record their stories.',
    content: 'The Legacy Planner allows you to manage your estate directly from your inventory. For any item, you can assign a beneficiary from your contacts. You can also record a "Legacy Story"—a short video or text explaining the significance of an item—to be shared with the beneficiary. This ensures your legacy is preserved, not just your assets.',
    isPro: true,
  },
  // Account & Data
  {
    id: 'data-security',
    category: 'Account & Data',
    title: 'Data Security & Backups',
    summary: 'How your data is protected and how you can back it up.',
    content: `We take your data security seriously. Here's how we protect your information:
      
      - **Authentication:** Your account is secured using Firebase Authentication, a robust system provided by Google.
      - **Database Security:** Your inventory data is stored in Firestore. Our security rules ensure that only you can access your own data. Your data is partitioned based on your unique User ID, making it inaccessible to other users.
      - **File Storage:** Uploaded images and documents are stored in Firebase Storage, which uses similar security rules to protect your files.
      - **User Backups:** While we secure your data on our platform, we always recommend keeping your own backups. You can download your entire inventory as a JSON file from the Settings page at any time. For critical legal documents, always maintain a separate external backup.`,
  },
];
