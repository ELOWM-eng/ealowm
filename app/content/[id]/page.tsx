import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ContentClient from '@/components/ContentClient'
import { CONTENT_ADULT, CONTENT_YOUTH } from '@/lib/content-config'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContentPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: goalData } = await supabase
    .from('user_goals')
    .select('version')
    .eq('user_id', user.id)
    .single()

  const version = goalData?.version ?? 'adult'
  if (version === 'en') redirect('/dashboard')

  const { id } = await params
  const config = version === 'youth' ? CONTENT_YOUTH[id] : CONTENT_ADULT[id]
  if (!config) redirect('/dashboard')

  return (
    <ContentClient
      sessionId={id}
      version={version}
      config={config}
    />
  )
}