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

  // 첫 번째 결과 불러오기 (end일 때만)
  let firstResult = null
  if (checkPoint === 'end') {
    const { data } = await supabase
      .from('awareness_check')
      .select('scores, created_at')
      .eq('user_id', user.id)
      .eq('version', currentVersion)
      .eq('check_point', 'start')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    firstResult = data
  }

  return (
    <AwarenessCheck
      userId={user.id}
      version={currentVersion}
      checkPoint={checkPoint}
      firstResult={firstResult}
    />
  )
}