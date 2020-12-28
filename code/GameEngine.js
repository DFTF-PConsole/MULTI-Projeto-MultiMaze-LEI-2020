"use strict";

// variaveis de controlo dos sons / musicas / elementos dos menus
{
    var ButtonArray;                                                    // array de botoes geral para o programa
    var audio = document.getElementById("Audio");              // musicas de background
    var muteMusic = 0;
    var musicVolume = 0.5;
    var buttonAudio = document.getElementById("buttonAudio");  // som dos botoes
    var muteSounds = 0;
    var buttonVolume = 0.5;
    var quitBtn;                                                        // botao quit global para todos os menus
    var introVideo = document.getElementById("introVideo");
    var TimerSound = new Audio();
    TimerSound.src = "../resources/audio/game_engine_sounds/AlertaRelogioTicking.mp3";
    TimerSound.volume = 1; // se o muteSounds estiver a 0 o volume deste som está sempre no máximo
}

// variaveis auxiliares para o controlo do movimento de colisao com muros e lava e oustros elementos comuns aos niveis
{
    var kdh;                // listener das teclas
    var kuh;                // listener das teclas
    var kph;                // listener dos botoes O / A / E e da barra de espaços
    var PausedPress = false;
    var MapaArray;
    var OptionsPress = false;
    var HelpPress = false;
    var ExitPress = false;
    var InGamePress = false;
    var TotalPowerUps = 0;  // total de power ups acumulado
    var powerUpTaken = false;
    var stackPowerUp = false;
    var marcador;
    var PlayerMoving;
    var rightColision;
    var leftColision;
    var upColision;
    var downColision;
    var timeStamp;      // time stamp auxiliar ao nivel 2 e 3
    var idle;
    var lavaCatch;
    var ended;
}

// variaveis de cotrolo das questoes do nivel 1
{
    var passou = 0;             // contador de perguntas respondidas corretamente
    var tentativas = 0;         // contador de tentativas que o jogador faz para responder a uma pergunta
    var dica1 = false;
    var dica2 = false;
    var dica3 = false;
    var dica4 = false;
}

// variaveis de controlo das bebidas energéticas e dos inimigos do nivel 2
{
    var EDtimeStamp = 0;            // var para contar o tempo do efeito da bebida
    var energyDrink1 = false;
    var energyDrink2 = false;
    var energyDrink3 = false;
    var energyDrink4 = false;
    var energyDrink5 = false;
    var segFaultCatch = false;      // para verificar quando o segFault apanha o player
    var SegFault;                   // para determinar que segFault apanhuo o player
    var SegFaultSentido;
    var HorizontalRLimit = 300;     // alcance do inimigo horizontal R
    var HorizontalLLimit = 300;     // alcance do inimigo horizontal L
    var enemyRStart = 0;            // posicao inicial do inimigo horizontal virado para a direita
    var enemyLStart = 0;            // posicao inicial do inimigo horizontal virado para a esquerda
    var enemyDStart = 0;            // posicao inicial do inimigo vertical virado para a baixo
    var enemyUStart = 0;            // posicao inicial do inimigo vertical virado para a cima
}

// variaeis de contrlo dos coffees do nivel 3
{
    var bugVertical = false;
    var bugHorizontal = false;
    var bugSentido1 = "down";       // para controlor o sentido do bug cima <-> baixo
    var bugSentido2 = "right";      // para controlor o sentido do bug esquerda <-> direita
    var bugEfectCounter = 0;        // numero de vezes que o bug toca no player diminui o score
    var inverteMovimento = false;   // efeito do stress
    var stressTimeStamp = 0;        // time stamp de inicio do stress
    var StressDuration = 0;         // duração do stress
    var PlayerSlowMovement = 0;     // duração do efeito que o bug tem no player (serão 5 seg)
    var sleepyTimeStamp = 0;        // controlo do efeito do sono em loop de 15 em 15 segundos
    var coffeeTimeStamp = 0;
    var coffeeEfect = false;
    var coffee1 = false;
    var coffee2 = false;
    var coffee3 = false;
    var coffee4 = false;
    var coffee5 = false;
}

(function(){window.addEventListener("load", main);}());

function main() {
    var canvas = document.getElementById("canvas");
    var canvasCtx = canvas.getContext("2d");
    audio.volume = buttonAudio.volume = 0.5; // definir para metade os volumes

    //mostra intro -> carrega sprites e botoes -> continua para o menu principal
    canvas.addEventListener("animationend", function(ev) {

        //Carrega os mapas
        canvas.addEventListener("end", endHandler);
        loadMapas(canvasCtx, canvas);

        function endHandler(ev){
            MapaArray = ev.MpArray;
            canvas.removeEventListener("end", initendHandler);
        }

        //carrega os botoes e sprites
        canvas.addEventListener("initend", initendHandler);
        loadButtonSprites(canvasCtx,canvas);
        loadMapas(canvasCtx, canvas);

        function initendHandler(ev) {
            ButtonArray = ev.BtnArray;

            // posiciona e desenha o botao quit
            quitBtn = ButtonArray[12];
            quitBtn.draw(canvasCtx);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.font = "30px Arial";
            canvasCtx.fillStyle = "#0fff00";
            canvasCtx.fillText("Click para começar!",canvas.width/2-canvasCtx.measureText("Click para começar!").width/2, canvas.height/2);

            // depois da animação introdutória cria um listener de click apenas para que a musica de fundo possa começar
            var start = function (ev) {
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.removeEventListener("click", start);
                audio.src = "../resources/audio/menu_music/menus.mp3";
                audio.play().catch(function(){});
                mainMenu(canvasCtx, canvas);
            };
            canvas.addEventListener("click", start);

            canvas.removeEventListener("animationend", initendHandler);
        }
    });
}

function loadButtonSprites(canvasCtx,canvas) {
    var loaded = 0; //contar botoes carregados
    var BtnArray = new Array(18);

    var Load = function (ev) { LoadedHandler(ev); };

    //criar imagens para botoes e sprites
    {
        var gameMenuBtn = new Image();
        gameMenuBtn.addEventListener("load", Load);
        gameMenuBtn.id = "gameMenuBtn";
        gameMenuBtn.src = "../resources/buttons/gameMenu.png";

        var storyModeBtn = new Image();
        storyModeBtn.addEventListener("load", Load);
        storyModeBtn.id = "storyModeBtn";
        storyModeBtn.src = "../resources/buttons/storyMode.png";

        var playBtn = new Image();
        playBtn.addEventListener("load", Load);
        playBtn.id = "playBtn";
        playBtn.src = "../resources/buttons/play.png";

        var helpMenuBtn = new Image();
        helpMenuBtn.addEventListener("load", Load);
        helpMenuBtn.id = "helpMenuBtn";
        helpMenuBtn.src = "../resources/buttons/help.png";

        var creditsMenuBtn = new Image();
        creditsMenuBtn.addEventListener("load", Load);
        creditsMenuBtn.id = "creditsMenuBtn";
        creditsMenuBtn.src = "../resources/buttons/credits.png";

        var optionsMenuBtn = new Image();
        optionsMenuBtn.addEventListener("load", Load);
        optionsMenuBtn.id = "optionsMenuBtn";
        optionsMenuBtn.src = "../resources/buttons/options.png";

        var rankingMenuBtn = new Image();
        rankingMenuBtn.addEventListener("load", Load);
        rankingMenuBtn.id = "rankingMenuBtn";
        rankingMenuBtn.src = "../resources/buttons/ranking.png";

        var volumeUp = new Image();
        volumeUp.addEventListener("load", Load);
        volumeUp.id = "volumeUp";
        volumeUp.src = "../resources/buttons/volumeUp.png";

        var volumeDown = new Image();
        volumeDown.addEventListener("load", Load);
        volumeDown.id = "volumeDown";
        volumeDown.src = "../resources/buttons/volumeDown.png";

        var increment  = new Image();
        increment.addEventListener("load", Load);
        increment.id = "increment";
        increment.src = "../resources/buttons/increment.png";

        var soundOn = new Image();
        soundOn.addEventListener("load", Load);
        soundOn.id = "soundOn";
        soundOn.src = "../resources/buttons/soundOn.png";

        var soundOff = new Image();
        soundOff.addEventListener("load", Load);
        soundOff.id = "soundOff";
        soundOff.src = "../resources/buttons/soundOff.png";

        var quitBtn = new Image();
        quitBtn.addEventListener("load", Load);
        quitBtn.id = "quitBtn";
        quitBtn.src = "../resources/buttons/quit.png";

        var nextPage = new Image();
        nextPage.addEventListener("load", Load);
        nextPage.id = "nextPage";
        nextPage.src = "../resources/buttons/nextPage.png";

        var prewPage = new Image();
        prewPage.addEventListener("load", Load);
        prewPage.id = "prewPage";
        prewPage.src = "../resources/buttons/prewPage.png";

        var textBox = new Image();
        textBox.addEventListener("load", Load);
        textBox.id = "textBox";
        textBox.src = "../resources/buttons/textBox.png";

        var deletBtn = new Image();
        deletBtn.addEventListener("load", Load);
        deletBtn.id = "deletBtn";
        deletBtn.src = "../resources/buttons/delet.png";

        var skipBtn = new Image();
        skipBtn.addEventListener("load", Load);
        skipBtn.id = "skipBtn";
        skipBtn.src = "../resources/buttons/skip.png";
    }

    function LoadedHandler(ev){
        var img = ev.target;
        var nw = img.naturalWidth;
        var nh = img.naturalHeight;

        // aqui faz o carregamento dos botoes e sprites para a canvas
        switch (img.id) {
            case "gameMenuBtn":
                BtnArray[0] = new ButtonSprite(canvas.width-(canvas.width/3),canvas.height/5, nw, nh, img, true);
                break;
            case "storyModeBtn":
                BtnArray[1] = new ButtonSprite(canvas.width/2+90, canvas.height/2-110, nw, nh, img, true);
                break;
            case "playBtn":
                BtnArray[2] = new ButtonSprite(canvas.width/2-30, canvas.height/2+50, nw, nh, img, true);
                break;
            case "rankingMenuBtn":
                BtnArray[3] = new ButtonSprite(canvas.width-(canvas.width/3), (canvas.height/5)+56, nw, nh, img, true);
                break;
            case "optionsMenuBtn":
                BtnArray[4] = new ButtonSprite(canvas.width-(canvas.width/3), (canvas.height/5)+112, nw, nh, img, true);
                break;
            case "helpMenuBtn":
                BtnArray[5] = new ButtonSprite(canvas.width-(canvas.width/3), (canvas.height/5)+168, nw, nh, img, true);
                break;
            case "creditsMenuBtn":
                BtnArray[6] = new ButtonSprite(canvas.width-(canvas.width/3), (canvas.height/5)+224, nw, nh, img, true);
                break;
            case "volumeUp":
                BtnArray[7] = new ButtonSprite(0, 0, nw, nh, img, true);
                break;
            case "volumeDown":
                BtnArray[8] = new ButtonSprite(0, 0, nw, nh, img, true);
                break;
            case "increment":
                BtnArray[9] = new ButtonSprite(0, 0, nw, nh, img, true);
                break;
            case "soundOn":
                BtnArray[10] = new ButtonSprite(0, 0, nw, nh, img, true);
                break;
            case "soundOff":
                BtnArray[11] = new ButtonSprite(0, 0, nw, nh, img, true);
                break;
            case "quitBtn":
                BtnArray[12] = new ButtonSprite(10, canvas.height-(10+nh), nw, nh, img, true);
                break;
            case "nextPage":
                BtnArray[13] = new ButtonSprite(0, canvas.height-(10+nh), nw, nh, img, true);
                break;
            case "prewPage":
                BtnArray[14] = new ButtonSprite(0, canvas.height-(10+nh), nw, nh, img, true);
                break;
            case "textBox":
                BtnArray[15] = new ButtonSprite((canvas.width/2)-90,130,nw,nh,img,true);
                break;
            case "deletBtn":
                BtnArray[16] = new ButtonSprite((canvas.width/2)-200,canvas.height/2+100,nw,nh,img,true);
                break;
            case "skipBtn":
                BtnArray[17] = new ButtonSprite(10, canvas.height-(10+nh), nw, nh, img, true);
                break;
        }
        ++loaded;

        if(loaded === 18){
            //devolde o array de botoes e o de sprites na forma de evento
            var ArrayEv = new Event("initend");
            ArrayEv.BtnArray = BtnArray;
            canvasCtx.canvas.dispatchEvent(ArrayEv);
        }
    }
}

function loadMapas(canvasCtx, canvas) {
    var loaded = 0; //contar botoes carregados
    var MpArray = new Array(3);

    var Load = function (ev) { LoadedHandler(ev); };

    //criar imagens para mapas
    {
        var level1 = new Image();
        level1.addEventListener("load", Load);
        level1.id = "level1";
        level1.src = "../resources/images/Mapas/Nivel1.png";

        var level2 = new Image();
        level2.addEventListener("load", Load);
        level2.id = "level2";
        level2.src = "../resources/images/Mapas/Nivel2.png";

        var level3 = new Image();
        level3.addEventListener("load", Load);
        level3.id = "level3";
        level3.src = "../resources/images/Mapas/Nivel3.png";
    }

    function LoadedHandler(ev){
        var img = ev.target;
        var nw = img.naturalWidth;
        var nh = img.naturalHeight;

        // aqui faz o carregamento dos botoes e sprites para a canvas
        switch (img.id) {
            case "level1":
                MpArray[0] = new ButtonSprite(0,180, nw, nh, img, false);
                break;
            case "level2":
                MpArray[1] = new ButtonSprite(0,180, nw, nh, img, false);
                break;
            case "level3":
                MpArray[2] = new ButtonSprite(0,180, nw, nh, img, false);
                break;
        }
        ++loaded;

        if(loaded === 3){
            //devolde o array de botoes e o de sprites na forma de evento
            var ArrayEv = new Event("end");
            ArrayEv.MpArray = MpArray;
            canvasCtx.canvas.dispatchEvent(ArrayEv);
        }
    }

}

