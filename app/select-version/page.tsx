import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import VersionSelectClient from '@/components/VersionSelectClient'

export const dynamic = 'force-dynamic'

export default async function SelectVersion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: goalData } = await supabase
    .from('user_goals')
    .select('version')
    .eq('user_id', user.id)
    .single()

  if (!goalData || !goalData.version || goalData.version === '') {
  // 버전 선택 필요
} else {
  redirect('/dashboard')
}

  return <VersionSelectClient userId={user.id} />
}