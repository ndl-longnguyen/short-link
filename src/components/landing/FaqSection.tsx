'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

interface FaqItem {
  question: string
  questionVi: string
  answer: string
  answerVi: string
}

const FAQS: FaqItem[] = [
  {
    question: 'What is a URL Shortener and why should I use it?',
    questionVi: 'Rút gọn link là gì và tại sao nên sử dụng?',
    answer:
      'A URL shortener transforms long, clunky URLs with complex UTM tracking parameters into short, elegant links (e.g. ndllink.vercel.app/sale). It makes your links cleaner for social sharing, print materials, SMS campaigns, and provides in-depth click analytics.',
    answerVi:
      'Rút gọn link là công cụ biến đổi các đường dẫn URL dài dòng, phức tạp thành các liên kết ngắn gọn, đẹp mắt và dễ nhớ. Giúp tăng tỷ lệ nhấp chuột (CTR), thuận tiện chia sẻ trên mạng xã hội, tin nhắn SMS, tài liệu in ấn và theo dõi chi tiết hiệu quả chiến dịch.',
  },
  {
    question: 'Are short links permanent and 100% free?',
    questionVi: 'Link rút gọn có miễn phí và hoạt động vĩnh viễn không?',
    answer:
      'Yes! ShortLink provides free, permanent link shortening with unlimited redirects. You can optionally configure an expiration date or click limit quota if you are running a limited-time marketing promotion.',
    answerVi:
      'Hoàn toàn có! ShortLink cung cấp dịch vụ rút gọn liên kết miễn phí vĩnh viễn với số lượt chuyển hướng không giới hạn. Bạn cũng có thể tùy chọn cài đặt ngày hết hạn hoặc giới hạn số lượt nhấp chuột nếu chạy các chương trình khuyến mãi ngắn hạn.',
  },
  {
    question: 'How do dynamic QR codes work with short links?',
    questionVi: 'Mã QR động hoạt động như thế nào với link rút gọn?',
    answer:
      'Every short link you generate automatically creates a dynamic QR code. Because the QR code encodes your short link rather than the raw destination, you can update your destination URL anytime from your dashboard without having to re-print your promotional brochures, menus, or packaging.',
    answerVi:
      'Mỗi liên kết rút gọn đều được tự động tạo một mã QR động đi kèm. Vì mã QR mã hóa đường link rút gọn nên bạn có thể thoải mái thay đổi link đích bất cứ lúc nào trong Dashboard mà không cần phải in lại ấn phẩm, bao bì hay menu.',
  },
  {
    question: 'Can I protect sensitive links with a password?',
    questionVi: 'Tôi có thể cài đặt mật khẩu bảo vệ link không?',
    answer:
      'Yes. You can enable password protection on any link during creation or anytime later. Visitors will be greeted with a modern passcode screen before being redirected to the final destination.',
    answerVi:
      'Có. Bạn có thể bật tính năng bảo vệ bằng mật khẩu cho bất kỳ link nào. Người truy cập sẽ cần nhập đúng mật khẩu tại màn hình xác thực bảo mật trước khi được chuyển hướng đến trang đích.',
  },
  {
    question: 'How does ShortLink protect against malware and phishing?',
    questionVi: 'Nền tảng bảo vệ người dùng khỏi liên kết độc hại như thế nào?',
    answer:
      'We implement strict Server-Side Request Forgery (SSRF) validation, automatically block private IP addresses (127.0.0.1, 10.x, 192.168.x), filter dangerous schemes (javascript:, data:), and maintain a community abuse reporting system to promptly review flagged links.',
    answerVi:
      'Hệ thống tích hợp các bộ lọc bảo mật tự động ngăn chặn tấn công SSRF, chặn các dải IP nội bộ, loại bỏ các giao thức nguy hiểm và cung cấp trang báo cáo vi phạm cộng đồng để xử lý kịp thời các liên kết spam, giả mạo hoặc lừa đảo.',
  },
  {
    question: 'What analytics metrics can I track on my links?',
    questionVi: 'Tôi có thể theo dõi những số liệu thống kê nào?',
    answer:
      'You get access to total clicks, daily clicks, 7-day and 30-day timeline charts, top referrer domains, device types (Desktop, Mobile, Tablet), browser distributions, operating systems, and top visitor countries — all collected without storing sensitive personal data.',
    answerVi:
      'Bạn có thể xem tổng số lượt click, biểu đồ tăng trưởng theo ngày/tuần/tháng, nguồn giới thiệu (Facebook, Google, TikTok...), loại thiết bị (Desktop, Điện thoại, Tablet), hệ điều hành và quốc gia truy cập mà vẫn đảm bảo tuyệt đối quyền riêng tư.',
  },
]

export default function FaqSection() {
  const { t, isVi } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto w-full" id="faq">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-xs">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.faqSection.badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.faqSection.title}
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {t.faqSection.subtitle}
        </p>
      </div>

      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx
          const question = isVi ? faq.questionVi : faq.question
          const answer = isVi ? faq.answerVi : faq.answer

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold text-slate-900 block">
                  {question}
                </span>
                <div
                  className={`p-1.5 rounded-xl bg-slate-100 text-slate-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 bg-slate-900 text-white' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                  <p>{answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
