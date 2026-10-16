/**
 * MODELO · Notas del semestre                                                   (PARTE 2 de la guía)
 *
 * SABE: qué es una evaluación, las reglas (pesos, rangos, nota mínima) y cómo se calcula el resumen.
 * NO SABE: que existe una pantalla, el DOM, localStorage, alert()... Por eso se prueba sin navegador.
 *
 * Se comunica con el resto SIN conocerlo: avisa de sus cambios con el patrón Observer (suscribir).
 *
 * Tu trabajo: reemplazar cada "TODO" por código real hasta que `npm run test:modelo` quede en verde.
 * Las reglas exactas y los mensajes de error están en la guía (Parte 2) y en pruebas/modelo.pruebas.js.
 */

export const NOTA_MINIMA = 3.0; // para aprobar
export const NOTA_MAXIMA = 5.0;
export const UMBRAL_RIESGO = 4.0; // si necesitas más que esto en lo que falta, estás "en riesgo"
export const MAX_NOMBRE = 40;

const EPS = 1e-9; // tolerancia para comparar decimales (0.1 + 0.2 no es exactamente 0.3 en un computador)

/** Error de negocio: su mensaje se puede mostrar tal cual al usuario. */
export class ErrorDeReglas extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeReglas';
  }
}

/** Ayuda ya escrita: redondea hacia ARRIBA (la nota que "necesitas" nunca debe quedarse corta). */
const redondearArriba = (valor, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.ceil(valor * f - EPS) / f;
};

export class NotasModelo {
  #almacen;
  #evaluaciones;
  #siguienteId;
  #suscriptores = new Set();

  // Ya escrito: recibe el almacén (no sabe cuál es), carga lo guardado y calcula el próximo id.
  constructor(almacen) {
    this.#almacen = almacen;
    const guardadas = almacen.cargar();
    this.#evaluaciones = Array.isArray(guardadas) ? guardadas : [];
    this.#siguienteId = this.#evaluaciones.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  }

  // Ya escrito: devuelve COPIAS, para que nadie cambie el estado interno saltándose las reglas.
  get evaluaciones() {
    return this.#evaluaciones.map((e) => ({ ...e }));
  }

  // Métodos privados auxiliares para búsqueda y validaciones
  #buscar(id) {
    const evaluacion = this.#evaluaciones.find((e) => e.id === id);
    if (!evaluacion) {
      throw new ErrorDeReglas('No existe la evaluación.');
    }
    return evaluacion;
  }

  #validarNota(nota) {
    if (nota !== null && nota !== undefined && (typeof nota !== 'number' || isNaN(nota) || nota < 0 || nota > NOTA_MAXIMA)) {
      throw new ErrorDeReglas('La nota debe estar entre 0 y 5.');
    }
  }

  // ---------------------------------------------------------------- 2A · Agregar y validar
  agregar({ nombre, peso, nota = null }) {
    const nombreLimpio = String(nombre ?? '').trim();
    if (!nombreLimpio) {
      throw new ErrorDeReglas('El nombre es obligatorio.');
    }
    if (nombreLimpio.length > MAX_NOMBRE) {
      throw new ErrorDeReglas('El nombre no puede superar 40 caracteres.');
    }

    const duplicado = this.#evaluaciones.some((e) => e.nombre.toLowerCase() === nombreLimpio.toLowerCase());
    if (duplicado) {
      throw new ErrorDeReglas('Ya existe una evaluación con ese nombre.');
    }

    const pesoNum = Number(peso);
    if (!Number.isFinite(pesoNum) || pesoNum < 1 || pesoNum > 100) {
      throw new ErrorDeReglas('El peso debe estar entre 1 y 100.');
    }

    this.#validarNota(nota);

    const pesoActual = this.#evaluaciones.reduce((sum, e) => sum + e.peso, 0);
    if (pesoActual + pesoNum > 100) {
      const restante = 100 - pesoActual;
      throw new ErrorDeReglas(`Los pesos no pueden sumar más de 100 % (te quedan ${restante} %).`);
    }

    const nuevaEval = {
      id: this.#siguienteId++,
      nombre: nombreLimpio,
      peso: pesoNum,
      nota: nota !== undefined ? nota : null
    };

    this.#evaluaciones.push(nuevaEval);
    this.#cambio();
    return nuevaEval.id;
  }

  // ---------------------------------------------------------------- 2B · Calificar y eliminar
  calificar(id, nota) {
    const evaluacion = this.#buscar(id);
    this.#validarNota(nota);
    evaluacion.nota = nota !== undefined ? nota : null;
    this.#cambio();
  }

  eliminar(id) {
    this.#buscar(id);
    this.#evaluaciones = this.#evaluaciones.filter((e) => e.id !== id);
    this.#cambio();
  }

  // ---------------------------------------------------------------- 2C · Resumen
  resumen() {
    const conNota = this.#evaluaciones.filter((e) => e.nota !== null && e.nota !== undefined);
    
    const acumulado = conNota.reduce((sum, e) => sum + (e.peso * e.nota) / 100, 0);
    const pesoCalificado = conNota.reduce((sum, e) => sum + e.peso, 0);
    const pesoPendiente = 100 - pesoCalificado;

    let notaNecesaria = null;
    if (pesoPendiente > 0) {
      const necesarioCrudo = (NOTA_MINIMA - acumulado) / (pesoPendiente / 100);
      notaNecesaria = Math.max(0, redondearArriba(necesarioCrudo, 2));
    }

    let estado = 'en-camino';
    if (acumulado + EPS >= NOTA_MINIMA) {
      estado = 'aprobado';
    } else if (notaNecesaria === null || notaNecesaria > NOTA_MAXIMA) {
      estado = 'imposible';
    } else if (notaNecesaria > UMBRAL_RIESGO) {
      estado = 'en-riesgo';
    } else {
      estado = 'en-camino';
    }

    return {
      acumulado,
      pesoCalificado,
      pesoPendiente,
      notaNecesaria,
      estado
    };
  }

  // ---------------------------------------------------------------- 2D · Observer y persistencia
  suscribir(suscriptor) {
    this.#suscriptores.add(suscriptor);
    return () => {
      this.#suscriptores.delete(suscriptor);
    };
  }

  #cambio() {
    this.#almacen.guardar(this.#evaluaciones);
    for (const suscriptor of this.#suscriptores) {
      suscriptor();
    }
  }
}