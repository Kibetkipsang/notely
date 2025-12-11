// services/notelyKnowledge.ts
export const NOTELY_COMPLETE_KNOWLEDGE = {
  // ==================== APP OVERVIEW ====================
  appOverview: `
# NOTELY - THE ULTIMATE NOTE-TAKING APPLICATION

## 🚀 CORE PURPOSE
Notely is a modern, AI-powered note-taking application designed for students, professionals, and anyone who needs to capture, organize, and enhance their ideas efficiently.

## 🎯 KEY VALUE PROPOSITION
1. **Smart Organization** - Beyond simple notes with AI-powered categorization
2. **Writing Enhancement** - Built-in AI assistance for better content
3. **Seamless Sync** - Access your notes anywhere, anytime
4. **Powerful Search** - Find anything instantly with advanced filters
5. **Beautiful Interface** - Clean, intuitive design that doesn't distract
  `,

  // ==================== CORE FEATURES ====================
  coreFeatures: {
    noteManagement: [
      "📝 **Rich Text Editor** - Format text with bold, italic, headings, lists, and more",
      "🎨 **Custom Styling** - Change fonts, colors, and backgrounds for notes",
      "📎 **File Attachments** - Add images, PDFs, documents to notes",
      "🔗 **Internal Linking** - Connect notes together for better context",
      "🔄 **Version History** - Track changes and restore previous versions",
      "⏱️ **Auto-Save** - Never lose work with real-time saving"
    ],

    organization: [
      "🏷️ **Smart Tagging** - AI-suggested tags and custom tag creation",
      "📂 **Nested Folders** - Create unlimited folder hierarchies",
      "🌟 **Starring/Favorites** - Mark important notes for quick access",
      "📍 **Pinning** - Keep crucial notes at the top of lists",
      "🔖 **Bookmarking** - Save notes for later reading",
      "🗂️ **Smart Collections** - Dynamic folders based on rules (e.g., 'All notes with #todo from last week')"
    ],

    aiFeatures: [
      "✨ **AI Writing Assistant** - Improve, expand, or rewrite content",
      "🏷️ **Smart Tag Generation** - Automatic keyword extraction from notes",
      "📋 **Note Summarization** - Condense long notes into key points",
      "💡 **Idea Generation** - Brainstorm new content based on prompts",
      "🔍 **Content Analysis** - Extract action items, identify themes",
      "✍️ **Grammar & Style Check** - Improve writing quality automatically"
    ],

    collaboration: [
      "👥 **Shared Notes** - Collaborate with others in real-time",
      "💬 **Comments & Annotations** - Add feedback directly on notes",
      "🔗 **Shareable Links** - Generate links with view/edit permissions",
      "👀 **Live Presence** - See who's viewing/editing notes",
      "📊 **Change Tracking** - Monitor edits and contributions",
      "🔔 **Notifications** - Get alerts for shared note activities"
    ],

    markdownSupport: [
      "📝 **Full Markdown Syntax** - Support for all standard Markdown",
      "👁️ **Live Preview** - See formatted output as you type",
      "🔄 **Bidirectional Editing** - Edit in Markdown or rich text",
      "🎨 **Syntax Highlighting** - Colored code blocks and formatting",
      "📋 **Quick Insert** - Toolbar for common Markdown elements",
      "🔤 **Custom Themes** - Different Markdown preview styles"
    ]
  },

  // ==================== MARKDOWN SUPPORT DETAILS ====================
  markdownGuide: {
    basics: [
      "# Headers - Use # for H1, ## for H2, etc.",
      "**Bold Text** - Use **text** or __text__",
      "*Italic Text* - Use *text* or _text_",
      "~~Strikethrough~~ - Use ~~text~~",
      "`Inline Code` - Use `code`",
      "[Links](https://notely.app) - Use [text](url)"
    ],

    advanced: [
      "```\nCode Blocks\n``` - Use triple backticks with optional language",
      "> Blockquotes - Use > for quotations",
      "- Lists - Use - or * for bullet points",
      "1. Numbered Lists - Use 1. 2. 3.",
      "--- or *** - Horizontal rules",
      "| Tables | Use pipe syntax for tables |"
    ],

    notelyExtensions: [
      ":::info\nInfo Boxes\n::: - Special containers for notes, tips, warnings",
      "[[Internal Links]] - Double brackets for linking to other Notely notes",
      "![[Note Title]] - Embed other notes directly",
      "#tag - Smart tags that become clickable filters",
      "`@mention` - Mention team members in shared notes",
      "`[ ]` and `[x]` - Interactive checkboxes in Markdown preview"
    ],

    tips: [
      "Use `Ctrl/Cmd + K` for quick Markdown reference",
      "Enable 'Focus Mode' for distraction-free Markdown writing",
      "Export Markdown notes as HTML, PDF, or Word documents",
      "Use `Tab` and `Shift+Tab` to indent/unindent lists",
      "Drag and drop images directly into Markdown editor"
    ]
  },

  // ==================== COMPREHENSIVE FAQS ====================
  faqs: [
    // GETTING STARTED
    {
      category: "Getting Started",
      question: "How do I create my first note?",
      answer: `1. Click the **'+ New Note'** button in the sidebar
2. Add a title (or use AI to suggest one from your content)
3. Start typing in the editor - it supports both rich text and Markdown
4. Use the AI Assistant (sparkle icon) for help with content
5. Add tags for organization (try the AI tag generator)
6. Click Save or use auto-save which works every few seconds

**Pro Tip:** Use templates from the Template Gallery to start faster!`
    },

    // ORGANIZATION
    {
      category: "Organization",
      question: "What's the best way to organize thousands of notes?",
      answer: `**Hierarchical System:**
1. **Folders** - Broad categories (Work, Personal, Study)
2. **Subfolders** - Projects within categories
3. **Tags** - Cross-cutting topics (#meeting, #todo, #idea)
4. **Smart Collections** - Auto-updating views based on rules

**Example Structure:**
- Work/
  - Projects/
    - Project X/ (with #project-x tags)
  - Meetings/ (all notes with #meeting tag)
- Personal/
  - Journals/
  - Recipes/ (with #cooking tag)

**Use AI Organization:**
• Click 'Organize with AI' to get suggestions
• Let AI suggest folder structures
• Use batch operations to move multiple notes`
    },

    // MARKDOWN SPECIFIC
    {
      category: "Markdown",
      question: "Does Notely support advanced Markdown features?",
      answer: `**YES! Notely has extensive Markdown support:**

## 📝 Standard Markdown
• Headers (# to ######)
• Emphasis (**bold**, *italic*)
• Lists (bullet, numbered, nested)
• Links and images
• Code blocks with syntax highlighting
• Blockquotes and horizontal rules

## 🚀 Notely Extensions
• **Internal Note Linking**: [[Note Title]] creates clickable links to other notes
• **Note Embedding**: ![[Note Title]] shows content from other notes inline
• **Smart Tags**: #tag-name becomes a clickable filter
• **Interactive Elements**: [ ] checkboxes that you can tick
• **Custom Containers**: :::info ::: for callouts

## 🎨 Preview Features
• Live preview pane (split view)
• Export as formatted HTML/PDF
• Custom CSS for personal styling
• Math notation support with KaTeX

**Tip:** Enable "Markdown Expert Mode" in Settings for advanced shortcuts.`
    },

    {
      category: "Markdown",
      question: "How do I convert existing notes to Markdown?",
      answer: `**Multiple Conversion Options:**

1. **Quick Convert:**
   • Open any note
   • Click the "⋮" menu
   • Select "Convert to Markdown"
   • Notely preserves all formatting

2. **Batch Conversion:**
   • Select multiple notes
   • Right-click → "Convert format"
   • Choose "Markdown"
   • All selected notes convert at once

3. **Import as Markdown:**
   • Use File → Import
   • Choose .md files
   • Notely maintains structure and links

4. **Export & Re-import:**
   • Export as .md
   • Edit in external editor
   • Import back with changes

**Preservation Guarantee:**
• All formatting kept intact
• Images remain embedded
• Tables convert properly
• Lists maintain hierarchy`
    },

    // AI FEATURES
    {
      category: "AI Features",
      question: "What exactly can the AI Writing Assistant do?",
      answer: `## 🤖 AI CAPABILITIES IN NOTELY

### ✍️ **Writing Enhancement**
• **Improve Clarity** - Rewrite confusing sentences
• **Expand Ideas** - Add details to brief points
• **Summarize** - Condense long text to key points
• **Change Tone** - Make professional, casual, or academic
• **Fix Grammar** - Correct errors and improve flow

### 🏷️ **Organization Help**
• **Smart Tagging** - Suggest relevant keywords
• **Categorization** - Recommend folders/categories
• **Title Suggestions** - Generate better note titles
• **Synopsis Creation** - Write summaries for long notes

### 💡 **Content Generation**
• **From Scratch** - Create notes from prompts
• **Meeting Notes** - Generate from bullet points
• **Project Plans** - Create structured outlines
• **Study Guides** - Organize information effectively

### 🔍 **Analysis**
• **Action Items** - Extract todos from text
• **Key Points** - Identify main ideas
• **Contradictions** - Find inconsistent information
• **Question Generation** - Create study questions

**Usage:** Click the sparkle icon (✨) anywhere in the editor to access AI tools.`
    },

    {
      category: "AI Features",
      question: "Is my data private with AI features?",
      answer: `**PRIVACY FIRST APPROACH:**

## 🔒 Data Handling
• **Local Processing** - AI can work offline for basic features
• **Optional Cloud AI** - Choose when to use enhanced cloud AI
• **No Training on Your Data** - We never use your notes to train public models
• **Encrypted Transmission** - All AI requests use end-to-end encryption

## 👁️ Transparency
• Clear indicators when AI is active
• Option to disable AI entirely
• View what data is sent for processing
• Delete AI processing history anytime

## ⚙️ Controls
• Per-note AI enable/disable
• Set AI usage limits
• Choose which AI providers to use
• Export all AI interactions

**Enterprise Version:** Offers completely self-hosted AI options.`
    },

    // COLLABORATION
    {
      category: "Collaboration",
      question: "How do I share notes with others?",
      answer: `## 🤝 SHARING OPTIONS

### **Quick Share**
1. Click **Share** button on any note
2. Choose permission level:
   • **View Only** - Can read, no edits
   • **Can Comment** - Read + add comments
   • **Can Edit** - Full edit access
   • **Owner** - Full control including sharing

3. Share via:
   • **Link** - Copy and send anywhere
   • **Email** - Direct invitation
   • **Team** - Share with specific team members

### **Advanced Features**
• **Expiration Dates** - Links that stop working after set time
• **Password Protection** - Add password to shared links
• **Download Restrictions** - Prevent note downloads
• **Activity Logs** - Track who viewed/edited

### **Team Collaboration**
• Create shared team folders
• Set team-wide permissions
• Use @mentions in comments
• Get notifications for team activity

**Tip:** Use "Share as Template" to let others copy without editing your original.`
    },

    // SYNCHRONIZATION
    {
      category: "Sync & Backup",
      question: "How does sync work across devices?",
      answer: `## 🔄 REAL-TIME SYNC SYSTEM

### **How It Works**
1. **Instant Sync** - Changes save locally and queue for cloud
2. **Conflict Resolution** - Smart merging when editing same note
3. **Offline Support** - Work without internet, syncs when back online
4. **Bandwidth Optimization** - Only syncs changes, not entire notes

### **Sync Options**
• **Selective Sync** - Choose which folders sync to which devices
• **Sync Frequency** - Real-time, every 5 min, or manual
• **Data Caps** - Set limits for mobile data
• **Background Sync** - Works even when app closed (mobile)

### **Backup Systems**
1. **Automatic Backups** - Daily encrypted cloud backups
2. **Version History** - Every change saved for 30 days (90 for premium)
3. **Export Schedules** - Automatic weekly PDF exports
4. **Local Backup** - Export to your computer as .notely bundle

### **Platform Support**
• **Web** - Full functionality
• **Windows/Mac** - Native desktop apps
• **iOS/Android** - Mobile apps with camera capture
• **Browser Extensions** - Quick clip from web pages

**Status:** Green dot in bottom right shows sync status.`
    },

    // IMPORT/EXPORT
    {
      category: "Import/Export",
      question: "What formats can I import/export?",
      answer: `## 📥 IMPORT SUPPORT
**From Other Apps:**
• **Evernote** (.enex) - Full import with notebooks, tags
• **OneNote** - Direct sync or export/import
• **Google Keep** - Import via Takeout
• **Apple Notes** - Export as PDF then import
• **Standard Formats** - .txt, .md, .docx, .pdf

**From Files:**
• **Markdown** (.md) with frontmatter support
• **HTML** - Preserves basic formatting
• **Word Documents** (.docx) - Maintains styles
• **Rich Text** (.rtf) - Formatting intact
• **Plain Text** (.txt) - Basic import

## 📤 EXPORT OPTIONS
**For Sharing:**
• **PDF** - Beautiful, print-ready documents
• **Markdown** - Clean .md files
• **HTML** - Web-ready with CSS
• **Word** (.docx) - Editable in Microsoft Word
• **Plain Text** - Simple .txt files

**For Backup:**
• **Notely Bundle** (.notely) - Complete backup with metadata
• **ZIP Archive** - All notes as individual files
• **JSON Export** - For developers and automation

**Pro Features:**
• **Batch Export** - Export entire folders at once
• **Custom Templates** - Define your own export format
• **Scheduled Exports** - Automatic daily/weekly exports
• **API Access** - Programmatic import/export`
    },

    // KEYBOARD SHORTCUTS
    {
      category: "Productivity",
      question: "What are the most useful keyboard shortcuts?",
      answer: `## ⌨️ ESSENTIAL KEYBOARD SHORTCUTS

### **Navigation**
• **Ctrl/Cmd + K** - Command palette (search anything)
• **Ctrl/Cmd + P** - Quick note switcher
• **Ctrl/Cmd + Shift + F** - Advanced search
• **J/K** - Move up/down through note list
• **Enter** - Open selected note

### **Editing**
• **Ctrl/Cmd + B** - Bold
• **Ctrl/Cmd + I** - Italic
• **Ctrl/Cmd + U** - Underline
• **Ctrl/Cmd + Shift + L** - Bullet list
• **Ctrl/Cmd + Shift + N** - Numbered list
• **Ctrl/Cmd + ]** - Indent
• **Ctrl/Cmd + [** - Outdent

### **Note Management**
• **Ctrl/Cmd + N** - New note
• **Ctrl/Cmd + Shift + N** - New folder
• **Ctrl/Cmd + D** - Duplicate note
• **Ctrl/Cmd + Delete** - Move to trash
• **Ctrl/Cmd + Shift + P** - Pin/unpin

### **AI Shortcuts**
• **Ctrl/Cmd + .** - Open AI assistant
• **Ctrl/Cmd + Shift + A** - Analyze note
• **Ctrl/Cmd + Shift + S** - Summarize
• **Ctrl/Cmd + Shift + T** - Generate tags

### **View Controls**
• **Ctrl/Cmd + \\** - Toggle sidebar
• **Ctrl/Cmd + Shift + E** - Toggle editor focus
• **Ctrl/Cmd + 1/2/3** - Change view (list, grid, kanban)

**Customization:** All shortcuts can be changed in Settings → Keyboard.`
    },

    // TROUBLESHOOTING
    {
      category: "Troubleshooting",
      question: "Why is my AI assistant not responding?",
      answer: `## 🔧 AI ASSISTANT TROUBLESHOOTING

### **Quick Checks**
1. **Internet Connection** - AI features require internet
2. **Service Status** - Check status.notely.app for outages
3. **Account Limits** - Free tier has daily AI limits
4. **Feature Enabled** - Verify AI is turned on in Settings

### **Common Issues & Fixes**

#### **"AI Service Unavailable"**
• **Wait 1 minute** and try again
• **Check firewall** - Allow connections to api.notely.app
• **Update app** - Ensure you have latest version

#### **"Quota Exceeded"**
• Free: 50 AI requests/day
• Premium: 500 requests/day
• **Reset time:** Midnight UTC
• **Upgrade** for higher limits

#### **"Slow Responses"**
• AI models vary in speed
• Try simpler prompts
• Use "Fast Mode" in AI settings
• Check your internet speed

#### **"Incorrect Answers"**
• Rephrase your question
• Provide more context
• Use the "Regenerate" button
• Report issue via feedback

### **Advanced Fixes**
1. **Clear AI Cache:** Settings → AI → Clear Cache
2. **Switch AI Model:** Try different model in settings
3. **Disable/Re-enable:** Turn AI off/on in settings
4. **Reinstall App:** Last resort for persistent issues

**Support:** Use Help → Contact Support for personalized help.`
    },

    // MOBILE SPECIFIC
    {
      category: "Mobile",
      question: "What can I do with the mobile app?",
      answer: `## 📱 NOTELY MOBILE APP FEATURES

### **Core Mobile Features**
• **Full Note Editing** - Same editor as desktop
• **Camera Integration** - Scan documents, whiteboards
• **Voice Notes** - Dictate notes, transcribes automatically
• **Offline Access** - Full functionality without internet
• **Quick Capture** - Widget for instant note creation

### **Mobile-Exclusive Features**
• **Location Tagging** - Automatically add location to notes
• **Handwriting Support** - Write/draw with stylus or finger
• **Audio Recording** - Attach voice memos to notes
• **Notification Quick Actions** - Create notes from notifications
• **Share Extension** - Save content from other apps directly

### **Optimized Mobile Workflow**
1. **Home Screen Widgets** - Quick access to frequent notes
2. **Siri Shortcuts** - "Hey Siri, add to Notely"
3. **Dark Mode Auto-switch** - Follows system setting
4. **Battery Optimization** - Minimal background usage
5. **Data Saver Mode** - Compress images, limit sync

### **Sync Behavior**
• **On Wi-Fi Only** option for data saving
• **Background Sync** every 15 minutes
• **Conflict Resolution** - Easy merge when editing on multiple devices
• **Selective Sync** - Choose which folders sync to mobile

**Tip:** Enable "Quick Note" from lock screen for instant capture!`
    }
  ],

  // ==================== TIPS & BEST PRACTICES ====================
  bestPractices: [
    "**Daily Review System:** Create a 'Daily Notes' template with sections for tasks, ideas, and reflections",
    "**Meeting Template:** Save time with pre-made meeting templates that include agenda, notes, and action items",
    "**Knowledge Base:** Use Notely as a personal wiki with [[internal links]] connecting related notes",
    "**Project Tracking:** Create a note for each project, then use #project-name tags on all related notes",
    "**Study Method:** Use the Cornell Note-taking system template for better learning retention",
    "**Weekly Planning:** Every Sunday, create a weekly plan note with goals, schedule, and priorities",
    "**Digital Garden:** Treat your notes as a living document that grows and connects over time",
    "**Batch Processing:** Dedicate specific times for note organization rather than doing it constantly"
  ],

  // ==================== TEMPLATES LIBRARY ====================
  templates: [
    {
      name: "Meeting Notes",
      description: "Structured template for effective meeting documentation",
      content: `# {{Meeting Topic}}
**Date:** {{date}}
**Attendees:** {{attendees}}

## 🎯 Agenda
1. 
2. 
3. 

## 📝 Notes
• 

## ✅ Action Items
- [ ] 
- [ ] 

## ❓ Questions & Follow-ups
• 

## 📁 Related Notes
• [[ ]]
• [[ ]]`
    },
    {
      name: "Project Plan",
      description: "Comprehensive project planning template",
      content: `# {{Project Name}}
**Status:** 🟡 In Progress
**Start Date:** {{start_date}}
**Due Date:** {{due_date}}

## 🎯 Overview
{{project_overview}}

## 📋 Goals & Objectives
1. 
2. 
3. 

## 👥 Team
• **Lead:** 
• **Members:** 

## 📅 Timeline
| Phase | Start | End | Status |
|-------|-------|-----|--------|
| Planning | | | |
| Execution | | | |
| Review | | | |

## 📁 Linked Resources
• [[ ]]
• [[ ]]

## 🔄 Updates
**{{date}}:** `
    }
  ]
};

