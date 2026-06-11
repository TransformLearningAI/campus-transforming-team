-- Seed tasks for Campus Transformation Team Portal
-- Run this in the Supabase SQL Editor

-- Organization & Management
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Define organizational structure and team roles', 'Map out the organizational chart for Campus Transformation. Define clear roles, responsibilities, and decision-making authority for each team member. Include volunteer expectations (hours/week, deliverables, communication norms). Create a simple org chart document the team can reference.', 'Organization & Management', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Set up internal communication and project management tools', 'Choose and configure tools for team communication (Slack, Discord, etc.) and project tracking (Notion, Trello, Asana, etc.). Establish norms for how and when to communicate, meeting cadence, and async updates.', 'Organization & Management', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Build a weekly team meeting structure and agenda template', 'Design a recurring meeting format: standing agenda items, time for updates, brainstorming, and decision-making. Keep it tight (30-45 min) given everyone is volunteering limited hours. Create a shared agenda template.', 'Organization & Management', 'medium', 'open');

-- Planning & Roadmap
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Develop 90-day strategic roadmap', 'Create a 90-day plan with milestones: what needs to happen to land the first client (pro bono or paid). Include key deliverables, who owns what, and decision points. Break into 30-day sprints with clear goals.', 'Planning & Roadmap', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Create a pipeline tracker for prospective colleges', 'Build a simple CRM or spreadsheet to track colleges that may be candidates for campus transformation -- enrollment trends, financial health, geographic location, accreditation status, board contacts. Prioritize outreach based on urgency and fit.', 'Planning & Roadmap', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Develop risk assessment and decision framework', 'Create a framework for evaluating whether a college is a good candidate for transformation vs. closure. Include financial viability indicators, community impact assessment, facility condition, and accreditation pathway options. This becomes a core tool for client engagements.', 'Planning & Roadmap', 'medium', 'open');

-- Marketing & Content
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Build marketing strategy and content calendar', 'Define target audiences (boards of trustees, college presidents, community leaders, media). Plan content across LinkedIn, email, blog, and social media. Create a monthly content calendar with topics tied to the campus closure crisis narrative. Assign content creation responsibilities across the team.', 'Marketing & Content', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Develop LinkedIn thought leadership strategy', 'Plan a LinkedIn presence strategy: regular posts about the campus closure crisis, transformation success models, and the mission. Identify key voices on the team to post. Draft a bank of 10-15 post ideas. Engage with higher ed communities and journalists covering closures.', 'Marketing & Content', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Build a media and press outreach list', 'Identify journalists, podcasts, newsletters, and outlets covering the higher ed closure crisis. Create a pitch template for earned media. Goal: position Campus Transformation as the go-to voice for what happens instead of closure.', 'Marketing & Content', 'medium', 'open');

-- Sales & Outreach
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Create an outreach playbook for reaching struggling colleges', 'Develop a step-by-step outreach strategy: how to identify at-risk colleges, who to contact first (board chair, president, CFO), what to say in the initial message, follow-up cadence, and how to move from conversation to engagement. Include email templates and talking points.', 'Sales & Outreach', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Write case study template for pro bono engagements', 'Design a case study format that documents the transformation process from start to finish: the college situation, the assessment, the proposed transformation plan, implementation, and outcomes. This becomes the sales tool for future paid clients.', 'Sales & Outreach', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Draft standard engagement proposal and contract templates', 'Create reusable proposal and contract templates for client engagements. Include scope of work, timeline, deliverables, pricing, confidentiality, and terms. Have versions for pro bono, sliding scale, and full-fee engagements. This saves time when the first real client says yes.', 'Sales & Outreach', 'medium', 'open');

-- Pricing & Revenue
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Design tiered pricing model for cash-strapped colleges', 'Develop a pricing structure that acknowledges most clients will be financially distressed. Consider: pro bono/case study tier, sliding scale based on endowment or enrollment size, deferred payment tied to transformation outcomes, revenue-share models where Campus Transformation earns a percentage of new revenue streams created. Research what peer consulting firms charge for similar institutional work.', 'Pricing & Revenue', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Create a menu of services with scope definitions', 'Define what Campus Transformation actually delivers at each engagement level: initial assessment, feasibility study, full transformation plan, implementation support, ongoing advisory. For each service, outline scope, deliverables, estimated time commitment, and pricing. This becomes the basis for proposals and contracts.', 'Pricing & Revenue', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Explore grant and foundation funding for transformation work', 'Research foundations, government grants, and philanthropic sources that fund higher ed innovation, workforce development, or community revitalization. If colleges cannot pay, maybe a third party can. Identify 10-15 potential funders and draft a grant prospect list with deadlines and requirements.', 'Grant Writing', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Develop outcome-based and revenue-share pricing models', 'Design creative pricing where Campus Transformation gets paid when the transformation succeeds -- e.g., a percentage of new revenue streams (workforce training contracts, facility rentals, community programming fees). Model out scenarios: what would a 5-10% revenue share look like over 3-5 years? This makes the service accessible to broke institutions while aligning incentives.', 'Pricing & Revenue', 'medium', 'open');

