// Server-side test setup — loaded before every Node test
// Add global mocks for server dependencies here (e.g. Supabase, SendGrid)
import { TextDecoder, TextEncoder } from 'node:util'
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web'

Object.assign(globalThis, {
	TextEncoder,
	TextDecoder,
	ReadableStream,
	TransformStream,
	WritableStream,
})

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetch, Headers, Request, Response } = require('next/dist/compiled/@edge-runtime/primitives/fetch')

Object.assign(globalThis, {
	fetch,
	Headers,
	Request,
	Response,
})