// ==================== HELPER FUNCTIONS ====================
export function findRelevantKnowledge(query: string) {
  const lowercaseQuery = query.toLowerCase();
  const relevant = {
    faqs: [] as any[],
    features: [] as string[],
    markdownTips: [] as string[],
    bestPractices: [] as string[]
  };

  // Search FAQs
  NOTELY_COMPLETE_KNOWLEDGE.faqs.forEach(faq => {
    const faqText = `${faq.question} ${faq.answer}`.toLowerCase();
    if (faqText.includes(lowercaseQuery) || 
        lowercaseQuery.includes(faq.question.toLowerCase().split(' ')[0])) {
      relevant.faqs.push(faq);
    }
  });

  // Search features
  Object.values(NOTELY_COMPLETE_KNOWLEDGE.coreFeatures).flat().forEach(feature => {
    if (feature.toLowerCase().includes(lowercaseQuery)) {
      relevant.features.push(feature);
    }
  });

  // Search markdown tips
  Object.values(NOTELY_COMPLETE_KNOWLEDGE.markdownGuide).flat().forEach(tip => {
    if (tip.toLowerCase().includes('markdown') || tip.toLowerCase().includes('md')) {
      relevant.markdownTips.push(tip);
    }
  });

  // Search best practices
  NOTELY_COMPLETE_KNOWLEDGE.bestPractices.forEach(practice => {
    if (practice.toLowerCase().includes(lowercaseQuery)) {
      relevant.bestPractices.push(practice);
    }
  });

  return relevant;
}

