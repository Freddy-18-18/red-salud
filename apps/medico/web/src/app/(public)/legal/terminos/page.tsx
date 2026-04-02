import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos de Servicio — Red Salud',
  description:
    'Términos y condiciones de uso de la plataforma Red Salud para profesionales de la salud en Venezuela.',
};

export default function TerminosPage() {
  return (
    <div className="pt-24">
      <section className="py-16 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Términos de Servicio</h1>
            <p className="mt-4 text-sm text-zinc-500">Última actualización: abril 2025</p>
          </div>

          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-a:text-teal-400 prose-a:no-underline hover:prose-a:text-teal-300 prose-strong:text-white prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed">
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar la plataforma Red Salud (&quot;el Servicio&quot;), usted acepta
              estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de
              estos términos, no podrá acceder al Servicio.
            </p>
            <p>
              Red Salud es una plataforma digital diseñada para profesionales de la salud en
              Venezuela, que ofrece herramientas de gestión clínica, agenda, historia médica
              electrónica y comunicación con pacientes.
            </p>

            <h2>2. Cuentas de Usuario</h2>
            <h3>2.1 Registro</h3>
            <p>
              Para utilizar el Servicio, debe crear una cuenta proporcionando información veraz y
              completa. Es su responsabilidad mantener la confidencialidad de sus credenciales de
              acceso.
            </p>
            <h3>2.2 Verificación profesional</h3>
            <p>
              Los usuarios que se registren como profesionales de la salud podrán ser sometidos a un
              proceso de verificación a través del Sistema Autónomo de Control Sanitario (SACS) u
              otros mecanismos de validación. Red Salud se reserva el derecho de suspender cuentas
              que no puedan ser verificadas.
            </p>
            <h3>2.3 Responsabilidad de la cuenta</h3>
            <p>
              Usted es responsable de toda la actividad que ocurra bajo su cuenta. Debe notificarnos
              inmediatamente ante cualquier uso no autorizado de su cuenta o cualquier otra violación
              de seguridad.
            </p>

            <h2>3. Uso del Servicio</h2>
            <h3>3.1 Uso permitido</h3>
            <p>El Servicio está destinado exclusivamente para:</p>
            <ul>
              <li>
                Gestión de consultas médicas y registros clínicos por parte de profesionales de la
                salud debidamente registrados.
              </li>
              <li>Comunicación entre profesionales de la salud y sus pacientes.</li>
              <li>
                Administración de agendas, prescripciones y documentación médica digital.
              </li>
            </ul>
            <h3>3.2 Uso prohibido</h3>
            <p>Queda expresamente prohibido:</p>
            <ul>
              <li>Utilizar el Servicio para fines ilegales o no autorizados.</li>
              <li>
                Compartir credenciales de acceso con terceros no autorizados.
              </li>
              <li>
                Intentar acceder a datos de otros usuarios o consultorios sin autorización.
              </li>
              <li>
                Utilizar el Servicio para almacenar información que no esté relacionada con la
                práctica médica.
              </li>
              <li>Realizar ingeniería inversa o intentar vulnerar la seguridad de la plataforma.</li>
            </ul>

            <h2>4. Privacidad y Datos Médicos</h2>
            <p>
              La protección de los datos médicos es nuestra máxima prioridad. El tratamiento de
              datos personales y datos de salud se rige por nuestra{' '}
              <Link href="/legal/privacidad">Política de Privacidad</Link>, que forma parte integral
              de estos Términos.
            </p>
            <p>
              Como profesional de la salud, usted es responsable de obtener el consentimiento
              informado de sus pacientes para el registro y almacenamiento de sus datos médicos en
              la plataforma, de conformidad con la legislación venezolana aplicable.
            </p>

            <h2>5. Propiedad Intelectual</h2>
            <h3>5.1 Propiedad de Red Salud</h3>
            <p>
              La plataforma Red Salud, incluyendo su diseño, código fuente, logotipos, marcas y
              contenido original, son propiedad exclusiva de Red Salud. Ningún derecho de propiedad
              intelectual le es transferido por el uso del Servicio.
            </p>
            <h3>5.2 Contenido del usuario</h3>
            <p>
              Los datos clínicos, notas médicas y demás contenido que usted genere a través del
              Servicio son y seguirán siendo de su propiedad. Red Salud no reclama propiedad sobre
              sus datos clínicos.
            </p>

            <h2>6. Planes y Pagos</h2>
            <p>
              Red Salud ofrece un plan gratuito con funcionalidades limitadas y planes de pago con
              funcionalidades extendidas. Los precios y las características de cada plan están
              publicados en nuestra{' '}
              <Link href="/precios">página de precios</Link>.
            </p>
            <p>
              Red Salud se reserva el derecho de modificar los precios de los planes de pago con un
              aviso previo de al menos 30 días. Los cambios de precio no afectarán el período de
              facturación en curso.
            </p>

            <h2>7. Cancelación</h2>
            <h3>7.1 Cancelación por el usuario</h3>
            <p>
              Puede cancelar su cuenta en cualquier momento desde la configuración de su perfil. Al
              cancelar, sus datos serán conservados durante 90 días, período en el cual podrá
              exportar toda su información. Transcurrido ese plazo, los datos serán eliminados de
              forma permanente.
            </p>
            <h3>7.2 Cancelación por Red Salud</h3>
            <p>
              Nos reservamos el derecho de suspender o cancelar cuentas que violen estos Términos de
              Servicio, con notificación previa cuando sea posible.
            </p>

            <h2>8. Limitaciones de Responsabilidad</h2>
            <p>
              Red Salud es una herramienta de gestión clínica y <strong>no reemplaza</strong> el
              juicio profesional del médico. Las sugerencias generadas por inteligencia artificial
              (como códigos ICD-11) son orientativas y deben ser validadas por el profesional.
            </p>
            <p>
              Red Salud no será responsable por decisiones médicas tomadas en base a la información
              presentada en la plataforma. El profesional de la salud mantiene en todo momento la
              responsabilidad sobre sus decisiones clínicas.
            </p>
            <p>
              En la medida permitida por la legislación venezolana, Red Salud no será responsable
              por daños indirectos, incidentales, especiales o consecuentes que resulten del uso o
              la imposibilidad de uso del Servicio.
            </p>

            <h2>9. Disponibilidad del Servicio</h2>
            <p>
              Nos esforzamos por mantener el Servicio disponible de forma continua, pero no
              garantizamos una disponibilidad del 100%. Pueden ocurrir interrupciones por
              mantenimiento programado, actualizaciones o circunstancias fuera de nuestro control.
            </p>

            <h2>10. Modificaciones a los Términos</h2>
            <p>
              Red Salud puede modificar estos Términos de Servicio en cualquier momento. Las
              modificaciones serán notificadas a través de la plataforma y/o por correo electrónico
              con al menos 15 días de anticipación. El uso continuado del Servicio después de la
              entrada en vigor de las modificaciones constituye la aceptación de los nuevos términos.
            </p>

            <h2>11. Legislación Aplicable</h2>
            <p>
              Estos Términos de Servicio se rigen por las leyes de la República Bolivariana de
              Venezuela. Cualquier controversia será sometida a los tribunales competentes de la
              ciudad de Caracas.
            </p>

            <h2>12. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con estos Términos de Servicio, puede
              contactarnos en{' '}
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
