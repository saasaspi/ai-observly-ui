// Stub for the `decompress` npm package.
// The real package is blocked by Replit's package firewall (CVE-2023-42282).
// It is only used by @sanity/cli during `sanity init` for template extraction.
// We never run `sanity init`, so this stub is safe.
module.exports = async function decompress() {
  throw new Error(
    'decompress is stubbed out. Run `sanity init` locally if you need template extraction.'
  )
}
