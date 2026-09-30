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
              quiz: {
                "question": "¿Cuál de estos es un proyecto?",
                "options": [
                  {
                    "text": "Construir un puente vehicular de 120 m",
                    "correct": true,
                    "why": "Tiene inicio y fin, y crea un resultado único: el puente."
                  },
                  {
                    "text": "Cobrar el peaje del puente cada día",
                    "correct": false,
                    "why": "Es una tarea repetitiva y continua: es operación, no proyecto."
                  },
                  {
                    "text": "Limpiar las oficinas todas las semanas",
                    "correct": false,
                    "why": "Se repite sin un fin definido; no crea un resultado único."
                  }
                ]
              },
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
              quiz: {
                "question": "Una planta de tratamiento se detiene 3 semanas para cambiar sus bombas y luego vuelve a operar. ¿Qué es esa parada?",
                "options": [
                  {
                    "text": "Un proyecto",
                    "correct": true,
                    "why": "Es temporal (3 semanas) y cambia algo de la planta; al terminar, vuelve la operación."
                  },
                  {
                    "text": "Una operación",
                    "correct": false,
                    "why": "La operación es el funcionamiento diario de la planta; la parada tiene inicio y fin propios."
                  },
                  {
                    "text": "Ninguna de las dos",
                    "correct": false,
                    "why": "Todo trabajo organizado es proyecto u operación; esta parada es claramente temporal."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Cuál es la función principal del gestor de proyectos?",
                "options": [
                  {
                    "text": "Hacer personalmente todo el trabajo técnico",
                    "correct": false,
                    "why": "El gestor coordina y decide; el equipo técnico ejecuta el trabajo especializado."
                  },
                  {
                    "text": "Asegurar que el trabajo correcto se haga a tiempo y dentro del presupuesto",
                    "correct": true,
                    "why": "Planifica, coordina, controla el avance y decide cuando algo se desvía."
                  },
                  {
                    "text": "Financiar el proyecto",
                    "correct": false,
                    "why": "Quien financia y respalda es el sponsor, no el gestor."
                  }
                ]
              },
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
              quiz: {
                "question": "El cliente agrega dos pisos más al edificio sin mover la fecha de entrega. ¿Qué es más probable?",
                "options": [
                  {
                    "text": "Nada cambia: alcance, tiempo y costo son independientes",
                    "correct": false,
                    "why": "Las tres restricciones están conectadas: si una cambia, las otras se mueven."
                  },
                  {
                    "text": "Sube el costo (más recursos) o aumenta el riesgo de no cumplir",
                    "correct": true,
                    "why": "Más alcance con el mismo tiempo exige más recursos o acepta más riesgo."
                  },
                  {
                    "text": "Baja el costo",
                    "correct": false,
                    "why": "Más trabajo en el mismo plazo casi nunca cuesta menos."
                  }
                ]
              },
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
              quiz: {
                "question": "Para terminar antes, decides agregar un segundo turno de trabajo. ¿Qué restricción estás cediendo?",
                "options": [
                  {
                    "text": "El costo",
                    "correct": true,
                    "why": "Más turnos y cuadrillas significan pagar más para ganar tiempo."
                  },
                  {
                    "text": "El alcance",
                    "correct": false,
                    "why": "El alcance se mantiene: se entrega lo mismo, solo que antes."
                  },
                  {
                    "text": "Ninguna",
                    "correct": false,
                    "why": "Acelerar siempre cuesta algo; aquí lo pagas en dinero."
                  }
                ]
              },
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
              quiz: {
                "question": "¿En qué momento se hace el monitoreo y control?",
                "options": [
                  {
                    "text": "Solo al final, antes del cierre",
                    "correct": false,
                    "why": "Esperar al final impide corregir a tiempo."
                  },
                  {
                    "text": "Durante toda la ejecución",
                    "correct": true,
                    "why": "Se compara lo real contra lo planificado de forma continua mientras se trabaja."
                  },
                  {
                    "text": "Solo durante la planificación",
                    "correct": false,
                    "why": "En la planificación aún no hay avance real que controlar."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Quién firma normalmente el acta de constitución?",
                "options": [
                  {
                    "text": "El sponsor",
                    "correct": true,
                    "why": "El sponsor autoriza el proyecto y le da autoridad al gestor."
                  },
                  {
                    "text": "El contratista principal",
                    "correct": false,
                    "why": "El contratista ejecuta trabajo, pero no autoriza el proyecto."
                  },
                  {
                    "text": "El equipo técnico",
                    "correct": false,
                    "why": "El equipo se forma después de que el proyecto está autorizado."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Cuál de estos es un interesado de una obra en la ciudad?",
                "options": [
                  {
                    "text": "Los vecinos del terreno",
                    "correct": true,
                    "why": "El ruido, el tránsito y el polvo los afectan, y pueden afectar al proyecto con reclamos."
                  },
                  {
                    "text": "Solo el cliente que paga",
                    "correct": false,
                    "why": "Los interesados son todos los que afectan o son afectados, no solo el cliente."
                  },
                  {
                    "text": "Nadie fuera del contrato",
                    "correct": false,
                    "why": "Municipios, reguladores y comunidades no firman el contrato, pero influyen mucho."
                  }
                ]
              },
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
              quiz: {
                "question": "La municipalidad tiene mucho poder pero poco interés diario en tu obra. ¿Cómo la gestionas?",
                "options": [
                  {
                    "text": "Gestionar de cerca",
                    "correct": false,
                    "why": "Eso es para alto poder y alto interés; aquí el interés es bajo."
                  },
                  {
                    "text": "Mantener satisfecha",
                    "correct": true,
                    "why": "Alto poder, bajo interés: cumple sus requisitos y evita que se convierta en un problema."
                  },
                  {
                    "text": "Solo monitorear",
                    "correct": false,
                    "why": "Por su alto poder, ignorarla puede detener la obra."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Para qué sirven las exclusiones en la definición del alcance?",
                "options": [
                  {
                    "text": "Para decir qué NO está incluido y evitar malentendidos",
                    "correct": true,
                    "why": "Dejarlo por escrito evita discusiones y cambios no controlados."
                  },
                  {
                    "text": "Para reducir el presupuesto",
                    "correct": false,
                    "why": "No reducen el costo; aclaran los límites del trabajo."
                  },
                  {
                    "text": "Son opcionales y casi no importan",
                    "correct": false,
                    "why": "Son de lo más útil para evitar el crecimiento descontrolado del alcance."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Qué dice la regla del 100% de la WBS?",
                "options": [
                  {
                    "text": "Que el proyecto debe terminar al 100%",
                    "correct": false,
                    "why": "La regla habla del contenido de la WBS, no del avance."
                  },
                  {
                    "text": "Que la WBS incluye todo el trabajo del proyecto, y nada más",
                    "correct": true,
                    "why": "Si algo no está en la WBS, no forma parte del proyecto."
                  },
                  {
                    "text": "Que cada paquete debe durar el 100% del plazo",
                    "correct": false,
                    "why": "Los paquetes tienen duraciones distintas; la regla trata del alcance total."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Cómo conviene organizar una WBS?",
                "options": [
                  {
                    "text": "Por entregables (qué se entrega)",
                    "correct": true,
                    "why": "Una WBS describe los entregables; las acciones vienen después, en el cronograma."
                  },
                  {
                    "text": "Por acciones (qué hacer)",
                    "correct": false,
                    "why": "Las acciones son actividades del cronograma, no elementos de la WBS."
                  },
                  {
                    "text": "Por nombre de cada trabajador",
                    "correct": false,
                    "why": "La WBS describe el trabajo, no a las personas."
                  }
                ]
              },
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
              quiz: {
                "question": "En una obra, ¿cuál es una actividad y no un paquete de trabajo?",
                "options": [
                  {
                    "text": "Losa del 2.º piso",
                    "correct": false,
                    "why": "Es un entregable (paquete de trabajo)."
                  },
                  {
                    "text": "Vaciar concreto en la losa",
                    "correct": true,
                    "why": "Es el trabajo que se hace para producir el entregable."
                  },
                  {
                    "text": "Estructura",
                    "correct": false,
                    "why": "Es un nivel alto de la WBS, no una actividad."
                  }
                ]
              },
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
              quiz: {
                "question": "No puedes vaciar concreto hasta terminar el encofrado. ¿Qué dependencia es?",
                "options": [
                  {
                    "text": "Fin a Inicio (FS)",
                    "correct": true,
                    "why": "El vaciado empieza cuando termina el encofrado."
                  },
                  {
                    "text": "Inicio a Inicio (SS)",
                    "correct": false,
                    "why": "SS significa que ambas empiezan juntas; aquí una debe terminar primero."
                  },
                  {
                    "text": "Fin a Fin (FF)",
                    "correct": false,
                    "why": "FF liga el final de ambas, no el inicio de la segunda."
                  }
                ]
              },
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
              quiz: {
                "question": "Una actividad de la ruta crítica se retrasa 3 días. ¿Qué pasa?",
                "options": [
                  {
                    "text": "Nada, se absorbe con la holgura",
                    "correct": false,
                    "why": "Las actividades críticas tienen holgura cero."
                  },
                  {
                    "text": "El proyecto completo se retrasa 3 días",
                    "correct": true,
                    "why": "La ruta crítica define la duración total: su retraso es el retraso del proyecto."
                  },
                  {
                    "text": "Solo se retrasa esa actividad",
                    "correct": false,
                    "why": "En la ruta crítica, el retraso se transmite hasta el final."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Cómo se construye un presupuesto ascendente?",
                "options": [
                  {
                    "text": "Sumando el costo de cada paquete de trabajo de la WBS",
                    "correct": true,
                    "why": "Se estima abajo, en cada paquete, y se suma hacia arriba."
                  },
                  {
                    "text": "Copiando el presupuesto total de otro proyecto",
                    "correct": false,
                    "why": "Eso es una estimación análoga, no ascendente."
                  },
                  {
                    "text": "Poniendo una cifra redonda y ajustándola después",
                    "correct": false,
                    "why": "Sin base en el trabajo, el presupuesto no es confiable."
                  }
                ]
              },
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
              quiz: {
                "question": "Identificaste el riesgo de lluvias fuertes en la temporada de vaciados. ¿Qué reserva lo cubre?",
                "options": [
                  {
                    "text": "La reserva de contingencia",
                    "correct": true,
                    "why": "Cubre riesgos identificados, como este."
                  },
                  {
                    "text": "La reserva de gestión",
                    "correct": false,
                    "why": "Esa es para imprevistos que no se identificaron."
                  },
                  {
                    "text": "Ninguna, las lluvias no se presupuestan",
                    "correct": false,
                    "why": "Un riesgo conocido debe tener una reserva."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Por qué se guarda una línea base?",
                "options": [
                  {
                    "text": "Para comparar el avance real contra el plan aprobado",
                    "correct": true,
                    "why": "Sin ella no puedes saber si vas atrasado o sobre el presupuesto."
                  },
                  {
                    "text": "Para poder cambiar el plan libremente",
                    "correct": false,
                    "why": "La línea base solo cambia con un control de cambios formal."
                  },
                  {
                    "text": "Es un requisito solo de Primavera P6",
                    "correct": false,
                    "why": "Es una práctica de gestión, se use la herramienta que se use."
                  }
                ]
              },
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
              quiz: {
                "question": "Gastaste el 60% del presupuesto y completaste el 40% del trabajo. ¿Qué indica?",
                "options": [
                  {
                    "text": "Todo va según lo previsto",
                    "correct": false,
                    "why": "Gastar más de lo que avanzas es una señal de alerta."
                  },
                  {
                    "text": "Posible sobrecosto: gastas más de lo que avanzas",
                    "correct": true,
                    "why": "El avance físico va detrás del gasto; conviene investigar la causa."
                  },
                  {
                    "text": "Vas adelantado",
                    "correct": false,
                    "why": "El avance (40%) es menor que el gasto (60%)."
                  }
                ]
              },
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
              quiz: {
                "question": "Contratas un seguro contra daños por sismo. ¿Qué respuesta al riesgo es?",
                "options": [
                  {
                    "text": "Evitar",
                    "correct": false,
                    "why": "Evitar sería eliminar la causa; el sismo puede ocurrir igual."
                  },
                  {
                    "text": "Transferir",
                    "correct": true,
                    "why": "Pasas el impacto económico a la aseguradora."
                  },
                  {
                    "text": "Aceptar",
                    "correct": false,
                    "why": "Aceptar sería no hacer nada; aquí tomaste una acción."
                  }
                ]
              },
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
              quiz: {
                "question": "El cliente pide cambiar el tipo de fachada. ¿Qué haces primero?",
                "options": [
                  {
                    "text": "Hacer el cambio de inmediato para quedar bien",
                    "correct": false,
                    "why": "Los cambios no controlados son los que descarrilan proyectos."
                  },
                  {
                    "text": "Pedir la solicitud por escrito y analizar su impacto",
                    "correct": true,
                    "why": "Así se evalúan alcance, tiempo y costo antes de aprobarlo."
                  },
                  {
                    "text": "Rechazarlo siempre",
                    "correct": false,
                    "why": "Los cambios no son malos: se evalúan y se deciden."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Qué es clave para cerrar formalmente un proyecto?",
                "options": [
                  {
                    "text": "Obtener la aceptación formal del cliente",
                    "correct": true,
                    "why": "Sin aceptación formal, el proyecto sigue abierto y consumiendo recursos."
                  },
                  {
                    "text": "Terminar el último trabajo técnico y listo",
                    "correct": false,
                    "why": "Faltan la aceptación, el cierre de contratos y la documentación."
                  },
                  {
                    "text": "Despedir al equipo antes de entregar",
                    "correct": false,
                    "why": "El equipo se libera después de la entrega y aceptación."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Cuándo conviene registrar lecciones aprendidas?",
                "options": [
                  {
                    "text": "Solo al final del proyecto",
                    "correct": false,
                    "why": "Al final se olvidan detalles; es mejor hacerlo también durante el proyecto."
                  },
                  {
                    "text": "Durante el proyecto y al cierre",
                    "correct": true,
                    "why": "Así se capturan cuando están frescas y el próximo equipo las aprovecha."
                  },
                  {
                    "text": "Nunca, cada proyecto es distinto",
                    "correct": false,
                    "why": "Aunque cada proyecto es único, muchos problemas se repiten."
                  }
                ]
              },
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
              quiz: {
                "question": "¿Qué herramienta profesional se usa para aplicar WBS, ruta crítica y líneas base en grandes proyectos?",
                "options": [
                  {
                    "text": "Oracle Primavera P6",
                    "correct": true,
                    "why": "Es el estándar en construcción, energía y minería, y es el siguiente curso."
                  },
                  {
                    "text": "Un procesador de texto",
                    "correct": false,
                    "why": "No permite calcular la programación ni la ruta crítica."
                  },
                  {
                    "text": "Ninguna, todo se hace a mano",
                    "correct": false,
                    "why": "En proyectos grandes, el cálculo manual no es práctico."
                  }
                ]
              },
            },
          ],
        },
      ],
    },
  ],
};
