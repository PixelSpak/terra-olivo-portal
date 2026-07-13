# Portal Image Sync

The portal can publish approved Airtable image submissions with:

```bash
npm run sync:portal-images
```

The script reads Airtable table `New images for portal`, finds records where
`Status` is `Update`, downloads the first image in `Attachments`, writes it to
`public/images/oils`, updates `src/data/oils.json`, and marks the Airtable row
`Done`.

If `REMOVE_BG_API_KEY` is configured, the sync sends each uploaded image to the
remove.bg API first and uses the returned transparent PNG for both the portal
and Airtable's `Transparent bg` attachment field. The GitHub workflow sets
`AIRTABLE_IMAGE_BG_REMOVAL_PROVIDER=removebg`, so cloud syncs fail safely if the
secret is missing. Local runs without a key fall back to the white-edge cleanup.

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
- `Transparent bg`: attachment, populated by the sync with the processed image

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
- `REMOVE_BG_API_KEY`

If the repository is connected to Vercel, the workflow commit will trigger the
normal production deployment.
