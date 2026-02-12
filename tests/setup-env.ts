import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"

function loadIfExists(filename: string) {
  const filePath = path.resolve(process.cwd(), filename)
  if (!fs.existsSync(filePath)) return
  dotenv.config({ path: filePath, override: false })
}

// Vitest doesn't automatically load Next.js env files.
// Load `.env.local` first, then `.env` as fallback.
loadIfExists(".env.local")
loadIfExists(".env")

