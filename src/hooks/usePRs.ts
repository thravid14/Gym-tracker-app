import { useMemo } from 'react'
import { useAppState } from '../state/AppState'
import { analyzePRs, type PRAnalysis } from '../lib/records'

/** Personal-record analysis over all sessions, recomputed only when sessions change. */
export function usePRs(): PRAnalysis {
  const { sessions } = useAppState()
  return useMemo(() => analyzePRs(sessions), [sessions])
}
