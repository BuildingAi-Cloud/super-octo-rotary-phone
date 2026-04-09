const fs = require("fs");
const path = require("path");

// Load .env manually
const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  envVars[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TABLE = envVars.SUPABASE_MARKETPLACE_LISTINGS_TABLE || "marketplace_listings";

console.log("All Supabase env vars found:");
for (const [k, v] of Object.entries(envVars)) {
  if (k.includes("SUPABASE")) console.log("  " + k + "=" + (v || "").slice(0, 20) + "...");
}

console.log("=== Supabase Marketplace Connection Test ===");
console.log("URL:", SUPABASE_URL || "(NOT SET)");
console.log("Key:", SUPABASE_KEY ? SUPABASE_KEY.slice(0, 15) + "..." : "(NOT SET)");
console.log("Table:", TABLE);
console.log("");

async function run() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log("FAIL: Missing credentials");
    process.exit(1);
  }

  // Step 1: Host reachability
  console.log("[1/3] Testing host reachability...");
  try {
    const r = await fetch(SUPABASE_URL, { signal: AbortSignal.timeout(10000) });
    console.log("  Host status:", r.status);
  } catch (e) {
    console.log("  FAIL - Unreachable:", e.message);
    process.exit(1);
  }

  // Step 2: Query table
  console.log("[2/3] Querying " + TABLE + " table...");
  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/" + TABLE + "?select=*&limit=3", {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
      },
    });
    console.log("  Query status:", r.status);
    const body = await r.text();
    if (r.status === 200) {
      const rows = JSON.parse(body);
      console.log("  Rows returned:", rows.length);
      if (rows.length > 0) console.log("  Columns:", Object.keys(rows[0]).join(", "));
    } else {
      console.log("  Response:", body.slice(0, 400));
    }
  } catch (e) {
    console.log("  FAIL:", e.message);
    process.exit(1);
  }

  // Step 3: Test INSERT + DELETE
  console.log("[3/3] Testing INSERT...");
  try {
    const testRow = {
      id: crypto.randomUUID(),
      category: "For Sale",
      title: "__connection_test__",
      description: "Automated test",
      suite: "Test",
      posted_by_user_id: "test",
      posted_by_name: "Test",
      price: null,
      is_free: true,
      interests: 0,
      contact_preference: "in_app",
      status: "archived",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const r = await fetch(SUPABASE_URL + "/rest/v1/" + TABLE, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(testRow),
    });
    console.log("  Insert status:", r.status);
    const body = await r.text();
    if (r.status === 201) {
      console.log("  INSERT OK!");
      const inserted = JSON.parse(body);
      // Cleanup
      const cleanupId = inserted[0]?.id || testRow.id;
      const d = await fetch(
        SUPABASE_URL + "/rest/v1/" + TABLE + "?id=eq." + cleanupId,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: "Bearer " + SUPABASE_KEY,
          },
        }
      );
      console.log("  Cleanup:", d.status === 204 ? "OK" : "status " + d.status);
    } else {
      console.log("  Response:", body.slice(0, 400));
    }
  } catch (e) {
    console.log("  FAIL:", e.message);
  }

  console.log("");
  console.log("=== DONE ===");
}

run();
