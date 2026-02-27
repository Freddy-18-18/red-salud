"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export default function TerminosPage() {
  const currentDate = new Date().toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header Section */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
          >
            Términos y Condiciones de Uso
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Este documento constituye un contrato legal vinculante bajo las leyes de la República Bolivariana de Venezuela. Su uso de la plataforma Red-Salud implica la aceptación incondicional de todas las cláusulas aquí descritas.
          </motion.p>
          <p className="mt-8 text-sm text-slate-400 font-mono">
            Vigencia a partir de: {currentDate} | Caracas, Venezuela
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            className="prose prose-slate prose-lg max-w-none text-justify"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {/* Warning Box */}
            <div className="bg-red-50 border-l-8 border-red-600 p-6 mb-12 rounded-r-xl shadow-sm">
              <h3 className="text-red-800 font-bold text-xl mb-2 mt-0">ADVERTENCIA LEGAL Y ACEPTACIÓN EXPRESA</h3>
              <p className="text-red-900 text-sm m-0 leading-relaxed">
                De conformidad con la <strong>Ley de Mensajes de Datos y Firmas Electrónicas</strong> de la República Bolivariana de Venezuela, al hacer clic en &quot;Registrarse&quot;, &quot;Acceder&quot;, &quot;Aceptar&quot; o simplemente al navegar y utilizar los servicios de RED-SALUD, usted manifiesta su voluntad expresa, libre e inequívoca de aceptar y adherirse a este contrato electrónico. Este acto tiene la misma validez jurídica y fuerza probatoria que una firma autógrafa. Si no está de acuerdo con alguna disposición, incluyendo la recolección masiva de datos o las limitaciones de responsabilidad, <strong>NO UTILICE ESTE SERVICIO</strong>.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-800 border-b pb-4 mb-6">TÍTULO I: DISPOSICIONES GENERALES</h2>

            <h3>1. Objeto y Ámbito de Aplicación</h3>
            <p>
              Los presentes Términos y Condiciones (en adelante, los &quot;Términos&quot;) regulan el acceso, navegación y uso de la plataforma digital, sitio web, aplicaciones móviles y servicios conexos (en adelante, la &quot;Plataforma&quot; o los &quot;Servicios&quot;) propiedad y operados por <strong>RED-SALUD C.A.</strong> (o la entidad legal correspondiente), en adelante &quot;LA EMPRESA&quot;.
            </p>
            <p>
              Estos Términos aplican a todos los visitantes, usuarios, pacientes, médicos, proveedores y cualquier otra persona que acceda a los Servicios (en adelante, el &quot;Usuario&quot;).
            </p>

            <h3>2. Capacidad Legal</h3>
            <p>
              El Usuario declara bajo juramento ser mayor de edad (18 años) y tener plena capacidad legal para contratar según las leyes venezolanas. En caso de ser menor de edad, el uso debe estar supervisado por padres o representantes legales, quienes asumen total responsabilidad, civil, penal y administrativa, por los actos del menor en la Plataforma.
            </p>

            <h2 className="text-3xl font-bold text-slate-800 border-b pb-4 mb-6 mt-12">TÍTULO II: USO DE DATOS Y PRIVACIDAD</h2>

            <h3>3. Autorización Amplia para el Tratamiento de Datos</h3>
            <p>
              En ejercicio de su derecho a la autodeterminación informativa y conforme a los artículos 28 y 60 de la <strong>Constitución de la República Bolivariana de Venezuela</strong>, el Usuario otorga a LA EMPRESA su <strong>CONSENTIMIENTO EXPRESO, INFORMADO E IRREVOCABLE</strong> para:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Recopilar:</strong> Datos personales, sensibles, médicos, de geolocalización, dirección IP, identificadores de dispositivos, patrones de uso, historial de navegación, y cualquier otra información generada durante la interacción con la Plataforma.</li>
              <li><strong>Almacenar:</strong> Dicha información en servidores propios o de terceros, ubicados dentro o fuera del territorio nacional (transferencia internacional de datos).</li>
              <li><strong>Procesar y Analizar:</strong> Utilizar algoritmos, inteligencia artificial y minería de datos para perfilamiento de usuarios, mejora de servicios, desarrollo comercial y fines estadísticos.</li>
              <li><strong>Comercializar y Ceder:</strong> Compartir datos (previa disociación o anonimización cuando la ley lo exija estrictamente) con socios comerciales, aseguradoras, farmacéuticas y afiliados para fines de marketing, investigación y oferta de servicios personalizados.</li>
            </ol>
            <p>
              El Usuario renuncia a cualquier reclamo por violación de privacidad derivado del uso de sus datos conforme a los fines aquí descritos, reconociendo que la gratuidad o el costo del servicio se sustentan parcialmente en el valor de dicha información.
            </p>

            <h2 className="text-3xl font-bold text-slate-800 border-b pb-4 mb-6 mt-12">TÍTULO III: NATURALEZA DEL SERVICIO Y TELEMEDICINA</h2>

            <h3>4. Descargo de Responsabilidad Médica (Ley de Telesalud)</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
              <p className="text-yellow-800 font-bold m-0">
                RED-SALUD NO ES UN SERVICIO DE EMERGENCIAS MÉDICAS. EN CASO DE EMERGENCIA DE SALUD, RIESGO DE MUERTE O DAÑO GRAVE, ACUDA INMEDIATAMENTE A UN CENTRO DE SALUD FÍSICO.
              </p>
            </div>
            <p>
              Los servicios prestados a través de la Plataforma se clasifican como servicios de <strong>orientación, triaje digital y teleconsulta ambulatoria</strong>. De conformidad con las normativas sobre el ejercicio de la medicina y telesalud en Venezuela:
            </p>
            <ul>
              <li><strong>Ausencia de Examen Físico:</strong> El Usuario reconoce que la atención virtual tiene limitaciones inherentes por la imposibilidad de realizar examen físico, palpación o auscultación directa.</li>
              <li><strong>Responsabilidad del Usuario:</strong> El Usuario es el único responsable de la veracidad, exactitud e integridad de la información, síntomas e historia clínica suministrada. LA EMPRESA no se hace responsable por errores de diagnóstico o tratamiento derivados de información falsa, incompleta u omitida por el Usuario.</li>
              <li><strong>Relación Médico-Paciente:</strong> La relación profesional se establece directamente entre el Médico tratante y el Usuario. LA EMPRESA actúa meramente como intermediario tecnológico y no practica la medicina.</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-800 border-b pb-4 mb-6 mt-12">TÍTULO IV: OBLIGACIONES Y SEGURIDAD</h2>

            <h3>5. Seguridad y Delitos Informáticos</h3>
            <p>
              El Usuario se compromete a no vulnerar la seguridad de la Plataforma. Cualquier intento de acceso no autorizado, sabotaje, interferencia, intercepción de datos o uso indebido de los sistemas será perseguido penalmente conforme a la <strong>Ley Especial contra los Delitos Informáticos</strong> de Venezuela, incluyendo delitos como el acceso indebido (Art. 6), sabotaje o daño de sistemas (Art. 7) y espionaje informático (Art. 11).
            </p>
            <p>
              LA EMPRESA se reserva el derecho de bloquear direcciones IP, dispositivos y cuentas de usuario ante cualquier sospecha de actividad maliciosa, sin previo aviso y sin derecho a reclamo.
            </p>

            <h3>6. Pagos, Tarifas y Moneda</h3>
            <p>
              Los precios de los servicios podrán estar expresados en Bolívares (Bs.) o en divisas referenciales (USD/EUR). En caso de pagos en Bolívares, se utilizará la tasa de cambio oficial del <strong>Banco Central de Venezuela (BCV)</strong> vigente al momento de la transacción, conforme a la normativa cambiaria y la <strong>Ley Orgánica de Precios Justos</strong>.
            </p>
            <p>
              <strong>Política de No Reembolso:</strong> Dada la naturaleza de los servicios digitales y de salud, una vez confirmado el agendamiento o realizado el pago, NO SE ADMITEN DEVOLUCIONES ni reembolsos, salvo falla técnica imputable exclusivamente a la Plataforma que impida la prestación total del servicio.
            </p>

            <h2 className="text-3xl font-bold text-slate-800 border-b pb-4 mb-6 mt-12">TÍTULO V: LIMITACIÓN DE RESPONSABILIDAD Y MODIFICACIONES</h2>

            <h3>7. Limitación Agravada de Responsabilidad</h3>
            <p>
              Dadas las condiciones de infraestructura de telecomunicaciones y suministro eléctrico en Venezuela, LA EMPRESA <strong>NO GARANTIZA</strong> la disponibilidad ininterrumpida de la Plataforma.
            </p>
            <p>
              LA EMPRESA NO SERÁ RESPONSABLE, contractualmente ni extracontractualmente, por daños directos, indirectos, incidentales, especiales o consecuentes, lucro cesante o daño moral, derivados de:
            </p>
            <ul className="list-disc pl-5">
              <li>Fallas en el servicio de internet (ABA Cantv, Inter, datos móviles, etc.) o suministro eléctrico.</li>
              <li>Interrupciones, latencia o errores en la transmisión de video/audio durante teleconsultas.</li>
              <li>Acceso no autorizado a datos por parte de terceros (hackers) a pesar de las medidas de seguridad razonables.</li>
              <li>Decisiones médicas tomadas por los profesionales de salud usuarios de la plataforma.</li>
            </ul>

            <h3>8. Modificaciones Unilaterales</h3>
            <p>
              LA EMPRESA se reserva el derecho absoluto de modificar, enmendar o sustituir estos Términos en cualquier momento, sin necesidad de notificación individual previa. Las versiones actualizadas se publicarán en esta sección. El uso continuado de la Plataforma tras cualquier cambio constituye la aceptación tácita y plena de los nuevos términos. Es carga del Usuario revisar periódicamente este contrato.
            </p>

            <h2 className="text-3xl font-bold text-slate-800 border-b pb-4 mb-6 mt-12">TÍTULO VI: JURISDICCIÓN Y LEY APLICABLE</h2>

            <h3>9. Ley Aplicable y Domicilio Especial</h3>
            <p>
              Para todos los efectos legales derivados del uso de esta Plataforma, estos Términos se rigen exclusivamente por las leyes de la <strong>República Bolivariana de Venezuela</strong>.
            </p>
            <p>
              Las partes eligen como domicilio especial, único y excluyente a la ciudad de <strong>Caracas, Venezuela</strong>, a la jurisdicción de cuyos tribunales declaran someterse las partes, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
            </p>

            <div className="mt-16 p-8 bg-slate-900 text-white rounded-2xl text-center shadow-2xl">
              <p className="text-lg mb-6">
                Al continuar utilizando Red-Salud, usted certifica que ha leído, entendido y aceptado cada una de las cláusulas de este contrato, reconociendo su validez legal y efectos vinculantes.
              </p>
              <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-transform transform hover:scale-105 shadow-lg">
                ACEPTO TODOS LOS TÉRMINOS Y CONDICIONES
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
