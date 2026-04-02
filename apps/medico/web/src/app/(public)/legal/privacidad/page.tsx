import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad — Red Salud',
  description:
    'Conocé cómo recopilamos, usamos y protegemos tus datos personales y médicos en Red Salud.',
};

export default function PrivacidadPage() {
  return (
    <div className="pt-24">
      <section className="py-16 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Política de Privacidad</h1>
            <p className="mt-4 text-sm text-zinc-500">Última actualización: abril 2025</p>
          </div>

          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-a:text-teal-400 prose-a:no-underline hover:prose-a:text-teal-300 prose-strong:text-white prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed">
            <p>
              En Red Salud, la privacidad y seguridad de los datos es fundamental. Esta Política de
              Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos la
              información personal y médica de nuestros usuarios.
            </p>

            <h2>1. Datos que Recopilamos</h2>
            <h3>1.1 Datos de registro</h3>
            <ul>
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono (opcional)</li>
              <li>Especialidad médica</li>
              <li>Número de registro profesional (SACS/MPPS)</li>
            </ul>

            <h3>1.2 Datos clínicos</h3>
            <p>
              Los profesionales de la salud registran datos clínicos de sus pacientes a través de la
              plataforma, incluyendo:
            </p>
            <ul>
              <li>Historias clínicas y notas de consulta (SOAP)</li>
              <li>Diagnósticos y códigos ICD-11</li>
              <li>Prescripciones médicas</li>
              <li>Resultados de estudios y laboratorios</li>
              <li>Imágenes médicas</li>
            </ul>
            <p>
              Estos datos son considerados <strong>información de salud protegida (PHI)</strong> y
              reciben el más alto nivel de protección dentro de nuestra plataforma.
            </p>

            <h3>1.3 Datos de uso</h3>
            <ul>
              <li>Información del dispositivo y navegador</li>
              <li>Dirección IP</li>
              <li>Páginas visitadas y funcionalidades utilizadas</li>
              <li>Fecha y hora de acceso</li>
            </ul>

            <h2>2. Cómo Usamos los Datos</h2>
            <h3>2.1 Datos de registro y perfil</h3>
            <ul>
              <li>Crear y mantener su cuenta de usuario</li>
              <li>Verificar su identidad profesional</li>
              <li>Comunicar actualizaciones del servicio</li>
              <li>Brindar soporte técnico</li>
            </ul>

            <h3>2.2 Datos clínicos</h3>
            <ul>
              <li>
                Permitir la gestión de consultas, historias clínicas y prescripciones dentro de su
                consultorio
              </li>
              <li>
                Generar sugerencias de códigos ICD-11 mediante inteligencia artificial (los datos se
                procesan de forma anonimizada y no se almacenan fuera de su cuenta)
              </li>
              <li>
                Facilitar la comunicación segura entre profesionales de la salud y pacientes
              </li>
            </ul>
            <p>
              <strong>
                Red Salud no vende, comparte ni comercializa datos clínicos con terceros bajo
                ninguna circunstancia.
              </strong>
            </p>

            <h3>2.3 Datos de uso</h3>
            <ul>
              <li>Mejorar la experiencia de usuario y funcionalidades de la plataforma</li>
              <li>Detectar y prevenir problemas técnicos y de seguridad</li>
              <li>Generar estadísticas agregadas y anonimizadas sobre el uso del servicio</li>
            </ul>

            <h2>3. Datos Médicos (PHI)</h2>
            <p>
              Los datos médicos registrados en Red Salud tienen un tratamiento especial:
            </p>
            <ul>
              <li>
                <strong>Propiedad</strong>: Los datos clínicos pertenecen al profesional de la salud
                y a sus pacientes, no a Red Salud.
              </li>
              <li>
                <strong>Acceso</strong>: Solo el profesional que registró los datos y los pacientes
                autorizados pueden acceder a la información clínica.
              </li>
              <li>
                <strong>Aislamiento</strong>: Los datos de cada consultorio están completamente
                aislados. No hay acceso cruzado entre consultorios, farmacias, laboratorios u otros
                actores de la plataforma.
              </li>
              <li>
                <strong>Encriptación</strong>: Toda la información médica está encriptada en
                tránsito (TLS 1.3) y en reposo (AES-256).
              </li>
              <li>
                <strong>Exportación</strong>: Los profesionales pueden exportar todos los datos
                clínicos de sus pacientes en cualquier momento.
              </li>
            </ul>

            <h2>4. Cookies y Tecnologías de Seguimiento</h2>
            <p>Red Salud utiliza cookies estrictamente necesarias para:</p>
            <ul>
              <li>Mantener la sesión de usuario activa</li>
              <li>Recordar preferencias de configuración</li>
              <li>Garantizar la seguridad de la cuenta</li>
            </ul>
            <p>
              No utilizamos cookies de terceros con fines publicitarios. No participamos en redes de
              publicidad ni compartimos datos de navegación con anunciantes.
            </p>

            <h2>5. Almacenamiento y Retención de Datos</h2>
            <ul>
              <li>
                Los datos se almacenan en servidores seguros en la nube con redundancia geográfica.
              </li>
              <li>
                Los datos de cuentas activas se conservan mientras la cuenta esté vigente.
              </li>
              <li>
                Al cancelar una cuenta, los datos se conservan durante 90 días para permitir la
                exportación. Después de ese período, se eliminan permanentemente.
              </li>
              <li>
                Los respaldos automáticos se realizan diariamente y se conservan por un período
                limitado con las mismas protecciones de seguridad.
              </li>
            </ul>

            <h2>6. Derechos del Usuario</h2>
            <p>Todo usuario de Red Salud tiene derecho a:</p>
            <ul>
              <li>
                <strong>Acceso</strong>: Solicitar una copia de todos los datos personales que
                tenemos sobre usted.
              </li>
              <li>
                <strong>Rectificación</strong>: Corregir datos personales inexactos o incompletos.
              </li>
              <li>
                <strong>Exportación</strong>: Descargar sus datos en formatos estándar.
              </li>
              <li>
                <strong>Eliminación</strong>: Solicitar la eliminación de su cuenta y datos
                personales.
              </li>
              <li>
                <strong>Información</strong>: Conocer qué datos tenemos, cómo los usamos y con
                quién los compartimos.
              </li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, contacte a{' '}
              <Link href="mailto:soporte@redsalud.com">soporte@redsalud.com</Link>.
            </p>

            <h2>7. Compartición de Datos con Terceros</h2>
            <p>Red Salud puede compartir datos únicamente en los siguientes casos:</p>
            <ul>
              <li>
                <strong>Proveedores de infraestructura</strong>: Servicios de hosting, base de datos
                y autenticación necesarios para operar la plataforma (Supabase, proveedores de
                nube). Estos proveedores están sujetos a acuerdos de confidencialidad.
              </li>
              <li>
                <strong>Obligación legal</strong>: Cuando sea requerido por orden judicial o
                autoridad competente según la legislación venezolana.
              </li>
              <li>
                <strong>Consentimiento explícito</strong>: Cuando el usuario haya dado su
                consentimiento expreso para compartir datos específicos.
              </li>
            </ul>

            <h2>8. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizacionales para proteger los datos, incluyendo:
            </p>
            <ul>
              <li>Encriptación en tránsito y en reposo</li>
              <li>Row Level Security (RLS) en toda la base de datos</li>
              <li>Autenticación segura con tokens JWT de expiración corta</li>
              <li>Aislamiento completo entre dominios y consultorios</li>
              <li>Monitoreo continuo de seguridad</li>
            </ul>
            <p>
              Para más detalles, visite nuestra{' '}
              <Link href="/seguridad">página de seguridad</Link>.
            </p>

            <h2>9. Menores de Edad</h2>
            <p>
              Red Salud no está dirigido a menores de 18 años como usuarios directos. Los datos de
              pacientes menores de edad son gestionados exclusivamente por el profesional de la
              salud responsable, bajo las mismas protecciones de seguridad y privacidad aplicables a
              todos los datos clínicos.
            </p>

            <h2>10. Cambios en esta Política</h2>
            <p>
              Red Salud puede actualizar esta Política de Privacidad periódicamente. Los cambios
              significativos serán notificados a través de la plataforma y/o por correo electrónico
              con al menos 15 días de anticipación. La fecha de última actualización se indicará
              siempre al inicio de este documento.
            </p>

            <h2>11. Contacto</h2>
            <p>
              Para cualquier consulta sobre esta Política de Privacidad o sobre el tratamiento de
              sus datos, puede contactarnos en{' '}
              <Link href="mailto:soporte@redsalud.com">soporte@redsalud.com</Link> o a través de
              nuestro{' '}
              <Link href="/contacto">formulario de contacto</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
