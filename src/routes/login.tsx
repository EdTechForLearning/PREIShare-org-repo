import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { getCurrentUser } from '../lib/auth/session'
import { createBrowserSupabaseClient } from '../lib/supabase/client'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = Route.useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    const normalizedEmail = email.trim()
    if (!normalizedEmail || !password) {
      setErrorMessage('Enter both your email address and password.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = await createBrowserSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        setErrorMessage(
          error.code === 'invalid_credentials'
            ? 'The email or password is incorrect.'
            : `Unable to sign in: ${error.message}`,
        )
        return
      }

      if (!data.session) {
        setErrorMessage('Sign-in did not establish a session. Please try again.')
        return
      }

      await navigate({ to: '/dashboard', replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to sign in. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrap px-4 py-12 sm:py-16">
      <section
        aria-labelledby="login-title"
        className="island-shell mx-auto max-w-md rounded-[2rem] p-6 sm:p-9"
      >
        <p className="island-kicker mb-2 text-sm font-semibold uppercase tracking-wide">
          PREIshare sponsor access
        </p>
        <h1
          className="display-title mb-6 text-3xl font-bold text-[var(--sea-ink)]"
          id="login-title"
        >
          Sign in
        </h1>

        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-semibold" htmlFor="login-email">
              Email
            </label>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
              id="login-email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-semibold"
              htmlFor="login-password"
            >
              Password
            </label>
            <input
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
              id="login-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {errorMessage ? (
            <p className="text-sm font-medium text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="w-full rounded-full bg-[var(--palm)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
