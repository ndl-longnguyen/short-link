import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free QR Code Generator | Tạo Mã QR Miễn Phí (PNG & SVG)',
  description:
    'Generate high-resolution, customized QR codes in PNG and SVG formats. Free online QR code studio with custom color palettes and high error correction.',
  keywords: [
    'QR Code Generator',
    'Free QR Code',
    'Generate QR Code',
    'SVG QR Code',
    'Tạo mã QR',
    'Tạo mã QR miễn phí',
    'Tạo QR code màu',
    'Tải mã QR SVG',
  ],
  alternates: {
    canonical: '/tools/qr-code-generator',
  },
  openGraph: {
    title: 'Free QR Code Generator | Tạo Mã QR Miễn Phí',
    description:
      'Generate customized QR codes in PNG and SVG formats for free with color pickers and error recovery.',
  },
}

export default function QRCodeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
