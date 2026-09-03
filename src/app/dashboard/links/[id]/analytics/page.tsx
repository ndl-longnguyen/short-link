import AnalyticsDashboardView from '@/components/analytics/AnalyticsDashboardView'

interface LinkAnalyticsProps {
  params: Promise<{
    id: string
  }>
}

export const metadata = {
  title: 'Link Analytics | ShortLink Dashboard',
}

export default async function SingleLinkAnalyticsPage({ params }: LinkAnalyticsProps) {
  const { id } = await params

  return (
    <AnalyticsDashboardView
      linkId={id}
      backHref="/dashboard/links"
    />
  )
}
