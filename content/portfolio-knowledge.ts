// =============================================================================
// portfolio-knowledge.ts
//
// THIS IS THE ONLY FILE YOU NEED TO EDIT to make this chat yours.
//
// Fill in every section below with your own information. The AI reads this
// file as its "brain" — everything it knows about you comes from here.
//
// Tip: The more detail you add, the better the AI answers recruiter questions.
// =============================================================================

export const portfolioKnowledge = {

  // ===========================================================================
  // META — Controls the chat UI text and the AI's identity
  // ===========================================================================
  meta: {
    // Your full name — used in the AI system prompt ("I'm representing ___")
    name: "Alex Rivera",

    // Big headline on the welcome screen. All caps works well here.
    tagline: "DESIGNER, STRATEGIST, AND BUILDER.",

    // The opening message the AI types out character-by-character on load.
    // Keep it warm, short, and personal.
    welcomeMessage: "Hi! I'm Alex 👋. Nice to meet you. I'm a product designer and builder. What do you wanna know about me?",
  },

  // ===========================================================================
  // ABOUT — Who you are. The AI uses these paragraphs to answer "tell me about
  // yourself", "what's your background", "what do you do", etc.
  // ===========================================================================
  about: {
    // 2–3 sentence elevator pitch. Lead with your level, years, and impact.
    overview: `I'm a senior product designer with 8+ years of experience shipping consumer and B2B products at scale. I've worked across fintech, healthtech, and productivity tools — always at the intersection of craft, strategy, and engineering. I care deeply about the end-to-end experience, from zero-to-one concepts to polished production designs.`,

    // What kind of role are you looking for right now?
    whatImLookingFor: `I'm looking for a Senior IC or Staff-level design role where I can lead 0-to-1 work and have a direct impact on product strategy. Ideally at a company that's building something net-new, not just optimizing an existing product.`,

    // How do you work? What's your process?
    process: `My process always starts with deep research — understanding the user's mental model before touching any design tools. I prototype early and often, sharing rough ideas in Figma or code to build shared understanding with engineers and PMs. I've found that a rough prototype in front of a real user on day two is worth more than a polished deck on day ten.`,

    // Your design philosophy or approach.
    approach: `I bring three things to every project: a systems lens (thinking about how this feature fits into the larger product architecture), a bias for prototyping (showing beats telling), and a strong point of view (I'm not here to make pretty pictures, I'm here to solve problems).`,

    // What are you especially good at?
    strengths: `My strongest skill is moving fast without sacrificing quality — I can take an ambiguous brief on Monday and have something testable by Wednesday. I'm also strong at stakeholder communication: I can present design rationale to a VP of Engineering as clearly as I can explain it to a new PM.`,

    // How do you work with others?
    collaboration: `I work best in tight cross-functional squads. I treat engineers as creative partners, not ticket-closers, and I've shipped some of my best work by pairing directly with an engineer on interaction details. I over-communicate async context so my collaborators always know the "why" behind a decision.`,

    // Your education, career origin story, anything interesting about how you got here.
    background: `I studied Visual Communication Design and started my career building design tools at a startup. That early exposure to developer workflows made me unusually comfortable in the technical side of product design. I later moved into consumer mobile, spent two years in healthtech doing zero-to-one work, and most recently led design for a fintech product used by 2M+ people.`,
  },

  // ===========================================================================
  // PROJECTS — Add as many as you want. Each one becomes part of the AI's
  // knowledge base. Be specific — vague descriptions produce vague AI answers.
  //
  // The `id` field must be a unique slug (no spaces). It's used to link action
  // buttons to the right project (see `actions.projects` below).
  // ===========================================================================
  projects: {
    "budget-app": {
      title: "Penny — Personal Budget App",
      role: "Lead Product Designer (sole designer on the project)",
      timeline: "Q2–Q4 2023",
      team: "3 engineers, 1 PM, 1 data scientist",

      summary: `Penny is a zero-friction personal budgeting app that connects to your bank and categorizes spending automatically. My design made it the #1 new finance app on the App Store for two weeks post-launch.`,

      problem: `Most budgeting apps require manual data entry or feel overwhelming with too many charts. Users would open them once, feel confused, and never come back. Our research showed that 73% of users who downloaded a budgeting app had abandoned it within 7 days.`,

      approach: `I led a four-week research sprint before touching any UI. We interviewed 22 people about their money anxiety, not their app preferences. The insight that shaped everything: people don't want more data about their spending, they want to feel in control. That reframe turned the whole product from a dashboard into a daily check-in.`,

      outcomes: `Launched to 50K users in the first month. Day-7 retention was 41% vs. the industry average of 12%. Average session length was 90 seconds — intentionally short, which was a design goal.`,
    },

    "design-system": {
      title: "Meridian Design System",
      role: "Design System Lead",
      timeline: "2022",
      team: "2 designers, 4 engineers",

      summary: `A full design system built from scratch for a 200-person product org. Covered 80+ components, design tokens, documentation, and a Figma library synced to code via Storybook.`,

      problem: `The company had 4 different button styles, 3 inconsistent type scales, and no single source of truth. New features took twice as long to design because designers rebuilt components from scratch every sprint.`,

      approach: `Started with an audit of every screen in production. Identified the 20% of components that appeared in 80% of UI surfaces. Built those first, shipped them, then expanded. Wrote the documentation myself so engineers didn't have to guess at usage intent.`,

      outcomes: `Cut average design-to-handoff time by 35%. New engineers reported feeling productive on their first day using the system. Zero regressions in the first six months of adoption.`,
    },

    "healthtech-onboarding": {
      title: "CareLoop — Patient Onboarding",
      role: "Senior Product Designer",
      timeline: "2021",
      team: "Cross-functional team of 8",

      summary: `Redesigned the patient onboarding flow for a healthcare platform used by 300 clinics. The new flow reduced onboarding time from 22 minutes to 8 minutes.`,

      problem: `Patients were dropping off during insurance verification — a legally required step that was implemented as a wall of form fields. Clinic staff were spending 30% of their time helping patients get through onboarding.`,

      approach: `I embedded with clinic staff for a week before designing anything. Watched them help patients, listened to what confused people, mapped the emotional journey. The redesign introduced progressive disclosure, plain-language copy, and a "save and continue later" option that turned a single long session into a flexible multi-step experience.`,

      outcomes: `Onboarding completion rate increased from 61% to 89%. Staff time spent on onboarding support dropped by 40%.`,
    },
  },

  // ===========================================================================
  // RESUME / CAREER HISTORY — Your work history. The AI uses this to answer
  // questions about your background and experience.
  // ===========================================================================
  resume: {
    summary: `Senior product designer with 8+ years of experience. I specialize in 0-to-1 product work, consumer mobile, and design systems. Comfortable across the full product lifecycle from research to production.`,

    experience: [
      {
        company: "Fern Labs",
        role: "Senior Product Designer",
        years: "2022 – Present",
        location: "Remote",
        highlights: `Lead designer on Penny, the personal budgeting app. Grew DAU from 0 to 200K in 18 months. Also led the Meridian design system initiative.`,
      },
      {
        company: "CareLoop Health",
        role: "Product Designer",
        years: "2020 – 2022",
        location: "Hybrid, San Francisco",
        highlights: `Redesigned patient onboarding, increasing completion rates by 28 points. Partnered directly with clinical teams to validate designs in the field.`,
      },
      {
        company: "Toolbox (YC W18)",
        role: "Product Designer",
        years: "2017 – 2020",
        location: "San Francisco",
        highlights: `Early design hire. Shipped 4 major product areas from zero. Helped the company grow from 8 to 60 employees and raise a $12M Series A.`,
      },
    ],

    education: `B.A. Visual Communication Design, University of Washington`,

    skills: [
      "Product strategy",
      "UX research",
      "Interaction design",
      "Design systems",
      "Figma",
      "Prototyping",
    ],
  },

  // ===========================================================================
  // WORKING STYLE — Helps the AI answer personality / culture-fit questions.
  // ===========================================================================
  workingStyle: {
    // What kind of environment brings out your best work?
    bestEnvironment: `I do my best work in fast-moving, high-trust teams where designers have a real seat at the table. I like quick feedback loops and teams that ship frequently and learn from it.`,

    // How do you communicate with teammates?
    communicationStyle: `I default to async — Loom videos for design walkthroughs, written docs for decisions. I try to over-communicate context so nobody has to guess why a decision was made. In meetings I prefer to show things rather than talk about them.`,

    // What slows you down or frustrates you?
    petPeeves: `Design-by-committee. Feedback without rationale ("make it pop" tells me nothing). Meetings that could have been a Loom. Processes that value output over outcomes.`,

    // A human detail that makes you more than a resume.
    whatIDoOutsideWork: `Distance running, cooking, and building dumb little side projects in Xcode. Currently learning to make ramen from scratch.`,
  },

  // ===========================================================================
  // FAQ — Common recruiter questions with your prepared answers. The AI will
  // use these verbatim when relevant questions come up.
  // ===========================================================================
  faq: {
    "Why are you looking for a new role?": `I've loved building Penny from the ground up, and I want to keep doing that kind of zero-to-one work. I'm also excited about how AI is changing the design process and want to be somewhere that's leaning into that evolution, not watching it from the sidelines.`,

    "What kind of role do you want?": `Senior IC or Staff level, ideally at a company that's building something new rather than optimizing an existing product. I want to be hands-on with design while also influencing product strategy.`,

    "Remote or in-person?": `Fully remote or hybrid. I've done both and thrive in either, as long as async communication culture is strong.`,

    "What's your salary expectation?": `I'm flexible depending on the opportunity and total package. Happy to get into specifics once we're a few steps in.`,

    "What's your availability?": `I'm actively looking and can start within 2–4 weeks of an offer.`,

    "Do you have management experience?": `I've mentored junior designers and led project-level coordination across cross-functional teams, but I haven't been a full-time people manager. I'm interested in a player-coach path eventually, but right now I want to stay hands-on.`,

    "What's a weakness or area for growth?": `I can get too deep in the details and lose track of the bigger deadline. I've gotten much better at this by setting explicit "good enough to ship" criteria at the start of a project, which helps me resist the urge to over-refine.`,
  },

  // ===========================================================================
  // ACTIONS — Buttons that appear after certain AI responses.
  //
  // - resume: shown after "can I see your resume?"
  // - linkedin / contact: shown after "what are you working on?"
  // - projects: shown after "examples of work" and when the AI mentions a
  //   project by name (via mentionKeywords)
  //
  // For `resume.url`: put your PDF file in the /public folder and reference it
  // as "/your-resume-filename.pdf", OR link to an external URL.
  //
  // For `projects[].mentionKeywords`: list words/phrases that, if they appear
  // in the AI's response, will auto-surface that project's button. Lowercase.
  // ===========================================================================
  actions: {
    resume: {
      label: "Download Resume",
      // Put your resume PDF in /public and reference it here, e.g. "/alex-rivera-resume.pdf"
      // Or use an external link: "https://yoursite.com/resume.pdf"
      url: "/alex-rivera-resume.pdf",
    },

    linkedin: {
      label: "My LinkedIn",
      url: "https://www.linkedin.com/in/alexrivera",
    },

    contact: {
      label: "Get in Touch",
      url: "https://www.linkedin.com/in/alexrivera",
    },

    // Add one entry per case study / project you want to surface as a button.
    projects: [
      {
        // Must match a key in `projects` above — used for deduplication
        id: "budget-app",
        // Button label shown in the UI
        label: "Penny — Budget App",
        // Where the button links to (your case study URL or portfolio page)
        url: "https://alexrivera.design/penny",
        // If the AI response contains any of these words/phrases, this button
        // auto-appears. Use project names, company names, feature names.
        mentionKeywords: ["penny", "budget app", "budgeting", "fern labs", "finance app"],
      },
      {
        id: "design-system",
        label: "Meridian Design System",
        url: "https://alexrivera.design/meridian",
        mentionKeywords: ["meridian", "design system", "component library", "storybook"],
      },
      {
        id: "healthtech-onboarding",
        label: "CareLoop Onboarding",
        url: "https://alexrivera.design/careloop",
        mentionKeywords: ["careloop", "patient onboarding", "healthcare", "healthtech"],
      },
    ],
  },
}
