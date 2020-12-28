"use strict";

(function(){window.addEventListener("load", main);}());

function  main() {
    var botao1 = document.getElementById("opcao1");
    var botao2 = document.getElementById("opcao2");
    var botao3 = document.getElementById("opcao3");
    var botao4 = document.getElementById("opcao4");
    var opcaoCerta = document.getElementsByTagName("resposta");
    var resposta = opcaoCerta[0].id.slice(0, -1);

    var verifica = function verificacao(ev){
        if (ev.currentTarget.id === resposta) parent.window.postMessage("acertou", '*');
        else parent.window.postMessage("errou", '*');
        window.close();
    };

    botao1.addEventListener("click", verifica);
    botao2.addEventListener("click", verifica);
    botao3.addEventListener("click", verifica);
    botao4.addEventListener("click", verifica);
}