/* ==========================================================================
   js/minigames.js - RECOMPENSAS, CLICKER Y APUESTAS
   ========================================================================== */

const Minigames = {
    lastDaily: 0,
    lastTimed: 0,
    checkInterval: null,

    init: async function() {
        // Enlazamos el botón del Captcha Anti-AFK
        document.getElementById('btn-afk-claim')?.addEventListener('click', () => this.claimTimedReward());

        // Pedimos al servidor la hora de nuestras últimas recompensas
        const { data: { user } } = await db.auth.getUser();
        if (user) {
            const { data } = await db.from('users').select('last_daily_reward, last_time_reward').eq('id', user.id).single();
            if (data) {
                this.lastDaily = data.last_daily_reward ? new Date(data.last_daily_reward).getTime() : 0;
                this.lastTimed = data.last_time_reward ? new Date(data.last_time_reward).getTime() : 0;
                this.startCheckLoop();
            }
        }
    },

    startCheckLoop: function() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        
        // Cada 30 segundos verificamos si nos toca premio
        this.checkInterval = setInterval(() => this.evaluateRewards(), 30000); 
        this.evaluateRewards(); // Comprobamos nada más entrar también
    },

    evaluateRewards: async function() {
        const now = Date.now();
        const msInDay = 24 * 60 * 60 * 1000;
        const msIn15Min = 15 * 60 * 1000;

        // 1. RECOMPENSA DIARIA (Sin chequeos AFK)
        if (now - this.lastDaily >= msInDay) {
            this.claimDailyReward();
        }

        // 2. RECOMPENSA POR TIEMPO (15 Minutos)
        if (now - this.lastTimed >= msIn15Min) {
            const timeSinceLastActivity = now - window.lastActivityTime;
            
            // Si el jugador ha hecho clics/teclas de forma natural y no repetitiva en los últimos 4 mins
            if (timeSinceLastActivity < (4 * 60 * 1000)) {
                this.claimTimedReward(); 
            } else {
                // MODO SOSPECHA: Captcha
                document.getElementById('afk-captcha-modal').classList.remove('hidden');
            }
        }
    },

    claimDailyReward: async function() {
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        const { data: success } = await db.rpc('claim_daily_reward', { p_user_id: user.id });
        if (success) {
            this.lastDaily = Date.now();
            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('text-reward-daily') : '¡Has recibido 50 Créditos de recompensa diaria!';
            if (window.showToast) window.showToast(msg, 'reward');
            this.refreshWallet(user.id);
        }
    },

    claimTimedReward: async function() {
        document.getElementById('afk-captcha-modal').classList.add('hidden');
        
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        const { data: success } = await db.rpc('claim_timed_reward', { p_user_id: user.id });
        if (success) {
            this.lastTimed = Date.now();
            window.lastActivityTime = Date.now(); 
            
            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('text-reward-timed') : '¡+5 Créditos por tu fidelidad en el servidor!';
            if (window.showToast) window.showToast(msg, 'reward');
            
            this.refreshWallet(user.id);
        }
    },

    refreshWallet: async function(userId) {
        const { data } = await db.from('users').select('credits').eq('id', userId).single();
        if (data && document.getElementById('user-credits')) {
            document.getElementById('user-credits').textContent = data.credits;
        }
    }
};

/* ==========================================================================
   EL MOTOR DE LA RULETA (ANIMACIÓN Y LÓGICA)
   ========================================================================== */
