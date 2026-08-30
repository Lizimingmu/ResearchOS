# ResearchOS seed data

These JSON files are generated from the typed sources in `src/data` with `npm run seed:export`.
They are provided for inspection and downstream migration; the TypeScript modules remain the runtime source of truth.

Every instructional item records `contentOrigin` and `verificationStatus`. AI-generated material must remain
`verificationStatus: "pending"` until a human review changes that state. No copyrighted article full text is bundled.
