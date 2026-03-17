"use client";

import { useEffect, useState, useRef } from "react";

const locations = [
  { city: "San Francisco", region: "US West", latency: "12ms" },
  { city: "New York", region: "US East", latency: "18ms" },
  { city: "London", region: "Europe", latency: "24ms" },
  { city: "Tokyo", region: "Asia Pacific", latency: "32ms" },
  { city: "Sydney", region: "Oceania", latency: "45ms" },
  { city: "Sao Paulo", region: "South America", latency: "38ms" },
];

// Community-wide intelligence section archived. No longer rendered in main site.
// See components/ui-archive/community-intelligence-section.tsx for future use.
