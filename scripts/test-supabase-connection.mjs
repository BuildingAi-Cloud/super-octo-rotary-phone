#!/usr/bin/env node
/**
 * Test Supabase connection and marketplace_listings table.
 * Usage: node scripts/test-supabase-connection.mjs
 */

import { config } from "dotenv"
config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const TABLE = process.env.SUPABASE_MARKETPLACE_LISTINGS_TABLE || "marketplace_listings"

console.log("=== Supabase Marketplace Connection Test ===")
console.log("URL:", SUPABASE_URL || "(NOT SET)")
console.log("Key:", SUPABASE_KEY ? SUPABASE_KEY.slice(0, 12) + "..." : "(NOT SET)")
console.log("Table:", TABLE)
console.log("")

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("FAIL: Missing SUPABASE_URL or SUPABASE_KEY in .env")
  process.exit(1)
}

async function testConnection() {
  // Step 1: Check host reachability
  console.log("[1/4] Testing host reachability...")
  try {
    const pingRes = await fetch(SUPABASE_URL, { signal: AbortSignal.timeout(10000) })
    console.log("  OK - Host reachable, status:", pingRes.status)
  } catch (err) {
    console.error("  FAIL - Host unreachable:", err.message)
    return false
  }

  // Step 2: Test REST API auth
  console.log("[2/4] Testing REST API auth...")
  try {
    const authRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      signal: AbortSignal.timeout(10000),
    })
    console.log("  Status:", authRes.status)
    if (authRes.status === 200) {
      console.log("  OK - Auth successful")
    } else {
      const body = await authRes.text()
      console.error("  WARN - Unexpected status:", body.slice(0, 200))
    }
  } catch (err) {
    console.error("  FAIL - REST API error:", err.message)
    return false
  }

  // Step 3: Query marketplace_listings table
  console.log(`[3/4] Querying ${TABLE} table...`)
  try {
    const queryRes = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=*&limit=5`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      }
    )
    console.log("  Status:", queryRes.status)
    const body = await queryRes.text()

    if (queryRes.status === 200) {
      const rows = JSON.parse(body)
      console.log(`  OK - Table exists, ${rows.length} rows returned`)
      if (rows.length > 0) {
        console.log("  Columns:", Object.keys(rows[0]).join(", "))
        console.log("  Sample row:", JSON.stringify(rows[0], null, 2).slice(0, 300))
      }
    } else if (queryRes.status === 404 || body.includes("does not exist") || body.includes("relation")) {
      console.log("  TABLE NOT FOUND - Need to create it")
      console.log("  Response:", body.slice(0, 300))
      return "TABLE_MISSING"
    } else {
      console.log("  WARN - Response:", body.slice(0, 300))
      return "TABLE_MISSING"
    }
  } catch (err) {
    console.error("  FAIL - Query error:", err.message)
    return false
  }

  // Step 4: Test INSERT (dry run)
  console.log(`[4/4] Testing INSERT into ${TABLE}...`)
  try {
    const testListing = {
      id: "00000000-0000-0000-0000-000000000000",
      category: "For Sale",
      title: "__connection_test__",
      description: "Automated connection test — will be deleted",
      suite: "Test",
      posted_by_user_id: "test-user",
      posted_by_name: "Test",
      price: null,
      is_free: true,
      interests: 0,
      contact_preference: "in_app",
      status: "archived",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(testListing),
      signal: AbortSignal.timeout(10000),
    })
    console.log("  Insert status:", insertRes.status)
    const insertBody = await insertRes.text()

    if (insertRes.status === 201) {
      console.log("  OK - INSERT works!")
      const rows = JSON.parse(insertBody)
      if (rows[0]?.id) {
        // Clean up test row
        const delRes = await fetch(
          `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${rows[0].id}`,
          {
            method: "DELETE",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            signal: AbortSignal.timeout(10000),
          }
        )
        console.log("  Cleanup:", delRes.status === 204 ? "OK (test row deleted)" : `status ${delRes.status}`)
      }
    } else {
      console.log("  FAIL - INSERT response:", insertBody.slice(0, 300))
      return false
    }
  } catch (err) {
    console.error("  FAIL - Insert error:", err.message)
    return false
  }

  return true
}

const result = await testConnection()

console.log("")
if (result === true) {
  console.log("=== ALL TESTS PASSED — API is fully connected to database ===")
} else if (result === "TABLE_MISSING") {
  console.log("=== TABLE MISSING — Need to create marketplace_listings table ===")
} else {
  console.log("=== CONNECTION FAILED — Check Supabase credentials and project status ===")
}
