import * as PIXI from 'pixi.js';

export class GameObject {
    constructor(textureKey, x = 0, y = 0) {
        // Obtenemos la textura previamente cargada en el Game de forma global
        const texture = PIXI.Assets.get(textureKey);
        this.sprite = new PIXI.Sprite(texture);
        
        // Centramos el punto de anclaje por defecto para facilitar cálculos
        this.sprite.anchor.set(0.5);
        this.sprite.x = x;
        this.sprite.y = y;
    }

    // Método que llamará el ticker de Pixi en cada frame si se necesita actualizar algo
    update(ticker) {
        // Se sobrescribe en las clases hijas si es necesario
    }
}