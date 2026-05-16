/* ==========================================================================
   js/arena_game.js - MOTOR ISOMÉTRICO DE DUELOS Y SPRITESHEET (FASE 4)
   ========================================================================== */

const ArenaGame = {
    // --- ESTADO GENERAL ---
    matchData: null,
    mode: null, 
    myRole: null, 
    myId: null,
    rivalId: null,
    p1Score: 0, 
    p2Score: 0, 
    isMyTurn: false,
    timerInterval: null,
    timeLeft: 20,
    channel: null,
    iaTimer: null,

    // --- MOTOR ISOMÉTRICO ---
    canvas: null,
    ctx: null,
    tileW: 64,
    tileH: 32,
    camera: { x: 500, y: 150 }, // Centrado para un canvas de 1000x600
    
    // --- CONFIGURACIÓN DE TU SPRITESHEET ---
    SPRITE_FRAMES: 14,
    SPRITE_WIDTH: 77,
    SPRITE_HEIGHT: 87,
    globalFrameCounter: 0, // Para controlar la velocidad de la animación

    images: {
        floor: new Image(),
        chair: new Image(),
        dice_closed: new Image(),
        dice_spinning: new Image(), // Aquí cargamos la tira PNG
        dice_frames: [] // Aquí cargamos los dados abiertos (1 al 6)
    },
    avatars: {
        p1: new Image(),
        p2: new Image()
    },
    
    // Entidades en el mapa
    diceArray: [], // Aquí guardamos los 10 dados
    selectedDiceId: null, // Para el botón de "Cerrar"
    mouseX: 0,
    mouseY: 0,
    hoveredTile: { x: -1, y: -1 },

    init: function() {
        this.canvas = document.getElementById('arena-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('click', (e) => this.handleClick(e));
            this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        }

        // Cargar Assets Visuales
        this.images.floor.src = 'assets/img/tile_floor.png';
        // Usamos habboapi.site como pediste para evitar el 404
        this.images.chair.src = 'https://habboapi.site/api/image/hc_chr';
        this.images.dice_closed.src = 'assets/img/dado/dice_closed.png';
        
        // Cargar tu tira de animación
        this.images.dice_spinning.src = 'assets/img/dado/dice_spinning.png';

        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `assets/img/dado/dice_${i}.png`;
            this.images.dice_frames.push(img);
        }

        // Botones UI
        document.getElementById('btn-duel-close')?.addEventListener('click', () => this.closeSelectedDice());
        document.getElementById('btn-duel-stand')?.addEventListener('click', () => this.stand());

        // Bucle principal de dibujado (60 FPS)
        setInterval(() => this.render(), 1000 / 60);

        // SISTEMA ANTI-HUIDAS
        window.addEventListener('beforeunload', async (e) => {
            const arena = document.getElementById('duel-arena-section');
            if (arena && !arena.classList.contains('hidden') && this.matchData) {
                // Si es contra la IA, la marcamos como terminada al huir
                if (this.mode === 'ia') {
                    db.from('arena_matches').update({ status: 'finished' }).eq('id', this.matchData.id).then();
                } else if (typeof this.abandonMatch === 'function') {
                    this.abandonMatch();
                }
            }
        });
    },

    // --- MATEMÁTICAS ISOMÉTRICAS ---
    mapToScreen: function(mapX, mapY) {
        const screenX = (mapX - mapY) * (this.tileW / 2) + this.camera.x;
        const screenY = (mapX + mapY) * (this.tileH / 2) + this.camera.y;
        return { x: screenX, y: screenY };
    },

    screenToMap: function(screenX, screenY) {
        const adjX = screenX - this.camera.x;
        const adjY = screenY - this.camera.y - (this.tileH / 2);
        const mapX = (adjX / (this.tileW / 2) + adjY / (this.tileH / 2)) / 2;
        const mapY = (adjY / (this.tileH / 2) - adjX / (this.tileW / 2)) / 2;
        return { x: Math.round(mapX), y: Math.round(mapY) };
    },

    // --- INICIO DE PARTIDA ---
    // --- INICIO DE PARTIDA ---
    startMatch: async function(matchRow, mode, myBetAmount, myBetItems) {
        this.matchData = matchRow;
        this.mode = mode;
        
        // Inicializamos los marcadores ACUMULATIVOS en 0 (p1Score SIEMPRE eres TÚ, p2Score SIEMPRE es el RIVAL)
        this.p1Score = 0;
        this.p2Score = 0;
        this.selectedDiceId = null;
        this.currentTurnUserId = null; // FIX GIGANTE: Resetear la memoria del turno para que arranque siempre limpio
        this.isGameOver = false; // NUEVO: Abrimos el candado al empezar la partida
        
        // Guardar la apuesta para el sistema de pagos
        this.myBetAmount = myBetAmount || 0;
        this.myBetItems = myBetItems || {};

        const { data: { user } } = await db.auth.getUser();
        this.myId = user.id;

        document.getElementById('betting-setup-section').classList.add('hidden');
        document.getElementById('matchmaking-section').classList.add('hidden');
        document.getElementById('duel-arena-section').classList.remove('hidden');

        const rawUrl = document.getElementById('user-avatar').src;
        try {
            let p1Url = new URL(rawUrl, window.location.origin);
            p1Url.searchParams.set('action', 'std');
            p1Url.searchParams.set('direction', '4');
            p1Url.searchParams.set('head_direction', '4');
            this.avatars.p1.src = p1Url.toString();
        } catch(e) {
            this.avatars.p1.src = rawUrl;
        }
        document.getElementById('duel-p1-name').textContent = 'Tú';
        document.getElementById('duel-p2-name').textContent = 'Esperando...';

        // --- EL GRAN FIX DE LOS DADOS INVERTIDOS ---
        // Asignamos el rol ANTES de dibujar el mapa para que la hitboxes reconozcan de quién es cada dado.
        if (mode === 'ia') {
            this.myRole = 'host';
            this.rivalId = 'ia';
        } else {
            this.myRole = (matchRow.host_id === this.myId) ? 'host' : 'guest';
            this.rivalId = (this.myRole === 'host') ? matchRow.guest_id : matchRow.host_id;
        }

        this.setupMapEntities();
        this.updateScoreUI();

        if (mode === 'ia') {
            document.getElementById('duel-p2-name').textContent = 'IA';
            this.avatars.p2.src = 'https://www.habbo.es/habbo-imaging/avatarimage?figure=hr-115-42.hd-195-19.ch-3030-82.lg-275-1408.sh-290-92&action=std&direction=4&head_direction=4';
            
            const firstTurn = Math.random() < 0.5 ? 'host' : 'guest';
            this.startTurn(firstTurn);
        } else {
            if (this.rivalId) {
                const { data: rivalData } = await db.from('users').select('username, look_string').eq('id', this.rivalId).single();
                document.getElementById('duel-p2-name').textContent = rivalData ? rivalData.username : 'Rival';
                
                if (rivalData && rivalData.look_string) {
                    this.avatars.p2.src = window.getAvatarUrl(rivalData.look_string, 'std&direction=4&head_direction=4');
                }
            }
            this.setupRealtime();

            if (this.myRole === 'host' && matchRow.status === 'playing') {
                const firstTurn = Math.random() < 0.5 ? this.myId : this.rivalId;
                await db.from('arena_matches').update({ turn_user_id: firstTurn }).eq('id', this.matchData.id);
            }
        }
    },

    setupMapEntities: function() {
        this.diceArray = [];
        const rivalRole = this.myRole === 'host' ? 'guest' : 'host';
        
        // LADO IZQUIERDO (TÚ - Siempre P1 en tu pantalla)
        const p1DiceCoords = [ 
            {x:2, y:5, elev: 30}, {x:3, y:5, elev: 30}, {x:4, y:5, elev: 30}, 
            {x:2, y:6, elev: 0},  {x:4, y:6, elev: 0}   
        ];
        p1DiceCoords.forEach((c, idx) => {
            this.diceArray.push({ id: `${this.myRole}_${idx}`, owner: this.myRole, x: c.x, y: c.y, elev: c.elev, state: 0, currentSpriteFrame: 0 });
        });

        // LADO DERECHO (RIVAL - Siempre P2 en tu pantalla)
        const p2DiceCoords = [ 
            {x:8, y:5, elev: 30}, {x:9, y:5, elev: 30}, {x:10, y:5, elev: 30}, 
            {x:8, y:6, elev: 0},  {x:10, y:6, elev: 0}  
        ];
        p2DiceCoords.forEach((c, idx) => {
            this.diceArray.push({ id: `${rivalRole}_${idx}`, owner: rivalRole, x: c.x, y: c.y, elev: c.elev, state: 0, currentSpriteFrame: 0 });
        });
    },

    // --- REDIBUJADO ISOMÉTRICO (60 FPS) ---
    render: function() {
        if (!this.ctx) return;
        if (this.mode !== 'ia' && !this.matchData && this.myRole !== 'host') return;
        
        this.globalFrameCounter++; 
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let x = 0; x < 12; x++) {
            for (let y = 0; y < 12; y++) {
                const pos = this.mapToScreen(x, y);
                if (this.images.floor.complete && this.images.floor.width > 0) {
                    this.ctx.drawImage(this.images.floor, pos.x - (this.tileW / 2), pos.y);
                } else {
                    this.ctx.strokeStyle = '#2ecc71';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(pos.x, pos.y);
                    this.ctx.lineTo(pos.x + (this.tileW / 2), pos.y + (this.tileH / 2));
                    this.ctx.lineTo(pos.x, pos.y + this.tileH);
                    this.ctx.lineTo(pos.x - (this.tileW / 2), pos.y + (this.tileH / 2));
                    this.ctx.closePath();
                    this.ctx.stroke();
                }
                if (this.hoveredTile.x === x && this.hoveredTile.y === y) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(pos.x, pos.y);
                    this.ctx.lineTo(pos.x + (this.tileW / 2), pos.y + (this.tileH / 2));
                    this.ctx.lineTo(pos.x, pos.y + this.tileH);
                    this.ctx.lineTo(pos.x - (this.tileW / 2), pos.y + (this.tileH / 2));
                    this.ctx.fill();
                }
            }
        }

        let entities = [...this.diceArray];
        entities.push({ type: 'avatar', x: 3, y: 6, isP1: true });
        entities.push({ type: 'avatar', x: 9, y: 6, isP1: false });

        entities.sort((a, b) => (a.x + a.y) - (b.x + b.y));

        entities.forEach(ent => {
            const pos = this.mapToScreen(ent.x, ent.y);

            if (ent.type === 'avatar') {
                const img = ent.isP1 ? this.avatars.p1 : this.avatars.p2;
                if (img.complete && img.width > 0) {
                    this.ctx.drawImage(img, pos.x - (img.width / 2), pos.y - img.height + (this.tileH / 2) + 15);
                }
            } 
            else if (ent.id) { 
                const drawX = pos.x - (this.SPRITE_WIDTH / 2);
                const drawY = pos.y - this.SPRITE_HEIGHT + (this.tileH / 2) - (ent.elev || 0);

                const hitW = 35; 
                const hitH = 45;
                const hitX = drawX + (this.SPRITE_WIDTH / 2) - (hitW / 2);
                const hitY = drawY + (this.SPRITE_HEIGHT / 2) - (hitH / 2) + 15;
                
                ent.hitbox = { x: hitX, y: hitY, w: hitW, h: hitH };

                if (this.selectedDiceId === ent.id) {
                    this.ctx.fillStyle = 'rgba(241, 196, 15, 0.5)';
                    this.ctx.beginPath();
                    this.ctx.ellipse(pos.x, drawY + this.SPRITE_HEIGHT - 10, 20, 10, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                if (ent.state === -1) {
                    if (this.images.dice_spinning.complete) {
                        if (this.globalFrameCounter % 5 === 0) {
                            ent.currentSpriteFrame = (ent.currentSpriteFrame + 1) % this.SPRITE_FRAMES;
                        }
                        const sourceX = ent.currentSpriteFrame * this.SPRITE_WIDTH;
                        this.ctx.drawImage(
                            this.images.dice_spinning, sourceX, 0, this.SPRITE_WIDTH, this.SPRITE_HEIGHT, 
                            drawX, drawY, this.SPRITE_WIDTH, this.SPRITE_HEIGHT
                        );
                    }
                } else if (ent.state === 0) {
                    if (this.images.dice_closed.complete) {
                        this.ctx.drawImage(this.images.dice_closed, drawX, drawY);
                    }
                } else if (ent.state >= 1 && ent.state <= 6) {
                    const img = this.images.dice_frames[ent.state - 1];
                    if (img && img.complete) {
                        this.ctx.drawImage(img, drawX, drawY);
                    }
                }
            }
        });
    },

    // --- CONTROLES DE RATÓN ---
    handleMouseMove: function(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
        
        this.hoveredTile = this.screenToMap(this.mouseX, this.mouseY);
    },

    getClickedDice: function() {
        for (let i = this.diceArray.length - 1; i >= 0; i--) {
            const d = this.diceArray[i];
            if (d.hitbox && 
                this.mouseX >= d.hitbox.x && this.mouseX <= d.hitbox.x + d.hitbox.w &&
                this.mouseY >= d.hitbox.y && this.mouseY <= d.hitbox.y + d.hitbox.h) {
                return d;
            }
        }
        return null;
    },

    handleClick: function(e) {
        if (!this.isMyTurn) return;

        const clickedDice = this.getClickedDice();
        
        if (clickedDice && clickedDice.owner === this.myRole) {
            if (clickedDice.state > 0) { 
                this.selectedDiceId = clickedDice.id;
                document.getElementById('btn-duel-close').disabled = false;
            }
        } else {
            this.selectedDiceId = null;
            document.getElementById('btn-duel-close').disabled = true;
        }
    },

    handleDoubleClick: function(e) {
        if (!this.isMyTurn) return;

        const clickedDice = this.getClickedDice();
        
        if (clickedDice && clickedDice.owner === this.myRole && clickedDice.state >= 0) { 
            this.spinDice(clickedDice);
        }
    },

    // --- LÓGICA DE DADOS ---
    spinDice: async function(dice) {
        clearInterval(this.timerInterval);
        this.timeLeft = 20;
        document.getElementById('duel-timer').textContent = this.timeLeft;
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('duel-timer').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.handleTimeout();
        }, 1000);

        dice.state = -1; 
        this.broadcastDiceState();

        const { data: secureRoll, error } = await db.rpc('roll_secure_dice', { 
            dice_id: dice.id, 
            match_id: this.matchData ? this.matchData.id : null 
        });

        const roll = (!error && secureRoll) ? secureRoll : Math.floor(Math.random() * 6) + 1;

        setTimeout(async () => {
            dice.state = roll;
            this.selectedDiceId = null;
            document.getElementById('btn-duel-close').disabled = true;
            
            // FIX UI: Siempre sumo a mi propio marcador visual (p1Score)
            this.p1Score += roll;
            
            this.updateScoreUI();
            this.broadcastGameState();

            if (this.p1Score > 21) {
                this.isMyTurn = false;
                clearInterval(this.timerInterval);
                await this.syncScoreToDB();

                if (this.mode !== 'ia') {
                    const updateData = { status: 'abandoned' };
                    if (this.myRole === 'host') updateData.host_score = -1;
                    else updateData.guest_score = -1;
                    await db.from('arena_matches').update(updateData).eq('id', this.matchData.id);
                }
                
                const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
                window.showToast(isEn ? 'Bust! You went over 21.' : '¡Te pasaste de 21!', 'error'); // FIX: Toast no bloqueante
                
                setTimeout(() => this.endGame('lose'), 1000);
            } else {
                await this.syncScoreToDB();
            }
        }, 1200);
    },

    closeSelectedDice: async function() {
        if (!this.isMyTurn || !this.selectedDiceId) return;

        const dice = this.diceArray.find(d => d.id === this.selectedDiceId);
        if (dice && dice.state > 0) {
            dice.state = 0; 
            this.selectedDiceId = null;
            document.getElementById('btn-duel-close').disabled = true;
            this.broadcastGameState();
            await this.syncScoreToDB();
        }
    },

    updateScoreUI: function() {
        const p1ScoreEl = document.getElementById('duel-p1-score');
        const p2ScoreEl = document.getElementById('duel-p2-score');
        if (p1ScoreEl) p1ScoreEl.textContent = this.p1Score;
        if (p2ScoreEl) p2ScoreEl.textContent = this.p2Score;
    },

    // --- MULTIJUGADOR REALTIME ---
    setupRealtime: function() {
        if (this.channel) db.removeChannel(this.channel);

        this.channel = db.channel(`match_${this.matchData.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'arena_matches', filter: `id=eq.${this.matchData.id}` }, 
            (payload) => {
                this.handleDBUpdate(payload.new);
            })
            .on('broadcast', { event: 'game_state_update' }, (payload) => {
                const incomingDice = payload.payload.diceArray;
                incomingDice.forEach(incDice => {
                    const myDice = this.diceArray.find(d => d.id === incDice.id);
                    if (myDice) {
                        myDice.state = incDice.state;
                        myDice.currentSpriteFrame = incDice.currentSpriteFrame;
                    }
                });

                this.p2Score = payload.payload.senderScore;
                this.updateScoreUI();
                
                if (!this.isMyTurn) {
                    this.timeLeft = 20;
                    const timerUI = document.getElementById('duel-timer');
                    if (timerUI) timerUI.textContent = this.timeLeft;
                }
            })
            .on('broadcast', { event: 'match_tied' }, () => {
                // FIX DESYNC DE EMPATE: El rival nos avisa del empate y reseteamos todo inmediatamente
                const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
                window.showToast(isEn ? "Tie! Dice are reset. The round continues!" : "¡Empate! Dados reiniciados. ¡Sigue la ronda!", 'reward');
                this.p1Score = 0;
                this.p2Score = 0;
                this.diceArray.forEach(d => d.state = 0);
                this.updateScoreUI();
            })
            .subscribe();
    },

    broadcastGameState: function() {
        if (this.mode !== 'ia' && this.channel) {
            this.channel.send({
                type: 'broadcast',
                event: 'game_state_update',
                payload: { 
                    diceArray: this.diceArray,
                    senderScore: this.p1Score // Siempre enviamos nuestra propia puntuación
                }
            });
        }
    },
    
    broadcastDiceState: function() {
        this.broadcastGameState();
    },

    syncScoreToDB: async function() {
        if (this.matchData && this.matchData.id) {
            // Mapeamos nuestro p1Score (Tú) y p2Score (Rival) a la BD según quién seamos
            const updateData = this.mode === 'ia' 
                ? { host_score: this.p1Score, guest_score: this.p2Score }
                : (this.myRole === 'host' ? { host_score: this.p1Score } : { guest_score: this.p1Score });
            await db.from('arena_matches').update(updateData).eq('id', this.matchData.id);
        }
    },

    // --- TURNOS Y LÓGICA GENERAL ---
    startTurn: function(who) {
        clearInterval(this.timerInterval);
        this.timeLeft = 20;
        
        const statusText = document.getElementById('duel-status-text');
        const timerUI = document.getElementById('duel-timer');
        
        timerUI.textContent = this.timeLeft;

        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';

        if (who === 'host') { 
            this.isMyTurn = true;
            const textTurn = isEn ? 'Your Turn! Double click a dice.' : '¡Tu Turno! Doble clic al dado.';
            statusText.innerHTML = `<span style="color: #2ecc71;">${textTurn}</span>`;
            document.getElementById('btn-duel-stand').disabled = false;

            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                timerUI.textContent = this.timeLeft;
                if (this.timeLeft <= 0) this.handleTimeout();
            }, 1000);

        } else { 
            this.isMyTurn = false;
            const rivalName = document.getElementById('duel-p2-name').textContent;
            const textTurn = isEn ? `Turn of: ${rivalName}` : `Turno de: ${rivalName}`;
            statusText.innerHTML = `<span style="color: #e74c3c;">${textTurn}</span>`;
            document.getElementById('btn-duel-close').disabled = true;
            document.getElementById('btn-duel-stand').disabled = true;

            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                timerUI.textContent = Math.max(0, this.timeLeft);
            }, 1000);

            if (this.mode === 'ia') this.playIATurn();
        }
    },

    stand: async function() {
        if (!this.isMyTurn) return;
        this.isMyTurn = false;
        clearInterval(this.timerInterval);

        document.getElementById('btn-duel-close').disabled = true;
        document.getElementById('btn-duel-stand').disabled = true;

        await this.syncScoreToDB();

        let myScore = this.p1Score;
        let rivalScore = this.p2Score;

        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';

        if (rivalScore > 0) {
            if (myScore > rivalScore) {
                return this.endGame('win'); 
            } else if (myScore < rivalScore) {
                if (this.mode !== 'ia') {
                    await db.from('arena_matches').update({ status: 'finished' }).eq('id', this.matchData.id);
                }
                return this.endGame('lose');
            } else {
                // FIX DE EMPATE LÍMPIO
                const msg = isEn ? `Tie at ${myScore}! Dice reset. Round continues!` : `¡Empate a ${myScore}! Dados reiniciados. Sigue la ronda.`;
                window.showToast(msg, 'reward'); // Toast no bloqueante
                
                this.p1Score = 0;
                this.p2Score = 0;
                this.diceArray.forEach(d => d.state = 0);
                this.updateScoreUI();
                this.broadcastDiceState();
                
                if (this.mode !== 'ia') {
                    // 1. Avisamos por radio al rival para que resetee sus puntos
                    if (this.channel) this.channel.send({ type: 'broadcast', event: 'match_tied', payload: {} });
                    
                    // 2. Le cedemos el turno al RIVAL en BD para evitar bucles infinitos en nuestra pantalla
                    await db.from('arena_matches').update({ host_score: 0, guest_score: 0, turn_user_id: this.rivalId }).eq('id', this.matchData.id);
                } else {
                    this.startTurn('guest'); 
                }
                return; 
            }
        }

        if (this.mode === 'ia') {
            this.startTurn('guest'); 
        } else {
            await db.from('arena_matches').update({ turn_user_id: this.rivalId }).eq('id', this.matchData.id);
        }
    },

    handleTimeout: async function() {
        clearInterval(this.timerInterval);
        this.isMyTurn = false;
        
        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
        window.showToast(isEn ? 'Time out! You lost your turn and the bet.' : '¡Tiempo agotado por inactividad! Has perdido.', 'error');

        if (this.mode === 'ia') {
            this.endGame('lose');
        } else {
            const updateData = { status: 'abandoned' };
            if (this.myRole === 'host') updateData.host_score = -1;
            else updateData.guest_score = -1;

            await db.from('arena_matches').update(updateData).eq('id', this.matchData.id); 
            this.endGame('lose');
        }
    },

    endGame: async function(result, alreadyPaid = false) {
        if (this.isGameOver) return; // NUEVO: Si el candado está cerrado (ya avisó), frenamos en seco
        this.isGameOver = true; // NUEVO: Cerramos el candado para ignorar los ecos de la radio

        clearInterval(this.timerInterval);
        if (this.iaTimer) clearInterval(this.iaTimer);
        if (this.channel) db.removeChannel(this.channel);

        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';

        if (result === 'win') {
            const msg = isEn ? `You reached ${this.p1Score} and won the pot!` : `¡Llegaste a ${this.p1Score} y ganaste el bote!`;
            window.showToast(msg, 'reward');
            
            if (!alreadyPaid) {
                // FIX 1: Le quitamos el "&& this.mode !== 'ia'" para que si le ganas a la IA, la partida se cierre.
                if (this.matchData && this.matchData.id) {
                    await db.from('arena_matches').update({ status: 'finished' }).eq('id', this.matchData.id);
                }
                await this.rewardWinner();
            }

            // --- NUEVO: KILLFEED Y VICTORIA BD ---
            if (this.mode !== 'ia' && this.matchData) {
                try {
                    const { data: userData } = await db.from('users').select('username, arena_wins').eq('id', this.myId).single();
                    if (userData) {
                        await db.from('users').update({ arena_wins: (userData.arena_wins || 0) + 1 }).eq('id', this.myId);
                        
                        const rivalName = document.getElementById('duel-p2-name').textContent || 'Rival';
                        const totalPot = (this.matchData.bet_amount || 0) * 2;
                        if (typeof ActivityFeed !== 'undefined' && totalPot > 0) {
                            ActivityFeed.sendActivity({
                                key: 'feed-arena-win',
                                user: userData.username,
                                pot: totalPot,
                                rival: rivalName
                            }, 'arena');
                        }
                    }
                } catch(e) { console.error(e); }
            }
        } else if (result === 'lose') {
            window.showToast(isEn ? 'You lost the bet. The items have vanished.' : 'Has perdido la apuesta. Los objetos se han esfumado.', 'error');
            
            // FIX 2: Si perdemos contra la IA, como ella no puede cerrar la partida, la cerramos nosotros.
            if (this.matchData && this.matchData.id && this.mode === 'ia') {
                await db.from('arena_matches').update({ status: 'finished' }).eq('id', this.matchData.id);
            }
        }

        document.getElementById('duel-arena-section').classList.add('hidden');
        document.getElementById('matchmaking-section').classList.remove('hidden');
        if (typeof window.Inventory !== 'undefined') window.Inventory.loadInventory();
        if (typeof ArenaLobby !== 'undefined') ArenaLobby.closeBettingSetup();
    },

    rewardWinner: async function() {
        try {
            const { data: { user } } = await db.auth.getUser();
            if (!user) return;

            if (this.matchData && this.matchData.id) {
                const { data: rewardPaid, error } = await db.rpc('pay_secure_reward', {
                    user_id: user.id,
                    match_id: this.matchData.id
                });
                
                if (error || !rewardPaid) {
                    console.error("Error de seguridad al pagar el premio:", error);
                }
            }
        } catch(e) {
            console.error("Error al procesar el bote:", e);
        }
    },

    handleDBUpdate: async function(newData) {
        // FIX CRÍTICO: Fusionar los datos nuevos con los viejos para no perder el "status"
        // Supabase solo envía las columnas modificadas. Si machacamos el objeto, perdemos datos vitales.
        this.matchData = { ...this.matchData, ...newData };
        const mergedData = this.matchData;

        if (mergedData.status === 'abandoned') {
            const amIHost = this.myRole === 'host';
            const myDbScore = amIHost ? mergedData.host_score : mergedData.guest_score;
            
            if (myDbScore === -1) {
                return;
            }

            const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
            let reasonEs = 'Tu rival huyó o agotó su tiempo';
            let reasonEn = 'Opponent fled or timed out';
            
            if (this.p2Score > 21) {
                reasonEs = 'Tu rival se pasó de 21';
                reasonEn = 'Opponent busted (> 21)';
            }

            window.showToast(isEn ? `You won! (${reasonEn})` : `¡Has ganado! (${reasonEs})`, 'reward');
            
            await db.from('arena_matches').update({ status: 'finished' }).eq('id', this.matchData.id);
            await this.rewardWinner();
            
            this.endGame('win', true); 
            return;
        }

        if (mergedData.status === 'finished') {
            const amIHost = this.myRole === 'host';
            const myDbScore = amIHost ? mergedData.host_score : mergedData.guest_score;
            const rivalDbScore = amIHost ? mergedData.guest_score : mergedData.host_score;

            if (myDbScore > rivalDbScore) {
                await this.rewardWinner();
                this.endGame('win', true); 
            } else if (myDbScore < rivalDbScore) {
                this.endGame('lose');
            }
            return;
        }

        if (mergedData.status === 'playing' && mergedData.turn_user_id) {
            if (this.currentTurnUserId !== mergedData.turn_user_id) {
                this.currentTurnUserId = mergedData.turn_user_id; 
                if (mergedData.turn_user_id === this.myId) {
                    this.startTurn('host'); 
                } else {
                    this.startTurn('guest'); 
                }
            }
        }
    },

    // --- IA MODO DIOS ---
    playIATurn: function() {
        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';

        this.iaTimer = setInterval(() => {
            const availableDice = this.diceArray.filter(d => d.owner === 'guest' && d.state >= 0);
            const selectedDice = availableDice[Math.floor(Math.random() * availableDice.length)];
            
            if (selectedDice) {
                clearInterval(this.timerInterval);
                this.timeLeft = 20;
                document.getElementById('duel-timer').textContent = this.timeLeft;
                this.timerInterval = setInterval(() => {
                    this.timeLeft--;
                    document.getElementById('duel-timer').textContent = Math.max(0, this.timeLeft);
                    if (this.timeLeft <= 0) this.handleTimeout();
                }, 1000);

                selectedDice.state = -1; 
                
                setTimeout(async () => {
                    const roll = Math.floor(Math.random() * 6) + 1;
                    selectedDice.state = roll;
                    
                    this.p2Score += roll;
                    this.updateScoreUI();
                    
                    await this.syncScoreToDB();

                    if (this.p2Score > 21) {
                        clearInterval(this.iaTimer);
                        setTimeout(() => this.endGame('win'), 1000);
                        return;
                    }

                    if (this.p1Score > 0) {
                        if (this.p2Score > this.p1Score) {
                            clearInterval(this.iaTimer);
                            setTimeout(() => this.endGame('lose'), 1000);
                            return;
                        } else if (this.p2Score === this.p1Score && this.p2Score >= 16) {
                            clearInterval(this.iaTimer);
                            window.showToast(isEn ? 'AI ties and stands! Restarting round...' : '¡La IA empata y se planta! Reiniciando ronda...', 'reward');
                            this.p1Score = 0; this.p2Score = 0;
                            this.diceArray.forEach(d => d.state = 0);
                            this.updateScoreUI();
                            this.startTurn('host');
                            return;
                        }
                    }

                    if (this.p1Score === 0 && this.p2Score >= 18) {
                        clearInterval(this.iaTimer);
                        this.startTurn('host');
                        return;
                    }

                }, 1200); 
            } else {
                clearInterval(this.iaTimer);
                if (this.p1Score === 0) {
                    this.startTurn('host'); 
                } else { 
                    if (this.p2Score > this.p1Score) setTimeout(() => this.endGame('lose'), 1000);
                    else if (this.p2Score < this.p1Score) setTimeout(() => this.endGame('win'), 1000);
                    else {
                        window.showToast(isEn ? 'Tie without dice! Restarting round...' : '¡Empate sin dados! Reiniciando ronda...', 'reward');
                        this.p1Score = 0; this.p2Score = 0;
                        this.diceArray.forEach(d => d.state = 0);
                        this.updateScoreUI();
                        this.startTurn('host');
                    }
                }
            }
        }, 3000); 
    }
};

document.addEventListener('DOMContentLoaded', () => ArenaGame.init());