const RouletteGame = {
    canvas: null,
    ctx: null,
    images: {},
    currentFrame: 1,
    isSpinning: false,
    avatarImg: new Image(),
    floorImg: new Image(),

    init: function() {
        this.canvas = document.getElementById('roulette-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
		this.floorImg.src = 'assets/img/tile_floor.png';
		
        // 1. Cargar las 10 fotos que capturaste
        const colors = ['amarillo', 'naranja', 'rojo', 'morado', 'verde', 'amarillo', 'naranja', 'rojo', 'morado', 'verde'];
        let loaded = 0;
        for (let i = 1; i <= 10; i++) {
            this.images[i] = new Image();
            this.images[i].src = `assets/img/ruleta/${i}_${colors[i-1]}.png`;
            this.images[i].onload = () => { loaded++; if (loaded === 10) this.drawScene(); };
        }

        // 2. Cargar tu Avatar para que mire la ruleta
        this.loadAvatar();

        document.getElementById('btn-spin-roulette')?.addEventListener('click', () => this.play());
    },

    loadAvatar: async function() {
        const { data: { user } } = await db.auth.getUser();
        if (user) {
            const { data } = await db.from('users').select('look_string').eq('id', user.id).single();
            if (data && data.look_string) {
                const isCustom = data.look_string.includes('-');
                // direction=7 es Noroeste (Mirando directo a la pared izquierda)
                this.avatarImg.src = isCustom 
                    ? `https://www.habbo.es/habbo-imaging/avatarimage?figure=${data.look_string}&direction=6&head_direction=6&action=std`
                    : `https://www.habbo.es/habbo-imaging/avatarimage?user=${data.look_string}&direction=6&head_direction=6&action=std`;
                this.avatarImg.onload = () => this.drawScene();
            }
        }
    },

    drawScene: function() {
        if (!this.ctx || !this.images[1]?.complete) return;
        
        // Fondo negro total
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Coordenadas base de la esquina de la sala (Arriba del todo)
        let originX = 300;
        let originY = 130;
        let wallH = 130;

        // 1. PARED IZQUIERDA (Pared de la Ruleta)
        this.ctx.beginPath();
        this.ctx.moveTo(originX, originY); 
        this.ctx.lineTo(originX - 160, originY + 80); // Base pared
        this.ctx.lineTo(originX - 160, originY + 80 - wallH); // Esquina inferior
        this.ctx.lineTo(originX, originY - wallH); // Esquina superior
        this.ctx.closePath();
        this.ctx.fillStyle = "#748796"; // Azul grisáceo oscuro Habbo
        this.ctx.fill();
        this.ctx.strokeStyle = "#5a6a75";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // 2. PARED DERECHA
        this.ctx.beginPath();
        this.ctx.moveTo(originX, originY); 
        this.ctx.lineTo(originX + 160, originY + 80); 
        this.ctx.lineTo(originX + 160, originY + 80 - wallH); 
        this.ctx.lineTo(originX, originY - wallH); 
        this.ctx.closePath();
        this.ctx.fillStyle = "#96a6b5"; // Azul grisáceo claro (Iluminado)
        this.ctx.fill();
        this.ctx.stroke();

        // 3. PUERTA EN LA PARED DERECHA (Típica de entrada de sala)
        this.ctx.beginPath();
        this.ctx.moveTo(originX + 64, originY + 32); // Base de la puerta
        this.ctx.lineTo(originX + 96, originY + 48); 
        this.ctx.lineTo(originX + 96, originY + 48 - 75); // Altura de la puerta
        this.ctx.lineTo(originX + 64, originY + 32 - 75); 
        this.ctx.closePath();
        this.ctx.fillStyle = "#000000"; // Agujero negro
        this.ctx.fill();

        // 4. EL SUELO (Dibujado baldosa a baldosa en Grid 5x5 perfecto)
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                // Matemáticas isométricas 2:1
                let x = originX + (col - row) * 32;
                let y = originY + (col + row) * 16;

                if (this.floorImg && this.floorImg.complete && this.floorImg.width > 0) {
                    // Imprimimos tu imagen tile_floor.png (64x32px) centrada
                    this.ctx.drawImage(this.floorImg, x - 32, y);
                } else {
                    // Fallback visual por si no carga tu imagen
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + 32, y + 16);
                    this.ctx.lineTo(x, y + 32);
                    this.ctx.lineTo(x - 32, y + 16);
                    this.ctx.closePath();
                    this.ctx.fillStyle = ((row+col)%2===0) ? "#989898" : "#8a8a8a";
                    this.ctx.fill();
                    this.ctx.strokeStyle = "#cccccc";
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        // 5. LA RULETA EN LA PARED IZQUIERDA
        // Ajustamos las coordenadas para que clave exactamente en el ángulo de la pared
        this.ctx.drawImage(this.images[this.currentFrame], originX - 165, originY - 85); 

        // 6. AVATAR (Posicionado en la sala, mirando hacia la pared izquierda)
        if (this.avatarImg.complete) {
            // Lo ponemos en una coordenada central del grid
            this.ctx.drawImage(this.avatarImg, originX - 35, originY + 15);
        }
    },

    play: async function() {
        if (this.isSpinning) return;
        
        const betAmount = parseInt(document.getElementById('roulette-bet').value);
        const betColor = document.getElementById('roulette-color').value;

        if (isNaN(betAmount) || betAmount <= 0) {
            if (window.showToast) window.showToast("Introduce una apuesta válida.", "error");
            return;
        }

        // Bloqueamos botón y empezamos a pedir a Supabase
        this.isSpinning = true;
        const btn = document.getElementById('btn-spin-roulette');
        btn.style.opacity = '0.5';
        btn.innerText = "Girando...";

        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        const { data, error } = await db.rpc('play_roulette', {
            p_user_id: user.id,
            p_bet_amount: betAmount,
            p_bet_color: betColor
        });

        if (error || !data) {
            if (window.showToast) window.showToast("Error de apuesta. Revisa tu saldo.", "error");
            this.isSpinning = false;
            btn.style.opacity = '1';
            btn.innerText = "🎰 Apostar y Girar";
            return;
        }

        // Matemáticas: calculamos los "saltos" exactos hasta el ganador
        this.startSpinAnimation(data.winning_number, data.won, data.new_balance, betAmount);
    },

    startSpinAnimation: function(targetFrame, won, newBalance, betAmount) {
        // ¿Cuántos números faltan desde nuestra foto actual hasta la foto ganadora?
        let stepsToTarget = (targetFrame - this.currentFrame + 10) % 10;
        
        // Sumamos 30 pasos extra (3 vueltas completas de ruleta rápidas)
        let totalSteps = stepsToTarget + 30; 
        let speed = 35; // Velocidad punta: 35ms por salto
        
        const step = () => {
            this.currentFrame++;
            if (this.currentFrame > 10) this.currentFrame = 1;
            this.drawScene(); // Redibujar con el nuevo color
            
            totalSteps--;
            
            // LA FRICCIÓN MÁGICA: Los últimos 8 pasos empiezan a frenar drásticamente
            if (totalSteps < 8) {
                speed += 50; // Se vuelve más y más lento: 85ms, 135ms, 185ms...
            }
            
            if (totalSteps > 0) {
                setTimeout(step, speed);
            } else {
                // CLAVADO. FIN DEL SHOW.
                this.isSpinning = false;
                const btn = document.getElementById('btn-spin-roulette');
                btn.style.opacity = '1';
                btn.innerText = "🎰 Apostar y Girar";
                
                // Actualizar monedero visual
                const elCredits = document.getElementById('user-credits');
                if (elCredits) elCredits.textContent = newBalance;

                // Tirar la tostada
                if (won) {
                    if (window.showToast) window.showToast(`¡BINGO! Has ganado ${betAmount * 2} Créditos.`, "reward");
                    
                    // FEED RULETA
                    if (betAmount >= 1000 && typeof ActivityFeed !== 'undefined') {
                        db.auth.getUser().then(({ data: { user } }) => {
                            if(user) {
                                db.from('users').select('username').eq('id', user.id).single().then(({data: u}) => {
                                    if (u) {
                                        ActivityFeed.sendActivity({
                                            key: 'feed-roulette-win',
                                            user: u.username,
                                            pot: betAmount,
                                            win: betAmount * 2
                                        }, 'ruleta');
                                    }
                                });
                            }
                        });
                    }
                } else {
                    if (window.showToast) window.showToast(`Salió mal. Perdiste ${betAmount} Créditos.`, "error");
                }
            }
        };
        
        step(); // Iniciar motor
    }
};
/* ==========================================================================
   EL MOTOR DEL CLICKER TITÁN (ANTI-MACROS Y LÓGICA)
   ========================================================================== */
const ClickerGame = {
    clicks: 0,
    target: 100,
    isClaiming: false,
    lastClickTime: 0,
    clickTimes: [], // Para medir CPS (Clics por segundo)

    init: function() {
        const coin = document.getElementById('clicker-coin');
        if (coin) {
            coin.addEventListener('mousedown', (e) => this.handleClick(e));
        }
    },

    handleClick: function(e) {
        if (!e.isTrusted || this.isClaiming) return;

        const now = Date.now();
        
        // SEGURIDAD ANTI-MACRO: Limitar Clics por Segundo (CPS) a 15 max
        this.clickTimes.push(now);
        this.clickTimes = this.clickTimes.filter(time => now - time <= 1000); 
        
        if (this.clickTimes.length > 15) {
            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('text-clicker-fast') : '¡Vas muy rápido! Frena un poco.';
            if (window.showToast) window.showToast(msg, 'error');
            this.clickTimes = []; 
            return;
        }

        // ACTUALIZAR PROGRESO
        this.clicks++;
        document.getElementById('clicker-counter').textContent = this.clicks;

        // FEEDBACK VISUAL: Hundir la moneda
        const coin = document.getElementById('clicker-coin');
        coin.style.transform = 'scale(0.9)';
        setTimeout(() => coin.style.transform = 'scale(1)', 60);

        // ANTI-AUTOCLICKER: Mover la moneda aleatoriamente
        const randomX = Math.floor(Math.random() * 20) - 10; 
        const randomY = Math.floor(Math.random() * 20) - 10;
        coin.style.marginLeft = `${randomX}px`;
        coin.style.marginTop = `${randomY}px`;

        // TEXTO FLOTANTE
        this.createFloatingText(e.offsetX, e.offsetY);

        if (this.clicks >= this.target) {
            this.claimReward();
        }
    },

    createFloatingText: function(x, y) {
        const container = document.getElementById('clicker-float-container');
        if (!container) return;

        const floatText = document.createElement('div');
        floatText.textContent = '+0.25';
        floatText.style.position = 'absolute';
        floatText.style.color = '#2ecc71';
        floatText.style.fontWeight = 'bold';
        floatText.style.fontSize = '16px';
        floatText.style.textShadow = '0px 2px 2px rgba(0,0,0,0.8)';
        floatText.style.left = `calc(50% - 60px + ${x}px)`;
        floatText.style.top = `calc(50% - 60px + ${y}px)`;
        floatText.style.transition = 'all 0.5s ease-out';
        floatText.style.pointerEvents = 'none';

        container.appendChild(floatText);

        setTimeout(() => {
            floatText.style.top = `calc(50% - 100px + ${y}px)`;
            floatText.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            if(floatText.parentNode) floatText.parentNode.removeChild(floatText);
        }, 500);
    },

    claimReward: async function() {
        this.isClaiming = true;
        const coin = document.getElementById('clicker-coin');
        coin.style.filter = 'grayscale(1)'; 
        
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        const { data: success } = await db.rpc('claim_clicker_reward', { p_user_id: user.id });

        if (success) {
            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('text-clicker-reward') : '¡Has ganado 25 Créditos!';
            if (window.showToast) window.showToast(msg, 'reward');
            Minigames.refreshWallet(user.id);
        } else {
            if (window.showToast) window.showToast("Petición sospechosa rechazada por el servidor.", "error");
        }

        this.clicks = 0;
        document.getElementById('clicker-counter').textContent = this.clicks;
        this.isClaiming = false;
        coin.style.filter = 'drop-shadow(0 5px 15px rgba(241,196,15,0.3))';
        coin.style.margin = '0px'; 
    }
};
/* ==========================================================================
   EL MOTOR DEL JUEGO DE MEMORIA TITÁN
   ========================================================================== */
const MemoryGame = {
    board: null,
    timerEl: null,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 8,
    timeLeft: 45,
    timerInterval: null,
    isPlaying: false,

    init: function() {
        this.board = document.getElementById('memory-board');
        this.timerEl = document.getElementById('memory-timer');
        
        const btnStart = document.getElementById('btn-start-memory');
        if (btnStart) {
            btnStart.addEventListener('click', () => this.startGame());
        }
    },

    // 1. El Inspector invisible (Nuevo)
    checkImage: function(furniName) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);   // ¡Existe!
            img.onerror = () => resolve(false); // ¡Roto!
            img.src = 'https://habboapi.site/api/image/' + furniName;
        });
    },

    // 2. StartGame modificado para esperar al Inspector
    startGame: async function() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        // Ocultar botón y avisar al jugador de que estamos preparando las cartas
        document.getElementById('btn-start-memory').style.display = 'none';
        this.timerEl.textContent = 'Cargando...';
        this.timerEl.style.color = '#f1c40f';

        // El Casting: buscar 8 furnis que SÍ funcionen
        let validFurnis = [];
        let shuffled = habboFurnisList.sort(() => 0.5 - Math.random());
        let index = 0;
        
        while (validFurnis.length < this.totalPairs && index < shuffled.length) {
            let furni = shuffled[index];
            let isValid = await this.checkImage(furni);
            if (isValid) validFurnis.push(furni);
            index++;
        }

        // Partida lista, resetear variables y arrancar
        this.matchedPairs = 0;
        this.timeLeft = 45;
        this.flippedCards = [];
        this.timerEl.textContent = this.timeLeft + 's';
        this.timerEl.style.color = '#e74c3c';
        
        this.board.style.pointerEvents = 'auto';
        this.board.style.opacity = '1';

        this.generateBoard(validFurnis);
        this.startTimer();
    },

    // 3. GenerateBoard modificado para recibir los validos
    generateBoard: function(validFurnis) {
        this.board.innerHTML = '';
        
        // Usar LOS VALIDADOS, duplicarlos para hacer parejas y barajar
        this.cards = [...validFurnis, ...validFurnis];
        this.cards.sort(() => 0.5 - Math.random());

        // Crear el HTML de las cartas
        this.cards.forEach((furni, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.furni = furni;
            
            card.style.width = '100%';
            card.style.height = '100%';
            card.style.backgroundColor = '#2c3e50';
            card.style.border = '2px solid #34495e';
            card.style.borderRadius = '5px';
            card.style.cursor = 'pointer';
            card.style.display = 'flex';
            card.style.justifyContent = 'center';
            card.style.alignItems = 'center';
            card.style.transition = '0.3s';
            card.innerHTML = '<span style="color: #1abc9c; font-weight: bold; font-size: 24px;">?</span>';

            card.addEventListener('click', () => this.flipCard(card));
            this.board.appendChild(card);
        });
    },
	flipCard: function(card) {
        if (!this.isPlaying || this.flippedCards.length >= 2 || this.flippedCards.includes(card) || card.dataset.matched === 'true') return;

        // Mostrar imagen inyectándola ahora (Anti-Inspección de código)
        const furniName = card.dataset.furni;
        card.innerHTML = '<img src="https://habboapi.site/api/image/' + furniName + '" style="max-width: 90%; max-height: 90%; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">';
        card.style.backgroundColor = '#ecf0f1';
        
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 800);
        }
    },

    checkMatch: function() {
        const [card1, card2] = this.flippedCards;
        const isMatch = card1.dataset.furni === card2.dataset.furni;

        if (isMatch) {
            card1.dataset.matched = 'true';
            card2.dataset.matched = 'true';
            card1.style.borderColor = '#2ecc71';
            card2.style.borderColor = '#2ecc71';
            this.matchedPairs++;

            if (this.matchedPairs === this.totalPairs) {
                this.endGame(true);
            }
        } else {
            // Ocultar de nuevo devolviendo la interrogación
            card1.innerHTML = '<span style="color: #1abc9c; font-weight: bold; font-size: 24px;">?</span>';
            card2.innerHTML = '<span style="color: #1abc9c; font-weight: bold; font-size: 24px;">?</span>';
            card1.style.backgroundColor = '#2c3e50';
            card2.style.backgroundColor = '#2c3e50';
        }

        this.flippedCards = [];
    },
	startTimer: function() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerEl.textContent = this.timeLeft + 's';
            
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    },

    endGame: async function(win) {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        this.board.style.pointerEvents = 'none';

        if (win) {
            // Animación y pago si gana
            this.timerEl.textContent = '¡GANASTE!';
            this.timerEl.style.color = '#2ecc71';
            
            const { data: { user } } = await db.auth.getUser();
            if (!user) return;

            const { data: success } = await db.rpc('claim_memory_reward', { p_user_id: user.id });
            
            if (success) {
                const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('text-memory-win') : '¡Has ganado 50 Créditos!';
                if (window.showToast) window.showToast(msg, 'reward');
                Minigames.refreshWallet(user.id);
            } else {
                if (window.showToast) window.showToast('Petición sospechosa rechazada por el servidor.', 'error');
            }
        } else {
            // Si pierde por tiempo
            this.timerEl.textContent = '0s';
            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('text-memory-lose') : '¡Tiempo agotado!';
            if (window.showToast) window.showToast(msg, 'error');
        }

        // Mostrar de nuevo el botón para reiniciar
        document.getElementById('btn-start-memory').style.display = 'block';
        document.getElementById('btn-start-memory').textContent = '🔄 Jugar de nuevo';
    },

    resetGame: function() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        this.board.innerHTML = ''; // Limpiar cartas
        this.timerEl.textContent = '45s';
        this.timerEl.style.color = '#e74c3c';
        document.getElementById('btn-start-memory').style.display = 'block';
        document.getElementById('btn-start-memory').textContent = '▶ Iniciar Partida';
    }
}; // <-- AQUÍ SE CIERRA EL OBJETO MEMORYGAME
/* ==========================================================================
   EL MOTOR DEL HOLODADO TITÁN
   ========================================================================== */
