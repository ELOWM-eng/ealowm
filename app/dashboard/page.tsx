import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { SESSIONS, SESSIONS_BY_WEEK } from '@/lib/sessions'
import { EN_SESSIONS, EN_SESSIONS_BY_WEEK } from '@/lib/sessions-en'
import { YOUTH_SESSIONS, YOUTH_SESSIONS_BY_WEEK } from '@/lib/sessions-youth'
import DashboardClient from '@/components/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: goalData } = await supabase
    .from('user_goals')
    .select('addiction_goal, version')
    .eq('user_id', user.id)
    .single()

  if (!goalData?.version) redirect('/select-version')

  const currentVersion = goalData?.version ?? 'adult'

  const { data: records } = await supabase
    .from('session_records')
    .select('session_id, completed, updated_at')
    .eq('user_id', user.id)
    .eq('version', currentVersion)

  const sessionList = currentVersion === 'en' ? EN_SESSIONS : currentVersion === 'youth' ? YOUTH_SESSIONS : SESSIONS
  const sessionsByWeek = currentVersion === 'en' ? EN_SESSIONS_BY_WEEK : currentVersion === 'youth' ? YOUTH_SESSIONS_BY_WEEK : SESSIONS_BY_WEEK

  const completedIds = new Set((records || []).filter(r => r.completed).map(r => r.session_id))
  const totalCompleted = completedIds.size
  const totalSessions = sessionList.length

  return (
    <DashboardClient
      userEmail={user.email ?? ''}
      completedIds={Array.from(completedIds)}
      totalCompleted={totalCompleted}
      totalSessions={totalSessions}
      sessionsByWeek={sessionsByWeek}
      userId={user.id}
      initialGoal={goalData?.addiction_goal ?? ''}
      version={currentVersion}
    />
  )
}