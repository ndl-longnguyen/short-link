'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Link2,
  QrCode,
  Target,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react'

const tools = [
  {
    id: 'shortener',
    title: 'Advanced URL Shortener',
    titleVi: 'Rút gọn link nâng cao',
    description:
      'Create custom slug links with password protection, click expiration limits, and HTTP 301/302/307 redirect status choices.',
    href: '/tools/url-shortener',
    icon: Link2,
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
    tag: 'Quick Creation',
  },
  {
    id: 'qr',
    title: 'Dynamic QR Code Studio',
    titleVi: 'Phòng thiết kế mã QR',
    description:
      'Generate high-resolution PNG & SVG QR codes with custom foreground/background colors and error correction level control.',
    href: '/dashboard/qr',
    icon: QrCode,
    color: 'from-purple-500 to-pink-600',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
    tag: 'Design & Export',
  },
  {
    id: 'utm',
    title: 'Campaign UTM Builder',
    titleVi: 'Công cụ gắn mã UTM chiến dịch',
    description:
      'Structure Google Analytics tracking parameters (source, medium, campaign, content) with 1-click automatic shortening into your dashboard.',
    href: '/tools/utm-builder',
    icon: Target,
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    tag: 'Analytics & Tracking',
  },
]

export default function DashboardToolsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Marketing & Growth Utilities
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Marketing Tools Suite
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Free utilities to enhance your link sharing, campaign tracking, and offline branding.
          </p>
        </div>

        <Link
          href="/tools"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-xs w-fit"
        >
          <span>View Public Directory</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map(tool => {
          const Icon = tool.icon
          return (
            <div
              key={tool.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition group relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-5 rounded-bl-full pointer-events-none`}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs ${tool.iconBg}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {tool.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {tool.title}
                  </h3>
                  <span className="text-xs text-indigo-600 font-medium block mt-0.5">
                    {tool.titleVi}
                  </span>
                  <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <Link
                  href={tool.href}
                  className="inline-flex items-center justify-between w-full text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition"
                >
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Shield className="w-4 h-4" />
            <span>Full Account Integration</span>
          </div>
          <h3 className="text-lg font-bold">All tools save directly to your dashboard</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Links and QR codes created with these tools are automatically associated with your account so you can monitor real-time clicks, device analytics, and country distributions.
          </p>
        </div>

        <Link
          href="/dashboard/links"
          className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shrink-0 shadow-sm"
        >
          View My Saved Links
        </Link>
      </div>
    </div>
  )
}
