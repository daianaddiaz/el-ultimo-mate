import { GameObject } from "./gameObject.js";
export class Persona extends GameObject {
  constructor(textureKey, x, y, velocidad = 5) {
        super(textureKey, x, y);
        this.velocidad = velocidad;
        
        // Estado de las teclas
        this.teclas = { w: false, a: false, s: false, d: false };
        
        // Límites donde se puede mover // se verificara con la barra
        this.limites = { minX: 0, maxX: 800, minY: 0, maxY: 600 };

        this.configurarTeclado();
    }

    configurarTeclado() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.teclas) this.teclas[key] = true;
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.teclas) this.teclas[key] = false;
        });
    }

    setLimites(minX, maxX, minY, maxY) {
        this.limites = { minX, maxX, minY, maxY };
    }

update(ticker){

        const dt = ticker.deltaTime;

        if (this.teclas.a) this.sprite.x -= this.velocidad * dt;
        if (this.teclas.d) this.sprite.x += this.velocidad * dt;
        if (this.teclas.w) this.sprite.y -= this.velocidad * dt;
        if (this.teclas.s) this.sprite.y += this.velocidad * dt;

        // Limitar la posición del prota para que no se salga de la barra
        if (this.sprite.x < this.limites.minX) this.sprite.x = this.limites.minX;
        if (this.sprite.x > this.limites.maxX) this.sprite.x = this.limites.maxX;
        if (this.sprite.y < this.limites.minY) this.sprite.y = this.limites.minY;
        if (this.sprite.y > this.limites.maxY) this.sprite.y = this.limites.maxY;
  }

}