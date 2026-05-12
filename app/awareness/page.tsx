import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AwarenessCheck from '@/components/AwarenessCheck'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ point?: string }>
}

export default async function AwarenessPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: goalData } = await supabase
    .from('user_goals')
    .select('version')
    .eq('user_id', user.id)
    .single()

  const { point } = await searchParams
  const checkPoint = point ?? 'start'
  const currentVersion = goalData?.version ?? 'adult'

  return (
    <AwarenessCheck
      userId={user.id}
      version={currentVersion}
      checkPoint={checkPoint}
    />
  )
}