function mainMenu(canvasCtx,canvas) {
    drawBackground(canvasCtx, canvas, "Menu");
    var MainMenuLogo = document.getElementById("MainMenu");
    canvasCtx.drawImage(MainMenuLogo, 0, 0, 740, 480);

    // buscar e desenhar os botoes
    {
        var gameMenuBtn = ButtonArray[0];
        var rankingMenuBtn = ButtonArray[3];
        var optionsMenuBtn = ButtonArray[4];
        var helpMenuBtn = ButtonArray[5];
        var creditsMenuBtn = ButtonArray[6];
        gameMenuBtn.draw(canvasCtx);
        rankingMenuBtn.draw(canvasCtx);
        optionsMenuBtn.draw(canvasCtx);
        helpMenuBtn.draw(canvasCtx);
        creditsMenuBtn.draw(canvasCtx);
        quitBtn.clear(canvasCtx);
    }

    // activar o listener para os botoes, cada botao tem a sua função
    var buttonsListener = function (ev) {
        if (gameMenuBtn.mouseOverButton(ev)) {
            buttonAudio.play();
            gameMenu(canvasCtx,canvas);
            canvasCtx.canvas.removeEventListener("click", buttonsListener);
        }
        if (rankingMenuBtn.mouseOverButton(ev)) {
            buttonAudio.play();
            rankingMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", buttonsListener);
        }
        if (optionsMenuBtn.mouseOverButton(ev)) {
            buttonAudio.play();
            optionsMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", buttonsListener);
        }
        if (helpMenuBtn.mouseOverButton(ev)) {
            audio.src = "../resources/audio/menu_music/ElevatorMusic.mp3"; // tocar a musica de fundo
            audio.play().catch(function(){});
            buttonAudio.play();
            helpMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", buttonsListener);
        }
        if (creditsMenuBtn.mouseOverButton(ev)) {
            audio.src = "../resources/audio/menu_music/creditos.mp3"; // tocar a musica de fundo
            audio.play().catch(function(){});
            buttonAudio.play();
            creditsMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", buttonsListener);
        }
    };
    canvasCtx.canvas.addEventListener("click", buttonsListener);
}

function drawBackground(canvasCtx,canvas,currentScreen) {
    //primeiro limpar a canvas
    clearCanvas(canvasCtx,canvas);
    switch (currentScreen) {
        case "Menu":
            document.body.style.backgroundImage = "url('../resources/images/BackGrounds/Menu.gif')";
            quitBtn.draw(canvasCtx); // manter o botao no ecrã se for um menu
            break;
        case "GamePlay":
            document.body.style.backgroundImage = "url('../resources/images/BackGrounds/floor.png')";
            break;
        case "1":
            document.body.style.backgroundImage = "url('../resources/images/BackGrounds/LoadingNivel1.png')";
            break;
        case "2":
            document.body.style.backgroundImage = "url('../resources/images/BackGrounds/LoadingNivel2.png')";
            break;
        case "3":
            document.body.style.backgroundImage = "url('../resources/images/BackGrounds/LoadingNivel3.png')";
            break;
    }
}

function clearCanvas(canvasCtx,canvas) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameMenu(canvasCtx, canvas) {
    drawBackground(canvasCtx, canvas, "Menu");
    var GameMenuPNG = document.getElementById("GameMenu");
    canvasCtx.drawImage(GameMenuPNG, 0, 0, 740, 480);

    // buscar os botoes necessarios e definir variaveis auxiliares
    {
        var storyModeBtn = ButtonArray[1];
        var playBtn = ButtonArray[2];
        var nextNickname = ButtonArray[13];
        var prewNickname = ButtonArray[14];
        var deletBtn = ButtonArray[16];
        var textBox = ButtonArray[15];
        var textBoxListener;        //listener da textbox
        var controlaInput = "invalido"; // muda para "valido" quando o input for valido
        var controlMouseClick = 0;  // para controlar os clicks na caixa de texto
        var playerInfo = new Array(3);
        playerInfo[0] = "";         // posicao 1 = nickname
        playerInfo[1] = 0;          // posicao 2 = score
        playerInfo[2] = "1";        // posicao 3 = nivel do jogo onde o jogador começa / ficou
        var i = 0;                  // varivel auxiliar para percorrer a informação da base de dados
    }

    // prepara o layout do menu e obter dados da base de dados
    {
        canvasCtx.font = "30px Arial Black";
        canvasCtx.fillStyle = "#d8d8d1";
        canvasCtx.fillText("Novo jogo", (canvas.width/2) - canvasCtx.measureText("Novo jogo").width/2, 100);
        canvasCtx.fillText("Carregar jogo", (canvas.width/2) - canvasCtx.measureText("Carregar jogo").width/2, canvas.height/2);
        canvasCtx.font = "20px Arial Black";
        canvasCtx.fillStyle = "#b2b1ee";
        canvasCtx.fillText("NickName:", (canvas.width/2)-220, 155);
        canvasCtx.font = "10px Arial Black";
        textBox.draw(canvasCtx);
        canvasCtx.fillStyle = "#c86b00";
        canvasCtx.fillText("clique para inserir", textBox.x+10, 152);
        canvasCtx.fillStyle = "#b2b1ee";
        canvasCtx.fillText("(Enter para confirmar)", textBox.x+5, textBox.y+textBox.height+20);
        canvasCtx.font = "15px Arial Black";
        canvasCtx.fillText("Nickname   Score", (canvas.width/2)-230, canvas.height/2+40);
        storyModeBtn.draw(canvasCtx);
        playBtn.draw(canvasCtx);
        prewNickname.x = (canvas.width/2)-250;
        prewNickname.y = canvas.height/2+100;
        prewNickname.draw(canvasCtx);
        nextNickname.x = prewNickname.x + prewNickname.width + deletBtn.width+30;
        nextNickname.y = prewNickname.y;
        nextNickname.draw(canvasCtx);
        deletBtn.draw(canvasCtx);
        if (localStorage.length === 0)
            canvasCtx.fillText("vazio", (canvas.width/2)-190, canvas.height/2+75);
        else {
            canvasCtx.fillText(localStorage.key(i), (canvas.width/2)-(canvasCtx.measureText(localStorage.key(i)).width/2+200), canvas.height/2+75);
            canvasCtx.fillText(localStorage.getItem(localStorage.key(i)).slice(0,-2), (canvas.width/2)-120, canvas.height/2+75);
        }
    }

    // prepara o listener e as acoes dos botoes
    var controlsListener = function(ev){
        if (textBox.mouseOverButton(ev)){
            if (controlMouseClick === 0 && localStorage.length < 25 ) {
                controlMouseClick = 1; // para impedir que apos clicado 1 vez volte a clicar criando varios listeners de keydown
                textBox.draw(canvasCtx);
                var X = textBox.x + 5;
                var Y = textBox.y + textBox.height - 10;
                textBoxListener = function (ev) {
                    // se o backsapece for pressionado e o nickName ainda contiver letras
                    if (ev.keyCode===8 && X > textBox.x+5 && playerInfo[0][0]!==undefined){
                        canvasCtx.clearRect(textBox.x, textBox.y, textBox.width+20, textBox.height);
                        textBox.draw(canvasCtx);
                        X -= canvasCtx.measureText(playerInfo[0][playerInfo[0].length-1]).width;
                        playerInfo[0] = playerInfo[0].slice(0, -1); // apagar a letra
                        canvasCtx.fillText(playerInfo[0], textBox.x + 5, Y);
                    }

                    // se passar os limites da caixa ou o nome tiver sido apagado
                    else if (X>=textBox.x + textBox.width-10 || (ev.keyCode===8 && X>=textBox.x+5) ) {
                        document.removeEventListener("keydown", textBoxListener);
                        canvasCtx.clearRect(textBox.x, textBox.y, textBox.width+20, textBox.height);
                        textBox.draw(canvasCtx);
                        canvasCtx.font = "15px Arial";
                        canvasCtx.fillText("clique para inserir", textBox.x+10, 152);
                        canvasCtx.font = "20px Arial"; // poe a 20 novamente para nao alterar o tamanho dos nicknames
                        X = textBox.x + 5;
                        playerInfo[0] = ""; // limpa o input errado
                        controlMouseClick = 0; // para poder voltar a activar o listener do input
                    }

                    // se escrever letras
                    else if (ev.keyCode!==13 && ev.keyCode>47 && ev.keyCode<58 || ev.keyCode>63 && ev.keyCode<91){
                        // limitar o tipo de caracteres aceites de 0-1 e de a-z
                        canvasCtx.fillText(ev.key, X, Y);
                        playerInfo[0] += ev.key; // guarda letra a letra
                        X += canvasCtx.measureText(ev.key).width;
                    }

                    if (ev.keyCode === 13 && playerInfo[0] !== "") { // se o enter for premido remove o listener e valida o input
                        document.removeEventListener("keydown", textBoxListener);
                        controlaInput = "valido"; // para permitir selecionar o modo historia
                        canvasCtx.clearRect(textBox.x, textBox.y, textBox.width, textBox.height);
                        textBox.draw(canvasCtx);
                        canvasCtx.font = "15px Arial";
                        canvasCtx.fillText("nickname gravado", textBox.x + 10, 152);
                        canvasCtx.font = "20px Arial";
                        localStorage.setItem(playerInfo[0],"0,1"); // guardar novo nickname e o score e o nivel
                    }
                };
                document.addEventListener("keydown", textBoxListener);
            }
            if (localStorage.length === 25){ // se o total de jogadores ja tiver sido atingido
                textBox.draw(canvasCtx);
                canvasCtx.font = "15px Arial";
                canvasCtx.fillText("Máx. de jogadores", textBox.x+10, 152);
                canvasCtx.font = "20px Arial";
            }
        }
        if (storyModeBtn.mouseOverButton(ev) && controlaInput === "valido" && localStorage.length > 0) {
            buttonAudio.play();
            audio.src = "";
            canvasCtx.canvas.removeEventListener("click", controlsListener);
            if (playerInfo[2] === "1") showGameIntro(canvasCtx, canvas, playerInfo);
            else gameEngine(canvasCtx, canvas, playerInfo);
        }
        if (playBtn.mouseOverButton(ev) && controlaInput === "invalido") { // se um novo nickname for inserido, nao permite clicar neste botao
            buttonAudio.play();
            // guarda no vetor playerInfo as informações do jogo carregado
            playerInfo[0] = localStorage.key(i); // para obter o nickname
            playerInfo[1] = parseInt(localStorage.getItem(localStorage.key(i)).slice(0,-2)); // para obter o score
            playerInfo[2] = localStorage.getItem(localStorage.key(i))[localStorage.getItem(localStorage.key(i)).length-1]; // para obter o nivel onde o jogador ficou
            audio.src = "";
            canvasCtx.canvas.removeEventListener("click", controlsListener);
            if (playerInfo[2] === "1") showGameIntro(canvasCtx, canvas, playerInfo);
            else gameEngine(canvasCtx, canvas, playerInfo);
        }
        if (nextNickname.mouseOverButton(ev) && localStorage.length > 0) {
            buttonAudio.play();
            canvasCtx.clearRect((canvas.width/2)-300,canvas.height/2+55,270,40);
            ++i;
            if (i === localStorage.length) i = 0;
            canvasCtx.fillText(localStorage.key(i), (canvas.width/2)-(canvasCtx.measureText(localStorage.key(i)).width/2+200), canvas.height/2+75);
            canvasCtx.fillText(localStorage.getItem(localStorage.key(i)).slice(0,-2), (canvas.width/2)-120, canvas.height/2+75);
        }
        if (prewNickname.mouseOverButton(ev) && localStorage.length > 0) {
            buttonAudio.play();
            canvasCtx.clearRect((canvas.width/2)-300,canvas.height/2+55,270,40);
            --i;
            if (i < 0) i = localStorage.length-1;
            canvasCtx.fillText(localStorage.key(i), (canvas.width/2)-(canvasCtx.measureText(localStorage.key(i)).width/2+200), canvas.height/2+75);
            canvasCtx.fillText(localStorage.getItem(localStorage.key(i)).slice(0,-2), (canvas.width/2)-120, canvas.height/2+75);
        }
        if (deletBtn.mouseOverButton(ev)){
            buttonAudio.play();
            localStorage.removeItem(localStorage.key(i));
            canvasCtx.clearRect((canvas.width/2)-300,canvas.height/2+55,270,40);
            if (localStorage.length === 0)
                canvasCtx.fillText("vazio", (canvas.width/2)-190, canvas.height/2+75);
            else {
                if (localStorage.length === 24) { // se o limite estiver no maximo e eliminar, mudar a mensagem da caixa de texto
                    textBox.draw(canvasCtx);
                    canvasCtx.font = "15px Arial";
                    canvasCtx.fillText("clique para inserir", textBox.x + 10, 152);
                    canvasCtx.font = "20px Arial";
                }
                if (i === localStorage.length) { // se a ultima posicao foi removida, mostra a penultima
                    canvasCtx.fillText(localStorage.key(--i), (canvas.width/2)-(canvasCtx.measureText(localStorage.key(i)).width/2+200), canvas.height / 2 + 75);
                    canvasCtx.fillText(localStorage.getItem(localStorage.key(i)).slice(0,-2), (canvas.width / 2) - 120, canvas.height / 2 + 75);
                }
                else if (i >= 0) { // se remover outra posicao qualquer, os elementos sao automaticamente puxados para tras
                    canvasCtx.fillText(localStorage.key(i), (canvas.width/2)-(canvasCtx.measureText(localStorage.key(i)).width/2+200), canvas.height / 2 + 75);
                    canvasCtx.fillText(localStorage.getItem(localStorage.key(i)).slice(0,-2), (canvas.width / 2) - 120, canvas.height / 2 + 75);
                }
            }
        }
        if (quitBtn.mouseOverButton(ev)) {
            buttonAudio.play();
            mainMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", controlsListener);
            document.removeEventListener("keydown", textBoxListener);
        }
    };
    canvasCtx.canvas.addEventListener("click", controlsListener);
}

function showGameIntro(canvasCtx, canvas, playerInfo) {
    drawBackground(canvasCtx, canvas, "GamePlay");

    // mostra o video de intro do jogo, quando terminar chama o gameEngine ou dá skip no video e chama o gameEngine
    introVideo.load();
    introVideo.autoplay = true;
    introVideo.style.display = 'initial';
    if (muteMusic === 1) introVideo.volume = 0;
    function EndedHandler(ev) {
        ev.target.pause();
        ev.target.style.display = "none";
        ev.target.removeEventListener("ended", EndedHandler);
        gameEngine(canvasCtx, canvas, playerInfo);
    }
    introVideo.addEventListener("ended", EndedHandler);

    // posicionar e preparar o botao para dar skip no video de intro
    var skipBtn = ButtonArray[17];
    skipBtn.draw(canvasCtx);
    var skipHandler = function(ev){
        if (skipBtn.mouseOverButton(ev)) {
            introVideo.pause();
            introVideo.style.display = "none";
            introVideo.removeEventListener("ended", EndedHandler);
            canvasCtx.canvas.removeEventListener("click", skipHandler);
            gameEngine(canvasCtx, canvas, playerInfo);
        }
    };
    canvasCtx.canvas.addEventListener("click", skipHandler);
}

