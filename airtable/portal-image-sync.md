# Portal Image Sync

The portal can publish approved Airtable image submissions with:

```bash
npm run sync:portal-images
```

The script reads Airtable table `New images for portal`, finds records where
`Status` is `Update`, downloads the first image in `Attachments`, writes it to
`public/images/oils`, updates `src/data/oils.json`, and marks the Airtable row
`Done`.

Use a safe preview first:

```bash
npm run sync:portal-images -- --dry-run --limit 5
```

## Airtable Fields

Keep these fields in `New images for portal`:

- `Status`: single select with `New`, `Update`, `Done`
- `Portal oil slug`: single line text, matching `src/data/oils.json`
- `Portal producer slug`: single line text
- `Olive oil name`: single line text
- `Company name`: single line text
- `Email`: email or single line text
- `Attachments`: attachment

The sync prefers `Portal oil slug`. Name/company matching is only a fallback for
older rows.

## Cloud Automation

`.github/workflows/sync-portal-images.yml` runs every 15 minutes, can be started
manually, and can be triggered by a GitHub `repository_dispatch` event named
`sync-portal-images`.

Add these GitHub Actions secrets before enabling the cloud workflow:

- `AIRTABLE_API_KEY`
- `AIRTABLE_IMAGE_SUBMISSIONS_BASE_ID`
- `AIRTABLE_IMAGE_SUBMISSIONS_TABLE_ID`

If the repository is connected to Vercel, the workflow commit will trigger the
normal production deployment.
