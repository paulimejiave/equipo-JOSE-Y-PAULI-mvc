import { NOTA_MINIMA, NOTA_MAXIMA } from './modelo.js';

export class TermometroVista {
  #modelo;
  #el;

  constructor(raiz, modelo) {
    this.#modelo = modelo;

    // 1. Estructura interna del termómetro dentro del contenedor raíz (#termometro)
    raiz.innerHTML = `
      <div class="termometro">
        <div class="relleno"></div>
        <div class="linea"></div>
      </div>
      <p class="leyenda"></p>
    `;

    this.#el = {
      relleno: raiz.querySelector('.relleno'),
      linea: raiz.querySelector('.linea'),
      leyenda: raiz.querySelector('.leyenda'),
    };

    // Ubicar la línea de la nota mínima de manera porcentual
    const porcentajeMinimo = (NOTA_MINIMA / NOTA_MAXIMA) * 100;
    this.#el.linea.style.left = `${porcentajeMinimo}%`;

    // 2. Suscribirse al Modelo y dibujar una primera vez
    this.#modelo.suscribir(() => {
      this.render();
    });
    this.render();
  }

  render() {
    const resumen = this.#modelo.resumen();
    const acumulado = resumen.acumulado;

    // El ancho del relleno se calcula según el acumulado, sin pasar del 100%
    const porcentajeAncho = Math.min(100, Math.max(0, (acumulado / NOTA_MAXIMA) * 100));
    this.#el.relleno.style.width = `${porcentajeAncho}%`;

    // Leyenda descriptiva
    this.#el.leyenda.textContent = `${acumulado.toFixed(2)} de ${NOTA_MAXIMA.toFixed(1)} · la línea marca el mínimo para aprobar (${NOTA_MINIMA.toFixed(1)})`;
  }
}