function gameEngine(canvasCtx, canvas, playerInfo) {
    drawBackground(canvasCtx, canvas, playerInfo[2]);
    audio.src = "";

    // sprites sheets e elementos para cada nivel
    var SpriteArray = null;
    var PlayerPosition = new Array(10);
    var QuestionArray = null;
    var segFaultSpSheet = new Array(8);
    var bugSpriteSheet = new Array(8);
    var eyeSpriteSheet = new Array(4);
    var powerUpBar = new Array(5);
    var lava = null;
    var powerUp = null;
    var levelTimer = 0;     // tempo em que a lava começa a ser de denhada

    // reset / preparaçao e variaveis globeis genericas
    PlayerMoving = inverteMovimento = rightColision = leftColision = upColision = downColision = lavaCatch = ended = false;
    OptionsPress = HelpPress = ExitPress = InGamePress = false;
    marcador = timeStamp = TotalPowerUps = 0;
    idle = "down";

    // carregar o player
    let PlayerLoader = function (ev) {

        // colocar as sprites na posição correta
        for (let x = 0; x < ev.SpriteArray.length; ++x) {
            if      (ev.SpriteArray[x].img.id === "player_right.png")      PlayerPosition[0] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_left.png")       PlayerPosition[1] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_up1.png")        PlayerPosition[2] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_up2.png")        PlayerPosition[3] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_down1.png")      PlayerPosition[4] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_down2.png")      PlayerPosition[5] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_idle_up.png")    PlayerPosition[6] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_idle_down.png")  PlayerPosition[7] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_idle_right.png") PlayerPosition[8] = ev.SpriteArray[x];
            else if (ev.SpriteArray[x].img.id === "player_idle_left.png")  PlayerPosition[9] = ev.SpriteArray[x];
        }
        canvasCtx.canvas.removeEventListener("Player", PlayerLoader);
    };
    canvasCtx.canvas.addEventListener("Player", PlayerLoader);
    loadLevel(canvasCtx, canvas, "../resources/textFiles/Player/Player.txt", 1, "Player");

    // carregamento dos elementos de cada nivel a partir de ficheiros
    if      (playerInfo[2] === "1") {
        audio.src = "../resources/audio/game_music/Nivel1Music.mp3";

        // reset / preparacao de variaveis globais
        levelTimer = 120;
        dica1 = dica2 = dica3 = dica4 = false;
        passou = tentativas = 0;

        // carregar o power up
        let PowerUpSprite = function (ev) {
            powerUp = ev.SpriteArray[0];
            canvasCtx.canvas.removeEventListener("powerUpNivel1", PowerUpSprite);
        };
        canvasCtx.canvas.addEventListener("powerUpNivel1", PowerUpSprite);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel1/PowerUp.txt", 1,"powerUpNivel1");

        // carregar as perguntas e a sprite do power up
        let questions = function (ev) {
            QuestionArray = ev.QuestoesArray;
            canvasCtx.canvas.removeEventListener("questoesNivel1", questions);
        };
        canvasCtx.canvas.addEventListener("questoesNivel1", questions);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel1/Questoes.txt", 2);

        // carregar os muros
        canvasCtx.canvas.addEventListener("spritesLoaded", loadingElements);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel1/Nivel1.txt",1, "spritesLoaded");
    }
    else if (playerInfo[2] === "2") {
        audio.src = "../resources/audio/game_music/Nivel2Music.mp3";

        // reset / preparacao de variavei globais
        levelTimer = 120;
        EDtimeStamp = enemyRStart =  enemyLStart =  enemyDStart =  enemyUStart = 0;
        energyDrink1 = energyDrink2 = energyDrink3 = energyDrink4 = energyDrink5 = segFaultCatch = false;

        // carregar a barra da energy drink
        let PowerUpBarLoader = function (ev) {

            // colocar na posição certa
            for (let x = 0; x < ev.SpriteArray.length; ++x) {
                if      (ev.SpriteArray[x].img.id === "powerUp1.png") powerUpBar[0] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUp2.png") powerUpBar[1] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUp3.png") powerUpBar[2] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUp4.png") powerUpBar[3] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUp5.png") powerUpBar[4] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUpStackED.png") powerUp = ev.SpriteArray[x];
            }
            canvasCtx.canvas.removeEventListener("PowerUpBar", PowerUpBarLoader);
        };
        canvasCtx.canvas.addEventListener("PowerUpBar", PowerUpBarLoader);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel2/PowerUpBar.txt", 1, "PowerUpBar");

        // carregar o inimigo segFault
        let segFaultLoader = function (ev) {

            // colocar as sprites na posição correta
            for (let x = 0; x < ev.SpriteArray.length; ++x) {

                if      (ev.SpriteArray[x].img.id === "segFault-R-1.png") {
                    segFaultSpSheet[0] = ev.SpriteArray[x];
                    enemyRStart = segFaultSpSheet[0].x;
                }
                else if (ev.SpriteArray[x].img.id === "segFault-R-2.png") segFaultSpSheet[1] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "segFault-L-1.png") {
                    segFaultSpSheet[2] = ev.SpriteArray[x];
                    enemyLStart = segFaultSpSheet[2].x;
                }
                else if (ev.SpriteArray[x].img.id === "segFault-L-2.png") segFaultSpSheet[3] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "segFault-U-1.png") {
                    segFaultSpSheet[4] = ev.SpriteArray[x];
                    enemyUStart = segFaultSpSheet[4].y;
                }
                else if (ev.SpriteArray[x].img.id === "segFault-U-2.png") segFaultSpSheet[5] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "segFault-D-1.png") {
                    segFaultSpSheet[6] = ev.SpriteArray[x];
                    enemyDStart = segFaultSpSheet[6].y;
                }
                else if (ev.SpriteArray[x].img.id === "segFault-D-2.png") segFaultSpSheet[7] = ev.SpriteArray[x];
            }
            canvasCtx.canvas.removeEventListener("segFault", PowerUpBarLoader);
        };
        canvasCtx.canvas.addEventListener("segFault", segFaultLoader);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel2/SegFault.txt", 1, "segFault");

        // carregar muros e energy drink
        canvasCtx.canvas.addEventListener("spritesLoaded", loadingElements);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel2/Nivel2.txt", 1, "spritesLoaded");
    }
    else if (playerInfo[2] === "3") {
        audio.src = "../resources/audio/game_music/Nivel3Music.mp3";

        // reset / preparacao de variaveis globais
        levelTimer = 380;
        bugVertical = bugHorizontal = coffeeEfect = coffee1 = coffee2 = coffee3 = coffee4 = coffee5 = false;
        bugSentido1 = "down";
        bugSentido2 = "right";
        bugEfectCounter = stressTimeStamp = StressDuration = PlayerSlowMovement = sleepyTimeStamp = coffeeTimeStamp = 0;

        // carregar a barra do cafe
        let CoffeeLoader = function (ev) {

            // colocar na posição certa
            for (let x = 0; x < ev.SpriteArray.length; ++x) {
                if      (ev.SpriteArray[x].img.id === "powerUpCoffe1.png") powerUpBar[0] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUpCoffe2.png") powerUpBar[1] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUpCoffe3.png") powerUpBar[2] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUpCoffe4.png") powerUpBar[3] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUpCoffe5.png") powerUpBar[4] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "powerUpStackCoffee.png") powerUp = ev.SpriteArray[x];
            }
            canvasCtx.canvas.removeEventListener("PowerUpBar", CoffeeLoader);
        };
        canvasCtx.canvas.addEventListener("PowerUpBar", CoffeeLoader);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel3/PowerUpBar.txt", 1, "PowerUpBar");

        // carregar o inimigo bug
        let BugLoader = function (ev) {

            // colocar as sprites na posição correta
            for (let x = 0; x < ev.SpriteArray.length; ++x) {
                if      (ev.SpriteArray[x].img.id === "bug-R-1.png") bugSpriteSheet[0] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "bug-R-2.png") bugSpriteSheet[1] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "bug-L-1.png") bugSpriteSheet[2] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "bug-L-2.png") bugSpriteSheet[3] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "bug-U-1.png") bugSpriteSheet[4] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "bug-U-2.png") bugSpriteSheet[5] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "bug-D-1.png") bugSpriteSheet[6] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "bug-D-2.png") bugSpriteSheet[7] = ev.SpriteArray[x];
            }
            canvasCtx.canvas.removeEventListener("Bug", BugLoader);
        };
        canvasCtx.canvas.addEventListener("Bug", BugLoader);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel3/Bug.txt", 1, "Bug");

        // carregar as camadas do olho
        let EyeLoader = function (ev) {

            // colocar as sprites na posição correta
            for (let x = 0; x < ev.SpriteArray.length; ++x) {
                if      (ev.SpriteArray[x].img.id === "eye1.png") eyeSpriteSheet[0] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "eye2.png") eyeSpriteSheet[1] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "eye3.png") eyeSpriteSheet[2] = ev.SpriteArray[x];
                else if (ev.SpriteArray[x].img.id === "eye4.png") eyeSpriteSheet[3] = ev.SpriteArray[x];
            }
            canvasCtx.canvas.removeEventListener("Eye", EyeLoader);
        };
        canvasCtx.canvas.addEventListener("Eye", EyeLoader);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel3/Eye.txt", 1, "Eye");

        // carregar muros e o cafe
        canvasCtx.canvas.addEventListener("spritesLoaded", loadingElements);
        loadLevel(canvasCtx, canvas, "../resources/textFiles/Niveis/Nivel3/Nivel3.txt",1, "spritesLoaded");
    }

    function loadingElements(ev) {

        // array com os muros e as sprites dos powerUps
        SpriteArray = ev.SpriteArray;
        // obter a sprite da lava
        for (let i = 0; i < SpriteArray.length; ++i) {
            if (playerInfo[0] !== "1" && SpriteArray[i].img.id === "lava.png") {
                lava = SpriteArray[i];
                SpriteArray.splice(i, 1);
            }
        }

        // listeners das setas
        kdh = function(ev) {
            switch (ev.code) {
                case "ArrowLeft":
                    if (inverteMovimento === false) PlayerPosition[1].left = true;
                    else PlayerPosition[0].right = true;
                    break;
                case "ArrowRight":
                    if (inverteMovimento === false) PlayerPosition[0].right = true;
                    else PlayerPosition[1].left = true;
                    break;
                case "ArrowUp":
                    if (inverteMovimento === false) {
                        PlayerPosition[2].up = true;
                        PlayerPosition[3].up = true;
                    }
                    else {
                        PlayerPosition[4].down = true;
                        PlayerPosition[5].down = true;
                    }
                    break;
                case "ArrowDown":
                    if (inverteMovimento === false) {
                        PlayerPosition[4].down = true;
                        PlayerPosition[5].down = true;
                    }
                    else {
                        PlayerPosition[2].up = true;
                        PlayerPosition[3].up = true;
                    }
                    break;
            }
        };
        kuh = function(ev) {
            switch (ev.code) {
                case "ArrowLeft":
                    if (inverteMovimento === false) PlayerPosition[1].left = false;
                    else PlayerPosition[0].right = false;
                    break;
                case "ArrowRight":
                    if (inverteMovimento === false) PlayerPosition[0].right = false;
                    else PlayerPosition[1].left = false;
                    break;
                case "ArrowUp":
                    if (inverteMovimento === false) {
                        PlayerPosition[2].up = false;
                        PlayerPosition[3].up = false;
                    }
                    else {
                        PlayerPosition[4].down = false;
                        PlayerPosition[5].down = false;
                    }
                    break;
                case "ArrowDown":
                    if (inverteMovimento === false) {
                        PlayerPosition[4].down = false;
                        PlayerPosition[5].down = false;
                    }
                    else {
                        PlayerPosition[2].up = false;
                        PlayerPosition[3].up = false;
                    }
                    break;
            }
        };
        window.addEventListener("keydown", kdh);
        window.addEventListener("keyup", kuh);

        // listener do espaço / O / E / A
        kph = function (ev) {

            if      (ev.code === "Space" && playerInfo[2] !== "1" && TotalPowerUps > 0) {
                powerUpTaken = true;
                --TotalPowerUps;
                if (TotalPowerUps === 0) stackPowerUp = false;
                if (muteSounds === 0) powerUp.sound.play();

                if      (playerInfo[2] === "2") {

                    // se estiver a apanhar uma bedida sem estar soube o efeito doutra aumenta o speed
                    if (EDtimeStamp === 0) for (let n = 0; n < 10; ++n) PlayerPosition[n].speed = 2;

                    // se apanhar uma bebida durante o efeito doutra atualiza o temporizador do efeito
                    EDtimeStamp = Math.round(new Date().getTime() / 1000);
                }
                else if (playerInfo[2] === "3") {

                    // se apanhar um cafe inicia o temporizador do efeito
                    coffeeTimeStamp = Math.round(new Date().getTime() / 1000);
                    coffeeEfect = true;
                }
            }
            else if (ev.code === "KeyO") OptionsPress = true;
            else if (ev.code === "KeyE") ExitPress = true;
            else if (ev.code === "KeyA") HelpPress = true;
            else if (ev.code === "KeyP") PausedPress = true;
        };
        window.addEventListener("keypress", kph);

        // esperar que os sons das sprites sejam carregados
        var startGame = function () {
            lava.sound.removeEventListener('canplaythrough', startGame);
            drawBackground(canvasCtx, canvas, "GamePlay");

            for (let x = 0; x < SpriteArray.length; ++x)
                // desenhar os muros que estao dentro da canvas e o jogador em idle
                if (SpriteArray[x].x < canvas.width) SpriteArray[x].draw(canvasCtx);

            audio.play();
            movementHandler(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, 0);
        };
        lava.sound.addEventListener('canplaythrough', startGame);
        canvasCtx.canvas.removeEventListener("spritesLoaded", loadingElements);
    }
}

