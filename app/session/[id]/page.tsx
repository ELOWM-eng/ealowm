import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { SESSIONS } from '@/lib/sessions'
import { EN_SESSIONS } from '@/lib/sessions-en'
import SessionClient from '@/components/SessionClient'
import { YOUTH_SESSIONS } from '@/lib/sessions-youth'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 현재 버전 확인 (먼저!)
  const { data: goalData } = await supabase
    .from('user_goals')
    .select('version')
    .eq('user_id', user.id)
    .single()

  const currentVersion = goalData?.version ?? 'adult'

  const sessionList = currentVersion === 'en' ? EN_SESSIONS : currentVersion === 'youth' ? YOUTH_SESSIONS : SESSIONS
  const session = sessionList.find(s => s.id === id)
  if (!session) notFound()

  const { data: record } = await supabase
    .from('session_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('session_id', id)
    .eq('version', currentVersion)
    .maybeSingle()

  const mapChecks = (arr: unknown[]) => arr.map((v: unknown) => {
    if (v === 'true') return true
    if (v === 'false') return false
    if (v === 'null') return null
    return v
  })

  const emptyChecks = new Array(
    session.think.inputType === 'mbti'
      ? (session.think.mbtiGroups?.length ?? 0) * 4
      : session.think.items.length
  ).fill(null)

  const initialData = record
    ? {
        think_checks: mapChecks(record.think_checks ?? emptyChecks),
        practice_texts: record.practice_texts ?? new Array(7).fill(''),
        reflect_texts: record.reflect_texts ?? new Array(session?.reflect?.qs?.length ?? 3).fill(''),
        completed: record.completed ?? false,
        version: currentVersion,
      }
    : {
        think_checks: emptyChecks,
        practice_texts: new Array(7).fill(''),
        reflect_texts: new Array(session?.reflect?.qs?.length ?? 3).fill(''),
        completed: false,
        version: currentVersion,
      }

  return (
    <SessionClient
      session={session}
      userId={user.id}
      initialData={initialData as any}
    />
  )
}