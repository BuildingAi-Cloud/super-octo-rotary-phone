// Server-side test setup — loaded before every Node test
// Add global mocks for server dependencies here (e.g. Supabase, SendGrid)
import { TextDecoder, TextEncoder } from 'node:util'
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web'

if (typeof globalThis.TextEncoder === 'undefined') {
	globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder
}

if (typeof globalThis.TextDecoder === 'undefined') {
	globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}

if (typeof globalThis.ReadableStream === 'undefined') {
	globalThis.ReadableStream = ReadableStream as typeof globalThis.ReadableStream
}

if (typeof globalThis.TransformStream === 'undefined') {
	globalThis.TransformStream = TransformStream as typeof globalThis.TransformStream
}

if (typeof globalThis.WritableStream === 'undefined') {
	globalThis.WritableStream = WritableStream as typeof globalThis.WritableStream
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetch, Headers, Request, Response } = require('next/dist/compiled/@edge-runtime/primitives/fetch')

if (typeof globalThis.fetch === 'undefined') {
	globalThis.fetch = fetch as typeof globalThis.fetch
}

if (typeof globalThis.Headers === 'undefined') {
	globalThis.Headers = Headers as typeof globalThis.Headers
}

if (typeof globalThis.Request === 'undefined') {
	globalThis.Request = Request as typeof globalThis.Request
}

if (typeof globalThis.Response === 'undefined') {
	globalThis.Response = Response as typeof globalThis.Response
}