function loadLevel(canvasCtx, canvas, url, loadMethod, eventName) {

    var LevelFile = new XMLHttpRequest();
    LevelFile.open("GET", url, true);
    LevelFile.onreadystatechange = function() {
        if (LevelFile.readyState === 4){
            if (LevelFile.status === 200 || LevelFile.status === 0) {
                if (loadMethod === 1) {
                    var data = LevelFile.responseText;
                    var sprites = 0;  // contador de sprites
                    var loaded = 0;   // contador de sprites carregadas
                    for (let i = 0; i < data.length; i++) if (data[i] === '\n') ++sprites;
                    var sprite_info = "";
                    var espaco = 0;
                    var Sprite_name = "";
                    var Sprite_X = 0;
                    var Sprite_Y = 0;
                    var Sprite_speed = 0;
                    var Sprite_sound = "";
                    var spArray = new Array(sprites);

                    function new_sprite(X, Y, speed, sound) {

                        // criar e carregar as sprites do nivel
                        let Load = function (ev) {loadHandler(ev, X, Y, speed)};
                        let Sprite = new Image();
                        Sprite.addEventListener("load", Load);
                        Sprite.id = Sprite_name;
                        Sprite.src = "../resources/images/Sprites/" + Sprite_name;

                        function loadHandler(ev, X, Y, speed) {

                            let img = ev.target;
                            let nw = img.naturalWidth;
                            let nh = img.naturalHeight;
                            let SpriteAudio = new Audio();
                            SpriteAudio.src = "../resources/audio/sprite_sound/" + sound;
                            spArray[loaded++] = new SpriteImage(X, Y, nw, nh, speed, img, SpriteAudio);

                            // depois de todas as prites faz o dispatch do array de volta para o gameEngine
                            if (loaded === sprites) {
                                let SpriteArrayEv;
                                if      (eventName === "Player")        SpriteArrayEv = new Event("Player");
                                else if (eventName === "PowerUpBar")    SpriteArrayEv = new Event("PowerUpBar");
                                else if (eventName === "segFault")      SpriteArrayEv = new Event("segFault");
                                else if (eventName === "Bug")           SpriteArrayEv = new Event("Bug");
                                else if (eventName === "Eye")           SpriteArrayEv = new Event("Eye");
                                else if (eventName === "spritesLoaded") SpriteArrayEv = new Event("spritesLoaded");
                                else if (eventName === "powerUpNivel1") SpriteArrayEv = new Event("powerUpNivel1");
                                SpriteArrayEv.SpriteArray = spArray;
                                canvasCtx.canvas.dispatchEvent(SpriteArrayEv);
                            }
                        }
                    }

                    for (let i = 0; i < data.length; i++) {
                        if (data[i] !== ' ' && data[i] !== '\n') sprite_info += data[i];
                        else {
                            ++espaco;
                            if (espaco === 1) Sprite_name = sprite_info;
                            else if (espaco === 2) Sprite_X = parseFloat(sprite_info);
                            else if (espaco === 3) Sprite_Y = parseFloat(sprite_info);
                            else if (espaco === 4) Sprite_speed = parseFloat(sprite_info);
                            else if (espaco === 5) {
                                Sprite_sound = sprite_info;
                                new_sprite(Sprite_X, Sprite_Y, Sprite_speed, Sprite_sound);
                                espaco = 0;     // reset do contador de espaços das linhas
                            }
                            sprite_info = "";   // reset da var que apanha cada parametro das linhas
                        }
                    }
                }
                else if (loadMethod === 2){
                    var data = LevelFile.responseText;
                    var info = "";
                    var espaco = 0;
                    var question = "";
                    var question_pos = 0;
                    var playerX = 0;
                    var playerY = 0;
                    var QuestionArray = new Array(3);
                    var pos = 0;

                    for (let i = 0; i < data.length; ++i){
                        if (data[i] !== ' ' && data[i] !== '\n')   info += data[i];
                        else {
                            ++espaco;
                            if (espaco === 1) question = info;
                            else if (espaco === 2) question_pos = parseInt(info);
                            else if (espaco === 3) playerX = parseInt(info);
                            else if (espaco === 4) {
                                playerY = parseInt(info);

                                var questao = new Array(4);
                                questao[0] = question;          // o numero da questao
                                questao[1] = question_pos;      // a marca onde ela está no mapa
                                questao[2] = playerX;           // posicao X para onde o player vai se errar
                                questao[3] = playerY;           // posicao Y para onde o player vai se errar
                                QuestionArray[pos] = questao;
                                ++pos;          // incrementar a posicao do AspriteArray
                                espaco = 0;     // reset do contador de espaços das linhas

                                if (pos === 3){
                                    var QuestoesEv = new Event("questoesNivel1");
                                    QuestoesEv.QuestoesArray = QuestionArray;
                                    canvasCtx.canvas.dispatchEvent(QuestoesEv);
                                }
                            }
                            info = "";   // reset da var que apanha cada parametro das linhas
                        }
                    }
                }
            }
        }
    };
    LevelFile.send();
}

function movementHandler(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, startTime, time){
    var reqID;
    var movement = function(time){
        if(!startTime)
            startTime = time;
        movementHandler(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, startTime, time);
    };
    reqID = window.requestAnimationFrame(movement);
    render(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, reqID, time - startTime);
}

