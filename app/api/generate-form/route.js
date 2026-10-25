import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAiModel } from '@/configs/AiModal'

const PROMPT = ' Create a form from this description. Return only valid JSON with this shape: {"formTitle":"string","formHeading":"string","fields":[{"fieldName":"string","fieldTitle":"string","fieldType":"string","placeholder":"string","label":"string","required":true,"options":[]}]} Description: '

function parseGeneratedForm(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  const jsonText = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned
  const form = JSON.parse(jsonText)
  if (!form.formTitle || !form.formHeading || !Array.isArray(form.fields)) {
    throw new Error('Generated form has an invalid structure.')
  }
  return form
}

export async function POST(request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to generate a form.' }, { status: 401 })
    }

    const { description } = await request.json()
    if (typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Describe the form you want to create.' }, { status: 400 })
    }

    const result = await getAiModel().generateContent(`${PROMPT}${description.trim()}`)
    const responseText = result.response.text()
    if (!responseText) {
      return NextResponse.json({ error: 'Gemini returned an empty response.' }, { status: 502 })
    }

    try {
      const form = parseGeneratedForm(responseText)
      return NextResponse.json({ form: JSON.stringify(form) })
    } catch (error) {
      console.error('Invalid Gemini JSON:', responseText)
      return NextResponse.json({ error: 'Gemini returned invalid JSON. Please try again.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Form generation failed:', error)
    const status = error.message === 'GEMINI_API_KEY is not configured.' ? 500 : 502
    const message = status === 500 ? 'Gemini API key is not configured on the server.' : 'Could not generate the form.'
    return NextResponse.json({ error: message }, { status })
  }
}