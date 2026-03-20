// Catálogo de Riesgos Críticos — RC5 a RC32
// Estructura: categorías con subpuntos numerados jerárquicamente
// Reemplazar con datos del documento oficial cuando esté disponible

const RC_CATALOG = [
  {
    code: 'RC5', name: 'Espacios Confinados',
    categories: [
      { number: '1', name: 'Controles Preventivos', subpoints: [
        { id: 'RC5-1.1', n: '1.1', desc: 'Verificar que se haya generado el IPERC continuo para la tarea' },
        { id: 'RC5-1.2', n: '1.2', desc: 'Análisis de la atmósfera del espacio confinado: O₂ (19.5–23.5%), gases tóxicos e inflamables dentro de límites' },
        { id: 'RC5-1.3', n: '1.3', desc: 'Brigada de respuesta a emergencias disponible, comunicada y con equipamiento completo' },
      ]},
      { number: '2', name: 'Equipos y Herramientas', subpoints: [
        { id: 'RC5-2.1', n: '2.1', desc: 'Equipo de protección personal completo, inspeccionado y en buen estado' },
        { id: 'RC5-2.2', n: '2.2', desc: 'Iluminación de emergencia instalada y operativa dentro del espacio confinado' },
        { id: 'RC5-2.3', n: '2.3', desc: 'Equipo de medición de gases calibrado y con certificado vigente' },
        { id: 'RC5-2.4', n: '2.4', desc: 'Sistema de rescate disponible y operativo en el punto de trabajo' },
      ]},
      { number: '3', name: 'Permisos y Documentación', subpoints: [
        { id: 'RC5-3.1', n: '3.1', desc: 'Permiso de trabajo en espacio confinado firmado y vigente' },
        { id: 'RC5-3.2', n: '3.2', desc: 'Personal designado con competencia certificada vigente para trabajos en espacios confinados' },
        { id: 'RC5-3.3', n: '3.3', desc: 'Supervisor de espacio confinado identificado, presente y comunicado con el equipo' },
      ]},
    ]
  },
  {
    code: 'RC6', name: 'Trabajos en Altura',
    categories: [
      { number: '1', name: 'Verificación de Equipos de Protección', subpoints: [
        { id: 'RC6-1.1', n: '1.1', desc: 'Arnés de cuerpo completo inspeccionado, sin daños visibles y con certificado vigente' },
        { id: 'RC6-1.2', n: '1.2', desc: 'Línea de vida / lanyard en buen estado, sin cortes ni deformaciones, certificado vigente' },
        { id: 'RC6-1.3', n: '1.3', desc: 'Conector/mosquetón con seguro de cierre funcionando correctamente' },
      ]},
      { number: '2', name: 'Condiciones del Punto de Trabajo', subpoints: [
        { id: 'RC6-2.1', n: '2.1', desc: 'Punto de anclaje certificado para la carga de trabajo (mínimo 2200 kg)' },
        { id: 'RC6-2.2', n: '2.2', desc: 'Área de trabajo delimitada y señalizada (radio de caída de objetos)' },
        { id: 'RC6-2.3', n: '2.3', desc: 'Plataforma de trabajo estable, asegurada y con barandas cuando aplique' },
      ]},
      { number: '3', name: 'Competencias y Autorización', subpoints: [
        { id: 'RC6-3.1', n: '3.1', desc: 'Trabajador con capacitación vigente en trabajos en altura (actualización anual)' },
        { id: 'RC6-3.2', n: '3.2', desc: 'Permiso de trabajo en altura firmado y vigente para la jornada' },
        { id: 'RC6-3.3', n: '3.3', desc: 'Condiciones meteorológicas aptas (sin lluvia intensa, viento > 50 km/h o tormentas eléctricas)' },
      ]},
    ]
  },
  {
    code: 'RC7', name: 'Izaje y Transporte de Cargas',
    categories: [
      { number: '1', name: 'Inspección de Equipos de Izaje', subpoints: [
        { id: 'RC7-1.1', n: '1.1', desc: 'Eslingas, cables y cadenas inspeccionadas sin daños, con carga nominal visible' },
        { id: 'RC7-1.2', n: '1.2', desc: 'Grilletes, ganchos y accesorios en buen estado con seguro de cierre operativo' },
        { id: 'RC7-1.3', n: '1.3', desc: 'Equipo izador (grúa/montacargas) con inspección pre-operacional realizada y firmada' },
      ]},
      { number: '2', name: 'Condiciones de la Operación', subpoints: [
        { id: 'RC7-2.1', n: '2.1', desc: 'Área de izaje delimitada, señalizada y libre de personal no autorizado durante la maniobra' },
        { id: 'RC7-2.2', n: '2.2', desc: 'Peso de la carga verificado y dentro de la capacidad del equipo izador' },
        { id: 'RC7-2.3', n: '2.3', desc: 'Rigger/aparejador competente identificado y dirigiendo la maniobra' },
      ]},
      { number: '3', name: 'Comunicación y Señalización', subpoints: [
        { id: 'RC7-3.1', n: '3.1', desc: 'Plan de izaje documentado para cargas críticas (>75% capacidad del equipo)' },
        { id: 'RC7-3.2', n: '3.2', desc: 'Sistema de comunicación efectivo entre rigger, operador y vigías' },
      ]},
    ]
  },
  {
    code: 'RC8', name: 'Trabajos con Energía Eléctrica',
    categories: [
      { number: '1', name: 'Aislamiento y Control de Energía', subpoints: [
        { id: 'RC8-1.1', n: '1.1', desc: 'Energía eléctrica del equipo/sistema bloqueada, rotulada y verificada (LOTO aplicado)' },
        { id: 'RC8-1.2', n: '1.2', desc: 'Ausencia de tensión verificada con equipo de medición calibrado y certificado' },
        { id: 'RC8-1.3', n: '1.3', desc: 'Puesta a tierra temporal instalada antes del inicio de trabajos' },
      ]},
      { number: '2', name: 'Equipos de Protección y Herramientas', subpoints: [
        { id: 'RC8-2.1', n: '2.1', desc: 'EPP dieléctrico completo: guantes, botas, casco y herramientas aisladas acordes a la tensión de trabajo' },
        { id: 'RC8-2.2', n: '2.2', desc: 'Área de trabajo delimitada con señalización de riesgo eléctrico' },
      ]},
      { number: '3', name: 'Autorización y Competencias', subpoints: [
        { id: 'RC8-3.1', n: '3.1', desc: 'Permiso de trabajo eléctrico firmado por electricista calificado y supervisor' },
        { id: 'RC8-3.2', n: '3.2', desc: 'Personal trabajando con calificación eléctrica vigente acorde al nivel de tensión' },
      ]},
    ]
  },
  {
    code: 'RC9', name: 'Manejo de Explosivos y Voladuras',
    categories: [
      { number: '1', name: 'Control de Acceso y Zona de Voladura', subpoints: [
        { id: 'RC9-1.1', n: '1.1', desc: 'Zona de voladura delimitada y evacuada en radio de seguridad establecido' },
        { id: 'RC9-1.2', n: '1.2', desc: 'Vigías ubicados en todos los accesos con comunicación efectiva con el tirador' },
        { id: 'RC9-1.3', n: '1.3', desc: 'Señales sonoras de alerta (sirenas) probadas y operativas antes de la voladura' },
      ]},
      { number: '2', name: 'Manejo y Almacenamiento', subpoints: [
        { id: 'RC9-2.1', n: '2.1', desc: 'Explosivos manipulados exclusivamente por personal con licencia SUCAMEC vigente' },
        { id: 'RC9-2.2', n: '2.2', desc: 'Detonadores y explosivos transportados en recipientes separados y homologados' },
        { id: 'RC9-2.3', n: '2.3', desc: 'Control de inventario de explosivos realizado al inicio y fin de jornada' },
      ]},
      { number: '3', name: 'Verificación Post-Voladura', subpoints: [
        { id: 'RC9-3.1', n: '3.1', desc: 'Tiempo de espera post-voladura cumplido (mínimo 30 minutos en voladura con mecha)' },
        { id: 'RC9-3.2', n: '3.2', desc: 'Inspección de zona post-voladura realizada por tirador antes de autorizar reingreso' },
        { id: 'RC9-3.3', n: '3.3', desc: 'Tiros cortados/fallidos identificados, registrados y tratados según procedimiento' },
      ]},
    ]
  },
  {
    code: 'RC10', name: 'Equipos Pesados Móviles',
    categories: [
      { number: '1', name: 'Inspección Pre-Operacional', subpoints: [
        { id: 'RC10-1.1', n: '1.1', desc: 'Inspección pre-operacional del equipo completada y firmada por el operador' },
        { id: 'RC10-1.2', n: '1.2', desc: 'Sistemas de frenos, dirección y luces verificados y operativos' },
        { id: 'RC10-1.3', n: '1.3', desc: 'Alarma de retroceso y cámara de visión trasera funcionando' },
      ]},
      { number: '2', name: 'Condiciones de Operación', subpoints: [
        { id: 'RC10-2.1', n: '2.1', desc: 'Operador con licencia interna y LICENCIA de conducir vigente para el tipo de equipo' },
        { id: 'RC10-2.2', n: '2.2', desc: 'Vías de tránsito con señalización, velocidades máximas visibles y en buen estado' },
        { id: 'RC10-2.3', n: '2.3', desc: 'Peatones separados del tránsito de equipos pesados (segregación física o vigías)' },
      ]},
    ]
  },
  {
    code: 'RC11', name: 'Excavaciones, Zanjas y Taludes',
    categories: [
      { number: '1', name: 'Evaluación Geotécnica y Entibado', subpoints: [
        { id: 'RC11-1.1', n: '1.1', desc: 'Evaluación del tipo de suelo y estabilidad realizada por persona competente' },
        { id: 'RC11-1.2', n: '1.2', desc: 'Entibado/apuntalamiento instalado en excavaciones > 1.5 m de profundidad' },
        { id: 'RC11-1.3', n: '1.3', desc: 'Taludes con ángulo de reposo seguro o terraplenes de material de relleno' },
      ]},
      { number: '2', name: 'Control de Acceso y Señalización', subpoints: [
        { id: 'RC11-2.1', n: '2.1', desc: 'Barrera física (cerco) instalada alrededor del perímetro de la excavación' },
        { id: 'RC11-2.2', n: '2.2', desc: 'Señalización de advertencia visible durante el día y la noche' },
        { id: 'RC11-2.3', n: '2.3', desc: 'Accesos y escaleras de emergencia instaladas (máx. 7.5 m de distancia)' },
      ]},
      { number: '3', name: 'Monitoreo Continuo', subpoints: [
        { id: 'RC11-3.1', n: '3.1', desc: 'Inspección diaria de taludes y estructuras de soporte antes de reiniciar trabajos' },
        { id: 'RC11-3.2', n: '3.2', desc: 'Sistema de drenaje operativo para evitar acumulación de agua en la excavación' },
      ]},
    ]
  },
  {
    code: 'RC12', name: 'Trabajos en Caliente (Soldadura / Corte)',
    categories: [
      { number: '1', name: 'Control de Atmósfera y Zona', subpoints: [
        { id: 'RC12-1.1', n: '1.1', desc: 'Área libre de materiales inflamables en radio de 11 metros o protegida con mantas ignífugas' },
        { id: 'RC12-1.2', n: '1.2', desc: 'Ventilación adecuada garantizada para dispersar humos y gases de soldadura/corte' },
        { id: 'RC12-1.3', n: '1.3', desc: 'Extintor operativo (mínimo PQS 6 kg) disponible en el punto de trabajo' },
      ]},
      { number: '2', name: 'Equipos y Protección Personal', subpoints: [
        { id: 'RC12-2.1', n: '2.1', desc: 'EPP específico para trabajos en caliente: careta de soldar, guantes cuero, delantal, polainas' },
        { id: 'RC12-2.2', n: '2.2', desc: 'Equipos de oxicorte inspeccionados: mangueras sin daños, válvulas antirretorno instaladas' },
      ]},
      { number: '3', name: 'Permisos y Vigías', subpoints: [
        { id: 'RC12-3.1', n: '3.1', desc: 'Permiso de trabajo en caliente firmado y vigente para la jornada' },
        { id: 'RC12-3.2', n: '3.2', desc: 'Vigía de fuego designado y presente durante toda la operación y 30 minutos posteriores' },
      ]},
    ]
  },
  {
    code: 'RC13', name: 'Sustancias Peligrosas (MATPEL)',
    categories: [
      { number: '1', name: 'Identificación y Etiquetado', subpoints: [
        { id: 'RC13-1.1', n: '1.1', desc: 'Todas las sustancias peligrosas identificadas y etiquetadas con rombo NFPA y ficha de datos de seguridad (HDS/SDS) disponible' },
        { id: 'RC13-1.2', n: '1.2', desc: 'Inventario actualizado de sustancias peligrosas en el área de trabajo' },
      ]},
      { number: '2', name: 'Almacenamiento y Manejo', subpoints: [
        { id: 'RC13-2.1', n: '2.1', desc: 'Almacenamiento en contenedores apropiados, compatibles y en buen estado' },
        { id: 'RC13-2.2', n: '2.2', desc: 'Segregación de sustancias incompatibles según matriz de compatibilidad química' },
        { id: 'RC13-2.3', n: '2.3', desc: 'Bandeja de contención instalada para derrames (mínimo 110% del volumen mayor)' },
      ]},
      { number: '3', name: 'Respuesta a Emergencias', subpoints: [
        { id: 'RC13-3.1', n: '3.1', desc: 'Kit de respuesta a derrames disponible y completo en el área de almacenamiento' },
        { id: 'RC13-3.2', n: '3.2', desc: 'Personal con capacitación en manejo y respuesta a emergencias con MATPEL' },
      ]},
    ]
  },
  {
    code: 'RC14', name: 'Aislamiento y Bloqueo de Energía (LOTO)',
    categories: [
      { number: '1', name: 'Procedimiento LOTO', subpoints: [
        { id: 'RC14-1.1', n: '1.1', desc: 'Procedimiento LOTO específico para el equipo/sistema disponible y conocido por el ejecutor' },
        { id: 'RC14-1.2', n: '1.2', desc: 'Todas las fuentes de energía identificadas: eléctrica, hidráulica, neumática, gravitacional, química y térmica' },
        { id: 'RC14-1.3', n: '1.3', desc: 'Energía residual disipada (presión, tensión, temperatura, gravedad) antes de iniciar trabajos' },
      ]},
      { number: '2', name: 'Dispositivos de Bloqueo', subpoints: [
        { id: 'RC14-2.1', n: '2.1', desc: 'Candado personal colocado por cada persona expuesta al riesgo (un candado por persona)' },
        { id: 'RC14-2.2', n: '2.2', desc: 'Tarjeta de advertencia (tag) colocada en cada punto de bloqueo con datos del ejecutor' },
        { id: 'RC14-2.3', n: '2.3', desc: 'Verificación de aislamiento exitoso realizada por el ejecutor antes del inicio (prueba de activación)' },
      ]},
    ]
  },
  {
    code: 'RC15', name: 'Herramientas Manuales y Eléctricas',
    categories: [
      { number: '1', name: 'Inspección de Herramientas', subpoints: [
        { id: 'RC15-1.1', n: '1.1', desc: 'Herramientas inspeccionadas antes del uso: sin grietas, mangos en buen estado, afilado adecuado' },
        { id: 'RC15-1.2', n: '1.2', desc: 'Herramientas eléctricas con cable de alimentación sin daños, sin empalmes improvisados' },
        { id: 'RC15-1.3', n: '1.3', desc: 'Guardas de seguridad de herramientas eléctricas (esmeriles, sierras) instaladas y operativas' },
      ]},
      { number: '2', name: 'Uso Seguro', subpoints: [
        { id: 'RC15-2.1', n: '2.1', desc: 'Herramientas utilizadas únicamente para el propósito para el que fueron diseñadas' },
        { id: 'RC15-2.2', n: '2.2', desc: 'EPP específico utilizado: careta facial para esmerilado, guantes anti-corte para sierra' },
      ]},
    ]
  },
  {
    code: 'RC16', name: 'Circulación Peatonal en Zonas de Operación',
    categories: [
      { number: '1', name: 'Segregación y Señalización', subpoints: [
        { id: 'RC16-1.1', n: '1.1', desc: 'Rutas peatonales señalizadas y físicamente separadas de vías de equipos pesados' },
        { id: 'RC16-1.2', n: '1.2', desc: 'Señalización de velocidad máxima visible en todas las vías de tránsito' },
        { id: 'RC16-1.3', n: '1.3', desc: 'Iluminación adecuada en áreas de tránsito nocturno y baja visibilidad' },
      ]},
      { number: '2', name: 'Control de Acceso', subpoints: [
        { id: 'RC16-2.1', n: '2.1', desc: 'Personal utilizando chaleco reflectivo de alta visibilidad en todo momento' },
        { id: 'RC16-2.2', n: '2.2', desc: 'Vigilantes o semáforos en cruces de vías peatonales y vehiculares de alto tráfico' },
      ]},
    ]
  },
  {
    code: 'RC17', name: 'Trabajos Nocturnos y con Visibilidad Reducida',
    categories: [
      { number: '1', name: 'Iluminación y Visibilidad', subpoints: [
        { id: 'RC17-1.1', n: '1.1', desc: 'Iluminación artificial suficiente en área de trabajo (mínimo según estándar de la tarea)' },
        { id: 'RC17-1.2', n: '1.2', desc: 'Equipos y vehículos con luces operativas: faros, luz de retroceso, balizas' },
        { id: 'RC17-1.3', n: '1.3', desc: 'Personal con chaleco o indumentaria reflectiva de alta visibilidad' },
      ]},
      { number: '2', name: 'Fatiga y Gestión del Turno', subpoints: [
        { id: 'RC17-2.1', n: '2.1', desc: 'Evaluación de fatiga del personal antes del inicio del turno nocturno' },
        { id: 'RC17-2.2', n: '2.2', desc: 'Cambios de guardia documentados con entrega formal de información de riesgos' },
      ]},
    ]
  },
  {
    code: 'RC18', name: 'Trabajos en o cerca del Agua',
    categories: [
      { number: '1', name: 'Equipos de Flotación y Rescate', subpoints: [
        { id: 'RC18-1.1', n: '1.1', desc: 'Chalecos salvavidas inspeccionados y disponibles para todo el personal expuesto' },
        { id: 'RC18-1.2', n: '1.2', desc: 'Aro salvavidas con cuerda instalado en puntos de trabajo cerca del agua' },
        { id: 'RC18-1.3', n: '1.3', desc: 'Embarcaciones con equipo de seguridad completo y operador competente cuando aplique' },
      ]},
      { number: '2', name: 'Condiciones y Supervisión', subpoints: [
        { id: 'RC18-2.1', n: '2.1', desc: 'Evaluación de caudal, corrientes y condiciones del agua antes del inicio de trabajos' },
        { id: 'RC18-2.2', n: '2.2', desc: 'Personal con competencia en natación o con flotador individual asignado' },
      ]},
    ]
  },
  {
    code: 'RC19', name: 'Radiaciones Ionizantes y No Ionizantes',
    categories: [
      { number: '1', name: 'Control de Zona y Dosimetría', subpoints: [
        { id: 'RC19-1.1', n: '1.1', desc: 'Zona de trabajo con radiación delimitada, señalizada con símbolo internacional de radiación' },
        { id: 'RC19-1.2', n: '1.2', desc: 'Dosímetros individuales asignados y en uso por todo personal expuesto' },
        { id: 'RC19-1.3', n: '1.3', desc: 'Fuentes radioactivas con acceso controlado y registro de custodia actualizado' },
      ]},
      { number: '2', name: 'Autorización y Competencias', subpoints: [
        { id: 'RC19-2.1', n: '2.1', desc: 'Permiso de uso de fuentes de radiación vigente emitido por autoridad competente (IPEN)' },
        { id: 'RC19-2.2', n: '2.2', desc: 'Operador de equipos de radiación con licencia y capacitación vigente' },
      ]},
    ]
  },
  {
    code: 'RC20', name: 'Exposición a Polvo y Sílice Respirable',
    categories: [
      { number: '1', name: 'Medidas de Control de Polvo', subpoints: [
        { id: 'RC20-1.1', n: '1.1', desc: 'Sistema de supresión de polvo (humectación, ventilación o captación) operativo' },
        { id: 'RC20-1.2', n: '1.2', desc: 'Monitoreo de polvo respirable realizado y resultado dentro de límites permisibles' },
      ]},
      { number: '2', name: 'Protección Respiratoria', subpoints: [
        { id: 'RC20-2.1', n: '2.1', desc: 'Respirador con filtro P100 o superior utilizado en áreas con concentración de sílice' },
        { id: 'RC20-2.2', n: '2.2', desc: 'Programa de protección respiratoria vigente: fit-test y capacitación del personal' },
      ]},
    ]
  },
  {
    code: 'RC21', name: 'Exposición a Ruido Ocupacional',
    categories: [
      { number: '1', name: 'Monitoreo y Control de Ruido', subpoints: [
        { id: 'RC21-1.1', n: '1.1', desc: 'Medición del nivel de ruido en el área realizada y registrada con dosímetro calibrado' },
        { id: 'RC21-1.2', n: '1.2', desc: 'Controles de ingeniería aplicados en fuentes de ruido cuando supera 85 dB(A)' },
      ]},
      { number: '2', name: 'Protección Auditiva', subpoints: [
        { id: 'RC21-2.1', n: '2.1', desc: 'Protección auditiva doble (tapones + orejeras) utilizada en zonas > 100 dB(A)' },
        { id: 'RC21-2.2', n: '2.2', desc: 'Audiometrías periódicas al día para el personal expuesto crónicamente' },
      ]},
    ]
  },
  {
    code: 'RC22', name: 'Manejo Manual de Cargas y Ergonomía',
    categories: [
      { number: '1', name: 'Evaluación de la Tarea', subpoints: [
        { id: 'RC22-1.1', n: '1.1', desc: 'Peso de carga dentro de límites seguros: máx. 25 kg hombre, 15 kg mujer (sin ayuda mecánica)' },
        { id: 'RC22-1.2', n: '1.2', desc: 'Técnica de levantamiento segura aplicada: espalda recta, carga cercana al cuerpo' },
      ]},
      { number: '2', name: 'Controles y Equipamiento', subpoints: [
        { id: 'RC22-2.1', n: '2.1', desc: 'Ayudas mecánicas disponibles para cargas que excedan los límites seguros' },
        { id: 'RC22-2.2', n: '2.2', desc: 'Personal sin condición osteomuscular activa que contraindicación el trabajo asignado' },
      ]},
    ]
  },
  {
    code: 'RC23', name: 'Exposición a Temperaturas Extremas',
    categories: [
      { number: '1', name: 'Monitoreo de Condiciones Ambientales', subpoints: [
        { id: 'RC23-1.1', n: '1.1', desc: 'Temperatura ambiental y/o índice WBGT medidos y dentro de rangos aceptables' },
        { id: 'RC23-1.2', n: '1.2', desc: 'Sistema de hidratación disponible: agua fresca y segura (mínimo 500 ml/hora en calor)' },
      ]},
      { number: '2', name: 'Controles y Vigilancia Médica', subpoints: [
        { id: 'RC23-2.1', n: '2.1', desc: 'Rotación de personal y pausas de descanso programadas para exposición al calor' },
        { id: 'RC23-2.2', n: '2.2', desc: 'Personal apto médicamente para trabajo en condiciones de temperatura extrema' },
      ]},
    ]
  },
  {
    code: 'RC24', name: 'Preparación y Respuesta a Emergencias',
    categories: [
      { number: '1', name: 'Plan y Recursos de Emergencia', subpoints: [
        { id: 'RC24-1.1', n: '1.1', desc: 'Plan de respuesta a emergencias del frente de trabajo actualizado y comunicado al personal' },
        { id: 'RC24-1.2', n: '1.2', desc: 'Botiquín de primeros auxilios completo y disponible en el área de trabajo' },
        { id: 'RC24-1.3', n: '1.3', desc: 'Número de emergencias y rutas de evacuación conocidos por todo el equipo' },
      ]},
      { number: '2', name: 'Simulacros y Competencias', subpoints: [
        { id: 'RC24-2.1', n: '2.1', desc: 'Al menos un integrante del equipo con certificación vigente en primeros auxilios' },
        { id: 'RC24-2.2', n: '2.2', desc: 'Simulacro de evacuación realizado en el frente de trabajo en los últimos 6 meses' },
      ]},
    ]
  },
  {
    code: 'RC25', name: 'Manejo y Transporte en Vehículos',
    categories: [
      { number: '1', name: 'Condiciones del Vehículo', subpoints: [
        { id: 'RC25-1.1', n: '1.1', desc: 'Inspección pre-operacional del vehículo realizada y firmada antes de partir' },
        { id: 'RC25-1.2', n: '1.2', desc: 'Cinturones de seguridad operativos para todos los ocupantes' },
        { id: 'RC25-1.3', n: '1.3', desc: 'Neumáticos con presión correcta, sin desgaste excesivo y en buen estado' },
      ]},
      { number: '2', name: 'Conductor y Comportamiento Vial', subpoints: [
        { id: 'RC25-2.1', n: '2.1', desc: 'Conductor con licencia de conducir vigente habilitada para el tipo de vehículo' },
        { id: 'RC25-2.2', n: '2.2', desc: 'Prohibición de uso de celular y conducción bajo efecto de alcohol/drogas verificada' },
        { id: 'RC25-2.3', n: '2.3', desc: 'Límites de velocidad respetados según el tipo de vía (mapa de velocidades vigente)' },
      ]},
    ]
  },
  {
    code: 'RC26', name: 'Caída de Rocas y Derrumbes',
    categories: [
      { number: '1', name: 'Evaluación Geomecánica', subpoints: [
        { id: 'RC26-1.1', n: '1.1', desc: 'Evaluación geomecánica del tajo/frente realizada por geomecánico competente' },
        { id: 'RC26-1.2', n: '1.2', desc: 'Sostenimiento primario (pernos, mallas, shotcrete) instalado según diseño geotécnico' },
        { id: 'RC26-1.3', n: '1.3', desc: 'Desatado de rocas sueltas realizado antes de iniciar trabajos en el frente' },
      ]},
      { number: '2', name: 'Monitoreo y Alarmas', subpoints: [
        { id: 'RC26-2.1', n: '2.1', desc: 'Sistema de monitoreo de deformaciones activo en zonas de alto riesgo geotécnico' },
        { id: 'RC26-2.2', n: '2.2', desc: 'Protocolo de evacuación ante señales de inestabilidad conocido por todo el personal' },
      ]},
    ]
  },
  {
    code: 'RC27', name: 'Sistemas a Presión (Hidráulica / Neumática)',
    categories: [
      { number: '1', name: 'Inspección y Mantenimiento', subpoints: [
        { id: 'RC27-1.1', n: '1.1', desc: 'Mangueras hidráulicas/neumáticas inspeccionadas: sin burbujas, grietas o uniones improvisadas' },
        { id: 'RC27-1.2', n: '1.2', desc: 'Válvulas de alivio de presión calibradas y certificadas dentro de período de vigencia' },
        { id: 'RC27-1.3', n: '1.3', desc: 'Presión de trabajo dentro de los límites máximos del equipo/componente' },
      ]},
      { number: '2', name: 'Despresurización Antes de Trabajos', subpoints: [
        { id: 'RC27-2.1', n: '2.1', desc: 'Sistema completamente despresurizado antes de realizar mantenimiento o conexiones' },
        { id: 'RC27-2.2', n: '2.2', desc: 'Personal posicionado fuera del plano de riesgo de fugas de presión durante operación' },
      ]},
    ]
  },
  {
    code: 'RC28', name: 'Prevención y Control de Incendios',
    categories: [
      { number: '1', name: 'Equipos de Extinción', subpoints: [
        { id: 'RC28-1.1', n: '1.1', desc: 'Extintores del tipo y capacidad adecuados disponibles, cargados y con fecha de recarga vigente' },
        { id: 'RC28-1.2', n: '1.2', desc: 'Sistema fijo de supresión de incendios (sprinklers, FM-200) operativo cuando aplique' },
      ]},
      { number: '2', name: 'Prevención y Control de Ignición', subpoints: [
        { id: 'RC28-2.1', n: '2.1', desc: 'Materiales inflamables almacenados en cantidad mínima necesaria y en contenedores homologados' },
        { id: 'RC28-2.2', n: '2.2', desc: 'Instalaciones eléctricas sin sobrecargas, empalmes expuestos ni cableado dañado' },
        { id: 'RC28-2.3', n: '2.3', desc: 'Personal con capacitación en uso de extintores y procedimiento de evacuación ante incendio' },
      ]},
    ]
  },
  {
    code: 'RC29', name: 'Perforación en Roca',
    categories: [
      { number: '1', name: 'Inspección del Equipo Perforador', subpoints: [
        { id: 'RC29-1.1', n: '1.1', desc: 'Equipo perforador con inspección pre-operacional realizada y firmada' },
        { id: 'RC29-1.2', n: '1.2', desc: 'Barrenos y brocas en buen estado, sin desgaste excesivo ni deformaciones' },
        { id: 'RC29-1.3', n: '1.3', desc: 'Sistema de lubricación y refrigeración del equipo operativo' },
      ]},
      { number: '2', name: 'Condiciones de Perforación', subpoints: [
        { id: 'RC29-2.1', n: '2.1', desc: 'Área de trabajo libre de personal no autorizado en radio de seguridad de perforación' },
        { id: 'RC29-2.2', n: '2.2', desc: 'Sistema de control de polvo (agua/captación) operativo durante la perforación' },
        { id: 'RC29-2.3', n: '2.3', desc: 'Operador con capacitación vigente en operación segura del equipo de perforación' },
      ]},
    ]
  },
  {
    code: 'RC30', name: 'Voladuras Secundarias y Petardeo',
    categories: [
      { number: '1', name: 'Control de Zona de Petardeo', subpoints: [
        { id: 'RC30-1.1', n: '1.1', desc: 'Área de petardeo delimitada y evacuada en radio de seguridad establecido' },
        { id: 'RC30-1.2', n: '1.2', desc: 'Vigías en todos los accesos con comunicación de radio verificada' },
        { id: 'RC30-1.3', n: '1.3', desc: 'Señales de alerta (sirenas/bocinas) probadas antes del inicio de la operación' },
      ]},
      { number: '2', name: 'Ejecución y Verificación', subpoints: [
        { id: 'RC30-2.1', n: '2.1', desc: 'Explosivos y accesorios manejados por personal con licencia SUCAMEC vigente' },
        { id: 'RC30-2.2', n: '2.2', desc: 'Verificación post-petardeo realizada antes de autorizar reingreso al área' },
      ]},
    ]
  },
  {
    code: 'RC31', name: 'Trabajos con Concreto y Productos Cementosos',
    categories: [
      { number: '1', name: 'Manejo Seguro del Material', subpoints: [
        { id: 'RC31-1.1', n: '1.1', desc: 'Personal con EPP adecuado: guantes de nitrilo, botas impermeables, gafas de protección' },
        { id: 'RC31-1.2', n: '1.2', desc: 'Exposición dérmica y ocular al cemento húmedo prevenida durante todo el proceso' },
      ]},
      { number: '2', name: 'Equipos y Procesos', subpoints: [
        { id: 'RC31-2.1', n: '2.1', desc: 'Mixer/bomba de concreto inspeccionado antes del uso; guardas de seguridad instaladas' },
        { id: 'RC31-2.2', n: '2.2', desc: 'Encofrados y estructuras de soporte verificados por persona competente antes de vaciado' },
        { id: 'RC31-2.3', n: '2.3', desc: 'Vibrador de concreto en buen estado; operador con EPPS anti-vibración cuando aplique' },
      ]},
    ]
  },
  {
    code: 'RC32', name: 'Gestión y Manejo de Residuos Peligrosos',
    categories: [
      { number: '1', name: 'Clasificación y Etiquetado', subpoints: [
        { id: 'RC32-1.1', n: '1.1', desc: 'Residuos peligrosos clasificados, etiquetados y almacenados por tipo e incompatibilidad' },
        { id: 'RC32-1.2', n: '1.2', desc: 'Manifiesto de residuos peligrosos actualizado y firmado por persona responsable' },
      ]},
      { number: '2', name: 'Almacenamiento Temporal', subpoints: [
        { id: 'RC32-2.1', n: '2.1', desc: 'Área de almacenamiento temporal techada, ventilada, con piso impermeabilizado y señalizada' },
        { id: 'RC32-2.2', n: '2.2', desc: 'Tiempo de almacenamiento dentro del límite legal (máx. 6 meses según OEFA)' },
      ]},
      { number: '3', name: 'Disposición y Transporte', subpoints: [
        { id: 'RC32-3.1', n: '3.1', desc: 'Empresa transportista de residuos peligrosos con registro MINEM/OEFA vigente' },
        { id: 'RC32-3.2', n: '3.2', desc: 'Empresa operadora de disposición final con autorización vigente' },
        { id: 'RC32-3.3', n: '3.3', desc: 'Certificado de disposición final recibido y archivado dentro del plazo reglamentario' },
      ]},
    ]
  },
];

module.exports = RC_CATALOG;