function render(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, reqID, timer) {

    function upDateCanvas(moving, pos, direcao, control) {

        if      (moving === true) {
            clearCanvas(canvasCtx,canvas);

            // desenhar a lava por baixo de tudo
            if (lavaCatch === false && Math.floor(Math.round(timer) / 1000) >= levelTimer) lavaHandler(true);

            for (let i = 0; i < SpriteArray.length; ++i) {

                // atualizar a sprite sheet do player
                if (i < 10 && i !== pos) {
                    PlayerPosition[i].x = PlayerPosition[pos].x;
                    PlayerPosition[i].y = PlayerPosition[pos].y;
                }

                // atualizar o X e Y das sprites estáticas e dinamicas de cada nivel
                if      (direcao === "right" && control) {
                    SpriteArray[i].x -= PlayerPosition[pos].speed;

                    // atualizar a posicao inicial dos inimigos horizontais no nivel 2 um vez
                    if (i === 0) {

                        enemyRStart -= PlayerPosition[pos].speed;
                        enemyLStart -= PlayerPosition[pos].speed;

                        // manter a lava no sitio certo
                        if (Math.floor(Math.round(timer)/1000) >= levelTimer) lava.x -= PlayerPosition[pos].speed;
                    }

                    // atualizar sprites dinamicas dos niveis 2 e 3
                    if      (playerInfo[2] === "2" && i < 8) segFaultSpSheet[i].x -= PlayerPosition[pos].speed;
                    else if (playerInfo[2] === "3" && i < 8) bugSpriteSheet[i].x  -= PlayerPosition[pos].speed;
                }
                else if (direcao === "left"  && control) {
                    SpriteArray[i].x += PlayerPosition[pos].speed;

                    // atualizar a posicao inicial dos inimigos horizonteis no nivel 2 um vez em
                    if (i === 0) {

                        enemyRStart += PlayerPosition[pos].speed;
                        enemyLStart += PlayerPosition[pos].speed;

                        // manter a lava no sitio certo
                        if (Math.floor(Math.round(timer)/1000) >= levelTimer) lava.x += PlayerPosition[pos].speed;
                    }

                    // atualizar sprites dinamicas dos niveis 2 e 3
                    if      (playerInfo[2] === "2" && i < 8) segFaultSpSheet[i].x += PlayerPosition[pos].speed;
                    else if (playerInfo[2] === "3" && i < 8) bugSpriteSheet[i].x  += PlayerPosition[pos].speed;
                }

                // verificar que elementos estao dentro da canvas para redesenho / atualizaçao
                if (SpriteArray[i].x < (PlayerPosition[pos].x + canvas.width) && (SpriteArray[i].x + SpriteArray[i].width >= (PlayerPosition[pos].x - canvas.width))) {

                    // se houver colisão entre o player e outra sprite
                    if (SpriteArray[i].intersectsPixelCheck(SpriteArray[i], PlayerPosition[pos])) {

                        var id = "";
                        for (let j = 0; j < SpriteArray[i].img.id.length; ++j) {
                            if (SpriteArray[i].img.id[j] === "V" || SpriteArray[i].img.id[j] === "_" || SpriteArray[i].img.id[j] === "." || SpriteArray[i].img.id[j] === "-")
                                break;
                            else
                                id += SpriteArray[i].img.id[j];
                        }

                        if (id === "Muro") {
                            if (direcao === "right") {
                                rightColision = upColision = downColision = true;
                                while (PlayerPosition[1].x + PlayerPosition[1].width >= SpriteArray[i].x) {
                                    PlayerPosition[1].x -= PlayerPosition[1].speed; // decrementa a sprite do sentido oposto para nao ficar preso
                                    PlayerPosition[9].x = PlayerPosition[1].x;      // atualiza o idle neste sentido
                                }
                            }
                            else if (direcao === "left") {
                                leftColision = upColision = downColision = true;
                                while (PlayerPosition[0].x <= SpriteArray[i].x + SpriteArray[i].width) {
                                    PlayerPosition[0].x += PlayerPosition[0].speed; // decrementa a sprite do sentido oposto para nao ficar preso
                                    PlayerPosition[8].x = PlayerPosition[0].x;      // atualiza o idle neste sentido
                                }
                            }
                            else if (direcao === "up") {
                                upColision = leftColision = rightColision = true;
                                while (PlayerPosition[4].y <= SpriteArray[i].y + SpriteArray[i].height || PlayerPosition[5].y <= SpriteArray[i].y + SpriteArray[i].height) {
                                    PlayerPosition[4].y += PlayerPosition[4].speed; // decrementa a sprite do sentido oposto para nao ficar preso
                                    PlayerPosition[5].y = PlayerPosition[4].y;      // atualiza a outra sprite com o mesmo sentido
                                    PlayerPosition[7].y = PlayerPosition[4].y;      // atualiza o idle neste sentido
                                }
                            }
                            else if (direcao === "down") {
                                downColision = leftColision = rightColision = true;
                                while (PlayerPosition[2].y + PlayerPosition[2].height >= SpriteArray[i].y || PlayerPosition[3].y + PlayerPosition[3].height >= SpriteArray[i].y) {
                                    PlayerPosition[2].y -= PlayerPosition[2].speed; // decrementa a sprite do sentido oposto para nao ficar preso
                                    PlayerPosition[3].y = PlayerPosition[2].y;      // atualiza a outra sprite com o mesmo sentido
                                    PlayerPosition[6].y = PlayerPosition[2].y;      // atualiza o idle neste sentido
                                }
                            }
                        }

                        // terminar o nivel
                        else if (id === "exit") {
                            window.cancelAnimationFrame(reqID);
                            upDateCanvas(false);

                            // no final do som da sprite exit sai do nivel
                            SpriteArray[i].sound.addEventListener("ended", function () {
                                SpriteArray[i].sound.currentTime = 0;
                                endLevel();
                            });
                            audio.src = ""; // para a musica do nivel
                            SpriteArray[i].sound.volume = buttonAudio.volume;
                            SpriteArray[i].sound.play();
                            return;
                        }

                        // power ups do nivel 1
                        if (playerInfo[2] === "1") {
                            if      (id === "dica1" && dica1 === false) {
                                dica1 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "dica2" && dica2 === false) {
                                dica2 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "dica3" && dica3 === false) {
                                dica3 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "dica4" && dica4 === false) {
                                dica4 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                        }

                        // power ups e inimigos do nivel 2
                        else if (playerInfo[2] === "2") {
                            if      (id === "energyDrink1" && energyDrink1 === false) {
                                energyDrink1 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "energyDrink2" && energyDrink2 === false) {
                                energyDrink2 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "energyDrink3" && energyDrink3 === false) {
                                energyDrink3 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "energyDrink4" && energyDrink4 === false) {
                                energyDrink4 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "energyDrink5" && energyDrink5 === false) {
                                energyDrink5 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                        }

                        // power ups do nivel 3
                        else if (playerInfo[2] === "3") {
                            if      (id === "coffee1" && coffee1 === false) {
                                coffee1 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "coffee2" && coffee2 === false) {
                                coffee2 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "coffee3" && coffee3 === false) {
                                coffee3 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "coffee4" && coffee4 === false) {
                                coffee4 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                            else if (id === "coffee5" && coffee5 === false) {
                                coffee5 = true;
                                powerUpHandler(SpriteArray[i]);
                            }
                        }
                    }

                    // redesenhar as sprites que estao dentro da canvas
                    ReDraw(SpriteArray[i]);
                }
            }
        }
        else if (moving === false) {

            // desenhar a lava por baixo de tudo
            if (lavaCatch === false && Math.floor(Math.round(timer) / 1000) >= levelTimer) lavaHandler(false);

            // percorrer o array de sprites para redesenhar as sprites que estao dentro da canvas
            for (let i = 0; i < SpriteArray.length; ++i) {

                if (SpriteArray[i].x < (PlayerPosition[0].x + canvas.width) && (SpriteArray[i].x + SpriteArray[i].width >= (PlayerPosition[0].x - canvas.width)))
                    ReDraw(SpriteArray[i]);
            }
        }
    }

    function ReDraw(sprite) {
        if      (playerInfo[2] === "1") {

            // nao redesenhar as dicas quando o jogador se move porque isso depende doutros factores
            if (sprite.img.id !== "dica1.png" && sprite.img.id !== "dica2.png" && sprite.img.id !== "dica3.png" && sprite.img.id !== "dica4.png" )
                sprite.draw(canvasCtx);

            // so desenha a dica se ainda nao tiver sido apanhada
            else if (dica1 === false && sprite.img.id === "dica1.png") sprite.draw(canvasCtx);
            else if (dica2 === false && sprite.img.id === "dica2.png") sprite.draw(canvasCtx);
            else if (dica3 === false && sprite.img.id === "dica3.png") sprite.draw(canvasCtx);
            else if (dica4 === false && sprite.img.id === "dica4.png") sprite.draw(canvasCtx);
        }
        else if (playerInfo[2] === "2") {

            // nao redesenhar as bebidas e os erros quando o jogador se move porque isso depende doutros factores
            if (sprite.img.id !== "energyDrink1.png" && sprite.img.id !== "energyDrink2.png" && sprite.img.id !== "energyDrink3.png" && sprite.img.id !== "energyDrink4.png" && sprite.img.id !== "energyDrink5.png")
                sprite.draw(canvasCtx);

            // so desenha a bebida se ainda nao tiver sido apanhada
            else if (energyDrink1 === false && sprite.img.id === "energyDrink1.png") sprite.draw(canvasCtx);
            else if (energyDrink2 === false && sprite.img.id === "energyDrink2.png") sprite.draw(canvasCtx);
            else if (energyDrink3 === false && sprite.img.id === "energyDrink3.png") sprite.draw(canvasCtx);
            else if (energyDrink4 === false && sprite.img.id === "energyDrink4.png") sprite.draw(canvasCtx);
            else if (energyDrink5 === false && sprite.img.id === "energyDrink5.png") sprite.draw(canvasCtx);
        }
        else if (playerInfo[2] === "3") {

            // nao redesenhar as sprites do bug nem dos cafes porque essas dependem doutros factores
            if (sprite.img.id !== "coffee1.png" && sprite.img.id !== "coffee2.png" && sprite.img.id !== "coffee3.png" && sprite.img.id !== "coffee4.png" && sprite.img.id !== "coffee5.png")
                sprite.draw(canvasCtx);

            // so redesenha o cafe se ainda nao tiver sido apanhado
            else if (coffee1 === false && sprite.img.id === "coffee1.png") sprite.draw(canvasCtx);
            else if (coffee2 === false && sprite.img.id === "coffee2.png") sprite.draw(canvasCtx);
            else if (coffee3 === false && sprite.img.id === "coffee3.png") sprite.draw(canvasCtx);
            else if (coffee4 === false && sprite.img.id === "coffee4.png") sprite.draw(canvasCtx);
            else if (coffee5 === false && sprite.img.id === "coffee5.png") sprite.draw(canvasCtx);
        }
    }

    function powerUpHandler (sprite) {
        stackPowerUp = true;
        if (muteSounds === 0) {
            sprite.sound.volume = buttonAudio.volume;
            sprite.sound.play();
        }
        ++TotalPowerUps;
    }

    // so para o NIVEL 1
    function Quizz( url, playerScore, PlayerSpSheet, Question) {

        let sWidth = window.screen.availWidth;
        let wWidth = 700;
        let wHeight = 300;
        let wLeft = (sWidth - wWidth)/2;	//center window on the screen
        let myWindow = window.open(url, '*', "width = " + wWidth + ", height = " + wHeight + ", left = " + wLeft);
        let acertou = document.getElementById("RespostaCorreta");
        let errou = document.getElementById("RespostaErrada");
        var controlo = tentativas;

        // caso o jogador queira fechar a pergunta não pode passar
        function checkWindow() {
            if (myWindow && myWindow.closed) {
                window.clearInterval(intervalID);

                if (controlo === tentativas) {

                    if (muteSounds === 0) {
                        errou.volume = buttonAudio.volume;
                        errou.play();
                    }

                    for (let i = 0; i < PlayerSpSheet.length-1; ++i){
                        PlayerSpSheet[i].x = Question[2];
                        PlayerSpSheet[i].y = Question[3];
                    }
                    upDateCanvas(true, 0);

                    rightColision = leftColision = upColision = downColision = false;
                    PlayerSpSheet[0].right = false;
                    myWindow.removeEventListener("message", resposta);
                }
            }
        }
        var intervalID = window.setInterval(checkWindow, 500);

        let resposta = function (ev) {

            ++tentativas;
            if      (ev.data === "acertou") {

                if (muteSounds === 0) {
                    acertou.volume = buttonAudio.volume;
                    acertou.play();
                }
                ++passou; // para nao repetir perguntas

                // caso nao tenha apanhado as dicas não as redesenhar se passar à perguntar
                if      (passou === 1) dica1 = true;
                else if (passou === 2) dica1 = dica2 = true;
                else if (passou === 3) dica1 = dica2 = dica3 = true;
            }
            else if (ev.data === "errou" && TotalPowerUps === 0) {
                if (muteSounds === 0) {
                    errou.volume = buttonAudio.volume;
                    errou.play();
                }

                // se errar faz setback da posição do jogador
                for (let i = 0; i < PlayerSpSheet.length-1; ++i){
                    PlayerSpSheet[i].x = Question[2];
                    PlayerSpSheet[i].y = Question[3];
                }
                upDateCanvas(true, 0);
            }
            else if (ev.data === "errou" && TotalPowerUps > 0) {

                // decrementar as tentativas
                --TotalPowerUps;
                if (muteSounds === 0) {
                    errou.volume = buttonAudio.volume;
                    errou.play();
                }

                // se errar mas as tentativas nao estavam a zero mantem o player na mesma posição
                for (let i = 0; i < PlayerSpSheet.length-1; ++i)
                    PlayerSpSheet[i].x -= PlayerSpSheet[i].width + 10;
                upDateCanvas(true, 0);
            }

            rightColision = leftColision = upColision = downColision = false;
            PlayerSpSheet[0].right = false;
            myWindow.removeEventListener("message", resposta);
        };
        myWindow.addEventListener("message", resposta);
    }

    function lavaHandler (moving) {

        if (moving === false) lava.clear(canvasCtx);
        lava.x += lava.speed;
        lava.draw(canvasCtx);

        // som do timer
        if (muteSounds === 0) TimerSound.play();

        // verificar se ha colisao da lava com o jogador
        if (lava.intersectsPixelCheck(lava, PlayerPosition[0])) {
            window.cancelAnimationFrame(reqID);
            lavaCatch = true;

            // ao fim do som da lava tocar sai do nivel voltando para o menu de jogo
            lava.sound.addEventListener("ended", function () {
                lava.sound.currentTime = 0;
                if (ended === false) endLevel();
            });
            audio.src = "";
            lava.sound.volume = buttonAudio.volume;
            lava.sound.play();
        }
    }

    // inimigos que se mexem
    function movingEnemies(enemy) {

        if (enemy === "bug") {

            // verificar se o bug está proximo do player
            if (bugSpriteSheet[1].x + bugSpriteSheet[1].width > PlayerPosition[0].x -  canvas.width && bugSpriteSheet[1].x < PlayerPosition[0].x +  canvas.width) bugHorizontal = true;
            if (bugSpriteSheet[4].x + bugSpriteSheet[4].width > PlayerPosition[0].x - canvas.width && bugSpriteSheet[4].x < PlayerPosition[0].x + canvas.width) bugVertical = true;

            if (bugVertical) {

                // incrementar a posição de acordo com o sentido do movimento e atualizar as restantes sprites
                if (bugSentido1 === "up") {
                    bugSpriteSheet[4].clear(canvasCtx);
                    bugSpriteSheet[5].clear(canvasCtx);
                    bugSpriteSheet[5].y -= bugSpriteSheet[5].speed;
                    bugSpriteSheet[6].y = bugSpriteSheet[7].y = bugSpriteSheet[4].y = bugSpriteSheet[5].y;

                    if (Math.floor(Math.round(timer) / 140) % 2 === 0) bugSpriteSheet[4].draw(canvasCtx);
                    else bugSpriteSheet[5].draw(canvasCtx);
                }
                else if (bugSentido1 === "down") {
                    bugSpriteSheet[6].clear(canvasCtx);
                    bugSpriteSheet[7].clear(canvasCtx);
                    bugSpriteSheet[7].y += bugSpriteSheet[7].speed;
                    bugSpriteSheet[4].y = bugSpriteSheet[5].y = bugSpriteSheet[6].y = bugSpriteSheet[7].y;

                    if (Math.floor(Math.round(timer) / 140) % 2 === 0) bugSpriteSheet[6].draw(canvasCtx);
                    else bugSpriteSheet[7].draw(canvasCtx);
                }

                // verificar colisões do bug com os muros que estao da direcao do seu sentido
                for (let i = 0; i < SpriteArray.length; ++i) {

                    if (SpriteArray[i].x <= bugSpriteSheet[4].x + bugSpriteSheet[4].width || SpriteArray[i].x + SpriteArray[i].width >= bugSpriteSheet[4].x ) {

                        var id = "";
                        for (let j = 0; j < SpriteArray[i].img.id.length; ++j) {
                            if (SpriteArray[i].img.id[j] === "V" || SpriteArray[i].img.id[j] === "_" || SpriteArray[i].img.id[j] === "." || SpriteArray[i].img.id[j] === "-") break;
                            else id += SpriteArray[i].img.id[j];
                        }

                        // se bater na perede inverte o sentido do movimento
                        if (id === "Muro" && bugSentido1 === "down" && bugSpriteSheet[4].boundInBoxColision(SpriteArray[i], bugSpriteSheet[4])) {
                            bugSentido1 = "up";
                            break;
                        }
                        else if (id === "Muro" && bugSentido1 === "up" && bugSpriteSheet[4].boundInBoxColision(SpriteArray[i], bugSpriteSheet[4])) {
                            bugSentido1 = "down";
                            break;
                        }
                    }
                }

                // se o player tocar no bug fica mais lento
                if (bugSpriteSheet[4].intersectsPixelCheck(PlayerPosition[0], bugSpriteSheet[4])) {

                    if (PlayerSlowMovement === 0) {
                        ++bugEfectCounter; // incremeta o numero de vezes que o bug toca no player
                        if (muteSounds === 0) {
                            bugSpriteSheet[4].sound.volume = buttonAudio.volume;
                            bugSpriteSheet[4].sound.play();
                        }

                        // faz o jogador mais lento
                        for (let y = 0; y < PlayerPosition.length; ++y) PlayerPosition[y].speed = 0.5;
                        PlayerSlowMovement = Math.floor(Math.round(timer) / 1000);  // time stampdwdwdwdddw
                    }
                }
                bugVertical = false;
            }

            if (bugHorizontal) {

                // incrementar a posição de acordo com o sentido do movimento e atualizar as restantes sprites
                if      (bugSentido2 === "right") {
                    bugSpriteSheet[0].clear(canvasCtx);
                    bugSpriteSheet[1].clear(canvasCtx);
                    bugSpriteSheet[1].x += bugSpriteSheet[1].speed;
                    bugSpriteSheet[2].x = bugSpriteSheet[3].x = bugSpriteSheet[0].x = bugSpriteSheet[1].x;

                    if (Math.floor(Math.round(timer) / 140) % 2 === 0) bugSpriteSheet[0].draw(canvasCtx);
                    else bugSpriteSheet[1].draw(canvasCtx);
                }
                else if (bugSentido2 === "left") {
                    bugSpriteSheet[2].clear(canvasCtx);
                    bugSpriteSheet[3].clear(canvasCtx);
                    bugSpriteSheet[3].x -= bugSpriteSheet[3].speed;
                    bugSpriteSheet[0].x = bugSpriteSheet[1].x = bugSpriteSheet[2].x = bugSpriteSheet[3].x;

                    if (Math.floor(Math.round(timer) / 140) % 2 === 0) bugSpriteSheet[2].draw(canvasCtx);
                    else bugSpriteSheet[3].draw(canvasCtx);
                }

                // verificar colisões do bug
                for (let i = 0; i < SpriteArray.length; ++i) {

                    if ( (SpriteArray[i].x <= bugSpriteSheet[0].x + bugSpriteSheet[0].width + bugSpriteSheet[0].speed || SpriteArray[i].x + SpriteArray[i].width >= bugSpriteSheet[0].x - bugSpriteSheet[0].speed ) && (SpriteArray[i].y <= bugSpriteSheet[0].y + bugSpriteSheet[0].height || SpriteArray[i].y + SpriteArray[i].height >= bugSpriteSheet[0].y) ){

                        var id = "";
                        for (let j = 0; j < SpriteArray[i].img.id.length; ++j) {
                            if (SpriteArray[i].img.id[j] === "V" || SpriteArray[i].img.id[j] === "_" || SpriteArray[i].img.id[j] === "." || SpriteArray[i].img.id[j] === "-") break;
                            else id += SpriteArray[i].img.id[j];
                        }

                        // se bater na perede inverte o sentido do movimento
                        if (id === "Muro" && bugSentido2 === "right" && bugSpriteSheet[0].boundInBoxColision(SpriteArray[i], bugSpriteSheet[0])) {
                            bugSentido2 = "left";
                            break;
                        }
                        else if (id === "Muro" && bugSentido2 === "left" && bugSpriteSheet[0].boundInBoxColision(SpriteArray[i], bugSpriteSheet[0])) {
                            bugSentido2 = "right";
                            break;
                        }
                    }

                    // se o player tocar no bug fica mais lento
                    if (bugSpriteSheet[0].intersectsPixelCheck(PlayerPosition[0],bugSpriteSheet[0])) {

                        if (PlayerSlowMovement === 0) {
                            ++bugEfectCounter; // incremeta o numero de vezes que o bug toca no player
                            if (muteSounds === 0) {
                                bugSpriteSheet[0].sound.volume = buttonAudio.volume;
                                bugSpriteSheet[0].sound.play();
                            }

                            // faz o jogador mais lento
                            for (let y = 0; y < PlayerPosition.length; ++y) PlayerPosition[y].speed = 0.5;
                            PlayerSlowMovement = Math.floor(Math.round(timer) / 1000);  // time stampdwdwdwdddw
                        }
                    }
                }
                bugHorizontal = false;
            }

            // se o player tocou no bug e ja passaram 5 seg repoe a velocidade do player
            if (Math.floor(Math.round(timer) / 1000) - PlayerSlowMovement >= 5) {
                for (let y = 0; y < PlayerPosition.length; ++y) PlayerPosition[y].speed = 1;
                PlayerSlowMovement = 0;
            }
        }
        else if (enemy === "segFault") {

            if (segFaultCatch === false) {

                if (PlayerPosition[0].x > enemyRStart + 250 && PlayerPosition[0].x < 2600 && PlayerPosition[0].y > segFaultSpSheet[0].y - (2 * segFaultSpSheet[0].height) && PlayerPosition[0].y + PlayerPosition[0].height <= segFaultSpSheet[0].y + (3 * segFaultSpSheet[0].height)) SegFaultAtack(0, 1, "right");
                else if (segFaultSpSheet[0].x > enemyRStart)  resetPosition(0, 1, "right");

                else if (PlayerPosition[0].x > enemyLStart - HorizontalLLimit && PlayerPosition[0].x < enemyLStart && PlayerPosition[0].y > segFaultSpSheet[2].y - (2*segFaultSpSheet[2].height) && PlayerPosition[0].y + PlayerPosition[0].height <= segFaultSpSheet[2].y + (3 * segFaultSpSheet[2].height)) SegFaultAtack(2, 3, "left");
                else if (segFaultSpSheet[2].x < enemyLStart)  resetPosition(2, 3, "left");

                else if (PlayerPosition[0].x > segFaultSpSheet[4].x && PlayerPosition[0].x < segFaultSpSheet[4].x + segFaultSpSheet[4].width && PlayerPosition[0].y < 350) SegFaultAtack(4, 5, "up");
                else if (segFaultSpSheet[4].y < enemyUStart) resetPosition(4, 5, "up");

                else if (PlayerPosition[0].x + 15 > segFaultSpSheet[6].x && PlayerPosition[0].x < segFaultSpSheet[6].x + segFaultSpSheet[6].width && PlayerPosition[0].y <= segFaultSpSheet[6].y + 350) SegFaultAtack(6, 7, "down");
                else if (segFaultSpSheet[6].y > enemyDStart)  resetPosition(6, 7, "down");

                else {
                    // de x em x segundos revela os inimigos
                    if (Math.floor(Math.round(timer) / 1000) - timeStamp >= 3) {
                        segFaultSpSheet[0].draw(canvasCtx);
                        segFaultSpSheet[2].draw(canvasCtx);
                        segFaultSpSheet[4].draw(canvasCtx);
                        segFaultSpSheet[6].draw(canvasCtx);
                        timeStamp = Math.floor(Math.round(timer) / 1000);
                    }
                    else if (Math.floor(Math.round(timer) / 1000) - timeStamp <= 2) {
                        segFaultSpSheet[0].clear(canvasCtx);
                        segFaultSpSheet[2].clear(canvasCtx);
                        segFaultSpSheet[4].clear(canvasCtx);
                        segFaultSpSheet[6].clear(canvasCtx);
                    }
                }
            }
            else if (segFaultCatch === true && Math.floor(Math.round(timer) / 1000) - timeStamp >= 1) {

                // come o jogador
                segFaultSpSheet[SegFault].clear(canvasCtx);
                segFaultSpSheet[SegFault+1].clear(canvasCtx);

                if (SegFaultSentido === "right") {
                    segFaultSpSheet[SegFault].x += 0.1;
                    segFaultSpSheet[SegFault+1].x = segFaultSpSheet[SegFault].x;
                    if (segFaultSpSheet[SegFault].x + segFaultSpSheet[SegFault].width > PlayerPosition[0].x + PlayerPosition[0].width) {
                        reStarLevel();
                        return;
                    }
                }
                else if (SegFaultSentido === "left") {
                    segFaultSpSheet[SegFault].x -= 0.1;
                    segFaultSpSheet[SegFault+1].x = segFaultSpSheet[SegFault].x;
                    if (segFaultSpSheet[SegFault].x < PlayerPosition[0].x) {
                        reStarLevel();
                        return;
                    }
                }
                else if (SegFaultSentido === "down") {
                    segFaultSpSheet[SegFault].y += 0.1;
                    segFaultSpSheet[SegFault+1].y = segFaultSpSheet[SegFault].y;
                    if (segFaultSpSheet[SegFault].y + segFaultSpSheet[SegFault].height > PlayerPosition[0].y + PlayerPosition[0].height) {
                        reStarLevel();
                        return;
                    }
                }
                else if (SegFaultSentido === "up") {
                    segFaultSpSheet[SegFault].y -= 0.1;
                    segFaultSpSheet[SegFault+1].y = segFaultSpSheet[SegFault].y;
                    if (segFaultSpSheet[SegFault].y < PlayerPosition[0].y) {
                        reStarLevel();
                        return;
                    }
                }

                PlayerPosition[7].draw(canvasCtx);

                if (Math.floor(Math.round(timer) / 140) % 2 === 0) {
                    segFaultSpSheet[SegFault].draw(canvasCtx);
                    if (muteSounds === 0) {
                        segFaultSpSheet[SegFault].sound.volume = buttonAudio.volume;
                        segFaultSpSheet[SegFault].sound.play();
                    }
                }
                else segFaultSpSheet[SegFault+1].draw(canvasCtx);
            }

            function SegFaultAtack(sprite1, sprite2, sentido) {
                segFaultSpSheet[sprite1].clear(canvasCtx);
                segFaultSpSheet[sprite2].clear(canvasCtx);

                if      (sentido === "right") {
                    segFaultSpSheet[sprite1].x += PlayerPosition[sprite1].speed + 0.3;
                    segFaultSpSheet[sprite2].x = segFaultSpSheet[sprite1].x;
                }
                else if (sentido === "left") {
                    segFaultSpSheet[sprite1].x -= PlayerPosition[sprite1].speed + 0.3;
                    segFaultSpSheet[sprite2].x = segFaultSpSheet[sprite1].x;
                }
                else if (sentido === "down") {
                    segFaultSpSheet[sprite1].y += PlayerPosition[sprite1].speed + 0.3;
                    segFaultSpSheet[sprite2].y = segFaultSpSheet[sprite1].y;
                }
                else if (sentido === "up") {
                    segFaultSpSheet[sprite1].y -= PlayerPosition[sprite1].speed + 0.3;
                    segFaultSpSheet[sprite2].y = segFaultSpSheet[sprite1].y;
                }

                if (Math.floor(Math.round(timer) / 140) % 2 === 0) segFaultSpSheet[sprite1].draw(canvasCtx);
                else segFaultSpSheet[sprite2].draw(canvasCtx);

                // se apanhar o jogador faz animação e reinicia o nivel
                if (segFaultSpSheet[sprite1].intersectsPixelCheck(PlayerPosition[0], segFaultSpSheet[sprite1])) {

                    // bloqueia o jogador
                    rightColision = leftColision = upColision = downColision = true;
                    segFaultCatch = true;

                    // time stamp do momento em que apanhou o jogador
                    timeStamp = Math.floor(Math.round(timer) / 1000);
                    audio.pause();

                    SegFault = sprite1;
                    SegFaultSentido = sentido;
                }
            }

            function resetPosition(sprite1, sprite2, sentido) {
                segFaultSpSheet[sprite1].clear(canvasCtx);
                segFaultSpSheet[sprite2].clear(canvasCtx);

                if      (sentido === "right") {
                    segFaultSpSheet[sprite1].x -= 1;
                    segFaultSpSheet[sprite2].x = segFaultSpSheet[sprite1].x;
                }
                else if (sentido === "left") {
                    segFaultSpSheet[sprite1].x += 1;
                    segFaultSpSheet[sprite2].x = segFaultSpSheet[sprite1].x;
                }
                else if (sentido === "down") {
                    segFaultSpSheet[sprite1].y -= 1;
                    segFaultSpSheet[sprite2].y = segFaultSpSheet[sprite1].y;
                }
                else if (sentido === "up") {
                    segFaultSpSheet[sprite1].y += 1;
                    segFaultSpSheet[sprite2].y = segFaultSpSheet[sprite1].y;
                }

                if (Math.floor(Math.round(timer) / 140) % 2 === 0) segFaultSpSheet[sprite1].draw(canvasCtx);
                else segFaultSpSheet[sprite2].draw(canvasCtx);
            }

            function reStarLevel() {
                // reinicia o nivel depois de comer o jogador
                window.cancelAnimationFrame(reqID);
                rightColision = leftColision = upColision = downColision = true;
                endLevel();
            }
        }
    }

    // arrow right
    if (rightColision === false && PlayerPosition[0].right) {

        PlayerMoving = true;
        if (leftColision === true) leftColision = downColision = upColision = false; // reset

        let X = PlayerPosition[0].x + PlayerPosition[0].width + PlayerPosition[0].speed;
        let SpritesRight;

        if (marcador === 0 && X < 3*(canvas.width/4) && PlayerPosition[0].x >= 0){
            PlayerPosition[0].x += PlayerPosition[0].speed;
            SpritesRight = false
        }
        else if ( X >= 3*(canvas.width/4) && marcador < canvas.width*3){
            marcador += PlayerPosition[0].speed;
            SpritesRight = true;
        }
        else if ( (X >= canvas.width/4 || X <= 3*(canvas.width/4)) && (marcador > 0 && marcador < canvas.width*3) ){
            PlayerPosition[0].x += PlayerPosition[0].speed;
            SpritesRight = false
        }
        else if (Math.floor(marcador) === canvas.width*3 && PlayerPosition[0].x > canvas.width/4 && X <= canvas.width){
            PlayerPosition[0].x += PlayerPosition[0].speed;
            SpritesRight = false
        }

        upDateCanvas(true, 0, "right", SpritesRight);

        // se for nivel 1 verificar se passa a marca das perguntas 1 / 2 / 3 respectivamente
        if (playerInfo[2] === "1" && passou === 0 && PlayerPosition[0].x + marcador === QuestionArray[0][1])
        {
            rightColision = leftColision = upColision = downColision = true; // para impedir que o payer se mexa
            Quizz( "Question1.html", playerInfo, PlayerPosition, QuestionArray[0]);
        }
        else if (playerInfo[2] === "1" && passou === 1 && PlayerPosition[0].x + marcador === QuestionArray[1][1])
        {
            rightColision = leftColision = upColision = downColision = true;
            Quizz( "Question2.html", playerInfo, PlayerPosition, QuestionArray[1]);
        }
        else if (playerInfo[2] === "1" && passou === 2 && PlayerPosition[0].x + marcador === QuestionArray[2][1])
        {
            rightColision = leftColision = upColision = downColision = true;
            Quizz( "Question3.html", playerInfo, PlayerPosition, QuestionArray[2]);
        }
        else {
            PlayerPosition[0].draw(canvasCtx);
            if (muteSounds === 0) {
                PlayerPosition[0].sound.volume = 1;
                PlayerPosition[0].sound.play();
            }
            idle = "right";
        }
    }

    // arrow left
    else if (leftColision === false && PlayerPosition[1].left) {

        PlayerMoving = true;
        if (rightColision === true) rightColision = downColision = upColision = false; // reset

        let X = PlayerPosition[1].x;
        let SpritesLeft;

        if (marcador === 0 && X < 3*(canvas.width/4) && X >= 0){
            PlayerPosition[1].x -= PlayerPosition[1].speed;
            SpritesLeft = false
        }
        else if ( X <= canvas.width/4 && marcador > 0){
            marcador -= PlayerPosition[1].speed;
            SpritesLeft = true;
        }
        else if ( (X >= canvas.width/4 || X <= 3*(canvas.width/4)) && (marcador > 0 && marcador < canvas.width*3) ){
            PlayerPosition[1].x -= PlayerPosition[1].speed;
            SpritesLeft = false
        }
        else if (marcador === canvas.width*3 && X > canvas.width/4 && X < canvas.width){
            PlayerPosition[1].x -= PlayerPosition[1].speed;
            SpritesLeft = false
        }

        upDateCanvas(true, 1, "left", SpritesLeft);

        PlayerPosition[1].draw(canvasCtx);
        if (muteSounds === 0) {
            PlayerPosition[0].sound.volume = 1;
            PlayerPosition[0].sound.play();
        }
        idle = "left";
    }

    // arrow up
    else if (upColision === false && PlayerPosition[2].up && PlayerPosition[2].y - PlayerPosition[2].speed > 0) {

        PlayerMoving = true;
        if (downColision === true) downColision = leftColision = rightColision = false; // reset

        PlayerPosition[2].y -= PlayerPosition[2].speed;

        upDateCanvas(true, 2, "up");

        if (Math.floor(Math.round(timer)/140) % 2 === 0 ) PlayerPosition[2].draw(canvasCtx);
        else PlayerPosition[3].draw(canvasCtx);

        if (muteSounds === 0) {
            PlayerPosition[0].sound.volume = 1;
            PlayerPosition[0].sound.play();
        }
        idle = "up";
    }

    // arrow down
    else if (downColision === false && PlayerPosition[4].down && PlayerPosition[4].y + PlayerPosition[4].height + PlayerPosition[4].speed < canvas.height) {

        PlayerMoving = true;
        if (upColision === true) upColision = leftColision = rightColision = false;

        PlayerPosition[4].y += PlayerPosition[4].speed;

        upDateCanvas(true, 4, "down");

        if (Math.floor(Math.round(timer)/125) % 2 === 0 ) PlayerPosition[4].draw(canvasCtx);
        else PlayerPosition[5].draw(canvasCtx);

        if (muteSounds === 0) {
            PlayerPosition[0].sound.volume = 1;
            PlayerPosition[0].sound.play();
        }
        idle = "down";
    }

    else if (idle === "up") {
        PlayerMoving = false;
        PlayerPosition[6].draw(canvasCtx);
    }
    else if (idle === "down") {
        PlayerMoving = false;
        PlayerPosition[7].draw(canvasCtx);
    }
    else if (idle === "right") {
        PlayerMoving = false;
        PlayerPosition[8].draw(canvasCtx);
    }
    else if (idle === "left") {
        PlayerMoving = false;
        PlayerPosition[9].draw(canvasCtx);
    }

    // NIVEL 1 -> desenhar a lava
    if (playerInfo[2] === "1" && PlayerMoving === false) upDateCanvas(false);

    // NIVEL 2 -> verificar se o efeito da bebida energetica ja passou e desenhar a lava quando o player está parado
    if (playerInfo[2] === "2") {

        if (PlayerMoving === false) upDateCanvas(false);

        // efeito da bebida
        if (EDtimeStamp > 0) {

            // verificar se o efeito da bebida energetica já terminou (10 seg) se nao desenha a barra
            if (Math.round(new Date().getTime() / 1000) - EDtimeStamp <= 2) {
                powerUpBar[0].clear(canvasCtx);
                powerUpBar[0].draw(canvasCtx);
            }
            else if (Math.round(new Date().getTime() / 1000) - EDtimeStamp <= 4) {
                powerUpBar[1].clear(canvasCtx);
                powerUpBar[1].draw(canvasCtx);
            }
            else if (Math.round(new Date().getTime() / 1000) - EDtimeStamp <= 6) {
                powerUpBar[2].clear(canvasCtx);
                powerUpBar[2].draw(canvasCtx);
            }
            else if (Math.round(new Date().getTime() / 1000) - EDtimeStamp <= 8) {
                powerUpBar[3].clear(canvasCtx);
                powerUpBar[3].draw(canvasCtx);
            }
            else if (Math.round(new Date().getTime() / 1000) - EDtimeStamp <= 10) {
                powerUpBar[4].clear(canvasCtx);
                powerUpBar[4].draw(canvasCtx);
            }
            else {
                for (let n = 0; n < 10; ++n) PlayerPosition[n].speed = 1;
                powerUpBar[4].clear(canvasCtx);
                EDtimeStamp = 0;
            }
        }

        // movimentos do seg fault
        movingEnemies("segFault");
    }

    // NIVEL 3 -> efeito do stress / movimentos do bug / efeito do bug sobre o jogador / efeito do sono
    if (playerInfo[2] === "3") {

        // efeito do stress só começa depois de 5 segudos do nivel ter começado
        {
            // de 20 em 20 segundos provoca o efeito do stress com duração variavel entre 5 e 10 segundos
            if (StressDuration === 0 && stressTimeStamp === 0 && Math.floor(Math.round(timer)/1000) > 5) {
                stressTimeStamp = Math.floor(Math.round(timer) / 1000) + 20;
                StressDuration = Math.floor(Math.random() * 10) + 5;
            }

            // inicia o efeito do stress
            if (Math.floor(Math.round(timer) / 1000) >= stressTimeStamp && inverteMovimento === false) inverteMovimento = true;

            // termina o efeito do stress
            if (Math.floor(Math.round(timer) / 1000) >= stressTimeStamp + StressDuration && inverteMovimento === true) {
                inverteMovimento = false;
                StressDuration = stressTimeStamp = 0;
            }
        }

        // bug
        movingEnemies("bug");

        // efeito do sono -> redesenha todos os elementos do mapa a cada fase (excepto bugs) evitando sobreposiçao de fases
        {
            // se o cafe foi bebido verificar se o efeito do cafe já terminou (10 seg)
            if      (coffeeEfect === true && Math.round(new Date().getTime() / 1000) - coffeeTimeStamp <= 2) {
                powerUpBar[0].clear(canvasCtx);
                powerUpBar[0].draw(canvasCtx);
            }
            else if (coffeeEfect === true && Math.round(new Date().getTime() / 1000) - coffeeTimeStamp <= 4) {
                powerUpBar[1].clear(canvasCtx);
                powerUpBar[1].draw(canvasCtx);
            }
            else if (coffeeEfect === true && Math.round(new Date().getTime() / 1000) - coffeeTimeStamp <= 6) {
                powerUpBar[2].clear(canvasCtx);
                powerUpBar[2].draw(canvasCtx);
            }
            else if (coffeeEfect === true && Math.round(new Date().getTime() / 1000) - coffeeTimeStamp <= 8) {
                powerUpBar[3].clear(canvasCtx);
                powerUpBar[3].draw(canvasCtx);
            }
            else if (coffeeEfect === true && Math.round(new Date().getTime() / 1000) - coffeeTimeStamp <= 10) {
                powerUpBar[4].clear(canvasCtx);
                powerUpBar[4].draw(canvasCtx);
            }
            else if (coffeeEfect === true && Math.round(new Date().getTime() / 1000) - coffeeTimeStamp > 10) {
                powerUpBar[4].clear(canvasCtx);
                coffeeEfect = false;
                coffeeTimeStamp = 0;
            }

            // inicia o loop do sono
            if (coffeeEfect === false && sleepyTimeStamp === 0 && Math.floor(Math.round(timer)/1000) > 5) sleepyTimeStamp = Math.floor(Math.round(timer) / 1000);

            // durante 5 segundo faz o efeito do sono
            if (coffeeEfect === false && sleepyTimeStamp > 0 && Math.floor(Math.round(timer) / 1000) - sleepyTimeStamp < 5) {

                timeStamp = Math.floor(Math.round(timer)/1000);
                if (timeStamp - sleepyTimeStamp < 1) {
                    upDateCanvas(false);
                    eyeSpriteSheet[0].draw(canvasCtx);
                }
                else if (timeStamp - sleepyTimeStamp >= 1 && timeStamp - sleepyTimeStamp < 2) {
                    if (PlayerMoving === false) upDateCanvas(false);
                    eyeSpriteSheet[1].draw(canvasCtx);
                }
                else if (timeStamp - sleepyTimeStamp >= 2 && timeStamp - sleepyTimeStamp < 3) {
                    if (PlayerMoving === false) upDateCanvas(false);
                    eyeSpriteSheet[2].draw(canvasCtx);
                }
                else if (timeStamp - sleepyTimeStamp >= 3 && timeStamp - sleepyTimeStamp < 4) {
                    if (PlayerMoving === false) upDateCanvas(false);
                    eyeSpriteSheet[3].draw(canvasCtx);
                }
                else if (timeStamp - sleepyTimeStamp >= 4 && timeStamp - sleepyTimeStamp < 5) clearCanvas(canvasCtx,canvas);
            }

            // reset do time stamp que marca o inicio da animação se o cafe nao tiver sido apanhado
            else if (coffeeEfect === false && Math.floor(Math.round(timer) / 1000) - sleepyTimeStamp >= 5) {
                if (PlayerMoving === false) upDateCanvas(false);
                sleepyTimeStamp = 0;
            }
        }
    }

    // stack dos power ups no canto inferior esquerdo da canvas
    if (TotalPowerUps > 0 && ended === false) {

        if      (TotalPowerUps === 1) powerUp.draw(canvasCtx);
        else if (TotalPowerUps === 2) {
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x -= powerUp.width;
        }
        else if (TotalPowerUps === 3) {
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x -= powerUp.width*2;
        }
        else if (TotalPowerUps === 4) {
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x -= powerUp.width*3;
        }
        else if (TotalPowerUps === 5) {
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x += powerUp.width;
            powerUp.draw(canvasCtx);
            powerUp.x -= powerUp.width*4;
        }
    }
    if (powerUpTaken === true) {
        if      (TotalPowerUps === 0) powerUp.clear(canvasCtx);
        else if (TotalPowerUps === 1) {
            powerUp.x += powerUp.width;
            powerUp.clear(canvasCtx);
            powerUp.x -= powerUp.width;
        }
        else if (TotalPowerUps === 2) {
            powerUp.x += powerUp.width*2;
            powerUp.clear(canvasCtx);
            powerUp.x -= powerUp.width*2;
        }
        else if (TotalPowerUps === 3) {
            powerUp.x += powerUp.width*3;
            powerUp.clear(canvasCtx);
            powerUp.x -= powerUp.width*3;
        }
        else if (TotalPowerUps === 4) {
            powerUp.x += powerUp.width*4;
            powerUp.clear(canvasCtx);
            powerUp.x -= powerUp.width*4;
        }
        upDateCanvas(false);
        powerUpTaken = false;
    }

    // escutar se um dos botoes O / A / E foi premido
    if      (OptionsPress === true) {

        OptionsPress = false;
        InGamePress = true;
        window.cancelAnimationFrame(reqID);
        window.removeEventListener("keypress", kph);
        optionsMenu(canvasCtx, canvas, PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, playerInfo, Math.floor(Math.round(timer)/1000));
    }
    else if (HelpPress === true) {

        HelpPress = false;
        InGamePress = true;
        window.cancelAnimationFrame(reqID);
        window.removeEventListener("keypress", kph);
        helpMenu(canvasCtx, canvas, PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, playerInfo, Math.floor(Math.round(timer)/1000));
    }
    else if (PausedPress === true){

        PausedPress = false;
        InGamePress = true;
        window.cancelAnimationFrame(reqID);
        window.removeEventListener("keypress", kph);
        PauseMenu(canvasCtx, canvas, PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, playerInfo, Math.floor(Math.round(timer)/1000));
    }
    else if (ExitPress === true) {
        window.cancelAnimationFrame(reqID);
        endLevel();
    }

    // timer
    var clock = "Timer: " + Math.floor(Math.round(timer)/1000);
    canvasCtx.font = "20px Arial";
    canvasCtx.fillStyle = "#f3fdff";
    canvasCtx.clearRect(canvas.width-canvasCtx.measureText(clock).width, 0, canvasCtx.measureText(clock).width, 17);
    canvasCtx.fillText(clock, canvas.width-canvasCtx.measureText(clock).width, 16);

    function endLevel() {
        clearCanvas(canvasCtx,canvas);

        // remover listeners das teclas
        window.removeEventListener("keydown", kdh);
        window.removeEventListener("keyup", kuh);
        window.removeEventListener("keypress", kph);

        // distinguir entre sair pela tecla E ou sair por ser apanhado pela lava ou chegar ao fim
        if (ExitPress === true) ExitPress = false;
        else {
            let score = "";
            // reset das variaveis de controlo dos niveis / incrementar o nivel se nao for apanhado pela lava / incrementar o score
            if      (playerInfo[2] === "1") {

                if (lavaCatch === false) {

                    // incrementar / decrementar o score do jogador em função do desempenho no nivel
                    if (dica1 === true) playerInfo[1] += 10;
                    else playerInfo[1] += 100;
                    if (dica2 === true) playerInfo[1] += 10;
                    else playerInfo[1] += 100;
                    if (dica3 === true) playerInfo[1] += 10;
                    else playerInfo[1] += 100;
                    if (dica4 === true) playerInfo[1] += 10;
                    else playerInfo[1] += 100;

                    if (Math.floor(Math.round(timer) / 1000) < levelTimer) playerInfo[1] += 100;
                    else if (Math.floor(Math.round(timer) / 1000) < levelTimer / 2) playerInfo[1] += 200;

                    // score em função das tentativas
                    if (tentativas > 3 && tentativas <= 6) playerInfo[1] -= 15;
                    else if (tentativas > 6 && tentativas <= 9) playerInfo[1] -= 20;
                    else if (tentativas > 9 && tentativas <= 12) playerInfo[1] -= 30;
                    else if (tentativas <= 3) playerInfo[1] += 100;

                    score = playerInfo[1].toString() + ",2";
                }
                else {
                    // se o jogador for apanhado pela lava perde pontos
                    if (playerInfo[1] - 50 >= 0) playerInfo[1] -= 50;
                    else playerInfo[1] = 0;
                    score += playerInfo[1].toString() + ",1";
                }
            }
            else if (playerInfo[2] === "2") {

                if (lavaCatch === false && segFaultCatch === false) {
                    playerInfo[1] += 100;
                    if (Math.floor(Math.round(timer) / 1000) < levelTimer) playerInfo[1] += 100;
                    else if (Math.floor(Math.round(timer) / 1000) < levelTimer / 2) playerInfo[1] += 200;
                    score += playerInfo[1].toString() + ",3";
                }
                else if (lavaCatch === true && segFaultCatch === false) {

                    // se o jogador for apanhado pela lava ou pelos segFaults perde pontos
                    if (playerInfo[1] - 50 >= 0) playerInfo[1] -= 50;
                    else playerInfo[1] = 0;
                    score += playerInfo[1].toString() + ",2";
                }
                else if (segFaultCatch === true) {
                    if (playerInfo[1] - 30 >= 0) playerInfo[1] -= 30;
                    else playerInfo[1] = 0;
                    score += playerInfo[1].toString() + ",2";
                }
            }
            else if (playerInfo[2] === "3") {

                if (lavaCatch === false) {

                    // incrementar / decrementar o score do jogador em função do desempenho no nivel
                    playerInfo[1] -= 10 * bugEfectCounter;
                    if (coffee1 === false && coffee2 === false && coffee3 === false) playerInfo[1] += 300;
                    if (Math.floor(Math.round(timer) / 1000) < levelTimer) playerInfo[1] += 100;
                    else if (Math.floor(Math.round(timer) / 1000) < levelTimer / 2) playerInfo[1] += 500;

                    score = playerInfo[1].toString() + ",1";
                }
                else {
                    // se o jogador for apanhado pela lava perde pontos
                    if (playerInfo[1] - 50 >= 0) playerInfo[1] -= 50;
                    else playerInfo[1] = 0;
                    score += playerInfo[1].toString() + ",3";
                }
            }

            ended = true; // para evitar que o metodo lava catch sejam executado mais que 1 vez depois de chamado
            if (lavaCatch === true) lavaCatch = false;

            // gravar os dados do jogador no localstorage
            var z = 0;
            while (localStorage.key(z) !== playerInfo[0]) ++z;
            localStorage.setItem(localStorage.key(z), score);
        }

        // eliminar as sprites e recarregar o menu de jogo
        for (let w = 0; w < SpriteArray.length; ++w) {

            // eliminar elementos do mapa
            SpriteArray[w] = null;

            // eliminar a sprite sheet do jogador
            if (w < 10) PlayerPosition[w] = null;

            // eliminar a barra de dos powerUps
            if (playerInfo[2] !== "1" && w < 5) powerUpBar[w] = null;

            // se for o nivel 1 elimina as questoes
            if (playerInfo[2] === "1" && w < 3) QuestionArray[w] = null;

            // se for nivel 2 eleimina os segFaults
            if (playerInfo[2] === "2" && w < 8) segFaultSpSheet[w] = null;

            // eliminar elementos do nivel 3
            if (playerInfo[2] === "3") {
                if (w < 8) bugSpriteSheet[w] = null;
                if (w < 5) eyeSpriteSheet[w] = null;
            }
        }

        // por a null todas as variaveis recebidas pelo render, como parametro
        powerUp = SpriteArray = PlayerPosition = QuestionArray = powerUpBar = segFaultSpSheet = bugSpriteSheet = eyeSpriteSheet = null;

        // caso tenha terminado o nivel
        if (segFaultCatch === false) {
            audio.src = "../resources/audio/menu_music/menus.mp3";
            audio.play();
            gameMenu(canvasCtx, canvas);
        }

        // se no nivel 2 o jogador for apanhado pelo segFault reinicia o nível
        else if (segFaultCatch) {
            // reset
            segFaultCatch = rightColision = leftColision = upColision = downColision = false;
            gameEngine(canvasCtx, canvas, playerInfo)
        }
    }
}

function PauseMenu(canvasCtx, canvas, PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, playerInfo, startTime) {

    drawBackground(canvasCtx, canvas, "Menu");
    var PauseMenuLogo = document.getElementById("PauseMenu");
    canvasCtx.drawImage(PauseMenuLogo, 0, 0, 740, 480);
    var dicas = [[211, 424], [1059, 31], [1865, 332], [2304, 226]];
    var energy = [[32, 429], [770, 25], [1102, 336], [2075, 423], [2836, 271]];
    var segFault = [[478, 424], [649, 193], [884, 222], [1370, 152], [2058, 193], [2512, 145]];
    var cafe = [[642, 426], [972, 337], [1712, 331], [2345, 134], [2717, 427]];

    if (playerInfo[2] === "1"){
        var mapa = MapaArray[0];
        mapa.draw(canvasCtx);
        //Fórmula cálculo das posições: x/4 , 180 + y/4
        //Marcar as posições das perguntas (são desenhadas no inicio, a meio do mapa e no fim)
        for (let i = 0; i < QuestionArray.length ; i++){
            canvasCtx.fillStyle = "#fd0000";
            canvasCtx.beginPath();
            canvasCtx.arc(QuestionArray[i][1]/4, 180 + 20, 7, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();

            canvasCtx.fillStyle = "#fd0000";
            canvasCtx.beginPath();
            canvasCtx.arc(QuestionArray[i][1]/4, 180 + mapa.height/2, 7, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();

            canvasCtx.fillStyle = "#fd0000";
            canvasCtx.beginPath();
            canvasCtx.arc(QuestionArray[i][1]/4, 180 + mapa.height - 20, 7, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();
        }
        //Desenhar posição dicas
        for (let i = 0; i < dicas.length ; i++){
            canvasCtx.fillStyle = "#0078ff";
            canvasCtx.beginPath();
            canvasCtx.arc(dicas[i][0]/4 , 180 + dicas[i][1]/4 , 7, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();
        }
        //Desenhar posição saída
        canvasCtx.fillStyle = "#00a200";
        canvasCtx.beginPath();
        canvasCtx.arc(2960/4 - 7, 180 + 420/4 - 7, 7, 0, 2 * Math.PI);
        canvasCtx.fill();
        canvasCtx.stroke();
    }
    if (playerInfo[2] === "2"){
        var mapa = MapaArray[1];
        mapa.draw(canvasCtx);
        //Fórmula cálculo das posições: x/4 , 180 + y/4
        //Marcar as posições dos segFault

        for (let i = 0; i < segFault.length ; i++){
            canvasCtx.fillStyle = "#fd0000";
            canvasCtx.beginPath();
            canvasCtx.arc(segFault[i][0]/4, 180 + segFault[i][1]/4, 7, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();
        }
        //Desenhar posição energy drink
        for (let i = 0; i < energy.length ; i++){
            canvasCtx.fillStyle = "#0078ff";
            canvasCtx.beginPath();
            canvasCtx.arc(energy[i][0]/4 , 180 + energy[i][1]/4 , 7, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();
        }
        //Desenhar posição saída
        canvasCtx.fillStyle = "#00a200";
        canvasCtx.beginPath();
        canvasCtx.arc(2900/4, 180 + 380/4, 7, 0, 2 * Math.PI);
        canvasCtx.fill();
        canvasCtx.stroke();
    }
    if (playerInfo[2] === "3"){
        var mapa = MapaArray[2];
        mapa.draw(canvasCtx);
        //Fórmula cálculo das posições: x/4 , 180 + y/4
        //Desenhar posição cafe
        for (let i = 0; i < cafe.length ; i++){
            canvasCtx.fillStyle = "#0078ff";
            canvasCtx.beginPath();
            canvasCtx.arc(cafe[i][0]/4 , 180 + cafe[i][1]/4 , 7, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();
        }
        //Desenhar posição saída
        canvasCtx.fillStyle = "#00a200";
        canvasCtx.beginPath();
        canvasCtx.arc(2960/4 - 7, 180 + 420/4 - 7, 7, 0, 2 * Math.PI);
        canvasCtx.fill();
        canvasCtx.stroke();
    }

    var quitListener = function(ev){
        if (quitBtn.mouseOverButton(ev)) {
            InGamePress = false;
            if (muteSounds === 0) buttonAudio.play();
            canvasCtx.canvas.removeEventListener("click", quitListener);
            backToGame(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, startTime);

        }
    };
    canvasCtx.canvas.addEventListener("click", quitListener);
}

function rankingMenu(canvasCtx, canvas) {
    drawBackground(canvasCtx, canvas, "Menu");
    var Ranking = document.getElementById("Ranking");
    canvasCtx.drawImage(Ranking, 0, 0, 740, 480);

    // desenhar labels
    canvasCtx.font = "30px Arial Black";
    canvasCtx.fillStyle = "#e1eeee";
    canvasCtx.fillText("Top 5:", canvas.width/2 - canvasCtx.measureText("Top 5:").width/2, canvas.height/10+140);
    canvasCtx.fillStyle = "#9a99d6";
    canvasCtx.font = "20px Arial";
    canvasCtx.fillText("NickName", canvas.width/2-canvasCtx.measureText("Ranking").width-20, canvas.height/10+170);
    canvasCtx.fillText("Score", canvas.width/2+canvasCtx.measureText("Ranking").width, canvas.height/10+170);


    if (localStorage.length > 0){
        var Y = 200;
        for (let i = 0; i < localStorage.length-1 && i < 5 && localStorage.key(i) !== null; ++i){
            canvasCtx.fillText(localStorage.key(i), canvas.width/2-canvasCtx.measureText("Ranking").width-20, canvas.height/10+Y);
            canvasCtx.fillText(localStorage.getItem(localStorage.key(i)).slice(0,-2), canvas.width/2+canvasCtx.measureText("Ranking").width, canvas.height/10+Y);
            Y += 30;
        }
    }
    else {
        canvasCtx.fillText("vazio", canvas.width/2-canvasCtx.measureText("Ranking").width, canvas.height/2+200);
    }

    var quitListener = function(ev){
        if (quitBtn.mouseOverButton(ev)) {
            buttonAudio.play();
            mainMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", quitListener);
        }
    };
    canvasCtx.canvas.addEventListener("click", quitListener);
}

function optionsMenu(canvasCtx, canvas, PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, playerInfo, startTime) {
    drawBackground(canvasCtx, canvas, "Menu");
    var Options = document.getElementById("Options");
    canvasCtx.drawImage(Options, 0, 0, 740, 480);

    // definir variaveis para os botoes do menu das opções
    {
        var volumeUp = ButtonArray[7];
        var volumeDown = ButtonArray[8];
        var increment = ButtonArray[9];
        var soundOn = ButtonArray[10];
        var soundOff = ButtonArray[11];
    }

    // labels
    {
        canvasCtx.font = "30px Arial Black";
        canvasCtx.fillStyle = "#cad4d6";
        var music = "Music: ";
        var musicX = canvas.width / 2 - 300;
        var musicY = canvas.height / 2 + 50;
        canvasCtx.fillText(music, musicX, musicY);

        var volume = "Sons: ";
        var volumeY = canvas.height / 2 + 100;
        canvasCtx.fillText(volume, musicX, volumeY);
    }

    // posicionar e desenhar os botoes
    {
        var buttonInterval = 0;
        var drawCopies = 1; // para criar copias dos botoes de controlo para distinguir entre a musica e volume
        var soundOnCopy;
        var soundOffCopy;
        var volumeUpCopy;
        var volumeDownCopy;
        var incrementCopy;

        controlsPosition(musicX + canvasCtx.measureText(music).width, musicY - volumeDown.height);
        controlsPosition(musicX + canvasCtx.measureText(music).width, volumeY - volumeDown.height);

        function controlsPosition(x, y) {
            volumeDown.x = x;
            volumeDown.y = y+6;

            increment.x = volumeDown.x + volumeDown.width + 10;
            increment.y = volumeDown.y - increment.height / 2 + volumeDown.height / 2;

            volumeUp.x = volumeDown.x + volumeDown.width + 10 + (increment.width + 10) * 10;
            volumeUp.y = volumeDown.y;

            soundOn.x = volumeUp.x + volumeUp.width + 20;
            soundOn.y = volumeUp.y;
            buttonInterval = soundOn.y - buttonInterval;

            // criar, posicionar e desenhar as copias de todos os botoes na primeira chamada ao metodo controlsPosition
            if (drawCopies == 1) {
                volumeUpCopy = new ButtonSprite(volumeUp.x, volumeUp.y, volumeUp.width, volumeUp.height, volumeUp.img, volumeUp.sound,true);
                volumeDownCopy = new ButtonSprite(volumeDown.x, volumeDown.y, volumeDown.width, volumeDown.height, volumeDown.img, volumeDown.sound,true);
                volumeUpCopy.draw(canvasCtx);
                volumeDownCopy.draw(canvasCtx);
                incrementCopy = new ButtonSprite(increment.x, increment.y, increment.width, increment.height, increment.img, increment.sound,true);
                for (let i = 1; i <= Math.round(musicVolume*10); ++i) {
                    incrementCopy.draw(canvasCtx);
                    incrementCopy.x += incrementCopy.width + 10;
                }
                soundOnCopy = new ButtonSprite(soundOn.x, soundOn.y, soundOn.width, soundOn.height, soundOn.img, soundOn.sound,true);
                soundOffCopy = new ButtonSprite(soundOn.x, soundOn.y, soundOn.width, soundOn.height, soundOff.img, soundOn.sound,true);
                if (muteMusic == 0) // se os sons dos botoes nao estiverem silenciados
                    soundOnCopy.draw(canvasCtx);
                else
                    soundOffCopy.draw(canvasCtx);
            }
            // desenha os botoes originais na segunda chamada
            else {
                volumeDown.draw(canvasCtx);
                volumeUp.draw(canvasCtx);
                for (let i = 1; i <= Math.round(buttonVolume*10); ++i) {
                    increment.draw(canvasCtx);
                    increment.x += increment.width + 10;
                }
                soundOff.x = soundOn.x;
                soundOff.y = soundOn.y;
                if (muteSounds == 0) // se a musica nao estiver muted
                    soundOn.draw(canvasCtx);
                else
                    soundOff.draw(canvasCtx);
            }
            ++drawCopies;
        }
    }

    // preparar o lsitener para todos os botoes
    var controlsListener = function(ev){
        // para dar mute ou unmute
        if      (muteMusic === 0  && soundOnCopy.mouseOverButton(ev)) {
            audio.volume = 0.0;
            soundOnCopy.clear(canvasCtx);
            soundOffCopy.draw(canvasCtx);
            muteMusic = 1;
        }
        else if (muteMusic === 1  && soundOffCopy.mouseOverButton(ev)) {
            audio.volume = musicVolume;
            soundOffCopy.clear(canvasCtx);
            soundOnCopy.draw(canvasCtx);
            muteMusic = 0;
        }
        if      (muteSounds === 0 && soundOn.mouseOverButton(ev)) {
            buttonAudio.volume = 0.0;
            soundOn.clear(canvasCtx);
            soundOff.draw(canvasCtx);
            muteSounds = 1;
        }
        else if (muteSounds === 1 && soundOff.mouseOverButton(ev)) {
            buttonAudio.volume = buttonVolume;
            soundOff.clear(canvasCtx);
            soundOn.draw(canvasCtx);
            muteSounds = 0;
        }

        // para controlar o volume
        if (muteMusic === 0 && audio.volume > 0.2 && volumeDownCopy.mouseOverButton(ev)) {
            incrementCopy.x -= incrementCopy.width + 10;
            incrementCopy.clear(canvasCtx);
            audio.volume -= 0.1;
            musicVolume -= 0.1;
        }
        if (muteMusic === 0 && audio.volume < 0.9 && volumeUpCopy.mouseOverButton(ev)) {
            incrementCopy.draw(canvasCtx);
            incrementCopy.x += incrementCopy.width + 10;
            audio.volume += 0.1;
            musicVolume += 0.1;
        }
        if (muteSounds === 0 && buttonAudio.volume > 0.2 && volumeDown.mouseOverButton(ev)) {
            increment.x -= increment.width + 10;
            increment.clear(canvasCtx);
            buttonAudio.volume -= 0.1;
            buttonVolume -= 0.1;
            buttonAudio.play();
        }
        if (muteSounds === 0 && buttonAudio.volume < 0.9 && volumeUp.mouseOverButton(ev)) {
            increment.draw(canvasCtx);
            increment.x += increment.width + 10;
            buttonAudio.volume += 0.1;
            buttonVolume += 0.1;
            buttonAudio.play();
        }

        // quando o quit for premido, volta para o main e elimina o listener
        if (quitBtn.mouseOverButton(ev) && InGamePress === false) {
            if (muteSounds === 0) buttonAudio.play();
            mainMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", controlsListener);
        }
        else if (quitBtn.mouseOverButton(ev) && InGamePress === true) {
            InGamePress = false;
            if (muteSounds === 0) buttonAudio.play();
            canvasCtx.canvas.removeEventListener("click", controlsListener);
            backToGame(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, startTime);
        }
    };
    canvasCtx.canvas.addEventListener("click", controlsListener);
}

function helpMenu(canvasCtx, canvas, PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, playerInfo, startTime) {
    drawBackground(canvasCtx, canvas, "Menu");
    var pageNumber = 1;

    // buscar os botoes, posicionar e desenha-los a primeira vez, bem como a primeira pagina
    // a posicao das setas nao pode ser definida no metodo loadSprites, porque sao reutilizadas no menu de jogo com posicao diferente
    var nextPage = ButtonArray[13];
    var prewPage = ButtonArray[14];
    prewPage.x = canvas.width-(prewPage.width*2)-10;
    prewPage.y = canvas.height - prewPage.height - 10;
    prewPage.draw(canvasCtx);
    nextPage.x = prewPage.x + nextPage.width + 5;
    nextPage.y = prewPage.y;
    nextPage.draw(canvasCtx);
    var Page1 = document.getElementById("HelpPage1");
    var Page2 = document.getElementById("HelpPage2");
    var Page3 = document.getElementById("HelpPage3");
    var Page4 = document.getElementById("HelpPage4");
    canvasCtx.drawImage(Page1, 0, 0, 740, 480);

    function pageHandler() {
        drawBackground(canvasCtx, canvas, "Menu");

        if (pageNumber === 1) canvasCtx.drawImage(Page1, 0, 0, 740, 480);
        else if (pageNumber === 2) canvasCtx.drawImage(Page2, 0, 0, 740, 480);
        else if (pageNumber === 3) canvasCtx.drawImage(Page3, 0, 0, 740, 480);
        else if (pageNumber === 4) canvasCtx.drawImage(Page4, 0, 0, 740, 480);
        else if (pageNumber > 4){
            pageNumber = 1;
            pageHandler();
        }
        else if (pageNumber < 1){
            pageNumber = 4;
            pageHandler();
        }
        prewPage.draw(canvasCtx);
        nextPage.draw(canvasCtx);
        quitBtn.draw(canvasCtx);
    }

    var controlsListener = function(ev){
        if (nextPage.mouseOverButton(ev)){
            ++pageNumber;
            if (muteSounds === 0) buttonAudio.play();
            pageHandler();
        }
        if (prewPage.mouseOverButton(ev)){
            --pageNumber;
            if (muteSounds === 0) buttonAudio.play();
            pageHandler();
        }
        if (quitBtn.mouseOverButton(ev) && InGamePress === false) {
            buttonAudio.play();
            audio.src = "../resources/audio/menu_music/menus.mp3";
            audio.play().catch(function(){});
            mainMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", controlsListener);
        }
        else if (quitBtn.mouseOverButton(ev) && InGamePress === true) {
            InGamePress = false;
            if (muteSounds === 0) buttonAudio.play();
            canvasCtx.canvas.removeEventListener("click", controlsListener);
            backToGame(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, startTime);
        }
    };
    canvasCtx.canvas.addEventListener("click", controlsListener);
}

function creditsMenu(canvasCtx, canvas) {
    drawBackground(canvasCtx, canvas, "Menu");
    var creditos = document.getElementById("Credits");
    canvasCtx.drawImage(creditos, 0, 0, 740, 480);

    var quitListener = function(ev){
        if (quitBtn.mouseOverButton(ev)) {
            buttonAudio.play();
            audio.src = "../resources/audio/menu_music/menus.mp3";
            audio.play().catch(function(){});
            mainMenu(canvasCtx, canvas);
            canvasCtx.canvas.removeEventListener("click", quitListener);
        }
    };
    canvasCtx.canvas.addEventListener("click", quitListener);
}

function backToGame(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, startTime) {
    drawBackground(canvasCtx, canvas, "GamePlay");
    window.addEventListener("keypress", kph);
    movementHandler(PlayerPosition, lava, levelTimer, SpriteArray, powerUp, powerUpBar, segFaultSpSheet, bugSpriteSheet, eyeSpriteSheet, QuestionArray, canvasCtx, canvas, playerInfo, startTime);
}