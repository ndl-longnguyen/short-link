import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
  className?: string
  textClassName?: string
}

export default function Logo({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
  textClassName = '',
}: LogoProps) {
  const dimensions = {
    xs: { px: 24, box: 'w-6 h-6', text: 'text-sm' },
    sm: { px: 32, box: 'w-8 h-8', text: 'text-base' },
    md: { px: 40, box: 'w-10 h-10', text: 'text-lg' },
    lg: { px: 48, box: 'w-12 h-12', text: 'text-xl' },
  }[size]

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${dimensions.box} relative rounded-xl overflow-hidden shadow-sm shadow-amber-900/10 border border-amber-500/20 bg-black flex items-center justify-center shrink-0`}
      >
        <Image
          src="/logo.png"
          alt="ShortLink Logo"
          width={dimensions.px}
          height={dimensions.px}
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
          priority
        />
      </div>
      {showText && (
        <span
          className={`font-bold tracking-tight text-slate-900 ${dimensions.text} ${textClassName}`}
        >
          Short<span className="text-amber-600">Link</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group cursor-pointer">
        {content}
      </Link>
    )
  }

  return content
}
