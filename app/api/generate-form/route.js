import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAiModel } from '@/configs/AiModal'

const PROMPT = ',On Basis of description create JSON form with formTitle, formHeading along with fieldName, FieldTitle,FieldType, Placeholder, label , required fields, and checkbox and select field type options will be in array only and in JSON format'

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

    const result = await getAiModel().generateContent(`Description:${description.trim()}${PROMPT}`)
    const form = result.response.text()
    if (!form) {
      return NextResponse.json({ error: 'Gemini returned an empty response.' }, { status: 502 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Form generation failed:', error)
    const status = error.message === 'GEMINI_API_KEY is not configured.' ? 500 : 502
    const message = status === 500 ? 'Gemini API key is not configured on the server.' : 'Could not generate the form.'
    return NextResponse.json({ error: message }, { status })
  }
}