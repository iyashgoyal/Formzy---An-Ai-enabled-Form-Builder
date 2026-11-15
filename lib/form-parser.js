/**
 * Helpers for turning raw AI output into a form definition.
 * Kept dependency-free so it can be unit tested outside Next.js.
 */

/**
 * Extracts the first complete JSON object from the model output. Handles
 * markdown code fences, leading chatter and trailing text.
 */
export function extractJson(text) {
  const cleaned = String(text)
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')

  const start = cleaned.indexOf('{')
  if (start === -1) {
    throw new Error('No JSON object found in the AI response.')
  }

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < cleaned.length; i += 1) {
    const char = cleaned[i]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
    } else if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return cleaned.slice(start, i + 1)
      }
    }
  }

  throw new Error('The AI response was cut off before the JSON was complete.')
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return []
  return options
    .map((option) => {
      if (typeof option === 'string') return option
      if (option && typeof option === 'object') {
        return option.label ?? option.value ?? option.title ?? ''
      }
      return ''
    })
    .filter((option) => String(option).trim() !== '')
}

const FIELD_TYPE_ALIASES = {
  dropdown: 'select',
  dropdownlist: 'select',
  choice: 'select',
  combobox: 'select',
  'single choice': 'radio',
  single_choice: 'radio',
  radiogroup: 'radio',
  radio_group: 'radio',
  checkboxes: 'checkbox',
  checkbox_group: 'checkbox',
  'multi select': 'checkbox',
  multiselect: 'checkbox',
  string: 'text',
  input: 'text',
  textbox: 'textarea',
  'text area': 'textarea',
  multiline: 'textarea',
  integer: 'number',
  float: 'number',
  boolean: 'checkbox',
  bool: 'checkbox',
}

const SUPPORTED_FIELD_TYPES = [
  'text',
  'email',
  'number',
  'tel',
  'date',
  'textarea',
  'select',
  'radio',
  'checkbox',
]

function normalizeFieldType(value) {
  const raw = String(value ?? 'text').trim().toLowerCase()
  const mapped = FIELD_TYPE_ALIASES[raw] ?? raw
  return SUPPORTED_FIELD_TYPES.includes(mapped) ? mapped : 'text'
}

function normalizeRequired(value) {
  return value === true || value === 1 || value === 'true' || value === 'yes'
}

export function normalizeForm(form) {
  if (!form || typeof form !== 'object' || !Array.isArray(form.fields)) {
    throw new Error('Generated form has an invalid structure.')
  }

  const fields = form.fields
    .filter((field) => field && typeof field === 'object')
    .map((field, index) => {
      const label = String(field.label ?? field.fieldTitle ?? field.fieldName ?? `Field ${index + 1}`)
      const fieldName =
        String(field.fieldName ?? label)
          .trim()
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .replace(/^(\d)/, '_$1') || `field_${index + 1}`

      return {
        fieldName,
        fieldTitle: String(field.fieldTitle ?? label),
        fieldType: normalizeFieldType(field.fieldType),
        placeholder: String(field.placeholder ?? ''),
        label,
        required: normalizeRequired(field.required),
        options: normalizeOptions(field.options),
        type: field.type,
      }
    })

  if (fields.length === 0) {
    throw new Error('The AI did not return any form fields.')
  }

  return {
    ...form,
    formTitle: String(form.formTitle ?? 'Untitled Form'),
    formHeading: String(form.formHeading ?? ''),
    fields,
  }
}

export function parseGeneratedForm(text) {
  const jsonText = extractJson(text)
  let form
  try {
    form = JSON.parse(jsonText)
  } catch (error) {
    throw new Error('The AI returned malformed JSON.')
  }
  return normalizeForm(form)
}
