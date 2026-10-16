import { ErrorDeReglas } from './modelo.js';

export class NotasControlador {
  #modelo;
  #vista;

  constructor(modelo, vista) {
    this.#modelo = modelo;
    this.#vista = vista;

    // 4A: Registrarse en los eventos que la Vista ofrece
    this.#vista.alAgregar((datos) => {
      this.#intentar(() => {
        const pesoNum = Number(datos.peso);
        const notaNum = datos.nota.trim() === '' ? null : Number(datos.nota);

        this.#modelo.agregar({
          nombre: datos.nombre,
          peso: pesoNum,
          nota: notaNum,
        });

        this.#vista.limpiarFormulario();
      });
    });

    this.#vista.alEliminar((id) => {
      this.#intentar(() => {
        this.#modelo.eliminar(id);
      });
    });

    this.#vista.alCalificar((id, nota) => {
      this.#intentar(() => {
        this.#modelo.calificar(id, nota);
      });
    });
  }

  /**
   * 4B: Método auxiliar para ejecutar órdenes al Modelo,
   * limpiar errores si sale bien, o mostrarlos si lanza ErrorDeReglas.
   */
  #intentar(accion) {
    try {
      this.#vista.limpiarError();
      accion();
    } catch (error) {
      if (error instanceof ErrorDeReglas) {
        this.#vista.mostrarError(error.message);
        // Si falla al calificar una fila, forzamos el render para que el input vuelva al valor válido anterior
        if (error.message.includes('nota')) {
          this.#vista.render();
        }
      } else {
        throw error; // Los errores que no son de reglas no se esconden: se vuelven a lanzar.
      }
    }
  }
}