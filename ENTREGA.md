# Entrega · Laboratorio MVC · Notas del semestre

**Equipo:** equipo-JOSE-Y-PAULI-mvc
**Integrantes:** Jose Maria Perez Silva y Paulina Mejia Velez
**Repositorio:** https://github.com/paulimejiave/equipo-JOSE-Y-PAULI-mvc.git 

> Completa este archivo a medida que avanzas (cada sección dice en qué parte de la guía se llena).
> Escribe con tus palabras: las respuestas copiadas de la guía o de otro equipo no cuentan.

---

## 1. Mapa de responsabilidades (Parte 1)

Clasifica cada fragmento de `espagueti.html`: **M** (Modelo), **V** (Vista), **C** (Controlador) o **Mezcla**
(en ese caso, escribe qué roles se mezclan). En "¿Por qué?" justifica en una frase.

| # | Fragmento | Rol(es) | ¿Por qué? |
|---|---|---|---|
| 1 | `var n = document.getElementById('nombre').value.trim();` | V | Lee directamente los valores de la pantalla. |
| 2 | `if (isNaN(p) \|\| p < 1 \|\| p > 100) { err.textContent = 'El peso debe estar entre 1 y 100.'; return; }` | M | Valida una regla de negocio sobre los datos numéricos. |
| 3 | `if (total + p > 100) { err.textContent = '...'; return; }` | M + V | Valida una regla de negocio y actualiza la interfaz de error a la vez. |
| 4 | `evals.push({ id: sig++, nombre: n, peso: p, nota: nota });` | M | Modifica directamente los datos y el estado interno. |
| 5 | `localStorage.setItem('notas.v1', JSON.stringify(evals));` | M | Gestiona el almacenamiento y la persistencia de los datos. |
| 6 | `document.getElementById('nombre').value = '';` | V | Manipula y limpia elementos directamente en el DOM. |
| 7 | `'<input ... onchange="ponerNota(' + e.id + ', this.value)">'` | V + C | Incrusta lógica de control y eventos directamente dentro del HTML generado. |
| 8 | `nec = Math.ceil(nec * 100 - 1e-9) / 100;` | M | Realiza cálculos matemáticos puros para las notas. |
| 9 | `if (acum + 1e-9 >= 3.0) { txt = '¡Aprobado! ...'; cls = 'ok'; }` | M + V | Calcula el estado del negocio y define clases visuales de la vista. |
| 10 | `document.getElementById('tabla').innerHTML = filas;` | V | Dibuja y renderiza la estructura HTML de la tabla en pantalla. |
| 11 | `function borrar(id) { ...splice...; localStorage.setItem(...); pintar(); }` | M + V + C | Modifica datos, guarda en disco y redibuja la pantalla en una sola función. |
| 12 | `(e.peso * e.nota / 100).toFixed(2)` | M | Calcula el aporte porcentual de la nota mediante operaciones matemáticas. |

## 2. Olores del espagueti (Parte 1)

Lista **al menos 5** problemas de diseño de `espagueti.html`. Para cada uno, escribe qué consecuencia tiene
cuando el proyecto crece y en qué pieza de MVC viviría la solución.

| Olor | Consecuencia | Dónde se arregla (M, V o C) |
|---|---|---|
| Valores mágicos repetidos | El 3.0 y el 100 están regados por todas partes; si cambian, toca buscarlos uno por uno corriendo riesgo de fallar. | Modelo (M) |
| Manipulación de HTML con innerHTML | Riesgo de seguridad (XSS) y errores visuales al inyectar texto del usuario sin sanitizar. | Vista (V) |
| Funciones multitarea (Acoplamiento) | Es imposible hacer pruebas automáticas sin levantar toda la interfaz y el navegador. | Modelo (M) |
| Almacenamiento disperso | Las llamadas a localStorage están mezcladas con la lógica de los botones y la interfaz. | Modelo (M) |
| Dependencia directa del DOM | Las reglas matemáticas dependen de que existan inputs físicos en pantalla para poder funcionar. | Modelo (M) |

## 3. El flujo de «agregar una evaluación» (Parte 6)

[Diagrama de flujo del MVC](./Imagenes/Diagrama.png) 

