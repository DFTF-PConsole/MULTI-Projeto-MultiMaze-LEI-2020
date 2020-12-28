"use strict";

class SpriteImage{
    constructor(x, y, w, h, speed, img, sound){

        //posição e movimento
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.speed = speed;

        //imagem
        this.img = img;

        //sound
        this.sound = sound;

        //para poder detetar as interseções é preciso ter um array com a info do pixel
        this.imageData = this.getImageData(img);
    }

    draw(ctx){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    clear(ctx){
        //função da biblioteca da DOM para limpar a canvas
        ctx.clearRect(this.x, this.y, this.width, this.height);
    }

    getImageData(img){
        //é preciso criar uma canvas auxiliar para isto
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, this.width, this.height);

        //devolve-se agora o array que contém ttodos os pixeis da imagem
        return ctx.getImageData(0, 0, this.width, this.height);
    }

    intersectsPixelCheck(s1, s2){
        //primeiro detectar possível interseção bound in box:
        if( !( (s1.x > s2.x + s2.width) || (s2.x > s1.x + s1.width) || (s1.y > s2.y + s2.height) || (s2.y > s1.y + s1.height) ) ){

            //obeter as coordenadas do rectângulo de interseção
            var xMin = Math.max(s1.x, s2.x);
            var xMax = Math.min(s1.x + s1.width, s2.x + s2.width);
            var yMin = Math.max(s1.y, s2.y);
            var yMax = Math.min(s1.y + s1.height, s2.y + s2.height);

            //percorrer todos os pixeis do rectângulo
            for(let y = yMin; y <= yMax; ++y){
                for(let x = xMin; x <= xMax; ++x){
                    var xlocal = Math.round(x - s1.x);
                    var ylocal = Math.round(y - s1.y);

                    //para sprite1
                    var pixelNum = xlocal + ylocal * s1.width;
                    var pixelPosArrayS1 = pixelNum * 4 + 3;

                    //para sprite2
                    xlocal = Math.round(x - s2.x);
                    ylocal = Math.round(y - s2.y);
                    pixelNum = xlocal + ylocal * s2.width;
                    var pixelPosArrayS2 = pixelNum * 4 + 3;

                    //há interceção se um pixel que está sobreposto é opaco em ambas as sprites
                    if(s1.imageData.data[pixelPosArrayS1] && s2.imageData.data[pixelPosArrayS2])
                        return true;
                }
            }
            return  false; //caso as bound in box se intersetem mas as imagens em si não se intercetam
        }
        return false; //caso as bound in box não se intercetem devolve logo falso
    }

    boundInBoxColision(s1, s2) {
        //primeiro detectar possível interseção bound in box:
        if (!((s1.x > s2.x + s2.width) || (s2.x > s1.x + s1.width) || (s1.y > s2.y + s2.height) || (s2.y > s1.y + s1.height))) {
            return true;
        } else return false;
    }
}