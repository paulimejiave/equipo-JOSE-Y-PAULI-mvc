/**
 * VISTA · Notas del semestre                                             (PARTE 3 de la guía)
 *
 * SABE: dibujar el estado del Modelo en el DOM y avisar qué hizo el usuario (clics, formularios).
 * NO SABE: ninguna regla de negocio, ni cambiar el Modelo, ni guardar datos.
 *
 * Lee del Modelo (solo lectura) y se suscribe a sus cambios para redibujarse sola.
 * El HTML estático (formulario, tabla, resumen) ya está en index.html: aquí solo se rellena y se escucha.
 */

export class NotasVista {
  #modelo;
  #el;

  constructor(raiz, modelo) {
    this.#modelo = modelo;
    
    // 3A: Busca en `raiz` los elementos y los guarda en this.#el
    this.#el = {
      form: raiz.querySelector('#form'),
      nombre: raiz.querySelector('#nombre'),
      peso: raiz.querySelector('#peso'),
      nota: raiz.querySelector('#nota'),
      error: raiz.querySelector('#error'),
      tabla: raiz.querySelector('#tabla'),
      vacio: raiz.querySelector('#vacio'),
      acumulado: raiz.querySelector('#acumulado'),
      pesoCalificado: raiz.querySelector('#pesoCalificado'),
      pesoPendiente: raiz.querySelector('#pesoPendiente'),
      necesaria: raiz.querySelector('#necesaria'),
      estado: raiz.querySelector('#estado'),
    };

    // Suscripción al Modelo para redibujarse sola y renderizado inicial
    this.#modelo.suscribir(() => {
      this.render();
    });
    this.render();
  }

  // ---------------------------------------------------------- 3B · Eventos que la Vista ofrece

  alAgregar(manejador) {
    // 3B: Escucha el envío del formulario sin recargar la página
    this.#el.form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      manejador(this.leerFormulario());
    });
  }

  alEliminar(manejador) {
    this.#el.tabla.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-eliminar]');
      if (boton) manejador(Number(boton.dataset.eliminar));
    });
  }

  alCalificar(manejador) {
    // 3B: Escucha el cambio en los inputs de nota de la tabla
    this.#el.tabla.addEventListener('change', (evento) => {
      const input = evento.target.closest('input[data-nota]');
      if (input) {
        const id = Number(input.dataset.nota);
        const valor = input.value.trim() === '' ? null : Number(input.value);
        manejador(id, valor);
      }
    });
  }

  // ---------------------------------------------------------- 3C · Órdenes que la Vista obedece

  leerFormulario() {
    return {
      nombre: this.#el.nombre.value,
      peso: this.#el.peso.value,
      nota: this.#el.nota.value,
    };
  }

  limpiarFormulario() {
    this.#el.nombre.value = '';
    this.#el.peso.value = '';
    this.#el.nota.value = '';
  }

  mostrarError(mensaje) {
    this.#el.error.textContent = mensaje;
  }

  limpiarError() {
    this.#el.error.textContent = '';
  }

  // ---------------------------------------------------------- 3D · Dibujar

  render() {
    const evaluaciones = this.#modelo.evaluaciones;
    const resumen = this.#modelo.resumen();

    // 1. Dibujar la tabla
    this.#el.tabla.innerHTML = '';
    if (evaluaciones.length === 0) {
      this.#el.vacio.hidden = false;
    } else {
      this.#el.vacio.hidden = true;
      for (const e of evaluaciones) {
        const tr = document.createElement('tr');

        // Nombre (usando textContent por seguridad)
        const tdNombre = document.createElement('td');
        tdNombre.textContent = e.nombre;
        tr.appendChild(tdNombre);

        // Peso
        const tdPeso = document.createElement('td');
        tdPeso.textContent = `${e.peso} %`;
        tr.appendChild(tdPeso);

        // Input de nota
        const tdNota = document.createElement('td');
        const inputNota = document.createElement('input');
        inputNota.type = 'number';
        inputNota.step = '0.1';
        inputNota.min = '0';
        inputNota.max = '5';
        inputNota.value = e.nota !== null && e.nota !== undefined ? e.nota : '';
        inputNota.dataset.nota = e.id;
        tdNota.appendChild(inputNota);
        tr.appendChild(tdNota);

        // Aporte
        const tdAporte = document.createElement('td');
        if (e.nota !== null && e.nota !== undefined) {
          const aporte = (e.peso * e.nota) / 100;
          tdAporte.textContent = aporte.toFixed(2);
        } else {
          tdAporte.textContent = '—';
        }
        tr.appendChild(tdAporte);

        // Botón Eliminar
        const tdAccion = document.createElement('td');
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.dataset.eliminar = e.id;
        tdAccion.appendChild(btnEliminar);
        tr.appendChild(tdAccion);

        this.#el.tabla.appendChild(tr);
      }
    }

    // 2. Dibujar el resumen
    this.#el.acumulado.textContent = resumen.acumulado.toFixed(2);
    
    const redondearPeso = (p) => Math.round(p * 100) / 100;
    this.#el.pesoCalificado.textContent = `${redondearPeso(resumen.pesoCalificado)} %`;
    this.#el.pesoPendiente.textContent = `${redondearPeso(resumen.pesoPendiente)} %`;

    if (resumen.notaNecesaria !== null) {
      this.#el.necesaria.textContent = resumen.notaNecesaria.toFixed(2);
    } else {
      this.#el.necesaria.textContent = '—';
    }

    // 3. Estado y clases CSS
    const estadoEl = this.#el.estado;
    estadoEl.className = ''; // Limpiar clases anteriores

    if (resumen.estado === 'aprobado') {
      estadoEl.textContent = '¡Aprobado! Ya aseguraste la nota mínima.';
      estadoEl.className = 'estado ok';
    } else if (resumen.estado === 'en-camino') {
      estadoEl.textContent = `En camino: necesitas ${resumen.notaNecesaria?.toFixed(2)} en lo que falta.`;
      estadoEl.className = 'estado en-camino';
    } else if (resumen.estado === 'en-riesgo') {
      estadoEl.textContent = `En riesgo: necesitas ${resumen.notaNecesaria?.toFixed(2)} en lo que falta.`;
      estadoEl.className = 'estado riesgo';
    } else if (resumen.estado === 'imposible') {
      estadoEl.textContent = 'Imposible aprobar con las notas actuales.';
      estadoEl.className = 'estado imposible';
    }
  }
}