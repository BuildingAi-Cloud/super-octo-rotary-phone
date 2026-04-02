export type CameraStatus = "online" | "offline" | "recording"
export type CameraProvider = string
export type CameraCoverageType = "building" | "floor" | "unit" | "access_point" | "amenity"
export type CameraProtocol = "rtsp" | "rtsps" | "onvif" | "hls" | "webrtc" | "srt" | "proprietary"
export type CameraAuthMode = "none" | "api_key" | "oauth2" | "basic" | "mutual_tls" | "signed_url"
export type TransportEncryption = "tls" | "dtls" | "srt" | "none"

export interface CameraFeedRecord {
  id: string
  name: string
  buildingId: string
  buildingName: string
  provider: CameraProvider
  providerCameraId: string
  location: string
  zone: string
  floor?: string
  unit?: string
  accessPoint?: string
  coverageType: CameraCoverageType
  status: CameraStatus
  lastMotion: string | null
  protocol: CameraProtocol
  authMode: CameraAuthMode
  requiresAuth: boolean
  transportEncryption: TransportEncryption
  atRestEncryption: boolean
  credentialsRef?: string
  streamUrl: string
  playbackUrl?: string
  linkedIntegrationName: string
  complianceTags: string[]
}

export interface CameraProviderTemplate {
  provider: string
  protocols: CameraProtocol[]
  supportedAuth: CameraAuthMode[]
  defaultTransportEncryption: Exclude<TransportEncryption, "none">
  notes: string
}

const CAMERA_FEEDS_KEY = "buildsync_camera_feeds"

