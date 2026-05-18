import { GameObject } from './GameObject.js';

export class Persona extends GameObject {
    constructor(textureKey, x, y, velocidad = 4) {
        super(textureKey, x, y);
        this.velocidad = velocidad;
        
        // Estado de los inputs
        this.teclas = { w: false, a: false, s: false, d: false };
        
        // Límites iniciales por defecto
        this.limites = { minX: 0, maxX: 800, minY: 0, maxY: 600 };

        this.escucharTeclado();
    }

    escucharTeclado() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.teclas) this.teclas[key] = true;
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.teclas) this.teclas[key] = false;
        });
    }

    definirLimitesMapeo(minX, maxX, minY, maxY) {
        this.limites = { minX, maxX, minY, maxY };
    }

    update(ticker) {
        const dt = ticker.deltaTime;

        // Movimiento suave con deltaTime
        if (this.teclas.a) this.sprite.x -= this.velocidad * dt;
        if (this.teclas.d) this.sprite.x += this.velocidad * dt;
        if (this.teclas.w) this.sprite.y -= this.velocidad * dt;
        if (this.teclas.s) this.sprite.y += this.velocidad * dt;

        // Traba al personaje dentro del tamaño de la barra
        if (this.sprite.x < this.limites.minX) this.sprite.x = this.limites.minX;
        if (this.sprite.x > this.limites.maxX) this.sprite.x = this.limites.maxX;
        if (this.sprite.y < this.limites.minY) this.sprite.y = this.limites.minY;
        if (this.sprite.y > this.limites.maxY) this.sprite.y = this.limites.maxY;
    }
}