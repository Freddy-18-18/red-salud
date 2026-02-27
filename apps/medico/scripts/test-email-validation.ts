import { validateEmailFormat } from "../app/dashboard/medico/pacientes/nuevo/_utils/validation";

const valids = [
  "user@example.com",
  "john.doe@sub.domain.org",
  "u+tag@domain.co",
];
const invalids = [
  "plainaddress",
  "user@",
  "@domain.com",
  "user@domain",
  "user@domain,com",
];

let passed = true;
for (const v of valids) {
  const res = validateEmailFormat(v);
  if (res !== null) {
    console.error(`Expected valid: ${v}`);
    passed = false;
  }
}
for (const v of invalids) {
  const res = validateEmailFormat(v);
  if (res === null) {
    console.error(`Expected invalid: ${v}`);
    passed = false;
  }
}

if (passed) {
  console.log("Email validation tests passed");
  process.exit(0);
} else {
  console.error("Email validation tests failed");
  process.exit(1);
}