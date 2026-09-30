// Curso "Introducción a la gestión de proyectos" (lecciones tipo SLIDES).
// El texto de las slides es fijo; el tutor IA lo usa como base para responder
// preguntas y para adaptar la explicación cuando el alumno lo pide.
// Para editar el curso, cambia este archivo y ejecuta `npm run db:seed`
// (las slides se regeneran; el progreso de los alumnos se conserva).

module.exports = {
  slug: "introduccion-gestion-proyectos",
  title: "Introducción a la gestión de proyectos",
  subtitle: "Los fundamentos para planificar, ejecutar y controlar proyectos de ingeniería",
  description:
    "Un curso interactivo en diapositivas para dar tus primeros pasos en la gestión de proyectos. " +
    "Aprenderás qué es un proyecto, cómo se define su alcance, cómo se construye un cronograma y un " +
    "presupuesto, y cómo se controla hasta el cierre. En cada diapositiva tienes un tutor con IA: " +
    "pregúntale lo que no entiendas o pídele que te lo explique de otra forma, y luego sigue con la lección.",
  priceCents: 0,
  aiGenerated: true,
  modules: [
    {
      title: "Módulo 1 · Fundamentos",
      lessons: [
        {
          title: "¿Qué es un proyecto?",
          description: "La definición de proyecto y en qué se diferencia de las operaciones del día a día.",
          durationMin: 8,
          slides: [
            {
              title: "Un proyecto es un esfuerzo temporal",
              bullets: [
                "Tiene un inicio y un fin definidos",
                "Busca crear un producto, servicio o resultado único",
                "Se ejecuta con recursos limitados: personas, dinero, equipos y tiempo",
              ],
              highlight: "Temporal no significa corto: una represa puede tomar 6 años y sigue siendo un proyecto.",
              tutorNotes: "Definición alineada con la guía PMBOK del PMI. Ejemplos útiles: construir un puente, implementar un ERP, lanzar un producto.",
            },
            {
              title: "Proyectos vs. operaciones",
              bullets: [
                "Proyecto: único y temporal (construir una planta de tratamiento)",
                "Operación: repetitiva y continua (operar esa planta cada día)",
                "Los proyectos suelen crear o cambiar lo que después se opera",
              ],
              highlight: "Pregunta clave: ¿esto se termina cuando se logra el objetivo? Si sí, es un proyecto.",
              tutorNotes: "Si el alumno confunde ambos, usar ejemplos de mantenimiento rutinario (operación) vs. una parada de planta programada (proyecto).",
            },
            {
              title: "¿Qué hace el gestor de proyectos?",
              bullets: [
                "Define con el cliente qué se va a entregar y cómo se medirá el éxito",
                "Planifica el trabajo, el cronograma y el presupuesto",
                "Coordina al equipo y a los interesados",
                "Controla el avance y toma decisiones cuando algo se desvía",
              ],
              highlight: "El gestor no hace todo el trabajo técnico: se asegura de que el trabajo correcto se haga a tiempo.",
              tutorNotes: "Roles relacionados: sponsor (financia y respalda), equipo técnico, PMO.",
            },
          ],
        },
        {
          title: "La triple restricción y el ciclo de vida",
          description: "Alcance, tiempo y costo, y las fases por las que pasa todo proyecto.",
          durationMin: 10,
          slides: [
            {
              title: "La triple restricción",
              bullets: [
                "Alcance: qué se va a entregar",
                "Tiempo: cuándo se va a entregar",
                "Costo: cuánto va a costar",
                "La calidad depende del equilibrio entre las tres",
              ],
              highlight: "Si cambias una, las otras se mueven: más alcance suele significar más tiempo o más costo.",
              tutorNotes: "También se llama triángulo de hierro. Versiones modernas agregan riesgo, recursos y calidad como restricciones.",
            },
            {
              title: "Un ejemplo: la obra se adelanta",
              bullets: [
                "El cliente pide terminar un edificio 2 meses antes",
                "Opción A: agregar turnos y cuadrillas → sube el costo",
                "Opción B: reducir el alcance (entregar por etapas)",
                "Opción C: mantener todo y aceptar más riesgo de retrasos",
              ],
              highlight: "Gestionar es elegir conscientemente cuál restricción ceder, y dejarlo por escrito.",
              tutorNotes: "Conectar con técnicas de compresión de cronograma: crashing (más recursos) y fast tracking (actividades en paralelo).",
            },
            {
              title: "El ciclo de vida de un proyecto",
              bullets: [
                "Inicio: se autoriza el proyecto y se define el objetivo",
                "Planificación: alcance, cronograma, costos, riesgos",
                "Ejecución: el equipo realiza el trabajo",
                "Monitoreo y control: se compara lo real contra lo planificado",
                "Cierre: se entrega, se aprueba y se documenta lo aprendido",
              ],
              highlight: "Monitoreo y control no es una etapa al final: ocurre durante toda la ejecución.",
              tutorNotes: "Son los 5 grupos de procesos del PMBOK. En proyectos ágiles el ciclo se repite en iteraciones.",
            },
          ],
        },
      ],
    },
    {
      title: "Módulo 2 · Inicio y planificación",
      lessons: [
        {
          title: "Acta de constitución e interesados",
          description: "Cómo nace formalmente un proyecto y quiénes influyen en él.",
          durationMin: 9,
          slides: [
            {
              title: "El acta de constitución",
              bullets: [
                "Documento que autoriza formalmente el proyecto",
                "Incluye objetivo, justificación, entregables principales y presupuesto estimado",
                "Nombra al gestor del proyecto y le da autoridad",
                "La firma el sponsor",
              ],
              highlight: "Sin acta, el proyecto no tiene respaldo: cualquiera puede cambiar las reglas del juego.",
              tutorNotes: "En inglés: Project Charter. Suele ocupar 2 a 5 páginas.",
            },
            {
              title: "¿Quiénes son los interesados?",
              bullets: [
                "Toda persona u organización afectada por el proyecto o que puede afectarlo",
                "Ejemplos: cliente, sponsor, equipo, contratistas, vecinos, municipalidad",
                "Cada uno tiene intereses, poder e influencia distintos",
              ],
              highlight: "Un interesado olvidado al inicio suele convertirse en un problema a mitad del proyecto.",
              tutorNotes: "En inglés: stakeholders. En construcción, las comunidades y los entes reguladores son interesados críticos.",
            },
            {
              title: "La matriz poder-interés",
              bullets: [
                "Alto poder, alto interés: gestionar de cerca",
                "Alto poder, bajo interés: mantener satisfecho",
                "Bajo poder, alto interés: mantener informado",
                "Bajo poder, bajo interés: monitorear",
              ],
              highlight: "El objetivo no es complacer a todos, sino decidir cuánta atención recibe cada uno.",
              tutorNotes: "Herramienta clásica para priorizar la comunicación con interesados.",
            },
          ],
        },
        {
          title: "Alcance y WBS",
          description: "Definir qué entra y qué no entra en el proyecto, y desglosarlo en trabajo manejable.",
          durationMin: 11,
          slides: [
            {
              title: "Definir el alcance",
              bullets: [
                "Describe los entregables y el trabajo necesario para producirlos",
                "Deja explícito lo que NO está incluido (exclusiones)",
                "Define criterios de aceptación: cómo sabremos que está terminado",
              ],
              highlight: "Las exclusiones evitan la mitad de las discusiones con el cliente.",
              tutorNotes: "Relacionar con 'scope creep': cambios de alcance no controlados que crecen poco a poco.",
            },
            {
              title: "La WBS: dividir para conquistar",
              bullets: [
                "Estructura de Desglose del Trabajo (Work Breakdown Structure)",
                "Descompone el proyecto en entregables cada vez más pequeños",
                "El último nivel se llama paquete de trabajo",
                "Un paquete debe poder estimarse, asignarse y controlarse",
              ],
              highlight: "Regla del 100%: la WBS incluye todo el trabajo del proyecto, y nada más.",
              tutorNotes: "La WBS es la base del cronograma y del presupuesto. En Primavera P6 se representa como la estructura WBS del proyecto.",
            },
            {
              title: "Ejemplo de WBS: una vivienda",
              bullets: [
                "1. Gestión del proyecto",
                "2. Obras preliminares (limpieza, trazado)",
                "3. Estructura (cimentación, columnas, losas)",
                "4. Instalaciones (eléctricas, sanitarias)",
                "5. Acabados (pisos, pintura, carpintería)",
              ],
              highlight: "Fíjate: se organiza por entregables (qué), no por acciones (hacer).",
              tutorNotes: "Si el alumno pide más niveles, desglosar 'Estructura' en cimentación → zapatas, vigas de cimentación, etc.",
            },
          ],
        },
      ],
    },
    {
      title: "Módulo 3 · Cronograma y costos",
      lessons: [
        {
          title: "Actividades y ruta crítica",
          description: "Del paquete de trabajo a un cronograma con dependencias y ruta crítica.",
          durationMin: 12,
          slides: [
            {
              title: "De paquetes a actividades",
              bullets: [
                "Cada paquete de trabajo se divide en actividades",
                "Cada actividad tiene una duración estimada",
                "Las actividades se conectan con dependencias",
              ],
              highlight: "Paquete = lo que se entrega. Actividad = el trabajo que hay que hacer para entregarlo.",
              tutorNotes: "Ejemplo: paquete 'Losa del 2° piso' → actividades encofrado, armado de acero, vaciado de concreto, curado.",
            },
            {
              title: "Tipos de dependencia",
              bullets: [
                "Fin a Inicio (FS): B empieza cuando A termina — la más común",
                "Inicio a Inicio (SS): B empieza cuando A empieza",
                "Fin a Fin (FF): B termina cuando A termina",
                "Inicio a Fin (SF): poco usada",
              ],
              highlight: "Ejemplo FS: no puedes vaciar concreto antes de terminar el encofrado.",
              tutorNotes: "Mencionar adelantos (lead) y retrasos (lag): p. ej. esperar 7 días de curado es un lag de 7 días.",
            },
            {
              title: "La ruta crítica",
              bullets: [
                "Es la secuencia de actividades más larga del proyecto",
                "Determina la duración total del proyecto",
                "Sus actividades tienen holgura cero",
                "Si una actividad crítica se retrasa, se retrasa todo el proyecto",
              ],
              highlight: "Para terminar antes, hay que acortar la ruta crítica; acelerar otras actividades no sirve.",
              tutorNotes: "Holgura (float) = cuánto puede retrasarse una actividad sin retrasar el proyecto. Método CPM.",
            },
          ],
        },
        {
          title: "Presupuesto y línea base",
          description: "Cómo se estima el costo y por qué congelamos el plan.",
          durationMin: 9,
          slides: [
            {
              title: "Estimar el costo",
              bullets: [
                "Se estima el costo de cada paquete de trabajo",
                "Incluye mano de obra, materiales, equipos y subcontratos",
                "Se suma de abajo hacia arriba siguiendo la WBS",
              ],
              highlight: "Una WBS bien hecha hace que el presupuesto casi se construya solo.",
              tutorNotes: "Técnicas: análoga, paramétrica (p. ej. costo por m²), ascendente (bottom-up).",
            },
            {
              title: "Reservas: prepararse para lo incierto",
              bullets: [
                "Reserva de contingencia: para riesgos identificados",
                "Reserva de gestión: para imprevistos no identificados",
                "Presupuesto total = costo estimado + reservas",
              ],
              highlight: "Un presupuesto sin reservas no es optimista: es irreal.",
              tutorNotes: "La reserva de gestión normalmente la controla el sponsor, no el gestor.",
            },
            {
              title: "La línea base",
              bullets: [
                "Es la versión aprobada del alcance, cronograma y costo",
                "Se 'congela' para compararla con lo que realmente pasa",
                "Solo cambia mediante un control de cambios formal",
              ],
              highlight: "Sin línea base no puedes decir si vas atrasado: no tienes contra qué comparar.",
              tutorNotes: "En Primavera P6 se guarda con 'Maintain Baselines' y se compara contra el avance actual.",
            },
          ],
        },
      ],
    },
    {
      title: "Módulo 4 · Ejecución, control y cierre",
      lessons: [
        {
          title: "Controlar el avance y los riesgos",
          description: "Medir el avance, anticipar riesgos y manejar los cambios.",
          durationMin: 12,
          slides: [
            {
              title: "¿Vamos bien? Medir el avance",
              bullets: [
                "Comparar lo real contra la línea base, periódicamente",
                "Avance físico: cuánto trabajo se completó",
                "Avance de costo: cuánto se gastó",
                "Las desviaciones tempranas son más fáciles de corregir",
              ],
              highlight: "Gastar el 50% del presupuesto no significa llevar el 50% del trabajo.",
              tutorNotes: "Introducir brevemente valor ganado: PV (planificado), EV (ganado), AC (costo real); SPI = EV/PV, CPI = EV/AC.",
            },
            {
              title: "Gestionar los riesgos",
              bullets: [
                "Riesgo: evento incierto que, si ocurre, afecta al proyecto",
                "Se evalúa por probabilidad e impacto",
                "Respuestas: evitar, mitigar, transferir o aceptar",
                "Se registran y revisan en el registro de riesgos",
              ],
              highlight: "Un riesgo es algo que podría pasar; un problema es algo que ya pasó.",
              tutorNotes: "Ejemplo: lluvias en temporada de vaciados → mitigar reprogramando o usando aditivos. Transferir = seguros o contratos.",
            },
            {
              title: "El control de cambios",
              bullets: [
                "Todo cambio se solicita por escrito",
                "Se analiza su impacto en alcance, tiempo y costo",
                "Lo aprueba o rechaza quien tiene autoridad",
                "Si se aprueba, se actualiza la línea base",
              ],
              highlight: "Los cambios no son malos; los cambios no controlados sí.",
              tutorNotes: "En proyectos grandes existe un comité de control de cambios (CCB).",
            },
          ],
        },
        {
          title: "Cierre del proyecto",
          description: "Entregar, aprobar y aprender para el siguiente proyecto.",
          durationMin: 7,
          slides: [
            {
              title: "Cerrar formalmente",
              bullets: [
                "Obtener la aceptación formal del cliente",
                "Cerrar contratos con proveedores y subcontratistas",
                "Liberar al equipo y los recursos",
                "Archivar la documentación del proyecto",
              ],
              highlight: "Un proyecto sin cierre formal sigue consumiendo tiempo y dinero.",
              tutorNotes: "En construcción incluye actas de recepción de obra, liquidación y garantías.",
            },
            {
              title: "Lecciones aprendidas",
              bullets: [
                "¿Qué salió bien y debemos repetir?",
                "¿Qué salió mal y cómo lo evitamos la próxima vez?",
                "Se documentan y se comparten con la organización",
              ],
              highlight: "La experiencia solo sirve si queda escrita para el próximo equipo.",
              tutorNotes: "Buenas prácticas: hacer sesiones de lecciones aprendidas también durante el proyecto, no solo al final.",
            },
            {
              title: "¿Y ahora qué?",
              bullets: [
                "Ya conoces el ciclo completo de un proyecto",
                "El siguiente paso: llevarlo a una herramienta profesional",
                "En el curso de Primavera P6 aplicarás WBS, ruta crítica y líneas base",
              ],
              highlight: "¡Felicitaciones por completar la introducción a la gestión de proyectos!",
              tutorNotes: "Si pregunta por certificaciones, mencionar CAPM (inicial) y PMP (con experiencia) del PMI.",
            },
          ],
        },
      ],
    },
  ],
};