-- Innovation & Strategy
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Design a Campus Transformation in a Box toolkit', 'Create a self-service toolkit that smaller or very early-stage colleges could use before a full engagement: self-assessment checklist, board discussion guide, community needs survey template, financial viability worksheet. This extends reach to colleges who are not ready for (or cannot afford) consulting, and builds the pipeline.', 'Innovation & Strategy', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Explore alternative accreditation and credentialing models', 'Research non-traditional accreditation pathways: workforce credential programs, apprenticeship models, alternative accreditors, state authorization options, and partnerships with accredited institutions. Document which models allow a transformed campus to offer credentials without traditional regional accreditation. This is a core knowledge asset for the company.', 'Innovation & Strategy', 'high', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Develop a community needs assessment framework', 'Build a reusable framework for assessing what a community actually needs from a transformed campus: workforce gaps, healthcare access, childcare, adult education, small business incubation, etc. Include survey templates, data sources (BLS, Census, local economic development), and interview guides for community stakeholders.', 'Research & Analysis', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Brainstorm new revenue stream models for transformed campuses', 'Create an inventory of creative revenue streams a transformed campus could generate: workforce training contracts with local employers, co-working and incubator space, community health and wellness programming, conference and event hosting, government service delivery partnerships, housing, childcare centers. Model out revenue potential for each. This becomes a selling point in proposals.', 'Financial Modeling', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Prototype a campus transformation simulation for client boards', 'Adapt the existing team simulation concept into a version tailored for a college board of trustees. Let them experience what transformation could look like for THEIR campus -- plug in their enrollment numbers, financials, community data, and see possible futures. This could be a powerful sales and engagement tool.', 'Simulation Exercise', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Design a Transformation Fellows program', 'Create a fellowship or cohort model where team members from multiple at-risk colleges go through a structured program together -- learning about transformation, sharing challenges, and building plans for their own campuses. This could be a revenue stream, a community-building tool, and a pipeline for full engagements.', 'Innovation & Strategy', 'low', 'open');

-- Partnerships & Collaboration
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Build partnership template for workforce development organizations', 'Create a partnership framework and MOU template for collaborating with workforce development boards, local employers, community colleges, and trade organizations. Define what each partner contributes, shared goals, governance, and how revenue or outcomes are split. Make it reusable across engagements.', 'Partnerships & Collaboration', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Develop collaboration model with community organizations', 'Design templates and frameworks for partnering with nonprofits, healthcare providers, local government, faith-based organizations, and other community anchors. A transformed campus needs tenants and partners -- this document helps structure those relationships. Include lease/use agreements, shared programming agreements, and joint funding applications.', 'Partnerships & Collaboration', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Create a model for faculty and staff transition support', 'When a college transforms, existing faculty and staff face uncertainty. Design a framework for how they can transition into new roles: workforce trainers, community program coordinators, administrative staff for new operations. This is both humane and a selling point -- transformation does not mean everyone loses their job.', 'Partnerships & Collaboration', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Explore public-private partnership models for campus reuse', 'Research how local and state governments could partner with transformed campuses: using campus space for government services, workforce training funded by WIOA dollars, community health clinics, veteran services, etc. Create a model showing how public funding can sustain a transformed campus. Draft a template for approaching municipal and county leaders.', 'Partnerships & Collaboration', 'high', 'open');

-- Research & Analysis
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Research and map the campus closure landscape', 'Build a living database of colleges that have closed, are at risk of closing, or are in financial distress. Track news, IPEDS data, accreditation warnings, enrollment declines, and endowment draws. This becomes the market intelligence that drives outreach and positions the company as the expert on this crisis.', 'Research & Analysis', 'high', 'open');

-- Operations & Admin
INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Build an advisory board of higher ed and community leaders', 'Identify and recruit 5-10 people who can serve as informal advisors: former college presidents, workforce development leaders, community foundation heads, higher ed journalists, accreditation experts. They lend credibility, open doors, and provide expertise the core team may lack. Draft an invitation template and value proposition for advisors.', 'Operations & Admin', 'medium', 'open');

INSERT INTO team_tasks (title, description, category, priority, status)
VALUES ('Create a transformation impact measurement framework', 'Define how to measure success for a campus transformation: jobs preserved, new jobs created, community members served, revenue generated, programs launched, credentials issued, facilities utilized. This data tells the story for future clients, funders, and media. Design a simple dashboard or reporting template.', 'Operations & Admin', 'medium', 'open');