const HoloDiceGame = {
    canvas: null,
    ctx: null,
    images: {},
    currentImageName: 'holo_off', // El dado empieza apagado
    isSpinning: false,
    avatarImg: new Image(),
    floorImg: new Image(),

    init: function() {
        this.canvas = document.getElementById('holodice-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.floorImg.src = 'assets/img/tile_floor.png';
        
        // 1. Cargar las 8 imágenes del Holodado
        const diceNames = ['1_holo', '2_holo', '3_holo', '4_holo', '5_holo', '6_holo', 'holo_on', 'holo_off'];
        let loaded = 0;
        
        diceNames.forEach(name => {
            this.images[name] = new Image();
            this.images[name].src = `assets/img/holo/${name}.png`;
            this.images[name].onload = () => { 
                loaded++; 
                if (loaded === diceNames.length) this.drawScene(); 
            };
        });

        // 2. Cargar tu Avatar para que mire el dado
        this.loadAvatar();

        document.getElementById('btn-spin-holodice')?.addEventListener('click', () => this.play());
    },

    loadAvatar: async function() {
        const { data: { user } } = await db.auth.getUser();
        if (user) {
            const { data } = await db.from('users').select('look_string').eq('id', user.id).single();
            if (data && data.look_string) {
                const isCustom = data.look_string.includes('-');
                // REVERTIMOS A LA DIRECCIÓN 6 (Igual que en la Ruleta)
                this.avatarImg.src = isCustom 
                    ? `https://www.habbo.es/habbo-imaging/avatarimage?figure=${data.look_string}&direction=2&head_direction=2&action=std`
                    : `https://www.habbo.es/habbo-imaging/avatarimage?user=${data.look_string}&direction=2&head_direction=2&action=std`;
                this.avatarImg.onload = () => this.drawScene();
            }
        }
    },

    drawScene: function() {
        if (!this.ctx || !this.images['holo_off']?.complete) return;
        
        // Fondo negro total
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Coordenadas base
        let originX = 300;
        let originY = 130;
        let wallH = 130;

        // 1. PARED IZQUIERDA
        this.ctx.beginPath();
        this.ctx.moveTo(originX, originY); 
        this.ctx.lineTo(originX - 160, originY + 80); 
        this.ctx.lineTo(originX - 160, originY + 80 - wallH); 
        this.ctx.lineTo(originX, originY - wallH); 
        this.ctx.closePath();
        this.ctx.fillStyle = "#748796"; 
        this.ctx.fill();
        this.ctx.strokeStyle = "#5a6a75";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // 2. PARED DERECHA
        this.ctx.beginPath();
        this.ctx.moveTo(originX, originY); 
        this.ctx.lineTo(originX + 160, originY + 80); 
        this.ctx.lineTo(originX + 160, originY + 80 - wallH); 
        this.ctx.lineTo(originX, originY - wallH); 
        this.ctx.closePath();
        this.ctx.fillStyle = "#96a6b5"; 
        this.ctx.fill();
        this.ctx.stroke();

        // 3. PUERTA EN LA PARED DERECHA (¡Restaurada!)
        this.ctx.beginPath();
        this.ctx.moveTo(originX + 64, originY + 32);
        this.ctx.lineTo(originX + 96, originY + 48); 
        this.ctx.lineTo(originX + 96, originY + 48 - 75);
        this.ctx.lineTo(originX + 64, originY + 32 - 75); 
        this.ctx.closePath();
        this.ctx.fillStyle = "#000000";
        this.ctx.fill();

        // 4. EL SUELO
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                let x = originX + (col - row) * 32;
                let y = originY + (col + row) * 16;

                if (this.floorImg && this.floorImg.complete && this.floorImg.width > 0) {
                    this.ctx.drawImage(this.floorImg, x - 32, y);
                } else {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + 32, y + 16);
                    this.ctx.lineTo(x, y + 32);
                    this.ctx.lineTo(x - 32, y + 16);
                    this.ctx.closePath();
                    this.ctx.fillStyle = ((row+col)%2===0) ? "#989898" : "#8a8a8a";
                    this.ctx.fill();
                    this.ctx.strokeStyle = "#cccccc";
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        // 5. AVATAR (Posición exacta de la Ruleta)
        if (this.avatarImg.complete) {
            this.ctx.drawImage(this.avatarImg, originX - 35, originY + 15);
        }

        // 6. DIBUJAR HOLODADO (Justo delante del avatar, hacia la izquierda-abajo)
        let diceImg = this.images[this.currentImageName];
        if (diceImg && diceImg.complete) {
            this.ctx.drawImage(diceImg, originX - 42, originY + 68); 
        }
    },
	play: async function() {
        if (this.isSpinning) return;
        
        const betAmount = parseInt(document.getElementById('holodice-bet').value);
        const betNumber = parseInt(document.getElementById('holodice-number').value);

        if (isNaN(betAmount) || betAmount <= 0) {
            if (window.showToast) window.showToast("Introduce una apuesta válida.", "error");
            return;
        }

        // Bloquear UI para evitar doble clic
        this.isSpinning = true;
        const btn = document.getElementById('btn-spin-holodice');
        btn.style.opacity = '0.5';
        btn.innerText = "Lanzando...";

        // Llamada segura a Supabase
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        const { data, error } = await db.rpc('play_holodice', {
            p_user_id: user.id,
            p_bet_amount: betAmount,
            p_bet_number: betNumber
        });

        if (error || !data) {
            if (window.showToast) window.showToast("Error de apuesta. Revisa tu saldo.", "error");
            this.isSpinning = false;
            btn.style.opacity = '1';
            btn.innerText = "🎲 Lanzar Dado";
            return;
        }

        // Arrancar animación de luces pasando el resultado que ya sabemos
        this.startSpinAnimation(data.winning_number, data.won, data.new_balance, betAmount);
    },

    startSpinAnimation: function(winningNumber, won, newBalance, betAmount) {
        let spinCount = 0;
        const maxSpins = 20; // Cuántas veces parpadeará el dado
        const speed = 80;    // Velocidad del parpadeo (80ms = muy rápido)
        
        const spinInterval = setInterval(() => {
            // Alternar imagen entre on y off
            this.currentImageName = (this.currentImageName === 'holo_on') ? 'holo_off' : 'holo_on';
            this.drawScene();
            
            spinCount++;
            
            // Cuando termina el parpadeo...
            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);
                
                // Clavamos la imagen del número ganador (ej: "4_holo")
                this.currentImageName = winningNumber + '_holo';
                this.drawScene();
                
                // Desbloqueamos UI
                this.isSpinning = false;
                const btn = document.getElementById('btn-spin-holodice');
                btn.style.opacity = '1';
                btn.innerText = "🎲 Lanzar Dado";
                
                // Actualizamos el contador de la cabecera
                const elCredits = document.getElementById('user-credits');
                if (elCredits) elCredits.textContent = newBalance;

               // Lanzamos la notificación
                if (won) {
                    if (window.showToast) window.showToast(`¡Salió el ${winningNumber}! Has ganado ${betAmount * 2} Créditos.`, "reward");
                    
                    // FEED HOLODADO
                    if (betAmount >= 1000 && typeof ActivityFeed !== 'undefined') {
                        db.auth.getUser().then(({ data: { user } }) => {
                            if(user) {
                                db.from('users').select('username').eq('id', user.id).single().then(({data: u}) => {
                                    if (u) {
                                        ActivityFeed.sendActivity({
                                            key: 'feed-holodice-win',
                                            user: u.username,
                                            pot: betAmount,
                                            win: betAmount * 2
                                        }, 'holodado');
                                    }
                                });
                            }
                        });
                    }
                } else {
                    if (window.showToast) window.showToast(`Salió el ${winningNumber}. Perdiste ${betAmount} Créditos.`, "error");
                }
            }
        }, speed);
    }
}; // <-- AQUÍ SE CIERRA EL OBJETO HOLODICEGAME

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        Minigames.init();
        RouletteGame.init(); // Arrancar la ruleta
        ClickerGame.init();  // Arrancar el clicker
        MemoryGame.init();   // Arrancar el juego de memoria
		HoloDiceGame.init(); // Arrancar el holodado
    }, 2000); // Arrancar un poco después de cargar la web
});