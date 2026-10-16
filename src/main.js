// RAÍZ DE COMPOSICIÓN: el único lugar que conoce las tres piezas y las conecta.
// (Ya viene escrito; en las Partes 5B y 5C vuelves a este archivo.)

import { NotasModelo } from './modelo.js';
import { NotasVista } from './vista.js';
import { NotasControlador } from './controlador.js';
import { AlmacenSesion } from './almacen.js'; // <- 5C: Cambiamos AlmacenLocal por AlmacenSesion
import { TermometroVista } from './termometro-vista.js'; // <- 5B: Importar la segunda vista

// 1. El Modelo, usando el nuevo almacén de sesión (se borra al cerrar la pestaña).
const modelo = new NotasModelo(new AlmacenSesion('notas.v1'));

// 2. La Vista: recibe el Modelo para poder LEERLO y suscribirse a sus cambios.
const vista = new NotasVista(document.getElementById('app'), modelo);

// 3. El Controlador: recibe las dos piezas y las conecta (eventos de la Vista → acciones del Modelo).
new NotasControlador(modelo, vista);

// Parte 5B: Montar la segunda vista (el termómetro).
new TermometroVista(document.getElementById('termometro'), modelo);