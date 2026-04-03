// Server-side test setup — loaded before every Node test
// Add global mocks for server dependencies here (e.g. Supabase, SendGrid)

// Polyfill fetch primitives for route-handler tests importing next/server.
if (typeof Request === 'undefined' || typeof Response === 'undefined') {
	class MockHeaders {
		private map = new Map<string, string>()

		constructor(init?: Record<string, string>) {
			if (init) {
				for (const [key, value] of Object.entries(init)) {
					this.map.set(key.toLowerCase(), value)
				}
			}
		}

		get(key: string) {
			return this.map.get(key.toLowerCase()) ?? null
		}
	}

	class MockRequest {
		method: string
		headers: MockHeaders
		private payload: unknown

		constructor(_url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
			this.method = init?.method ?? 'GET'
			this.headers = new MockHeaders(init?.headers)
			this.payload = init?.body ? JSON.parse(init.body) : undefined
		}

		async json() {
			return this.payload
		}
	}

	class MockResponse {
		status: number
		ok: boolean
		private payload: unknown

		constructor(body?: string, init?: { status?: number }) {
			this.status = init?.status ?? 200
			this.ok = this.status >= 200 && this.status < 300
			this.payload = body ? JSON.parse(body) : undefined
		}

		async json() {
			return this.payload
		}

		async text() {
			return JSON.stringify(this.payload)
		}
	}

	globalThis.Headers = MockHeaders as unknown as typeof Headers
	globalThis.Request = MockRequest as unknown as typeof Request
	globalThis.Response = MockResponse as unknown as typeof Response
}