const PROVIDER_TEMPLATES: CameraProviderTemplate[] = [
  {
    provider: "Verkada",
    protocols: ["proprietary", "hls"],
    supportedAuth: ["oauth2", "api_key", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "Cloud-native security cameras with signed playback links.",
  },
  {
    provider: "Axis",
    protocols: ["onvif", "rtsp", "rtsps", "hls"],
    supportedAuth: ["basic", "oauth2", "mutual_tls", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "Enterprise ONVIF and RTSP/RTSPS compatible cameras.",
  },
  {
    provider: "Hikvision",
    protocols: ["onvif", "rtsp", "rtsps"],
    supportedAuth: ["basic", "api_key", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "NVR and IP camera fleets; prefer RTSPS for encrypted transport.",
  },
  {
    provider: "Dahua",
    protocols: ["onvif", "rtsp", "rtsps"],
    supportedAuth: ["basic", "api_key", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "Common in mixed commercial deployments.",
  },
  {
    provider: "Hanwha Vision",
    protocols: ["onvif", "rtsp", "rtsps", "hls"],
    supportedAuth: ["basic", "oauth2", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "Supports secure stream profiles and enterprise integrations.",
  },
  {
    provider: "Uniview",
    protocols: ["onvif", "rtsp", "rtsps"],
    supportedAuth: ["basic", "api_key", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "ONVIF-enabled camera ecosystems.",
  },
  {
    provider: "Milestone XProtect",
    protocols: ["proprietary", "hls", "webrtc"],
    supportedAuth: ["oauth2", "signed_url", "api_key"],
    defaultTransportEncryption: "tls",
    notes: "VMS aggregation for multi-vendor sites.",
  },
  {
    provider: "Genetec Security Center",
    protocols: ["proprietary", "hls", "webrtc"],
    supportedAuth: ["oauth2", "signed_url", "mutual_tls"],
    defaultTransportEncryption: "tls",
    notes: "Unified access/video platform with strict security controls.",
  },
  {
    provider: "Avigilon",
    protocols: ["proprietary", "rtsp", "rtsps"],
    supportedAuth: ["oauth2", "api_key", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "Commercial surveillance deployments with VMS support.",
  },
  {
    provider: "Brivo Access",
    protocols: ["proprietary", "hls"],
    supportedAuth: ["api_key", "oauth2", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "Access-control linked video endpoints.",
  },
  {
    provider: "Salto KS",
    protocols: ["proprietary", "hls"],
    supportedAuth: ["api_key", "oauth2", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "Smart lock ecosystem with video integrations.",
  },
  {
    provider: "Custom",
    protocols: ["rtsp", "rtsps", "onvif", "hls", "webrtc", "srt", "proprietary"],
    supportedAuth: ["none", "api_key", "oauth2", "basic", "mutual_tls", "signed_url"],
    defaultTransportEncryption: "tls",
    notes: "Use this for any provider not listed; enforce secure protocol + auth.",
  },
]

const DEFAULT_CAMERA_FEEDS: CameraFeedRecord[] = [
  {
    id: "CAM-01",
    name: "Main Lobby",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Verkada",
    providerCameraId: "verkada-lobby-01",
    location: "Ground Floor",
    zone: "Lobby",
    accessPoint: "Main Entrance",
    coverageType: "access_point",
    status: "online",
    lastMotion: "2025-01-14 11:58",
    protocol: "hls",
    authMode: "signed_url",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/verkada/lobby-01",
    streamUrl: "https://demo.buildsync.local/streams/parkview/lobby",
    playbackUrl: "https://demo.buildsync.local/playback/parkview/lobby",
    linkedIntegrationName: "Verkada Cloud API",
    complianceTags: ["AES-256-at-rest", "TLS1.3", "SOC2"],
  },
  {
    id: "CAM-02",
    name: "Garage Entrance",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Brivo Access",
    providerCameraId: "brivo-garage-02",
    location: "B1 Level",
    zone: "Garage",
    accessPoint: "Garage Gate",
    coverageType: "access_point",
    status: "recording",
    lastMotion: "2025-01-14 11:55",
    protocol: "hls",
    authMode: "api_key",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/brivo/garage-02",
    streamUrl: "https://demo.buildsync.local/streams/parkview/garage",
    playbackUrl: "https://demo.buildsync.local/playback/parkview/garage",
    linkedIntegrationName: "Brivo Garage Access",
    complianceTags: ["AES-256-at-rest", "TLS1.2+"],
  },
  {
    id: "CAM-03",
    name: "Elevator A",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Verkada",
    providerCameraId: "verkada-elevator-a",
    location: "Interior",
    zone: "Vertical Transit",
    floor: "All",
    coverageType: "floor",
    status: "online",
    lastMotion: "2025-01-14 11:50",
    protocol: "hls",
    authMode: "signed_url",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/verkada/elevator-a",
    streamUrl: "https://demo.buildsync.local/streams/parkview/elevator-a",
    linkedIntegrationName: "Verkada Cloud API",
    complianceTags: ["AES-256-at-rest", "TLS1.3"],
  },
  {
    id: "CAM-04",
    name: "Elevator B",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Verkada",
    providerCameraId: "verkada-elevator-b",
    location: "Interior",
    zone: "Vertical Transit",
    floor: "All",
    coverageType: "floor",
    status: "offline",
    lastMotion: "2025-01-14 09:00",
    protocol: "hls",
    authMode: "signed_url",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/verkada/elevator-b",
    streamUrl: "https://demo.buildsync.local/streams/parkview/elevator-b",
    linkedIntegrationName: "Verkada Cloud API",
    complianceTags: ["AES-256-at-rest", "TLS1.3"],
  },
  {
    id: "CAM-05",
    name: "Pool Area",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Verkada",
    providerCameraId: "verkada-pool-05",
    location: "Level 3",
    zone: "Amenities",
    coverageType: "amenity",
    status: "online",
    lastMotion: "2025-01-14 10:30",
    protocol: "hls",
    authMode: "signed_url",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/verkada/pool-05",
    streamUrl: "https://demo.buildsync.local/streams/parkview/pool",
    linkedIntegrationName: "Verkada Cloud API",
    complianceTags: ["AES-256-at-rest", "TLS1.3"],
  },
  {
    id: "CAM-06",
    name: "Mailroom",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Salto KS",
    providerCameraId: "salto-mailroom-06",
    location: "Ground Floor",
    zone: "Operations",
    accessPoint: "Mailroom",
    coverageType: "access_point",
    status: "recording",
    lastMotion: "2025-01-14 11:45",
    protocol: "hls",
    authMode: "api_key",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/salto/mailroom-06",
    streamUrl: "https://demo.buildsync.local/streams/parkview/mailroom",
    linkedIntegrationName: "Salto Security Layer",
    complianceTags: ["AES-256-at-rest", "TLS1.2+"],
  },
  {
    id: "CAM-07",
    name: "Unit 807 Hallway",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Verkada",
    providerCameraId: "verkada-u807-hall",
    location: "Level 8",
    zone: "Residential Corridor",
    floor: "8",
    unit: "Unit 807",
    coverageType: "unit",
    status: "online",
    lastMotion: "2025-01-14 09:15",
    protocol: "hls",
    authMode: "signed_url",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/verkada/u807-hall",
    streamUrl: "https://demo.buildsync.local/streams/parkview/unit-807",
    linkedIntegrationName: "Verkada Cloud API",
    complianceTags: ["AES-256-at-rest", "TLS1.3"],
  },
  {
    id: "CAM-08",
    name: "Service Entrance",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Brivo Access",
    providerCameraId: "brivo-service-08",
    location: "Ground Floor",
    zone: "Operations",
    accessPoint: "Service Entrance",
    coverageType: "access_point",
    status: "recording",
    lastMotion: "2025-01-14 11:52",
    protocol: "hls",
    authMode: "api_key",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/brivo/service-08",
    streamUrl: "https://demo.buildsync.local/streams/parkview/service-entrance",
    linkedIntegrationName: "Brivo Garage Access",
    complianceTags: ["AES-256-at-rest", "TLS1.2+"],
  },
  {
    id: "CAM-09",
    name: "Bike Storage",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Unmanaged",
    providerCameraId: "local-bike-09",
    location: "B2 Level",
    zone: "Storage",
    coverageType: "floor",
    status: "online",
    lastMotion: "2025-01-14 08:00",
    protocol: "rtsp",
    authMode: "none",
    requiresAuth: false,
    transportEncryption: "none",
    atRestEncryption: false,
    streamUrl: "https://demo.buildsync.local/streams/parkview/bike-storage",
    linkedIntegrationName: "Local NVR",
    complianceTags: ["legacy"],
  },
  {
    id: "CAM-10",
    name: "Commercial Suite 2205 Entry",
    buildingId: "parkview-tower",
    buildingName: "Parkview Tower",
    provider: "Verkada",
    providerCameraId: "verkada-suite-2205",
    location: "Level 22",
    zone: "Commercial",
    floor: "22",
    unit: "Unit 2205",
    accessPoint: "Suite 2205 Entry",
    coverageType: "unit",
    status: "online",
    lastMotion: "2025-01-14 11:40",
    protocol: "hls",
    authMode: "signed_url",
    requiresAuth: true,
    transportEncryption: "tls",
    atRestEncryption: true,
    credentialsRef: "vault://camera/verkada/u2205-entry",
    streamUrl: "https://demo.buildsync.local/streams/parkview/unit-2205",
    playbackUrl: "https://demo.buildsync.local/playback/parkview/unit-2205",
    linkedIntegrationName: "Verkada Cloud API",
    complianceTags: ["AES-256-at-rest", "TLS1.3", "SOC2"],
  },
]

function cloneDefaults(): CameraFeedRecord[] {
  return DEFAULT_CAMERA_FEEDS.map((feed) => ({ ...feed }))
}

function canUseStorage(): boolean {
  return typeof window !== "undefined"
}

function readCameraFeeds(): CameraFeedRecord[] {
  if (!canUseStorage()) return cloneDefaults()

  const saved = localStorage.getItem(CAMERA_FEEDS_KEY)
  if (!saved) {
    const seeded = cloneDefaults()
    localStorage.setItem(CAMERA_FEEDS_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    const parsed = JSON.parse(saved) as CameraFeedRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = cloneDefaults()
      localStorage.setItem(CAMERA_FEEDS_KEY, JSON.stringify(seeded))
      return seeded
    }
    return parsed
  } catch {
    const seeded = cloneDefaults()
    localStorage.setItem(CAMERA_FEEDS_KEY, JSON.stringify(seeded))
    return seeded
  }
}

export function listCameraFeeds(filters?: {
  buildingId?: string
  provider?: CameraProvider | "all"
  status?: CameraStatus | "all"
  secureOnly?: boolean
  search?: string
}): CameraFeedRecord[] {
  const feeds = readCameraFeeds()

  return feeds.filter((feed) => {
    if (filters?.buildingId && feed.buildingId !== filters.buildingId) return false
    if (filters?.provider && filters.provider !== "all" && feed.provider !== filters.provider) return false
    if (filters?.status && filters.status !== "all" && feed.status !== filters.status) return false
    if (filters?.secureOnly && !isCameraFeedSecure(feed)) return false

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      const haystack = [feed.name, feed.location, feed.zone, feed.unit, feed.accessPoint, feed.providerCameraId, feed.linkedIntegrationName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    return true
  })
}

export function listCameraProviders(): string[] {
  return [...new Set(readCameraFeeds().map((feed) => feed.provider))].sort((a, b) => a.localeCompare(b))
}

export function listCameraProviderTemplates(): CameraProviderTemplate[] {
  return PROVIDER_TEMPLATES.map((template) => ({ ...template, protocols: [...template.protocols], supportedAuth: [...template.supportedAuth] }))
}

export function isSecureStreamUrl(url: string): boolean {
  return /^(https:\/\/|wss:\/\/|rtsps:\/\/|srt:\/\/)/i.test(url)
}

export function isCameraFeedSecure(feed: CameraFeedRecord): boolean {
  const hasEncryptedTransport = feed.transportEncryption !== "none" && isSecureStreamUrl(feed.streamUrl)
  const hasAuth = !feed.requiresAuth || feed.authMode !== "none"
  return hasEncryptedTransport && hasAuth && feed.atRestEncryption
}

export function getCameraSecurityIssues(feed: CameraFeedRecord): string[] {
  const issues: string[] = []
  if (!isSecureStreamUrl(feed.streamUrl)) issues.push("Stream URL is not using encrypted transport.")
  if (feed.transportEncryption === "none") issues.push("Transport encryption is disabled.")
  if (feed.requiresAuth && feed.authMode === "none") issues.push("Authentication is required but not configured.")
  if (!feed.atRestEncryption) issues.push("Recordings are not marked encrypted at rest.")
  if (feed.protocol === "rtsp") issues.push("Raw RTSP is configured; prefer RTSPS/HLS/WebRTC for secure transport.")
  return issues
}

export function getSafeStreamEndpoint(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return "hidden"
  }
}

export function getMaskedCredentialRef(reference?: string): string {
  if (!reference) return "Not configured"
  const visibleSuffix = reference.slice(-8)
  return `***${visibleSuffix}`
}