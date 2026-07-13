const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildAirtableFieldAttempts,
} = require("../src/lib/bottleImageSubmissionFields.js");

test("keeps portal slug fields when optional Airtable metadata is unavailable", () => {
  const attempts = buildAirtableFieldAttempts({
    requiredFields: {
      "Olive oil name": "Knolive Epicure",
      Email: "producer@example.com",
    },
    statusFields: {
      Status: "New",
    },
    identityFields: {
      "Portal oil slug": "knolive-epicure",
      "Portal producer slug": "knolive-oils-sl",
    },
    optionalMetadataFields: {
      "Source page": "/winners/knolive-epicure",
    },
  });

  assert.deepEqual(attempts[1], {
    "Olive oil name": "Knolive Epicure",
    Email: "producer@example.com",
    Status: "New",
    "Portal oil slug": "knolive-epicure",
    "Portal producer slug": "knolive-oils-sl",
  });
});
