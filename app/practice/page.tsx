import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PracticeClient from '@/components/PracticeClient'
import type { PracticeVersion } from '@/lib/practice-config'

export const dynamic = 'force-dynamic'

export default async function PracticePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: goalData } = await supabase
    .from('user_goals')
    .select('version')
    .eq('user_id', user.id)
    .single()

  if (!goalData?.version) redirect('/select-version')

  return <PracticeClient version={goalData.version as PracticeVersion} />
}
