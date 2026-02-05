import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { agendaItems } = body

  if (!agendaItems || agendaItems.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No items to summarize',
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
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const itemsString = agendaItems.map((i: any) => 
    `- ${i.theme} (${i.votes} votes): ${i.description}`
  ).join('\n')

  const prompt = `
    Based on the following prioritized agenda items for a team building "Yarn" (AI symptom tracker), 
    provide a concise, high-impact 2-sentence summary of the focus of this meeting.
    Highlight the most important priorities based on the votes.

    Agenda Items:
    ${itemsString}

    Summary (2 sentences):
  `

  try {
    const result = await model.generateContent(prompt)
    const summary = result.response.text().trim()

    return {
      success: true,
      summary
    }
  } catch (error) {
    console.error('Gemini Summary Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate meeting summary',
    })
  }
})
