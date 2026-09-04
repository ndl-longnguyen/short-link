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

import { useTranslation } from '@/lib/i18n/context'

const tools = [
  {
    id: 'shortener',
    title: 'Advanced URL Shortener',
    titleVi: 'Rút gọn link nâng cao',
    description:
      'Create custom slug links with password protection, click expiration limits, and HTTP 301/302/307 redirect status choices.',
    descriptionVi:
      'Tạo liên kết tùy chỉnh đuôi với mật khẩu bảo vệ, giới hạn số lượt click và tùy chọn mã chuyển hướng HTTP 301/302/307.',
    href: '/tools/url-shortener',
    icon: Link2,
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
    tag: 'Quick Creation',
    tagVi: 'Tạo nhanh',
  },
  {
    id: 'qr',
    title: 'Dynamic QR Code Studio',
    titleVi: 'Phòng thiết kế mã QR',
    description:
      'Generate high-resolution PNG & SVG QR codes with custom foreground/background colors and error correction level control.',
    descriptionVi:
      'Tạo mã QR độ nét cao định dạng PNG & SVG với màu sắc tùy biến thương hiệu và cấu hình độ sửa lỗi.',
    href: '/dashboard/qr',
    icon: QrCode,
    color: 'from-purple-500 to-pink-600',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
    tag: 'Design & Export',
    tagVi: 'Thiết kế & Xuất',
  },
  {
    id: 'utm',
    title: 'Campaign UTM Builder',
    titleVi: 'Công cụ gắn mã UTM chiến dịch',
    description:
      'Structure Google Analytics tracking parameters (source, medium, campaign, content) with 1-click automatic shortening into your dashboard.',
    descriptionVi:
      'Cấu trúc tham số Google Analytics (source, medium, campaign, content) và tự động rút gọn lưu ngay vào bảng điều khiển.',
    href: '/tools/utm-builder',
    icon: Target,
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    tag: 'Analytics & Tracking',
    tagVi: 'Đo lường & Theo dõi',
  },
]

export default function DashboardToolsPage() {
  const { isVi } = useTranslation()

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            {isVi ? 'Tiện ích Marketing & Tăng trưởng' : 'Marketing & Growth Utilities'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isVi ? 'Bộ công cụ Marketing' : 'Marketing Tools Suite'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {isVi
              ? 'Các tiện ích miễn phí giúp tối ưu hóa chia sẻ liên kết, theo dõi chiến dịch và nhận diện thương hiệu.'
              : 'Free utilities to enhance your link sharing, campaign tracking, and offline branding.'}
          </p>
        </div>

        <Link
          href="/tools"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-xs w-fit"
        >
          <span>{isVi ? 'Xem danh mục công khai' : 'View Public Directory'}</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map(tool => {
          const Icon = tool.icon
          const title = isVi ? tool.titleVi : tool.title
          const description = isVi ? tool.descriptionVi : tool.description
          const tag = isVi ? tool.tagVi : tool.tag

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
                    {tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <Link
                  href={tool.href}
                  className="inline-flex items-center justify-between w-full text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition"
                >
                  <span>{isVi ? 'Mở công cụ' : 'Open Tool'}</span>
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
            <span>{isVi ? 'Tích hợp tài khoản toàn diện' : 'Full Account Integration'}</span>
          </div>
          <h3 className="text-lg font-bold">
            {isVi ? 'Mọi công cụ đều lưu trực tiếp vào bảng điều khiển' : 'All tools save directly to your dashboard'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            {isVi
              ? 'Liên kết và mã QR tạo từ các công cụ này đều tự động liên kết với tài khoản của bạn để dễ dàng theo dõi số lượt nhấp chuột, thiết bị và phân bố quốc gia.'
              : 'Links and QR codes created with these tools are automatically associated with your account so you can monitor real-time clicks, device analytics, and country distributions.'}
          </p>
        </div>

        <Link
          href="/dashboard/links"
          className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shrink-0 shadow-sm"
        >
          {isVi ? 'Xem liên kết đã lưu' : 'View My Saved Links'}
        </Link>
      </div>
    </div>
  )
}
