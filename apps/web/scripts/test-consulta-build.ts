import { buildPacienteFromParams } from "../app/dashboard/medico/pacientes/nuevo/_utils/consulta";

const params = new URLSearchParams({ cedula: "12345678", nombre: "Juan Perez", edad: "35", genero: "M" });
const p = buildPacienteFromParams(params);
if (p.cedula !== "12345678" || p.nombre_completo !== "Juan Perez" || p.edad !== 35 || p.genero !== "M") {
  console.error("Paciente mapping failed", p);
  process.exit(1);
}
const params2 = new URLSearchParams({ cedula: "", nombre: "", edad: "abc", genero: "" });
const p2 = buildPacienteFromParams(params2);
if (p2.edad !== null) {
  console.error("Edad parsing should be null");
  process.exit(1);
}
console.log("Consulta mapping tests passed");