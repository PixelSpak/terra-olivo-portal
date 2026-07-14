# Portal Image Sync

The portal can publish approved Airtable image submissions with:

```bash
npm run sync:portal-images
```

The script reads Airtable table `New images for portal` and uses a two-step
review flow:

- `Status = Update`: downloads the first image in `Attachments`, removes the
  background, uploads the processed PNG to `Transparent bg`, and changes the row
  to `Check`. It does not update the portal yet.
- `Status = Approved`: downloads the reviewed image from `Transparent bg`,
  writes it to `public/images/oils`, updates `src/data/oils.json`, and marks the
  row `Done`.

The GitHub workflow uses local `rembg` with the `birefnet-general` model, so the
background removal does not need a paid remove.bg API key. Local runs without
`AIRTABLE_IMAGE_BG_REMOVAL_PROVIDER=rembg` still use the lightweight white-edge
cleanup fallback.

Use a safe preview first:

```bash
npm run sync:portal-images -- --dry-run --limit 5
```

You can also run one phase at a time:

```bash
npm run sync:portal-images -- --mode approved
npm run sync:portal-images -- --mode update
```

## Airtable Fields

Keep these fields in `New images for portal`:

- `Status`: single select with `New`, `Update`, `Check`, `Approved`, `Done`
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
`sync-portal-images`. The workflow publishes `Approved` rows and commits portal
changes first, then prepares `Update` rows for review. That keeps slow
background-removal work from delaying already-approved website updates.

Add these GitHub Actions secrets before enabling the cloud workflow:

- `AIRTABLE_API_KEY`
- `AIRTABLE_IMAGE_SUBMISSIONS_BASE_ID`
- `AIRTABLE_IMAGE_SUBMISSIONS_TABLE_ID`

If the repository is connected to Vercel, the workflow commit will trigger the
normal production deployment.

Optional environment overrides:

- `AIRTABLE_IMAGE_BG_REMOVAL_PROVIDER`: `rembg`, `local`, or `removebg`
- `REMBG_MODEL`: defaults to `birefnet-general`
- `AIRTABLE_IMAGE_SUBMISSIONS_REVIEW_STATUS`: defaults to `Check`
- `AIRTABLE_IMAGE_SUBMISSIONS_APPROVED_STATUS`: defaults to `Approved`
