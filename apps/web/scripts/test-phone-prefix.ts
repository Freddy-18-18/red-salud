import { formatVzlaPhone, validateVzlaPhone } from "../app/dashboard/medico/pacientes/nuevo/_utils/phone";

const valids = [
  { raw: "+58 4121234567", expected: "+58 412 123 4567" },
  { raw: "4121234567", expected: "+58 412 123 4567" },
  { raw: "+58 412 123 4567", expected: "+58 412 123 4567" },
];

const invalids = [
  "+58 412 12 34567",
  "+584121234567",
  "+57 412 123 4567",
  "+58 412 123 456",
  "+58 412 1234 567",
  "+58 412 12 34",
];

let passed = true;

for (const { raw, expected } of valids) {
  const formatted = formatVzlaPhone(raw);
  if (formatted !== expected) {
    console.error(`Format failed: ${raw} => ${formatted}, expected ${expected}`);
    passed = false;
  }
  const err = validateVzlaPhone(formatted);
  if (err !== null) {
    console.error(`Validation failed for valid ${formatted}`);
    passed = false;
  }
}

for (const raw of invalids) {
  const err = validateVzlaPhone(raw);
  if (err === null) {
    console.error(`Validation passed incorrectly for invalid ${raw}`);
    passed = false;
  }
}

if (passed) {
  console.log("Phone validation tests passed");
  process.exit(0);
} else {
  console.error("Phone validation tests failed");
  process.exit(1);
}