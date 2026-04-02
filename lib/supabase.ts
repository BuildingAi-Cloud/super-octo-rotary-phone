import { createClient } from '@supabase/supabase-js'
import { getDeploymentMode } from '@/lib/runtime-public'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

const deploymentMode = getDeploymentMode()

export const supabase =
	deploymentMode === 'onprem' || !supabaseUrl || !supabaseAnonKey
		? null
		: createClient(supabaseUrl, supabaseAnonKey)
