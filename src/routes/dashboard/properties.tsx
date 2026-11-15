import { createServerFn } from '@tanstack/react-start'
import { createFileRoute, redirect } from '@tanstack/react-router'
import type { Database } from '../../lib/supabase/types'

type Property = Pick<
  Database['public']['Tables']['properties']['Row'],
  'id' | 'title' | 'description' | 'address' | 'city' | 'status' | 'created_at'
>

const listProperties = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Property[]> => {
    const { createServerSupabaseClient } =
      await import('../../lib/supabase.server')
    const { supabase, user } = await createServerSupabaseClient()

    if (!user) {
      throw redirect({ to: '/login' })
    }

    const { data, error } = await supabase
      .from('properties')
      .select('id, title, description, address, city, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Unable to load properties: ${error.message}`)
    }

    return data
  },
)

export const Route = createFileRoute('/dashboard/properties')({
  loader: () => listProperties(),
  pendingComponent: PropertiesLoading,
  errorComponent: PropertiesError,
  component: PropertiesPage,
})

function PropertiesLoading() {
  return (
    <section aria-busy="true" aria-live="polite">
      <p className="text-sm text-[var(--sea-ink-soft)]">Loading properties…</p>
    </section>
  )
}

function PropertiesError({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.'

  return (
    <section aria-labelledby="properties-error-title" className="space-y-3">
      <h1
        className="text-2xl font-bold text-[var(--sea-ink)]"
        id="properties-error-title"
      >
        Unable to load properties
      </h1>
      <p className="text-sm text-red-700" role="alert">
        {message}
      </p>
      <button
        className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
        onClick={() => window.location.reload()}
        type="button"
      >
        Try again
      </button>
    </section>
  )
}

function PropertiesPage() {
  const properties = Route.useLoaderData()

  return (
    <section aria-labelledby="properties-title" className="space-y-5">
      <header>
        <p className="island-kicker text-sm font-semibold uppercase tracking-wide">
          Sponsor portfolio
        </p>
        <h1
          className="mt-1 text-2xl font-bold text-[var(--sea-ink)]"
          id="properties-title"
        >
          Properties
        </h1>
      </header>

      {properties.length === 0 ? (
        <p className="island-shell rounded-2xl p-6 text-[var(--sea-ink-soft)]">
          No properties yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  )
}

function PropertyCard({ property }: { property: Property }) {
  const createdDate = new Date(property.created_at)
  const formattedDate = Number.isNaN(createdDate.getTime())
    ? null
    : createdDate.toLocaleDateString()

  return (
    <article className="feature-card rounded-xl border border-[var(--line)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="m-0 break-words text-lg font-bold text-[var(--sea-ink)]">
            {property.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {property.city}
          </p>
        </div>
        {property.status ? (
          <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--sea-ink)]">
            {property.status}
          </span>
        ) : null}
      </div>

      {property.address ? (
        <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
          {property.address}
        </p>
      ) : null}
      {property.description ? (
        <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--sea-ink-soft)]">
          {property.description}
        </p>
      ) : null}
      {formattedDate ? (
        <p className="mt-4 text-xs text-[var(--sea-ink-soft)]">
          Added {formattedDate}
        </p>
      ) : null}
    </article>
  )
}
