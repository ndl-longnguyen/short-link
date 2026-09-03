import Link from 'next/link'
import { AlertCircle, Clock, Ban, HelpCircle, ArrowRight, ShieldAlert } from 'lucide-react'

interface ErrorPageProps {
  searchParams: Promise<{
    type?: string
    slug?: string
  }>
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const { type, slug } = await searchParams

  let title = 'Link Unavailable'
  let description = 'We could not redirect you to the destination address.'
  let icon = <AlertCircle className="w-12 h-12 text-rose-500" />
  let badgeText = 'Error'
  let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200'

  switch (type) {
    case 'not-found':
      title = 'Link Not Found'
      description = slug
        ? `The short link "${slug}" does not exist or may have been deleted by its creator.`
        : 'The short link you followed does not exist.'
      icon = <HelpCircle className="w-12 h-12 text-amber-500" />
      badgeText = '404 Not Found'
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200'
      break

    case 'expired':
      title = 'Link Has Expired'
      description = 'This short link was scheduled with an expiration date and is no longer accepting visits.'
      icon = <Clock className="w-12 h-12 text-orange-500" />
      badgeText = 'Expired'
      badgeColor = 'bg-orange-50 text-orange-700 border-orange-200'
      break

    case 'disabled':
      title = 'Link Is Disabled'
      description = 'The owner of this short link has temporarily paused redirects to this destination.'
      icon = <Ban className="w-12 h-12 text-zinc-500" />
      badgeText = 'Inactive'
      badgeColor = 'bg-zinc-100 text-zinc-700 border-zinc-200'
      break

    case 'max-clicks':
      title = 'Click Limit Reached'
      description = 'This short link was configured with a maximum click quota which has now been exhausted.'
      icon = <AlertCircle className="w-12 h-12 text-indigo-500" />
      badgeText = 'Limit Reached'
      badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200'
      break
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-5">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            {icon}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-4 shadow-xs" style={{}} >
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          {title}
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-8">
          {description}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition shadow-md shadow-slate-900/10 active:scale-[0.98]"
          >
            Create Your Own Short Link
            <ArrowRight className="w-4 h-4" />
          </Link>

          {slug && (
            <Link
              href={`/report?slug=${encodeURIComponent(slug)}`}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-medium text-xs transition"
            >
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Report this link for abuse or malware
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        Secured by ShortLink Platform &bull; Privacy-Safe Redirects
      </div>
    </div>
  )
}
