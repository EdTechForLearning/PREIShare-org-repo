import { createServerFn } from '@tanstack/react-start'
import {
  createFileRoute,
  isRedirect,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useRef, useState, type FormEvent } from 'react'
import type { Database } from '../../../lib/supabase/types'

type PropertyInsert = Database['public']['Tables']['properties']['Insert']
type PropertyFormInput = {
  title: string
  city: string
  description: string | null
  address: string | null
  status: string | null
}
type PropertyField = keyof PropertyFormInput

const propertyFields: PropertyField[] = [
  'title',
  'city',
  'description',
  'address',
  'status',
]

function validatePropertyInput(input: unknown): PropertyFormInput {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('Enter valid property information.')
  }

  const record = input as Record<string, unknown>
  const allowedFields = new Set(propertyFields)
  if (Object.keys(record).some((key) => !allowedFields.has(key as PropertyField))) {
    throw new Error('The property submission contains unsupported fields.')
  }

  if (typeof record.title !== 'string' || record.title.trim() === '') {
    throw new Error('Property title is required.')
  }
  if (typeof record.city !== 'string' || record.city.trim() === '') {
    throw new Error('City is required.')
  }

  const optionalText = (field: 'description' | 'address' | 'status') => {
    const value = record[field]
    if (value === undefined || value === null || value === '') {
      return null
    }
    if (typeof value !== 'string') {
      throw new Error(`Enter valid ${field} text.`)
    }
    return value.trim() || null
  }

  return {
    title: record.title.trim(),
    city: record.city.trim(),
    description: optionalText('description'),
    address: optionalText('address'),
    status: optionalText('status'),
  }
}

const createProperty = createServerFn({ method: 'POST' })
  .validator(validatePropertyInput)
  .handler(async ({ data }) => {
    const { createServerSupabaseClient } =
      await import('../../../lib/supabase.server')
    const { supabase, user } = await createServerSupabaseClient()

    if (!user) {
      throw redirect({ to: '/login' })
    }

    const property: PropertyInsert = {
      owner_id: user.id,
      title: data.title,
      city: data.city,
      description: data.description,
      address: data.address,
      status: data.status,
    }

    const { data: createdProperty, error } = await supabase
      .from('properties')
      .insert(property)
      .select('id')
      .single()

    if (error) {
      throw new Error(`Unable to create property: ${error.message}`)
    }
    if (!createdProperty) {
      throw new Error('The database did not confirm that the property was saved.')
    }

    return { id: createdProperty.id }
  })

export const Route = createFileRoute('/dashboard/properties/new')({
  component: NewPropertyPage,
})

function NewPropertyPage() {
  const navigate = Route.useNavigate()
  const router = useRouter()
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<PropertyField, string>>
  >({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submissionInProgress = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submissionInProgress.current) {
      return
    }

    setFieldErrors({})
    setFormError('')

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    const city = String(formData.get('city') ?? '').trim()
    const errors: Partial<Record<PropertyField, string>> = {}

    if (!title) {
      errors.title = 'Enter a property title.'
    }
    if (!city) {
      errors.city = 'Enter the property city.'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    const optionalValue = (name: 'description' | 'address' | 'status') => {
      const value = String(formData.get(name) ?? '').trim()
      return value || null
    }

    submissionInProgress.current = true
    setIsSubmitting(true)
    try {
      await createProperty({
        data: {
          title,
          city,
          description: optionalValue('description'),
          address: optionalValue('address'),
          status: optionalValue('status'),
        },
      })
      await navigate({ to: '/dashboard/properties', replace: true })
      await router.invalidate()
    } catch (error) {
      if (isRedirect(error)) {
        throw error
      }
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save the property. Please try again.',
      )
    } finally {
      submissionInProgress.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="new-property-title"
      className="mx-auto max-w-3xl space-y-5"
    >
      <header>
        <Link className="text-sm font-semibold" to="/dashboard/properties">
          ← Back to properties
        </Link>
        <h1
          className="mt-4 text-2xl font-bold text-[var(--sea-ink)]"
          id="new-property-title"
        >
          Add New Property
        </h1>
      </header>

      <form
        className="island-shell space-y-5 rounded-2xl p-5 sm:p-7"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            error={fieldErrors.title}
            id="property-title"
            label="Property title"
            name="title"
            required
          />
          <TextField
            error={fieldErrors.city}
            id="property-city"
            label="City"
            name="city"
            required
          />
          <TextField
            id="property-address"
            label="Address"
            name="address"
          />
          <TextField
            id="property-status"
            label="Status"
            name="status"
          />
          <div className="space-y-2 sm:col-span-2">
            <label
              className="block text-sm font-semibold"
              htmlFor="property-description"
            >
              Description
            </label>
            <textarea
              className="min-h-28 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
              id="property-description"
              name="description"
              rows={4}
            />
          </div>
        </div>

        {formError ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {formError}
          </p>
        ) : null}

        <button
          className="rounded-full bg-[var(--palm)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Saving property…' : 'Save property'}
        </button>
      </form>
    </section>
  )
}

function TextField({
  error,
  id,
  label,
  name,
  required = false,
}: {
  error?: string | undefined
  id: string
  label: string
  name: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold" htmlFor={id}>
        {label}
        {required ? ' (required)' : ''}
      </label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete="off"
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
        id={id}
        name={name}
        required={required}
        type="text"
      />
      {error ? (
        <p className="text-sm text-red-700" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
