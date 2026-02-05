import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { meeting_id, responses } = body

  if (!responses || responses.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No responses to analyze',
    })
  }

  const apiKey = process.env.GEMINI_API_KEY || config.geminiApiKey
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini API Key missing',
    })
  }

  const genAI = new GoogleGenerativeAI(apiKey as string)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  // Construct the prompt from team responses
  const formattedResponses = responses.map((r: any) => 
    `User: ${r.user_id}\nWorrying: ${r.worrying}\nGoing Well: ${r.going_well}\nCould do better: ${r.could_do_better}`
  ).join('\n\n---\n\n')

  const prompt = `
    You are an expert meeting facilitator for a student engineering team building "Yarn" (an AI symptom tracker).
    Analyze the following team reflections and extract 3-5 key "Themes" for today's meeting.
    For each theme, provide a concise description and 2-3 specific "Action Points".

    Team Reflections:
    ${formattedResponses}

    Return the result as a raw JSON array of objects with this structure:
    [{ "theme": "string", "description": "string", "action_points": ["string", "string"] }]
    Output ONLY the JSON array. No markdown, no backticks.
  `

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    
    // Clean potential markdown wrap
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const agendaItems = JSON.parse(cleanJson)

    return {
      success: true,
      agendaItems
    }
  } catch (error) {
    console.error('Gemini Analysis Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to extract meeting themes',
    })
  }
})
