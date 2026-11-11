<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend visual consistency

- Read `docs/FRONTEND_DESIGN.md` before making customer-facing UI changes.
- Reuse existing shared components and established page patterns before creating a new visual treatment.
- Do not add decorative leading dots, bullets, circles, blobs, or status-like markers to eyebrow text, badges, pills, headings, or navigation labels.
- Use bullets and dots only when they communicate semantic list structure, status, progress, or selection.
- Do not add breadcrumbs to single-level customer pages. Introduce breadcrumbs only as an approved site-wide navigation pattern applied consistently.
- Do not create a page-specific variation of a shared pattern without an explicit product requirement.
- Compare sibling customer pages before changing headers, spacing, navigation, buttons, cards, or section labels.
- Keep Feedback and Contact Us aligned through the shared `SupportPage` component.
- Prefer the restrained ROAMIGO visual language already present in shared components. Avoid ornamental elements that do not communicate information or improve usability.
