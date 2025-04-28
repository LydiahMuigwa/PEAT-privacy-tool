function detectPII(profile) {
  const piiFields = [];

  if (profile.fullName) piiFields.push("Full Name");
  if (profile.email && /@/.test(profile.email)) piiFields.push("Email Address");
  if (profile.phone && profile.phone.length >= 9) piiFields.push("Phone Number");
  if (profile.dateOfBirth) piiFields.push("Date of Birth");
  if (profile.gender) piiFields.push("Gender");
  if (profile.race || profile.ethnicity) piiFields.push("Race/Ethnicity");
  if (profile.religion) piiFields.push("Religion");
  if (profile.passportNumber) piiFields.push("Passport Number");
  if (profile.driverLicense) piiFields.push("Driver's License");
  if (profile.socialSecurityNumber) piiFields.push("Social Security Number");
  if (profile.address || profile.city || profile.country) piiFields.push("Mailing Address");
  if (profile.photo) piiFields.push("Profile Photo");
  if (profile.jobTitle || profile.company) piiFields.push("Workplace Details");
  if (profile.education) piiFields.push("Education History");
  if (profile.geo || profile.location) piiFields.push("Geolocation Data");
  if (profile.username) piiFields.push("Username");
  if (profile.nationality || profile.citizenship) piiFields.push("Nationality");

  return piiFields;
}

module.exports = { detectPII };
