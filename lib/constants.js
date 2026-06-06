export const TASK_CATEGORIES = [
  'Community Outreach',
  'Financial Modeling',
  'K-12 Partnerships',
  'Workforce Development',
  'Technology & AI',
  'Grant Writing',
  'Legal & Governance',
  'Marketing & Content',
  'Research & Analysis',
  'Employer Relations',
  'Arts & Culture Programming',
  'STEM Programs',
  'Healthcare Partnerships',
  'Campus Assessment',
  'Operations & Admin',
  'Simulation Exercise',
]

export const AREAS_OF_INTEREST = [
  'Strategy & Consulting',
  'Financial Analysis',
  'Academic Program Design',
  'Workforce Training',
  'K-12 Education',
  'Community Engagement',
  'Technology & AI',
  'Grant Writing & Fundraising',
  'Legal & Policy',
  'Marketing & PR',
  'Data & Analytics',
  'Healthcare & Wellness',
  'Arts & Culture',
  'STEM & Science',
  'Real Estate & Facilities',
  'Government Relations',
  'Project Management',
  'Content & Writing',
]

export const KEY_DOCUMENTS = [
  {
    title: 'Campus Transformation Website',
    url: 'https://transformlearning.ai/campus-transformation',
    category: 'Core',
  },
  {
    title: 'Team Simulation Exercise',
    url: 'https://transformlearning.ai/campus-transformation/simulation',
    category: 'Core',
  },
  {
    title: 'Simulation (Google Doc)',
    url: 'https://docs.google.com/document/d/1akdzkGLS9FNzjYJqSpb0JFxu-4CykS1tLWsASlDjdtY/edit',
    category: 'Core',
  },
  {
    title: 'Campus Transformation Prospectus',
    url: 'https://transformlearning.ai/Campus-Transformation-Prospectus.html',
    category: 'Core',
  },
  {
    title: 'Our Process (Gated)',
    url: 'https://transformlearning.ai/campus-transformation/process',
    category: 'Core',
  },
  {
    title: 'YouTube Channel',
    url: 'https://www.youtube.com/@JeffRitter-d8c',
    category: 'Marketing',
  },
]

// Marketing site pages team members can suggest edits to (transformlearning.ai).
export const MARKETING_PAGES = [
  { label: 'Home', url: 'https://transformlearning.ai/' },
  {
    label: 'Campus Transformation',
    url: 'https://transformlearning.ai/campus-transformation',
  },
  {
    label: 'About',
    url: 'https://transformlearning.ai/campus-transformation/about',
  },
  {
    label: 'Our Process',
    url: 'https://transformlearning.ai/campus-transformation/process',
  },
  {
    label: 'Case Studies',
    url: 'https://transformlearning.ai/campus-transformation/cases',
  },
  {
    label: 'Simulation',
    url: 'https://transformlearning.ai/campus-transformation/simulation',
  },
  {
    label: 'Blog',
    url: 'https://transformlearning.ai/campus-transformation/blog',
  },
  {
    label: 'Inquiry / Contact',
    url: 'https://transformlearning.ai/campus-transformation/inquiry',
  },
  { label: 'Investors', url: 'https://transformlearning.ai/investors' },
  { label: 'Methodology', url: 'https://transformlearning.ai/methodology' },
  { label: 'Students', url: 'https://transformlearning.ai/students' },
  { label: 'Other / not listed', url: '' },
]

// Who can change suggestion status. Also true for any member whose DB role is 'admin' or 'owner'.
export const ADMIN_EMAILS = ['jeff@transformlearning.ai']

export const SUGGESTION_STATUSES = [
  { value: 'open', label: 'Open', color: '#3B82F6' },
  { value: 'in_review', label: 'In Review', color: '#D97706' },
  { value: 'applied', label: 'Applied', color: '#16A34A' },
  { value: 'declined', label: 'Declined', color: '#94A3B8' },
]

export const ONBOARDING_STEPS = [
  {
    id: 'website',
    label: 'Explore the Campus Transformation website',
    url: 'https://transformlearning.ai/campus-transformation',
  },
  {
    id: 'prospectus',
    label: 'Read the Prospectus',
    url: 'https://transformlearning.ai/Campus-Transformation-Prospectus.html',
  },
  {
    id: 'simulation',
    label: 'Complete the Edgewater College simulation',
    url: 'https://transformlearning.ai/campus-transformation/simulation',
  },
  {
    id: 'profile',
    label: 'Fill out your profile — bio, links, areas of interest',
  },
  { id: 'introduce', label: 'Post an introduction in the Discussions' },
]
