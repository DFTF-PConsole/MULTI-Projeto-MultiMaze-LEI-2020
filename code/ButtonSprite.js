"use strict";

class ButtonSprite extends SpriteImage{
    constructor(x, y, w, h, img, clickable){
        super(x, y, w, h, 0, img);
        this.clickable = clickable;
    }

    // acrescentar feature para fazer um efeito qundo o botao é clicado
    mouseOverButton(ev){ //ev.target é a canvas
        var mx = ev.offsetX;  //mx, my = mouseX, mouseY na canvas
        var my = ev.offsetY;
        if (mx >= this.x && mx <= this.x + this.width && my >= this.y && my <= this.y + this.height) {
            return true;
        }
        else
            return false;
    }

    // acrescentar metodo para mudar o cursor quando o rato esta por cima
}