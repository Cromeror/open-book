# OpenBook | Gestión transparente de copropiedades

## 1. Problemática

En las unidades residenciales es común realizar actividades para recolectar dinero con distintos fines, como mantenimiento de zonas comunes, mejoras de infraestructura o eventos comunitarios. Estas actividades suelen incluir rifas, donaciones voluntarias o aportes comprometidos por cada apartamento.

Actualmente, estos procesos presentan varias dificultades:

- Falta de transparencia en el manejo del dinero recaudado.
- Ausencia de un registro centralizado y confiable de los aportes.
- Dificultad para conocer el avance real frente a un objetivo económico.
- Confusión entre aportes comprometidos y aportes efectivamente realizados.
- Dependencia de registros manuales (papel, hojas de cálculo, mensajes informales).
- Desconfianza entre residentes y administración por falta de trazabilidad.

Estas problemáticas afectan la participación de los residentes y la credibilidad de la administración.

---

## 2. Objetivo del Proyecto

Diseñar e implementar un sistema de software que permita gestionar de forma clara, transparente y auditable las actividades de recaudo de dinero en copropiedades, facilitando el control de los aportes y el seguimiento en tiempo real del avance hacia los objetivos económicos definidos.

---

## 3. Alcance del Sistema

El sistema permitirá:

- Definir objetivos monetarios de recaudo.
- Asociar múltiples actividades de recaudo a un mismo objetivo.
- Registrar compromisos de aporte por apartamento.
- Registrar aportes reales realizados por los residentes.
- Calcular automáticamente el avance del recaudo.
- Proveer información clara y accesible para todos los involucrados.
- Mantener trazabilidad y control sobre los registros financieros.

---

## 4. Conceptos Clave del Dominio

### 4.1 Objetivo de Recaudo
Representa la meta económica que se desea alcanzar.

Ejemplos de atributos:
- Nombre del objetivo
- Descripción
- Monto objetivo
- Fecha de inicio y fin
- Estado (activo / finalizado)

---

### 4.2 Actividades de Recaudo
Acciones mediante las cuales se obtiene el dinero para cumplir un objetivo.

Ejemplos:
- Rifas
- Donaciones
- Eventos comunitarios
- Ventas

Cada actividad está asociada a un objetivo de recaudo.

---

### 4.3 Apartamentos / Unidades Residenciales
Identifican a los aportantes dentro de la copropiedad.

Ejemplos de atributos:
- Número de apartamento
- Torre o bloque
- Estado (activo / inactivo)

---

### 4.4 Compromisos de Aporte
Registro de la intención o responsabilidad asumida por un apartamento frente a una actividad.

Características:
- Monto comprometido
- Actividad asociada
- Estado del compromiso (pendiente, parcial, cumplido)

> Un compromiso no representa un ingreso real hasta que se registra un aporte efectivo.

---

### 4.5 Aportes Reales
Registro contable del dinero efectivamente recibido.

Ejemplos de atributos:
- Apartamento
- Actividad
- Monto aportado
- Fecha
- Medio de pago
- Observaciones
- Soporte o comprobante (opcional)

---

## 5. Cálculo de Avance del Objetivo

El sistema calcula automáticamente el progreso del recaudo:

- Total recaudado: suma de todos los aportes reales.
- Faltante: diferencia entre el monto objetivo y el monto recaudado.
- Porcentaje de avance: (recaudado / objetivo) × 100.

Ejemplo:
- Objetivo: $100
- Recaudado: $55
- Avance: 55%
- Faltante: $45

---

## 6. Principios de Transparencia

El diseño del sistema se rige por los siguientes principios:

- **Trazabilidad:** todo aporte queda registrado con fecha y responsable.
- **Inmutabilidad:** los aportes no se eliminan; solo pueden corregirse con justificación.
- **Auditoría:** historial de cambios y modificaciones.
- **Claridad:** diferenciación explícita entre compromisos y aportes reales.
- **Acceso controlado:** información visible según rol del usuario.

---

## 7. Funcionalidades Principales

### Para la Administración
- Crear y gestionar objetivos de recaudo.
- Crear y administrar actividades de recaudo.
- Registrar compromisos por apartamento.
- Registrar aportes reales.
- Consultar reportes y estados de avance.
- Exportar información para fines contables o legales.

#### Gestión de Visibilidad de Estados de Cuenta

