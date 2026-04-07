// Supabase mock — intercept fetch-based Supabase REST calls
// Use by setting NEXT_PUBLIC_SUPABASE_URL and key to empty in tests,
// or by mocking the supabaseRequest helper.
import { jest } from '@jest/globals'

export const mockSupabaseResponse = (data: unknown, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}

export function mockFetchForSupabase(responses: Record<string, unknown>) {
  return jest.fn((url: string) => {
    for (const [pattern, data] of Object.entries(responses)) {
      if (url.includes(pattern)) return mockSupabaseResponse(data)
    }
    return mockSupabaseResponse(null, 404)
  })
}
