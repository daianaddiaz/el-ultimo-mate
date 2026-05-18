import { Juego } from './juego/juego.js';

window.addEventListener('DOMContentLoaded', () => {
    const miJuego = new Juego();
    miJuego.arrancar().catch(err => {
        console.error("Error al arrancar:", err);
    });
});