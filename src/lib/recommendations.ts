/**
 * recommendations.ts
 * Curated list of tools shown in the Discover sheet.
 * These are never auto-seeded — the user explicitly adds them to their cache.
 */

export interface RecommendedTool {
  name: string
  url: string
  description: string
  tags: string[]   // default category ids to apply when added
}

export const RECOMMENDED_TOOLS: RecommendedTool[] = [
  // Dev
  { name: 'GitHub',      url: 'https://github.com',        description: 'Code hosting, PRs, CI/CD',                  tags: ['cat-dev'] },
  { name: 'Vercel',      url: 'https://vercel.com',        description: 'Deploy frontends in seconds',                tags: ['cat-dev'] },
  { name: 'Postman',     url: 'https://postman.com',       description: 'API testing and collections',                tags: ['cat-dev'] },
  { name: 'Railway',     url: 'https://railway.app',       description: 'Backend + DB hosting',                      tags: ['cat-dev'] },
  { name: 'Supabase',    url: 'https://supabase.com',      description: 'Postgres + auth + storage as a service',     tags: ['cat-dev'] },
  { name: 'CodeSandbox', url: 'https://codesandbox.io',    description: 'Browser-based dev environments',             tags: ['cat-dev'] },
  { name: 'Warp',        url: 'https://warp.dev',          description: 'AI-native terminal',                         tags: ['cat-dev'] },
  { name: 'Cursor',      url: 'https://cursor.com',        description: 'AI code editor',                             tags: ['cat-dev'] },
  // Marketing
  { name: 'Canva',       url: 'https://canva.com',         description: 'Drag-and-drop design tool',                  tags: ['cat-marketing'] },
  { name: 'Beehiiv',     url: 'https://beehiiv.com',       description: 'Newsletter platform',                        tags: ['cat-marketing'] },
  { name: 'Buffer',      url: 'https://buffer.com',        description: 'Social media scheduling',                    tags: ['cat-marketing'] },
  { name: 'Mailchimp',   url: 'https://mailchimp.com',     description: 'Email marketing & automation',               tags: ['cat-marketing'] },
  { name: 'Typefully',   url: 'https://typefully.com',     description: 'Twitter/X thread composer',                  tags: ['cat-marketing'] },
  { name: 'Loom',        url: 'https://loom.com',          description: 'Async video messaging',                      tags: ['cat-marketing'] },
  // Community
  { name: 'Discord',     url: 'https://discord.com',       description: 'Community chat and servers',                 tags: ['cat-community'] },
  { name: 'Slack',       url: 'https://slack.com',         description: 'Team messaging',                             tags: ['cat-community'] },
  { name: 'Circle',      url: 'https://circle.so',         description: 'Community platform for creators',            tags: ['cat-community'] },
  { name: 'Notion',      url: 'https://notion.so',         description: 'Docs, wikis, and project boards',            tags: ['cat-community'] },
  { name: 'Luma',        url: 'https://lu.ma',             description: 'Event hosting + RSVP',                       tags: ['cat-community', 'cat-events'] },
  // Events
  { name: 'Eventbrite',  url: 'https://eventbrite.com',    description: 'Large-scale event management',               tags: ['cat-events'] },
  { name: 'Zoom',        url: 'https://zoom.us',           description: 'Video conferencing',                         tags: ['cat-events'] },
  { name: 'Streamyard',  url: 'https://streamyard.com',    description: 'Live streaming studio',                      tags: ['cat-events'] },
  { name: 'Cal.com',     url: 'https://cal.com',           description: 'Open-source scheduling',                     tags: ['cat-events'] },
  // UAT
  { name: 'Maze',        url: 'https://maze.co',           description: 'Rapid usability testing',                    tags: ['cat-uat'] },
  { name: 'UserTesting', url: 'https://usertesting.com',   description: 'Video feedback from real users',              tags: ['cat-uat'] },
  { name: 'Hotjar',      url: 'https://hotjar.com',        description: 'Heatmaps and session recordings',             tags: ['cat-uat'] },
  { name: 'Lyssna',      url: 'https://lyssna.com',        description: 'Design and copy testing',                    tags: ['cat-uat'] },
  { name: 'ScreenRec',   url: 'https://screenrec.com',     description: 'Quick screen recording',                     tags: ['cat-uat'] },
  // AI
  { name: 'Claude',      url: 'https://claude.ai',         description: "Anthropic's AI assistant",                   tags: ['cat-ai'] },
  { name: 'ChatGPT',     url: 'https://chatgpt.com',       description: "OpenAI's AI assistant",                      tags: ['cat-ai'] },
  { name: 'Perplexity',  url: 'https://perplexity.ai',     description: 'AI-powered search',                          tags: ['cat-ai'] },
  { name: 'v0',          url: 'https://v0.dev',            description: 'AI UI generator by Vercel',                  tags: ['cat-ai', 'cat-dev'] },
  { name: 'Runway',      url: 'https://runwayml.com',      description: 'AI video generation',                        tags: ['cat-ai'] },
]

export function normaliseUrl(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, '')
  } catch {
    return url.toLowerCase().trim()
  }
}