export function generateSystemPrompt(query: string): string {
  const knowledge = findRelevantKnowledge(query);
  
  return `
# 🎯 NOTELY AI ASSISTANT - COMPLETE KNOWLEDGE BASE

## APP OVERVIEW
${NOTELY_COMPLETE_KNOWLEDGE.appOverview}

## RELEVANT KNOWLEDGE FOR THIS QUERY
${knowledge.faqs.length > 0 ? 
  `### FAQ MATCHES:\n${knowledge.faqs.slice(0, 3).map(f => `**Q:** ${f.question}\n**A:** ${f.answer.substring(0, 200)}...`).join('\n\n')}` 
  : ''}

${knowledge.features.length > 0 ? 
  `### RELATED FEATURES:\n${knowledge.features.slice(0, 5).map(f => `• ${f}`).join('\n')}` 
  : ''}

${knowledge.markdownTips.length > 0 ? 
  `### MARKDOWN TIPS:\n${knowledge.markdownTips.slice(0, 3).map(t => `• ${t}`).join('\n')}` 
  : ''}

## RESPONSE GUIDELINES
1. **Be Specific** - Reference exact Notely features by name
2. **Provide Steps** - Give actionable, numbered instructions
3. **Include Examples** - Show practical usage examples
4. **Mention Shortcuts** - Include keyboard shortcuts when relevant
5. **Suggest Templates** - Recommend appropriate templates
6. **Explain Benefits** - Say why a feature or approach is useful
7. **Keep Under 400 Words** - Be comprehensive but concise
8. **Use Emojis Sparingly** - For visual organization only
9. **End Helpfully** - Suggest next steps or related features

## TONE & STYLE
- **Friendly but professional** - Like a helpful expert
- **Encouraging** - Make users feel capable
- **Clear** - Avoid jargon, explain technical terms
- **Confident** - Show deep product knowledge

**Remember:** You ARE Notely. You know everything about the app. Answer as if you built it yourself.
`;
}