## 4. Evidencias (Partes 2, 3, 4 y 6)

[Salida npm test](./Imagenes/npmtest.jpeg)

[Salida npm run arquitectura](./Imagenes/npmarquitectura.jpeg)

[App Vistas](./Imagenes/vistas.jpeg) 

## 5. Tres cambios, tres lugares (Parte 5)

Después de cada cambio ejecuta `git diff --stat HEAD~1` (o `git show --stat`) y pega el resultado.
La idea: **cada cambio debía tocar solo las piezas que le corresponden**.

| Cambio | Archivos que tocaste | ¿Era lo esperado? ¿Por qué? |
|---|---|---|
| 5A · Nombres únicos | src/modelo.js | Sí, porque la validación de nombres repetidos y las reglas del dominio pertenecen estrictamente al Modelo. |
| 5B · Segunda vista (termómetro) | src/termometro-vista.js<br>src/main.js | Sí. Se creó un archivo nuevo exclusivo para la vista gráfica del termómetro y solo se conectó en la raíz de composición (`main.js`), sin alterar la lógica de negocio. |
| 5C · Otro almacén | src/almacen.js<br>src/main.js | Sí, ya que el almacenamiento es una pieza independiente (contrato de persistencia) y solo requirió añadir la clase con `sessionStorage` e inyectarla en la composición principal. |

**Evidencias de los cambios (git show --stat):**

 5A:
 src/modelo.js | 3 +++
 1 file changed, 3 insertions(+)

 5B:
 src/main.js             | 4 +++-
 src/termometro-vista.js | 38 ++++++++++++++++++++++++++++++++++++++
 2 files changed, 41 insertions(+), 1 deletion(-)

 5C:
 src/almacen.js | 15 +++++++++++++++
 src/main.js    |  4 ++--
 2 files changed, 17 insertions(+), 4 deletions(-)

## 6. Reflexión (Parte 6)

1. En la versión espagueti, ¿qué tuviste que leer o tocar para entender dónde se decide si el estudiante aprobó? ¿Y en la versión MVC?
   * **Respuesta:** En la versión espagueti era necesario leer e inspeccionar todo el archivo desordenado donde se mezclaba la lógica de datos con el DOM y los eventos. En la versión MVC, la lógica de negocio y aprobación está encapsulada y clara en un solo lugar: el método `resumen()` dentro de `src/modelo.js`.

2. ¿Por qué el Modelo **no** debe llamar a `alert()` ni a `document`? ¿Qué pasaría con las pruebas del Modelo si lo hiciera?
   * **Respuesta:** Porque el Modelo representa puramente las reglas de negocio y debe ser completamente agnóstico de la interfaz de usuario. Si dependiera del DOM o de `alert()`, las pruebas automáticas en Node.js fallarían o requerirían un navegador simulado, perdiendo la rapidez y limpieza de las pruebas unitarias.

3. El Modelo avisa de sus cambios sin saber quién escucha (Observer). ¿Qué ganamos con eso frente a que el Modelo llame directamente a `vista.render()`?
   * **Respuesta:** Ganamos desacoplamiento total. El modelo no necesita conocer ni importar a las vistas de forma rígida; simplemente emite un aviso. Esto permite que múltiples vistas (como la tabla principal y el termómetro) se actualicen de manera simultánea sin que el núcleo del negocio dependa de ellas.

4. Elige un olor de MVC (controlador gordo, lógica en la Vista, Modelo que toca la pantalla, Modelo anémico) que te hubiera sido fácil cometer hoy. ¿Cuál y cómo lo evitaron?
   * **Respuesta:** El controlador gordo. Era fácil caer en la tentación de poner allí las validaciones de negocio o los cálculos matemáticos. Lo evitamos manteniendo al Controlador delgado, limitándolo estrictamente a escuchar la vista, invocar al modelo y manejar errores.

5. ¿Para qué tipo de aplicación **no** usarías MVC? Justifica con lo que viste en el laboratorio.
   * **Respuesta:** No lo usaría para microservicios backend puros sin interfaz gráfica, scripts de automatización sencillos o procesamiento de datos por lotes, ya que la separación estricta de vistas y controladores añadiría una complejidad innecesaria donde no existe interacción visual con el usuario.