import Link from 'next/link'
import { Link2, QrCode, Target, Globe, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const tools = [
  {
    title: 'URL Shortener',
    description: 'Transform long, complex URLs into memorable, secure, and trackable short links.',
    href: '/tools/url-shortener',
    icon: Link2,
    badge: 'Popular',
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    title: 'QR Code Generator',
    description: 'Generate high-resolution PNG and SVG QR codes for any link, text, or landing page.',
    href: '/tools/qr-code-generator',
    icon: QrCode,
    badge: 'Free Studio',
    color: 'from-purple-500 to-pink-600',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    title: 'UTM Campaign Builder',
    description: 'Build Google Analytics UTM parameters to track campaign source, medium, and campaign ROI.',
    href: '/tools/utm-builder',
    icon: Target,
    badge: 'Marketing',
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    title: 'URL Encoder / Decoder',
    description: 'Safely encode and decode URI components and special characters.',
    href: '#',
    icon: Globe,
    badge: 'Coming Soon',
    comingSoon: true,
    color: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    title: 'Redirect Chain Checker',
    description: 'Analyze HTTP 301, 302, and 307 redirect chains and verify destination integrity.',
    href: '#',
    icon: ShieldCheck,
    badge: 'Coming Soon',
    comingSoon: true,
    color: 'from-zinc-500 to-slate-600',
    iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
  },
]

export const metadata = {
  title: 'Free Link & Marketing Tools | ShortLink',
  description: 'A suite of free online utilities for modern marketers: URL Shortener, QR Code Generator, and UTM Builder.',
}

export default function ToolsDirectoryPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg transition shadow-xs"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-20 px-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          100% Free Link Utilities
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Everything you need for link marketing
        </h1>
        <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
          Streamline your campaigns, generate custom branded QR codes, and structure trackable UTM links without restrictions.
        </p>
      </section>

      {/* Tools Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.title}
                className={`group relative bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col justify-between ${
                  tool.comingSoon ? 'opacity-75' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3.5 rounded-2xl border ${tool.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                        tool.comingSoon
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {tool.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100">
                  {tool.comingSoon ? (
                    <span className="text-xs font-semibold text-slate-400 cursor-not-allowed">
                      In Development
                    </span>
                  ) : (
                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition"
                    >
                      Open Tool
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
