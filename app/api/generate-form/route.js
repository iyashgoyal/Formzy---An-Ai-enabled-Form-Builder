import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAiModel } from '@/configs/AiModal'
import { parseGeneratedForm } from '@/lib/form-parser'

// AI generation can take a few seconds. Vercel's default function timeout is
// 10s, which returns a plain-text/HTML error page (the cause of the client's
// "Unexpected token ... is not valid JSON" error). 60s is the Hobby plan max.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const PROMPT =
  'Create a form from this description. Return only valid JSON with this shape: ' +
  '{"formTitle":"string","formHeading":"string","fields":[{"fieldName":"string",' +
  '"fieldTitle":"string","fieldType":"string","placeholder":"string","label":"string",' +
  '"required":true,"options":[]}]} ' +
  'Allowed fieldType values: text, email, number, tel, date, textarea, select, radio, checkbox. ' +
  'For select, radio and checkbox always fill "options" with plain strings. ' +
  'Description: '

export async function POST(request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to generate a form.' }, { status: 401 })
    }

    let description
    try {
      const body = await request.json()
      description = body?.description
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    if (typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Describe the form you want to create.' }, { status: 400 })
    }

    const result = await getAiModel().generateContent(`${PROMPT}${description.trim()}`)

    let responseText = ''
    try {
      responseText = result.response.text()
    } catch (error) {
      console.error('Gemini returned no text:', error)
      return NextResponse.json(
        { error: 'The AI could not generate a form for that description. Please try again.' },
        { status: 502 }
      )
    }

    if (!responseText || !responseText.trim()) {
      return NextResponse.json({ error: 'The AI returned an empty response.' }, { status: 502 })
    }

    try {
      const form = parseGeneratedForm(responseText)
      return NextResponse.json({ form: JSON.stringify(form) })
    } catch (error) {
      console.error('Invalid AI JSON:', error.message, responseText)
      return NextResponse.json({ error: `${error.message} Please try again.` }, { status: 502 })
    }
  } catch (error) {
    console.error('Form generation failed:', error)

    if (error.message === 'GEMINI_API_KEY is not configured.') {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      )
    }

    if (error.name === 'AbortError' || /aborted|timeout/i.test(error.message || '')) {
      return NextResponse.json(
        { error: 'The AI took too long to respond. Please try again.' },
        { status: 504 }
      )
    }

    return NextResponse.json({ error: 'Could not generate the form. Please try again.' }, { status: 502 })
  }
}
