/* ==========================================================================
   js/arena_lobby.js - SISTEMA DE MATCHMAKING Y APUESTAS (FASE 4)
   ========================================================================== */

const ArenaLobby = {
    currentMode: 'public', // 'public', 'friend', 'ia'
    myBetItems: {},        // { item_id: cantidad }
    myBetTotal: 0,
    rivalBetTotal: 0,
    joiningMatchId: null,  // null si estamos creando, un UUID si nos estamos uniendo

    init: function() {
        // 1. Pestañas de Navegación
        document.querySelectorAll('.arena-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = btn.getAttribute('data-target');
                this.switchTab(targetId, btn);
            });
        });

        // 2. Botones de Inicio de Partida
        document.getElementById('btn-arena-create')?.addEventListener('click', () => {
            this.currentMode = 'public';
            this.openBettingSetup(null, 0); // null = Crear partida nueva
        });
        
        document.getElementById('btn-arena-refresh')?.addEventListener('click', () => {
            if (this.currentMode === 'public') this.loadPublicMatches();
        });

        document.getElementById('btn-play-ia')?.addEventListener('click', () => {
            this.currentMode = 'ia';
            this.openBettingSetup(null, 0); // null = Crear partida contra IA
        });

        // Botón de Retar a un Amigo
        document.getElementById('btn-send-challenge')?.addEventListener('click', () => this.initiateFriendChallenge());

        // 3. Mesa de Apuestas (Drag & Drop)
        const dropzone = document.getElementById('my-bet-dropzone');
        if (dropzone) {
            dropzone.addEventListener('dragover', (e) => e.preventDefault());
            dropzone.addEventListener('drop', (e) => this.handleDropItem(e));
        }

        // 4. Controles de la Mesa
        document.getElementById('btn-cancel-bet')?.addEventListener('click', () => this.closeBettingSetup());
        document.getElementById('btn-confirm-bet')?.addEventListener('click', () => this.confirmBet());

        // 5. Escuchar cuando se abre la Arena para recargar la lista
        document.getElementById('nav-find-match')?.addEventListener('click', () => this.loadPublicMatches());
    },

    // --- INTERFAZ LOBBY ---
    switchTab: function(targetId, activeBtn) {
        // Actualizar botones
        document.querySelectorAll('.arena-tab-btn').forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');

        // Actualizar vistas
        document.querySelectorAll('.arena-view').forEach(v => v.classList.add('hidden'));
        document.getElementById(targetId).classList.remove('hidden');

        if (targetId === 'arena-view-public') {
            this.currentMode = 'public';
            this.loadPublicMatches();
        } else if (targetId === 'arena-view-friend') {
            this.currentMode = 'friend';
        } else if (targetId === 'arena-view-ia') {
            this.currentMode = 'ia';
        }
    },

	// --- SISTEMA DE RETOS ---
    initiateFriendChallenge: async function() {
        // FIX: Ahora buscamos el ID real que está en el HTML
        const friendInput = document.getElementById('input-friend-name');
        if (!friendInput) return;

        const friendName = friendInput.value.trim();
        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';

        if (!friendName) {
            window.showToast(isEn ? "Enter a friend's username." : "Introduce el nombre de un amigo.", 'error');
            return;
        }

        window.showToast(isEn ? "Searching for user..." : "Buscando usuario...", 'reward');

        // Buscar al amigo en la base de datos
        const { data: friendData, error } = await db.from('users').select('id').ilike('username', friendName).single();

        if (error || !friendData) {
            window.showToast(isEn ? "User not found." : "Usuario no encontrado.", 'error');
            return;
        }

        // Evitar retarse a uno mismo
        const { data: { user } } = await db.auth.getUser();
        if (user && user.id === friendData.id) {
            window.showToast(isEn ? "You can't challenge yourself." : "No puedes retarte a ti mismo.", 'error');
            return;
        }

        // Si existe y no eres tú, guardamos la ID y abrimos la mesa
        this.currentMode = 'friend';
        this.friendTargetId = friendData.id; 
        this.openBettingSetup(null, 0);
    },
    loadPublicMatches: async function() {
        const listDiv = document.getElementById('arena-public-list');
        if (!listDiv) return;

        listDiv.innerHTML = '<p style="color: #aaa; text-align: center;">Buscando partidas...</p>';

        // Obtenemos nuestra ID para saber cuáles son nuestras partidas
        const { data: { user } } = await db.auth.getUser();

        const { data, error } = await db
            .from('arena_matches')
            .select('*, host:users!host_id(username)') 
            .eq('status', 'waiting')
            .eq('game_type', 'public')
            .order('created_at', { ascending: false });

        if (error) console.error("🕵️ Error de Supabase leyendo partidas:", error.message, error.details);

        if (error || !data || data.length === 0) {
            listDiv.innerHTML = '<p style="color: #aaa; text-align: center;">No hay partidas públicas disponibles. ¡Crea una!</p>';
            return;
        }

        listDiv.innerHTML = '';
        data.forEach(match => {
            const card = document.createElement('div');
            card.className = 'arena-match-card';
            
            const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
            const hostName = match.host ? match.host.username : 'Desconocido';
            
            // ¿Es mi partida?
            const isMyMatch = user && match.host_id === user.id;

            if (isMyMatch) {
                // MI PARTIDA -> Botón Rojo de Cancelar
                const btnText = isEn ? 'Cancel Match' : 'Cancelar Partida';
                card.innerHTML = `
                    <div>
                        <h4 style="color: #e74c3c; margin-bottom: 5px;">${hostName} (Tú)</h4>
                        <p style="color: #f1c40f; font-weight: bold; font-size: 14px;">Bote: ${match.bet_amount} Créditos</p>
                    </div>
                    <button class="btn-cancel-my-match" data-id="${match.id}" style="background: #c0392b; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        ${btnText}
                    </button>
                `;
            } else {
                // PARTIDA DE OTRO -> Botón Naranja de Unirse
                const btnText = isEn ? 'Join' : 'Unirse';
                // Guardamos los items de forma segura en el botón
                const safeItems = encodeURIComponent(JSON.stringify(match.bet_items || {}));
                card.innerHTML = `
                    <div>
                        <h4 style="color: #3498db; margin-bottom: 5px;">${hostName}</h4>
                        <p style="color: #f1c40f; font-weight: bold; font-size: 14px;">Bote: ${match.bet_amount} Créditos</p>
                    </div>
                    <button class="btn-join-match" data-id="${match.id}" data-pot="${match.bet_amount}" data-items="${safeItems}" style="background: #e67e22; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        ${btnText}
                    </button>
                `;
            }
            listDiv.appendChild(card);
        });

        // Eventos para Unirse
        document.querySelectorAll('.btn-join-match').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const matchId = e.target.getAttribute('data-id');
                const pot = parseInt(e.target.getAttribute('data-pot'));
                const items = JSON.parse(decodeURIComponent(e.target.getAttribute('data-items')));
                this.currentMode = 'public';
                this.openBettingSetup(matchId, pot, items);
            });
        });

        // Eventos para Cancelar Propia
        document.querySelectorAll('.btn-cancel-my-match').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const matchId = e.target.getAttribute('data-id');
                this.cancelMyMatch(matchId);
            });
        });
    },

    cancelMyMatch: async function(matchId, isAuto = false, autoMsg = null) {
        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
        
        // Si no es un borrado automático, preguntamos al jugador
        if (!isAuto) {
            if (!confirm(isEn ? "Cancel match and refund bet?" : "¿Seguro que quieres cancelar tu partida y recuperar la apuesta?")) return;
        }

        const { data: { user } } = await db.auth.getUser();
        
        const { data: success, error } = await db.rpc('cancel_secure_match', {
            host_uuid: user.id,
            target_match_id: matchId
        });

        if (success) {
            window.showToast(autoMsg || (isEn ? "Match cancelled! Bet refunded." : "¡Partida cancelada! Apuesta devuelta a tu inventario."), 'reward');
            this.loadPublicMatches(); 
            if (typeof window.Inventory !== 'undefined') window.Inventory.loadInventory(); 
        } else {
            if (!isAuto) window.showToast(isEn ? "Error. Maybe someone just joined?" : "Error al cancelar. ¿Quizás alguien se acaba de unir en este milisegundo?", 'error');
        }
    },

    // --- MESA DE APUESTAS ---
    openBettingSetup: function(matchId, rivalBet, rivalBetItems = null) {
        this.joiningMatchId = matchId;
        this.rivalBetTotal = rivalBet;
        this.rivalBetItems = rivalBetItems || {};
        this.myBetItems = {};
        this.myBetTotal = 0;

        // Ocultar sección de matchmaking, mostrar mesa
        document.getElementById('matchmaking-section').classList.add('hidden');
        document.getElementById('betting-setup-section').classList.remove('hidden');

        this.updateBettingUI();
    },

    closeBettingSetup: function() {
        // --- NUEVO: El Arrepentimiento ---
        // Si estábamos a punto de unirnos a un reto de amigo y le damos a cancelar, liberamos al Host
        if (this.currentMode === 'friend' && this.joiningMatchId) {
            db.from('arena_matches').update({ status: 'declined' }).eq('id', this.joiningMatchId).then();
        }

        this.myBetItems = {};
        this.myBetTotal = 0;
        this.joiningMatchId = null; // Limpiamos la ID para que no interfiera luego

        document.getElementById('betting-setup-section').classList.add('hidden');
        document.getElementById('matchmaking-section').classList.remove('hidden');
        
        if (this.currentMode === 'public') this.loadPublicMatches();
        
        if (typeof window.Inventory !== 'undefined') window.Inventory.loadInventory();
    },

    handleDropItem: async function(e) {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain');
        if (!itemId) return;

        const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[itemId] : null;
        if (!ref) return;

        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        const { data: userData } = await db.from('users').select('inventory').eq('id', user.id).single();
        const inv = userData.inventory || {};
        const alreadyBet = this.myBetItems[itemId] || 0;
        const available = (inv[itemId] || 0) - alreadyBet;

        if (available > 0) {
            let qty = 1; // Por defecto apostamos 1
            
            // SOLO si tenemos más de 1, preguntamos al usuario
            if (available > 1) {
                const isEn = LanguageManager.current === 'en';
                const msg = isEn ? `You have ${available} available. How many do you want to bet?` : `Tienes ${available} disponibles. ¿Cuántos deseas apostar?`;
                
                let qtyStr = prompt(msg, available.toString());
                if (qtyStr === null) return; // Si cancela, abortamos
                
                qty = parseInt(qtyStr);
                if (isNaN(qty) || qty <= 0 || qty > available) {
                    alert(isEn ? "Invalid quantity." : "Cantidad inválida.");
                    return;
                }
            }

            // Aplicamos la cantidad (sea 1 o la que eligió)
            this.myBetItems[itemId] = alreadyBet + qty;
            this.myBetTotal += (ref.value * qty);
            this.updateBettingUI();
        } else {
            const isEn = LanguageManager.current === 'en';
            alert(isEn ? "You don't have more of this item." : "No tienes más de este objeto en tu inventario.");
        }
    },

    // Quitar objeto de la mesa al hacerle clic
    removeBetItem: function(itemId) {
        if (!this.myBetItems[itemId] || this.myBetItems[itemId] <= 0) return;
        
        const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[itemId] : null;
        if (!ref) return;

        let currentBet = this.myBetItems[itemId];
        let qty = 1; // Por defecto quitamos 1

        // SOLO si hay más de 1 en la mesa, preguntamos cuántos quitar
        if (currentBet > 1) {
            const isEn = LanguageManager.current === 'en';
            const msg = isEn ? `You bet ${currentBet}. How many do you want to remove?` : `Has apostado ${currentBet}. ¿Cuántos deseas retirar?`;

            let qtyStr = prompt(msg, currentBet.toString());
            if (qtyStr === null) return;

            qty = parseInt(qtyStr);
            if (isNaN(qty) || qty <= 0 || qty > currentBet) {
                alert(isEn ? "Invalid quantity." : "Cantidad inválida.");
                return;
            }
        }

        // Aplicamos la retirada (sea 1 o la que eligió)
        this.myBetItems[itemId] -= qty;
        this.myBetTotal -= (ref.value * qty);
        if (this.myBetItems[itemId] === 0) delete this.myBetItems[itemId];

        this.updateBettingUI();
    },

    // (Asegúrate de que openBettingSetup tenga rivalBetItems = null en sus argumentos, es decir: openBettingSetup: function(matchId, rivalBet, rivalBetItems = null) y this.rivalBetItems = rivalBetItems || {};)
    
    updateBettingUI: function() {
        document.getElementById('rival-bet-total').textContent = this.rivalBetTotal;
        document.getElementById('my-bet-total').textContent = this.myBetTotal;

        const rivalPotDiv = document.getElementById('rival-bet-pot');
        rivalPotDiv.innerHTML = '';
        
        if (this.joiningMatchId && this.rivalBetItems && Object.keys(this.rivalBetItems).length > 0) {
            for (const [itemId, quantity] of Object.entries(this.rivalBetItems)) {
                const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[itemId] : null;
                if (ref) {
                    const itemBox = document.createElement('div');
                    itemBox.style.position = 'relative';

                    const img = document.createElement('img');
                    img.src = ref.image_url;
                    img.className = 'bet-item';
                    img.title = ref.name;
                    
                    const badge = document.createElement('div');
                    badge.textContent = 'x' + quantity;
                    badge.style.position = 'absolute';
                    badge.style.bottom = '-5px';
                    badge.style.right = '-5px';
                    badge.style.background = '#e74c3c';
                    badge.style.color = 'white';
                    badge.style.fontSize = '10px';
                    badge.style.fontWeight = 'bold';
                    badge.style.padding = '2px 4px';
                    badge.style.borderRadius = '4px';

                    itemBox.appendChild(img);
                    itemBox.appendChild(badge);
                    rivalPotDiv.appendChild(itemBox);
                }
            }
        } else if (this.joiningMatchId) {
            rivalPotDiv.innerHTML = '<p style="color: #aaa; margin-top: 50px;">Cargando apuesta...</p>';
        } else {
            rivalPotDiv.innerHTML = '<p style="color: #aaa; margin-top: 50px;">Esperando rival...</p>';
        }

        // Dibujar mi bote con sistema de apilado (Stacking) visual
        const myPotDiv = document.getElementById('my-bet-pot');
        myPotDiv.innerHTML = '';
        
        for (const [itemId, quantity] of Object.entries(this.myBetItems)) {
            const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[itemId] : null;
            if (ref) {
                const itemBox = document.createElement('div');
                itemBox.style.position = 'relative';
                itemBox.style.cursor = 'pointer';
                itemBox.onclick = () => this.removeBetItem(itemId);

                const img = document.createElement('img');
                img.src = ref.image_url;
                img.className = 'bet-item';
                img.title = ref.name;
                
                // Etiqueta roja con la cantidad estilo Habbo
                const badge = document.createElement('div');
                badge.textContent = 'x' + quantity;
                badge.style.position = 'absolute';
                badge.style.bottom = '-5px';
                badge.style.right = '-5px';
                badge.style.background = '#e74c3c';
                badge.style.color = 'white';
                badge.style.fontSize = '10px';
                badge.style.fontWeight = 'bold';
                badge.style.padding = '2px 4px';
                badge.style.borderRadius = '4px';

                itemBox.appendChild(img);
                itemBox.appendChild(badge);
                myPotDiv.appendChild(itemBox);
            }
        }

        this.validateBet();
    },

    validateBet: function() {
        const btnConfirm = document.getElementById('btn-confirm-bet');
        let isValid = false;

        // Regla 1: Contra IA (Máximo 100 créditos)
        if (this.currentMode === 'ia') {
            if (this.myBetTotal > 0 && this.myBetTotal <= 100) {
                isValid = true;
            }
        } 
        // Regla 2: Unirse a partida (+- 5 créditos del rival)
        else if (this.joiningMatchId) {
            const diff = Math.abs(this.myBetTotal - this.rivalBetTotal);
            if (this.myBetTotal > 0 && diff <= 5) {
                isValid = true;
            }
        } 
        // Regla 3: Crear partida (Solo necesita ser mayor que 0)
        else {
            if (this.myBetTotal > 0) {
                isValid = true;
            }
        }

        btnConfirm.disabled = !isValid;
    },

    // --- ENVIAR A LA BASE DE DATOS ---
    confirmBet: async function() {
        document.getElementById('btn-confirm-bet').disabled = true;

        const { data: { user } } = await db.auth.getUser();
        if (!user) return;
        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';

        // ==========================================
        // MODO 1: UNIRSE A UNA PARTIDA EXISTENTE
        // ==========================================
        if (this.joiningMatchId) {
            // Usamos el misil SQL atómico para esquivar el RLS y que no nos roben objetos
            const { data: joinResult, error: joinErr } = await db.rpc('join_secure_match', {
                guest_uuid: user.id,
                target_match_id: this.joiningMatchId,
                guest_items: this.myBetItems
            });

            if (joinErr || !joinResult || !joinResult.success) {
                window.showToast(isEn ? "Error joining: Match full or insufficient items." : "Error al unirse: Partida llena, cancelada o faltan objetos.", 'error');
                document.getElementById('btn-confirm-bet').disabled = false;
                this.closeBettingSetup();
                return;
            }

            if (typeof window.Inventory !== 'undefined') window.Inventory.loadInventory();

            // Partida unida con éxito, arrancamos el motor
            if (typeof ArenaGame !== 'undefined') {
                // FIX: Respetamos 'this.currentMode' para que sepa si es pública o amigo
                ArenaGame.startMatch(joinResult.match_data, this.currentMode, this.myBetTotal, this.myBetItems);
            }
            return;
        }

        // ==========================================
        // MODO 2: CREAR NUEVA PARTIDA (Pública, Amigo o IA)
        // ==========================================
        
        // 1. Cobramos la apuesta al creador
        const { data: betPlaced, error: betError } = await db.rpc('place_secure_bet', {
            user_id: user.id,
            bet_items: this.myBetItems
        });

        if (betError || !betPlaced) {
            window.showToast(isEn ? "Security Error: Insufficient items." : "Error de Seguridad: Faltan objetos en tu inventario.", 'error');
            document.getElementById('btn-confirm-bet').disabled = false;
            return;
        }
        
        if (typeof window.Inventory !== 'undefined') window.Inventory.loadInventory(); 

        // 2. Lógica según el tipo de partida creada
        if (this.currentMode === 'ia') {
            const newIaMatch = {
                host_id: user.id,
                status: 'playing', 
                game_type: 'ia',
                bet_amount: this.myBetTotal,
                bet_items: this.myBetItems
            };
            
            const { data, error } = await db.from('arena_matches').insert([newIaMatch]).select().single();
            
            if (!error && typeof ArenaGame !== 'undefined') {
                ArenaGame.startMatch(data, 'ia', this.myBetTotal, this.myBetItems);
            } else {
                document.getElementById('btn-confirm-bet').disabled = false;
                const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('arena-ia-error') : 'Error al crear la partida oficial contra la IA.';
                window.showToast(msg, 'error');
            }
        } 
        else {
            const isFriendMode = this.currentMode === 'friend';
            
            const newMatch = {
                host_id: user.id,
                status: isFriendMode ? 'pending_invite' : 'waiting',
                guest_id: isFriendMode ? this.friendTargetId : null,
                game_type: this.currentMode,
                bet_amount: this.myBetTotal,
                bet_items: this.myBetItems
            };

            const { data, error } = await db.from('arena_matches').insert([newMatch]).select().single();
            
            if (!error) {
                document.getElementById('betting-setup-section').classList.add('hidden');
                document.getElementById('matchmaking-section').classList.remove('hidden');

                // FIX GIGANTE: Quitar los alert bloqueantes para que la radio pueda encenderse inmediatamente
                if (isFriendMode) {
                    window.showToast(isEn ? "Challenge sent! Waiting for response (60s)..." : "¡Reto enviado! Esperando respuesta (60s)...", 'reward');
                    
                    this.challengeTimeout = setTimeout(async () => {
                        const { data: checkMatch } = await db.from('arena_matches').select('status').eq('id', data.id).single();
                        if (checkMatch && checkMatch.status === 'pending_invite') {
                            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('arena-challenge-expired') : "El reto ha caducado. Apuesta devuelta.";
                            this.cancelMyMatch(data.id, true, msg);
                        }
                    }, 60000); 
                } else {
                    window.showToast(isEn ? "Match created! Waiting for a rival..." : "¡Partida creada! Esperando a que alguien se una...", 'reward');
                    this.loadPublicMatches(); 
                }
                
                // Ahora la radio se enciende SIN ESPERAR, cazando a tu amigo al instante
                this.listenForChallengeResponse(data.id);
            } else {
                document.getElementById('btn-confirm-bet').disabled = false;
            }
        }
    },

    listenForChallengeResponse: function(matchId) {
        if (this.challengeChannel) db.removeChannel(this.challengeChannel);
        if (this.hostPollingInterval) clearInterval(this.hostPollingInterval);
        
        // Función central para procesar la entrada o rechazo de forma segura
        const checkMatchStatus = (updatedMatch) => {
            const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';

            if (updatedMatch.status === 'playing') {
                if (this.challengeChannel) db.removeChannel(this.challengeChannel);
                if (this.challengeTimeout) clearTimeout(this.challengeTimeout);
                if (this.hostPollingInterval) clearInterval(this.hostPollingInterval); // Apagar paracaídas
                
                if (updatedMatch.game_type === 'friend') {
                    window.showToast(isEn ? "Challenge accepted!" : "¡Reto aceptado!");
                } else {
                    window.showToast(isEn ? "A rival has joined!" : "¡Un rival se unió a tu partida!");
                }

                if (typeof ArenaGame !== 'undefined') {
                    ArenaGame.startMatch(updatedMatch, updatedMatch.game_type, this.myBetTotal, this.myBetItems);
                }
            } else if (updatedMatch.status === 'declined') {
                if (this.challengeChannel) db.removeChannel(this.challengeChannel);
                if (this.challengeTimeout) clearTimeout(this.challengeTimeout);
                if (this.hostPollingInterval) clearInterval(this.hostPollingInterval); // Apagar paracaídas
                
                const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('arena-challenge-declined') : "Tu reto ha sido rechazado. Apuesta devuelta.";
                this.cancelMyMatch(updatedMatch.id, true, msg);
            }
        };

        // 1. Radar en Tiempo Real (Rápido)
        this.challengeChannel = db.channel(`host_wait_${matchId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'arena_matches', filter: `id=eq.${matchId}` }, 
            (payload) => checkMatchStatus(payload.new))
            .subscribe();

        // 2. PARACAÍDAS ANTI-FALLOS: El Host revisa por su cuenta cada 3 segundos
        this.hostPollingInterval = setInterval(async () => {
            const { data } = await db.from('arena_matches').select('*').eq('id', matchId).single();
            if (data && (data.status === 'playing' || data.status === 'declined')) {
                checkMatchStatus(data);
            }
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => ArenaLobby.init());