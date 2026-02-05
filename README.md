# Yarn Meeting Catalyst 🚀

AI-driven team synchronization tool for the Yarn team. Convert meeting friction into focused, prioritized agendas using Nuxt 3, Supabase, and Gemini.

## 🛠️ Setup Instructions

### 1. Database (Supabase)
Run the SQL migration found in `supabase_setup.sql` in your existing Yarn Supabase SQL Editor. This will create:
- `catalyst_meetings` (includes `meeting_summary` column)
- `catalyst_responses`
- `catalyst_agenda_items`

### 2. Environment Variables
Add the following to your `.env` (local) and Netlify Dashboard:

```env
# Existing Yarn Keys
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# AI Integration
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Development
```bash
npm install
npm run dev
```

### 4. Deployment
Deploy to Netlify by linking this repository. Ensure the environment variables above are added to the Netlify site configuration.

---

Built by Kdog 👨‍💻✊
