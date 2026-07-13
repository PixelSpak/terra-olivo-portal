function buildAirtableFieldAttempts({
  requiredFields,
  statusFields,
  identityFields,
  optionalMetadataFields,
}) {
  return [
    {
      ...requiredFields,
      ...statusFields,
      ...identityFields,
      ...optionalMetadataFields,
    },
    {
      ...requiredFields,
      ...statusFields,
      ...identityFields,
    },
    {
      ...requiredFields,
      ...statusFields,
    },
    requiredFields,
  ];
}

module.exports = {
  buildAirtableFieldAttempts,
};
