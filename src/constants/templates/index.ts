export interface Template {
  id: string;
  name: string;
  category: "work" | "business" | "education" | "personal" | "developer" | "marketing" | "finance";
  description: string;
  tags: string[];
  htmlContent: string;
  colorPreset: string; // CSS Gradient classes
}

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Blank Document",
    category: "personal",
    description: "Start a document from scratch with clean, custom styling.",
    tags: ["new", "empty", "fresh"],
    htmlContent: "<p></p>",
    colorPreset: "from-neutral-200 to-neutral-350 dark:from-zinc-700 dark:to-zinc-850"
  },
  {
    id: "resume-modern",
    name: "Modern Resume",
    category: "work",
    description: "Clean, eye-catching design perfect for tech and creative roles.",
    tags: ["resume", "job", "career", "modern"],
    htmlContent: `
      <h1 style="text-align: center;"><strong>Alex Johnson</strong></h1>
      <p style="text-align: center; color: #5f6368;">alex.johnson@email.com | (555) 123-4567 | San Francisco, CA</p>
      <hr />
      <h3><strong>Professional Summary</strong></h3>
      <p>Results-driven Software Engineer with 5+ years of experience building modern web applications. Expert in React, Node.js, and TypeScript, with a passion for designing scalable systems and clean architectures.</p>
      <h3><strong>Work Experience</strong></h3>
      <p><strong>Senior Software Engineer</strong> | TechCorp Inc. (2022 - Present)</p>
      <ul>
        <li>Led the frontend migration from legacy systems to Next.js, improving page speed by 40%.</li>
        <li>Mentored junior engineers and instituted rigorous code review standards.</li>
      </ul>
      <p><strong>Software Engineer</strong> | InnovateWeb (2020 - 2022)</p>
      <ul>
        <li>Designed and developed collaborative editor features using Yjs and React.</li>
        <li>Optimized MongoDB queries, reducing database load metrics by 15%.</li>
      </ul>
      <h3><strong>Skills</strong></h3>
      <p>React, Next.js, TypeScript, Node.js, Express, MongoDB, Redis, Docker, CI/CD, Git</p>
      <h3><strong>Education</strong></h3>
      <p><strong>B.S. in Computer Science</strong> | Stanford University (2016 - 2020)</p>
    `,
    colorPreset: "from-blue-500 to-indigo-600"
  },
  {
    id: "resume-professional",
    name: "Professional Resume",
    category: "work",
    description: "Traditional corporate design tailored for business, finance, and legal careers.",
    tags: ["resume", "corporate", "professional"],
    htmlContent: `
      <h1 style="text-align: center;"><strong>SARAH SMITH, CPA</strong></h1>
      <p style="text-align: center; color: #5f6368;">sarah.smith@email.com | (555) 987-6543 | Chicago, IL</p>
      <hr />
      <h3><strong>Executive Experience</strong></h3>
      <p><strong>Senior Audit Manager</strong> | Finance Associates (2020 - Present)</p>
      <ul>
        <li>Supervised annual audits of Fortune 500 manufacturing corporations.</li>
        <li>Successfully managed client accounts generating over $2M in consulting revenue.</li>
      </ul>
      <p><strong>Senior Consultant</strong> | Accounting Advisors (2017 - 2020)</p>
      <ul>
        <li>Performed risk assessments and internal control documentation audits.</li>
        <li>Trained junior staff in audit testing and regulatory compliance workflows.</li>
      </ul>
      <h3><strong>Education & Certifications</strong></h3>
      <p><strong>Certified Public Accountant (CPA)</strong> | Illinois Board of Accountancy</p>
      <p><strong>M.S. in Accounting</strong> | University of Chicago (2015 - 2017)</p>
    `,
    colorPreset: "from-sky-500 to-indigo-700"
  },
  {
    id: "resume-creative",
    name: "Creative Resume",
    category: "work",
    description: "Bold visual layouts optimized for designers, developers, and writers.",
    tags: ["resume", "design", "creative"],
    htmlContent: `
      <h1 style="color: #ea4335;"><strong>Lara Croft</strong></h1>
      <p><strong>Creative Director / Visual Stylist</strong></p>
      <p>lara.croft@creative.com | portfolio.lara.com | London, UK</p>
      <hr />
      <h3><strong>Visual Portfolio Work</strong></h3>
      <p><strong>Creative Director</strong> | BrandStudio (2021 - Present)</p>
      <ul>
        <li>Directed rebranding campaigns for leading global consumer products.</li>
        <li>Oversaw design systems, UX layouts, and corporate photography assets.</li>
      </ul>
      <h3><strong>Education</strong></h3>
      <p><strong>B.F.A. in Graphic Design</strong> | Royal College of Art (2016 - 2020)</p>
    `,
    colorPreset: "from-pink-500 to-rose-600"
  },
  {
    id: "resume-fresher",
    name: "Fresher Resume",
    category: "work",
    description: "Tailored layout focusing on educational projects and academic highlights.",
    tags: ["resume", "entry-level", "fresher"],
    htmlContent: `
      <h1 style="text-align: center;"><strong>Devin Miller</strong></h1>
      <p style="text-align: center;">devin.miller@email.com | Seattle, WA</p>
      <hr />
      <h3><strong>Education</strong></h3>
      <p><strong>B.S. in Software Engineering</strong> | University of Washington (2022 - 2026)</p>
      <p>GPA: 3.85 / 4.00</p>
      <h3><strong>Projects</strong></h3>
      <p><strong>Clouds Docs Collaboration Platform</strong> (Cap Stone Project)</p>
      <ul>
        <li>Built an offline-first collaborative rich text workspace in React.</li>
        <li>Implemented dynamic margins, drag-and-drop elements, and a document ruler.</li>
      </ul>
      <h3><strong>Technical Focus</strong></h3>
      <p>JavaScript, Python, React, SQL, Algorithms & Data Structures</p>
    `,
    colorPreset: "from-teal-500 to-emerald-600"
  },
  {
    id: "cover-letter",
    name: "Cover Letter",
    category: "work",
    description: "Standard application letter formatting to introduce your qualifications.",
    tags: ["job", "cover-letter", "apply"],
    htmlContent: `
      <p>John Doe<br />(555) 123-4567<br />john.doe@email.com</p>
      <p>Date: July 26, 2026</p>
      <p><strong>Hiring Manager</strong><br />Target Company Inc.<br />100 Tech Way<br />San Francisco, CA</p>
      <p>Dear Hiring Manager,</p>
      <p>I am writing to express my strong interest in the Senior Developer position at Target Company. With a background in building real-time document workspaces and responsive visual editors, I am confident I can make an immediate contribution to your product team.</p>
      <p>In my previous role, I developed modular toolbar controllers and optimized formatting rendering algorithms. I look forward to bringing these skills to your company.</p>
      <p>Sincerely,</p>
      <p>John Doe</p>
    `,
    colorPreset: "from-blue-600 to-cyan-500"
  },
  {
    id: "business-letter",
    name: "Business Letter",
    category: "business",
    description: "Formal letter format for partnership proposals and client communications.",
    tags: ["letter", "business", "formal"],
    htmlContent: `
      <p><strong>Acme Corporation</strong><br />123 Corporate Blvd<br />New York, NY 10001</p>
      <p>July 26, 2026</p>
      <p><strong>Global Partners Ltd</strong><br />456 Alliance Ave<br />Boston, MA 02108</p>
      <p><strong>Subject: Business Collaboration Proposal</strong></p>
      <p>Dear Partners,</p>
      <p>We are writing to formally propose an integration of our cloud document capabilities with your CRM suite. We believe this alliance will create unmatched value for both user bases.</p>
      <p>Please find enclosed our service catalog. We look forward to scheduling a conference call next week.</p>
      <p>Sincerely,</p>
      <p><strong>Robert Vance</strong><br />VP of Operations, Acme Corp</p>
    `,
    colorPreset: "from-slate-600 to-slate-800"
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    category: "business",
    description: "Keep track of meeting agendas, attendee rosters, and key deliverables.",
    tags: ["notes", "agenda", "meeting"],
    htmlContent: `
      <h2><strong>Meeting Notes: Weekly Product Sync</strong></h2>
      <p><strong>Date:</strong> July 26, 2026 | <strong>Facilitator:</strong> Product Lead | <strong>Minutes:</strong> Sarah</p>
      <hr />
      <h3><strong>Attendees</strong></h3>
      <ul>
        <li>Alex (Engineering)</li>
        <li>Sarah (Product)</li>
        <li>James (Design)</li>
      </ul>
      <h3><strong>Agenda</strong></h3>
      <ol>
        <li>Review Ruler and Drag Margins milestones</li>
        <li>Discuss Template Gallery launch layout</li>
        <li>Verify PDF/DOCX color consistency</li>
      </ol>
      <h3><strong>Decisions</strong></h3>
      <ul>
        <li>Template Gallery will occupy the top portion of the main Dashboard.</li>
        <li>Placeholder images will use visual color gradients instead of static icons.</li>
      </ul>
      <h3><strong>Action Items</strong></h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #dadce0;">
        <thead>
          <tr style="background-color: #f1f3f4;">
            <th style="border: 1px solid #dadce0; padding: 8px; text-align: left;">Task</th>
            <th style="border: 1px solid #dadce0; padding: 8px; text-align: left;">Owner</th>
            <th style="border: 1px solid #dadce0; padding: 8px; text-align: left;">Due</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #dadce0; padding: 8px;">Create Template Mock Data</td>
            <td style="border: 1px solid #dadce0; padding: 8px;">Alex</td>
            <td style="border: 1px solid #dadce0; padding: 8px;">End of day</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dadce0; padding: 8px;">Validate Scroll Layout</td>
            <td style="border: 1px solid #dadce0; padding: 8px;">James</td>
            <td style="border: 1px solid #dadce0; padding: 8px;">Tomorrow</td>
          </tr>
        </tbody>
      </table>
    `,
    colorPreset: "from-amber-500 to-orange-600"
  },
  {
    id: "project-proposal",
    name: "Project Proposal",
    category: "business",
    description: "Detailed proposal structure including scope, budgets, and milestones.",
    tags: ["proposal", "scope", "project"],
    htmlContent: `
      <h2><strong>Project Proposal: Cloud Documents Upgrades</strong></h2>
      <h3><strong>1. Objective</strong></h3>
      <p>Introduce a robust Template Gallery and interactive formatting controls to establish a market-leading editing workspace.</p>
      <h3><strong>2. Scope of Work</strong></h3>
      <ul>
        <li>Designing responsive grid sliders matching user viewport widths.</li>
        <li>Drafting 32 standard HTML templates for various categories.</li>
        <li>Implementing localized document cloning logic.</li>
      </ul>
      <h3><strong>3. Estimated Budget</strong></h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #dadce0;">
        <tr style="background-color: #f8f9fa;">
          <th style="border: 1px solid #dadce0; padding: 8px;">Category</th>
          <th style="border: 1px solid #dadce0; padding: 8px;">Cost</th>
        </tr>
        <tr>
          <td style="border: 1px solid #dadce0; padding: 8px;">Engineering</td>
          <td style="border: 1px solid #dadce0; padding: 8px;">$15,000</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dadce0; padding: 8px;">UI Design</td>
          <td style="border: 1px solid #dadce0; padding: 8px;">$5,000</td>
        </tr>
      </table>
    `,
    colorPreset: "from-violet-500 to-purple-700"
  },
  {
    id: "business-proposal",
    name: "Business Proposal",
    category: "business",
    description: "Pitch new business relationships, product integrations, or strategic alignments.",
    tags: ["pitch", "proposal", "business"],
    htmlContent: `
      <h2><strong>Strategic Business Proposal</strong></h2>
      <p>Prepared for: <strong>Universal Retailers Corp</strong><br />By: <strong>CloudSolutions Inc</strong></p>
      <hr />
      <h3><strong>Executive Summary</strong></h3>
      <p>Integrating professional document design systems immediately boosts employee communication effectiveness and shortens client onboarding timelines.</p>
      <h3><strong>Proposed Roadmap</strong></h3>
      <ol>
        <li>Initial architecture reviews and template definitions.</li>
        <li>Development of interactive margins, color modules, and collaboration.</li>
        <li>Deploying cloud hosting servers.</li>
      </ol>
    `,
    colorPreset: "from-emerald-600 to-teal-700"
  },
  {
    id: "invoice",
    name: "Invoice",
    category: "finance",
    description: "Professional invoice layout with billing grids and item lists.",
    tags: ["billing", "invoice", "finance"],
    htmlContent: `
      <h2><strong>INVOICE</strong></h2>
      <p><strong>Invoice No:</strong> #2026-001 | <strong>Date:</strong> July 26, 2026</p>
      <hr />
      <p><strong>Bill To:</strong><br />Enterprise Client Corp<br />500 Corporate Ave<br />Chicago, IL</p>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #dadce0; margin-top: 16px;">
        <thead>
          <tr style="background-color: #f1f3f4;">
            <th style="border: 1px solid #dadce0; padding: 8px; text-align: left;">Item</th>
            <th style="border: 1px solid #dadce0; padding: 8px; text-align: right;">Rate</th>
            <th style="border: 1px solid #dadce0; padding: 8px; text-align: right;">Hours</th>
            <th style="border: 1px solid #dadce0; padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #dadce0; padding: 8px;">Software Architecture Design</td>
            <td style="border: 1px solid #dadce0; padding: 8px; text-align: right;">$150.00</td>
            <td style="border: 1px solid #dadce0; padding: 8px; text-align: right;">40</td>
            <td style="border: 1px solid #dadce0; padding: 8px; text-align: right;">$6,000.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dadce0; padding: 8px;">Template Gallery Engineering</td>
            <td style="border: 1px solid #dadce0; padding: 8px; text-align: right;">$120.00</td>
            <td style="border: 1px solid #dadce0; padding: 8px; text-align: right;">30</td>
            <td style="border: 1px solid #dadce0; padding: 8px; text-align: right;">$3,600.00</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f8f9fa;">
            <td colspan="3" style="border: 1px solid #dadce0; padding: 8px; text-align: right;">Subtotal:</td>
            <td style="border: 1px solid #dadce0; padding: 8px; text-align: right;">$9,600.00</td>
          </tr>
        </tbody>
      </table>
    `,
    colorPreset: "from-blue-700 to-indigo-900"
  },
  {
    id: "report",
    name: "Report",
    category: "business",
    description: "General-purpose corporate report document outline.",
    tags: ["report", "corporate", "status"],
    htmlContent: `
      <h1 style="text-align: center;"><strong>Q2 Product Delivery Report</strong></h1>
      <p style="text-align: center;">Prepared by: Engineering Management</p>
      <hr />
      <h3><strong>1. Overview</strong></h3>
      <p>All core goals for document margins, theme synchronization, and server integrations have been delivered on schedule.</p>
      <h3><strong>2. Key Metrics</strong></h3>
      <ul>
        <li>Production compilation builds complete in under 90 seconds.</li>
        <li>Theme toggle matches system preference on initialization.</li>
      </ul>
    `,
    colorPreset: "from-slate-500 to-blue-600"
  },
  {
    id: "research-paper",
    name: "Research Paper",
    category: "education",
    description: "Academic paper layout conforming to MLA/APA formatting standards.",
    tags: ["paper", "academic", "research"],
    htmlContent: `
      <h1 style="text-align: center;"><strong>A Real-time Cloud Document Framework</strong></h1>
      <p style="text-align: center;">Sarah Lin | Department of Computer Engineering</p>
      <hr />
      <p><strong>Abstract:</strong> This research paper investigates collaborative synchronization algorithms using Operational Transformation (OT) and Conflict-free Replicated Data Types (CRDTs). We outline optimized database modeling paradigms and responsive UI rulers.</p>
      <h3><strong>I. Introduction</strong></h3>
      <p>Modern collaborative web spaces require immediate client responsiveness combined with robust data consistency schemas.</p>
    `,
    colorPreset: "from-indigo-600 to-violet-800"
  },
  {
    id: "assignment",
    name: "Assignment",
    category: "education",
    description: "Standard homework/assignment header layout.",
    tags: ["homework", "assignment", "student"],
    htmlContent: `
      <p><strong>Course:</strong> Advanced Web Engineering (CS-402)<br /><strong>Student Name:</strong> Mark Spencer<br /><strong>Date:</strong> July 26, 2026</p>
      <hr />
      <h2><strong>Assignment 3: Document Workspace Framework</strong></h2>
      <p><strong>Question 1:</strong> Outline the difference between page margins and paragraph indents in professional editors.</p>
      <p style="color: #4a86e8;">Page margins define the overall canvas boundaries, whereas paragraph indents modify custom block indent offsets.</p>
    `,
    colorPreset: "from-teal-600 to-cyan-700"
  },
  {
    id: "case-study",
    name: "Case Study",
    category: "education",
    description: "Present structured problems, solutions, and operational outcomes.",
    tags: ["case-study", "analysis", "academic"],
    htmlContent: `
      <h2><strong>Case Study: Real-time Document Migration</strong></h2>
      <h3><strong>Background</strong></h3>
      <p>The client struggled with sluggish editing and synchronization collisions across multi-user sessions.</p>
      <h3><strong>Challenge</strong></h3>
      <p>Updating document structures without locking cursor nodes during collaborative reviews.</p>
      <h3><strong>Solution & Outcome</strong></h3>
      <p>Deploying CRDT document models reduced concurrent save conflicts to absolute zero.</p>
    `,
    colorPreset: "from-rose-500 to-pink-700"
  },
  {
    id: "brochure",
    name: "Brochure",
    category: "marketing",
    description: "Eye-catching multi-column flyer outline.",
    tags: ["brochure", "flyer", "marketing"],
    htmlContent: `
      <h1 style="text-align: center; color: #4a86e8;"><strong>Clouds Docs: Edit in the Cloud</strong></h1>
      <p style="text-align: center;">The ultimate document creation solution for remote teams.</p>
      <hr />
      <h3><strong>Premium Features</strong></h3>
      <ul>
        <li>Real-time collaborative typing and cursor tracking.</li>
        <li>Comprehensive template collection covering resume and business letters.</li>
        <li>Export instantly to PDF and Word DOCX formats.</li>
      </ul>
    `,
    colorPreset: "from-purple-600 to-orange-500"
  },
  {
    id: "newsletter",
    name: "Newsletter",
    category: "marketing",
    description: "Structured layout for monthly announcements and company news.",
    tags: ["newsletter", "marketing", "updates"],
    htmlContent: `
      <h2><strong>Monthly Digest: Clouds Docs News</strong></h2>
      <p>Issue #5 | July 2026</p>
      <hr />
      <h3><strong>What's New in Clouds Docs?</strong></h3>
      <p>We are excited to announce our brand new <strong>Template Gallery</strong>! Start templates directly from the main panel, featuring modern resumes, invoices, and letter outlines.</p>
    `,
    colorPreset: "from-fuchsia-600 to-pink-500"
  },
  {
    id: "portfolio",
    name: "Portfolio",
    category: "developer",
    description: "Minimalist portfolio sheet showcasing professional web projects.",
    tags: ["portfolio", "resume", "projects"],
    htmlContent: `
      <h1><strong>Jane Doe - Portfolio</strong></h1>
      <p>Frontend Architect | React Specialist</p>
      <hr />
      <h3><strong>Projects Gallery</strong></h3>
      <p><strong>Cloud Document Workspace</strong></p>
      <p>Built a collaborative cloud rich-text application, handling offline states, dynamic ruler adjustments, and real-time cursor pointers.</p>
    `,
    colorPreset: "from-teal-700 to-blue-700"
  },
  {
    id: "prd",
    name: "Product Requirements Document (PRD)",
    category: "developer",
    description: "Define product features, user stories, and acceptance criteria.",
    tags: ["prd", "product", "agile"],
    htmlContent: `
      <h2><strong>Product Requirements Document (PRD): Template Gallery</strong></h2>
      <p><strong>Author:</strong> Sarah Lin | <strong>Status:</strong> Approved</p>
      <hr />
      <h3><strong>1. Objective</strong></h3>
      <p>Allow users to initiate document creation using pre-formatted layout presets, boosting creation metrics.</p>
      <h3><strong>2. Requirements</strong></h3>
      <ul>
        <li>Render horizontal slider grid of card templates.</li>
        <li>Provide category filter tabs and search fields.</li>
        <li>Ensure template cloning is fast and doesn't modify the source data.</li>
      </ul>
    `,
    colorPreset: "from-emerald-700 to-teal-900"
  },
  {
    id: "sdd",
    name: "Software Design Document (SDD)",
    category: "developer",
    description: "Outline system architecture, data models, and API interfaces.",
    tags: ["sdd", "architecture", "developer"],
    htmlContent: `
      <h2><strong>Software Design Document (SDD): Margin Controls</strong></h2>
      <h3><strong>1. Architecture Overview</strong></h3>
      <p>Client coordinates are mapped to DPI grids and saved back via server actions. Node styling attributes are registered inside TipTap schemas.</p>
      <h3><strong>2. Database Model</strong></h3>
      <pre>Document: { leftMargin: Number, rightMargin: Number }</pre>
    `,
    colorPreset: "from-slate-700 to-indigo-900"
  },
  {
    id: "technical-documentation",
    name: "Technical Documentation",
    category: "developer",
    description: "Detailed system outline for developer setup and codebase operations.",
    tags: ["docs", "technical", "setup"],
    htmlContent: `
      <h2><strong>Technical Documentation: Setup Guide</strong></h2>
      <hr />
      <h3><strong>1. Installation</strong></h3>
      <p>Clone the document repository and install package dependencies:</p>
      <pre style="background: #f1f3f4; padding: 10px; border-radius: 4px;">npm install</pre>
      <h3><strong>2. Run Development Servers</strong></h3>
      <pre style="background: #f1f3f4; padding: 10px; border-radius: 4px;">npm run dev</pre>
    `,
    colorPreset: "from-violet-700 to-indigo-800"
  },
  {
    id: "api-documentation",
    name: "API Documentation",
    category: "developer",
    description: "Clean REST/GraphQL API specification template.",
    tags: ["api", "docs", "endpoints"],
    htmlContent: `
      <h2><strong>API Reference Guide</strong></h2>
      <hr />
      <h3><strong>GET /api/documents/[documentId]</strong></h3>
      <p>Retrieves metadata, content, and margin properties of a specific document.</p>
      <h3><strong>Response Body</strong></h3>
      <pre style="background: #f8f9fa; padding: 10px;">{
  "id": "123",
  "title": "My Doc",
  "leftMargin": 56,
  "rightMargin": 56
}</pre>
    `,
    colorPreset: "from-blue-800 to-cyan-900"
  },
  {
    id: "business-plan",
    name: "Business Plan",
    category: "business",
    description: "Comprehensive business roadmap, goals, and market assessments.",
    tags: ["plan", "business", "roadmap"],
    htmlContent: `
      <h2><strong>Business Plan: Cloud Solutions</strong></h2>
      <h3><strong>1. Mission Statement</strong></h3>
      <p>Providing seamless cloud document editing systems to empower enterprise teams to coordinate faster.</p>
      <h3><strong>2. Market Analysis</strong></h3>
      <p>Targeting small to mid-sized creative and tech agencies looking for unified real-time workspaces.</p>
    `,
    colorPreset: "from-orange-500 to-red-650"
  },
  {
    id: "marketing-plan",
    name: "Marketing Plan",
    category: "marketing",
    description: "Outline campaign goals, channels, and monthly budgets.",
    tags: ["marketing", "plan", "campaign"],
    htmlContent: `
      <h2><strong>Q3 Product Marketing Plan</strong></h2>
      <hr />
      <h3><strong>1. Goals</strong></h3>
      <ul>
        <li>Increase platform registrations by 25% month-over-month.</li>
        <li>Achieve a 15% conversion rate on template usage.</li>
      </ul>
      <h3><strong>2. Target Channels</strong></h3>
      <p>Developer forums, SaaS directory lists, and enterprise product blogs.</p>
    `,
    colorPreset: "from-pink-600 to-purple-650"
  },
  {
    id: "swot-analysis",
    name: "SWOT Analysis",
    category: "business",
    description: "Evaluate project Strengths, Weaknesses, Opportunities, and Threats.",
    tags: ["swot", "business", "planning"],
    htmlContent: `
      <h2><strong>SWOT Analysis Grid</strong></h2>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #dadce0;">
        <tr>
          <td style="border: 1px solid #dadce0; padding: 12px; width: 50%; vertical-align: top;">
            <strong>Strengths</strong>
            <ul>
              <li>High-fidelity draggable ruler</li>
              <li>Clean Google Docs-style design</li>
            </ul>
          </td>
          <td style="border: 1px solid #dadce0; padding: 12px; width: 50%; vertical-align: top;">
            <strong>Weaknesses</strong>
            <ul>
              <li>Lack of native custom page sizes</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #dadce0; padding: 12px; width: 50%; vertical-align: top;">
            <strong>Opportunities</strong>
            <ul>
              <li>Expand template options for education</li>
            </ul>
          </td>
          <td style="border: 1px solid #dadce0; padding: 12px; width: 50%; vertical-align: top;">
            <strong>Threats</strong>
            <ul>
              <li>Evolving web application standards</li>
            </ul>
          </td>
        </tr>
      </table>
    `,
    colorPreset: "from-rose-600 to-orange-600"
  },
  {
    id: "weekly-planner",
    name: "Weekly Planner",
    category: "personal",
    description: "Weekly scheduler template with task lists.",
    tags: ["planner", "schedule", "weekly"],
    htmlContent: `
      <h2><strong>Weekly Planner Schedule</strong></h2>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #dadce0;">
        <tr style="background-color: #f1f3f4;">
          <th style="border: 1px solid #dadce0; padding: 8px; width: 20%;">Day</th>
          <th style="border: 1px solid #dadce0; padding: 8px; width: 80%;">Schedule / Priorities</th>
        </tr>
        <tr>
          <td style="border: 1px solid #dadce0; padding: 8px; font-weight: bold;">Monday</td>
          <td style="border: 1px solid #dadce0; padding: 8px;">Product launch reviews and build diagnostics.</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dadce0; padding: 8px; font-weight: bold;">Tuesday</td>
          <td style="border: 1px solid #dadce0; padding: 8px;">Code migrations and team sync.</td>
        </tr>
      </table>
    `,
    colorPreset: "from-cyan-500 to-blue-600"
  },
  {
    id: "daily-planner",
    name: "Daily Planner",
    category: "personal",
    description: "Hourly checklist and objective manager for daily organization.",
    tags: ["planner", "schedule", "daily"],
    htmlContent: `
      <h2><strong>Daily Planner Agenda</strong></h2>
      <p><strong>Date:</strong> July 26, 2026</p>
      <hr />
      <h3><strong>Hourly Tasks</strong></h3>
      <ul>
        <li><strong>09:00 AM</strong> - Team standup meeting</li>
        <li><strong>10:00 AM</strong> - Custom formatting tools coding</li>
        <li><strong>02:00 PM</strong> - Deploy changes and run diagnostics</li>
      </ul>
    `,
    colorPreset: "from-emerald-500 to-teal-600"
  },
  {
    id: "todo-list",
    name: "To-do List",
    category: "personal",
    description: "Minimalist task checklist list.",
    tags: ["todo", "list", "personal"],
    htmlContent: `
      <h2><strong>Personal To-do Checklist</strong></h2>
      <hr />
      <ul data-type="taskList">
        <li data-checked="true">Verify document gallery layout is responsive</li>
        <li data-checked="false">Draft Case Study and assignments templates</li>
        <li data-checked="false">Revalidate PDF exports look premium</li>
      </ul>
    `,
    colorPreset: "from-purple-500 to-indigo-600"
  },
  {
    id: "travel-itinerary",
    name: "Travel Itinerary",
    category: "personal",
    description: "Schedule trip agendas, flights, and lodging notes.",
    tags: ["travel", "itinerary", "vacation"],
    htmlContent: `
      <h2><strong>Travel Itinerary: Paris Trip</strong></h2>
      <hr />
      <p><strong>Flight Details:</strong> BA-203 | Departure: 10:00 AM</p>
      <h3><strong>Schedule</strong></h3>
      <ul>
        <li><strong>Day 1:</strong> Museum tours and city walk.</li>
        <li><strong>Day 2:</strong> Art galleries and local cuisine.</li>
      </ul>
    `,
    colorPreset: "from-indigo-500 to-sky-600"
  },
  {
    id: "event-planning",
    name: "Event Planning Checklist",
    category: "personal",
    description: "Verify event activities, dates, vendors, and invite lists.",
    tags: ["event", "planner", "party"],
    htmlContent: `
      <h2><strong>Event Planning Organizer</strong></h2>
      <hr />
      <h3><strong>Setup Tasks</strong></h3>
      <ul data-type="taskList">
        <li data-checked="true">Confirm venue reservation</li>
        <li data-checked="false">Send digital invitations</li>
        <li data-checked="false">Select catering choices</li>
      </ul>
    `,
    colorPreset: "from-pink-500 to-orange-500"
  },
  {
    id: "budget-planner",
    name: "Budget Planner",
    category: "finance",
    description: "Manage monthly expenses, savings objectives, and accounts.",
    tags: ["budget", "finance", "money"],
    htmlContent: `
      <h2><strong>Monthly Savings & Budget Planner</strong></h2>
      <hr />
      <h3><strong>Expected Cash Flows</strong></h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #dadce0;">
        <tr style="background-color: #f1f3f4;">
          <th style="border: 1px solid #dadce0; padding: 8px;">Source</th>
          <th style="border: 1px solid #dadce0; padding: 8px;">Budget</th>
        </tr>
        <tr>
          <td style="border: 1px solid #dadce0; padding: 8px;">Rent & Utilities</td>
          <td style="border: 1px solid #dadce0; padding: 8px;">$1,800</td>
        </tr>
      </table>
    `,
    colorPreset: "from-teal-600 to-emerald-700"
  },
  {
    id: "recipe",
    name: "Recipe",
    category: "personal",
    description: "Document culinary ingredients, preparation steps, and serving counts.",
    tags: ["recipe", "food", "personal"],
    htmlContent: `
      <h2><strong>Classic Margherita Pizza</strong></h2>
      <p>Servings: 2 | Time: 30 mins</p>
      <hr />
      <h3><strong>Ingredients</strong></h3>
      <ul>
        <li>1 pre-made pizza dough roll</li>
        <li>1/2 cup fresh tomato sauce</li>
        <li>Mozzarella cheese slices</li>
        <li>Fresh basil leaves</li>
      </ul>
      <h3><strong>Preparation</strong></h3>
      <ol>
        <li>Preheat oven to 450°F (230°C).</li>
        <li>Spread tomato sauce on stretched dough, add cheese slices, and bake for 12 minutes.</li>
        <li>Garnish with fresh basil.</li>
      </ol>
    `,
    colorPreset: "from-rose-500 to-orange-600"
  }
];