La administración tiene facultades especiales para gestionar la visibilidad de los estados de cuenta de los residentes:

- **Modificación con justa causa:** Los administradores podrán cambiar la visibilidad de los estados de cuenta de un residente únicamente cuando exista una causa justificada y documentada, conforme a la legislación de tratamiento de la información (Ley 1581 de 2012).
- **Causales válidas:** Entre las causales se incluyen:
  - Orden judicial o requerimiento de autoridad competente.
  - Solicitud formal del titular de la información a través del sistema de PQR.
  - Protección de derechos fundamentales del titular.
  - Incumplimiento de términos y condiciones por parte del residente.
- **Registro obligatorio:** Toda modificación realizada por la administración debe quedar registrada con:
  - Fecha y hora de la modificación.
  - Administrador responsable.
  - Justificación detallada.
  - Soporte documental (si aplica).
- **Notificación al titular:** El residente debe ser notificado de cualquier cambio en la visibilidad de sus estados de cuenta realizado por la administración.

---

### Para los Residentes
- Consultar objetivos activos y finalizados.
- Visualizar el avance del recaudo.
- Consultar su historial de aportes.
- Ver el impacto de su contribución en el objetivo general.

#### Visibilidad de Estados de Cuenta

El sistema permite a los residentes gestionar la visibilidad de sus estados de cuenta con las siguientes consideraciones:

**Configuración inicial (registro):**
- Al momento del registro, el residente puede optar por hacer **públicos** sus estados de cuenta.
- Esta decisión debe ser **expresa y clara**, cumpliendo con los requisitos de consentimiento informado establecidos en la legislación de protección de datos personales (Ley 1581 de 2012 - Habeas Data).
- Si el residente opta por estados de cuenta públicos, podrá acceder a los estados de cuenta públicos de todos los demás residentes que hayan dado el mismo consentimiento.

**Cambio de visibilidad:**
- El cambio de visibilidad de estados de cuenta no es inmediato ni reversible de forma unilateral:
  - **De público a privado:** Requiere una solicitud formal a través del sistema de PQR dirigida a la administración.
  - **De privado a público:** Igualmente requiere una solicitud formal a través del sistema de PQR.
- Este mecanismo garantiza la trazabilidad de las decisiones y protege los derechos de los titulares de la información.

**Acceso a estados de cuenta públicos:**
- Solo los residentes que hayan configurado sus propios estados de cuenta como públicos pueden ver los estados de cuenta públicos de otros residentes.
- Este principio de reciprocidad fomenta la transparencia voluntaria y equitativa.

---

## 8. Beneficios del Sistema

- Mayor confianza entre administración y residentes.
- Información centralizada y organizada.
- Reducción de errores manuales.
- Seguimiento en tiempo real de los recaudos.
- Base documental para auditorías y rendición de cuentas.
- Incremento en la participación comunitaria.

---

## 9. Sistema de PQR (Peticiones, Quejas y Reclamos)

El sistema incluye un módulo de PQR para gestionar solicitudes formales de los residentes:

**Tipos de solicitudes:**
- **Peticiones:** Solicitudes de información, cambios de configuración (como visibilidad de estados de cuenta), o servicios.
- **Quejas:** Inconformidades sobre el funcionamiento del sistema o la gestión administrativa.
- **Reclamos:** Solicitudes de corrección de información o revisión de decisiones.

**Características del módulo:**
- Radicación automática con número de seguimiento.
- Tiempos de respuesta definidos según tipo de solicitud.
- Trazabilidad completa del proceso.
- Notificaciones al solicitante sobre el estado de su PQR.
- Historial de solicitudes por residente.

**Integración con visibilidad de estados de cuenta:**
- Las solicitudes de cambio de visibilidad (público ↔ privado) se tramitan exclusivamente a través de este módulo.
- La administración debe responder y documentar cada solicitud.

---

## 10. Proyección Futura

El sistema podrá evolucionar para incluir:

- Integración con plataformas de pago digital.
- Reportes automáticos periódicos.
- Notificaciones de avance y cierre de objetivos.
- Certificados de aporte.
- Paneles públicos de consulta (solo lectura).
- Integración con sistemas contables de la copropiedad.

---

## 11. Enfoque del Proyecto

Este proyecto no busca ser únicamente un registro contable, sino una herramienta de **gestión, control y transparencia**, diseñada específicamente para las necesidades reales de las copropiedades.

