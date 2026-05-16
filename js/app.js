/* ==========================================================================
   js/app.js - CONFIGURACIÓN GLOBAL Y RADIO
   ========================================================================== */

// UTILIDAD GLOBAL: Generador de enlaces de avatar para múltiples hoteles
window.getAvatarUrl = function(lookString, action = 'sit,wav', headOnly = false) {
    if (!lookString) return 'https://www.habbo.es/habbo-imaging/avatarimage?user=Guest';

    // 1. Si es ropa del editor PRO (contiene guiones y no tiene ":")
    if (lookString.includes('-') && !lookString.includes(':')) {
        let url = `https://www.habbo.es/habbo-imaging/avatarimage?figure=${lookString}`;
        if (headOnly) url += '&head_direction=3&direction=3&headonly=1';
        else url += `&action=${action}`;
        return url;
    }

    // 2. Si es un nombre de usuario importado
    let hotel = 'es'; // Por defecto (para los usuarios antiguos)
    let username = lookString;

    // Si trae el prefijo de nuestro nuevo selector (ej: "com.br:lupobalt780")
    if (lookString.includes(':')) {
        const parts = lookString.split(':');
        hotel = parts[0];
        username = parts[1];
    }

    let url = `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${username}`;
    if (headOnly) url += '&head_direction=3&direction=3&headonly=1';
    else url += `&action=${action}`;
    
    return url;
};

/* --------------------------------------------------------------------------
   1. HABBO RADIO TITÁN - MOTOR MUSICAL
   -------------------------------------------------------------------------- */
const HabboRadio = {
    audio: new Audio(),
    currentIndex: 0,
    isPaused: true,
    songs: [
        { name: "Habnosis - Tapes from Goa", file: "01 - Habnosis - Tapes from Goa.mp3" },
        { name: "Lady BlaBla - Furni Face", file: "02 - Lady BlaBla - Furni Face.mp3" },
        { name: "Michael Bauble - Habbowood", file: "03 - Michael Bauble - Habbowood.mp3" },
        { name: "BanzaiBabes - About VIP Now", file: "04 - BanzaiBabes - About VIP Now.mp3" },
        { name: "Kayne Quest - Gold Coin Digger", file: "05 - Kayne Quest - Gold Coin Digger.mp3" },
        { name: "Aerokid - Phuturistic Chilled Trax", file: "06 - Aerokid - Phuturistic Chilled Trax.mp3" },
        { name: "Aerokid - Party Trax", file: "07 - Aerokid - Party Trax.mp3" },
        { name: "Kayne Quest - Touch the Skyscraper", file: "08 - Kayne Quest - Touch the Skyscraper.mp3" },
        { name: "BanzaiBabes - Too Lost In Lido", file: "09 - BanzaiBabes - Too Lost In Lido.mp3" },
        { name: "Kayne Quest - The Good Trade", file: "10 - Kayne Quest - The Good Trade.mp3" },
        { name: "Pixel! at the Disco - The Ballad of Bonnie Blonde", file: "11 - Pixel! at the Disco - The Ballad of Bonnie Blonde.mp3" },
        { name: "BanzaiBabes - Push the Call for Help", file: "12 - BanzaiBabes - Push the Call for Help.mp3" },
        { name: "Lady BlaBla - Pixelrazzi", file: "13 - Lady BlaBla - Pixelrazzi.mp3" },
        { name: "Lady BlaBla - Pet Romance", file: "14 - Lady BlaBla - Pet Romance.mp3" },
        { name: "Kallomies - Park Adventure", file: "15 - Kallomies - Park Adventure.mp3" },
        { name: "Michael Bauble - Haven't Friend Request You Yet", file: "16 - Michael Bauble - Haven't Friend Request You Yet.mp3" },
        { name: "Pixel! at the Disco - I Write Bans not Tragedies", file: "17 - Pixel! at the Disco - I Write Bans not Tragedies.mp3" },
        { name: "Rage Against the Fuse - Alley Cat in Trouble", file: "18 - Rage Against the Fuse - Alley Cat in Trouble.mp3" },
        { name: "Habbocalyptica - Epic Flail", file: "19 - Habbocalyptica - Epic Flail.mp3" },
        { name: "DJ Bobba feat. Habboway - Galactic Disco", file: "20 - DJ Bobba feat. Habboway - Galactic Disco.mp3" },
        { name: "Habbo de Gaia - Electric Pixels", file: "21 - Habbo de Gaia - Electric Pixels.mp3" },
        { name: "Rage Against the Fuse - Who Dares Stacks", file: "22 - Rage Against the Fuse - Who Dares Stacks.mp3" },
        { name: "Habnosis - The Habstep", file: "23 - Habnosis - The Habstep.mp3" },
        { name: "Habnosis - 68B Attack Sub", file: "24 - Habnosis - 68B Attack Sub.mp3" },
        { name: "DJ Bobba - Uuh Aah", file: "25 - DJ Bobba - Uuh Aah.mp3" },
        { name: "Barrio Bobba - Caliente Street", file: "26 - Barrio Bobba - Caliente Street.mp3" },
        { name: "Ana Stan Band - Habbo Libre", file: "27 - Ana Stan Band - Habbo Libre.mp3" },
        { name: "Silent Aurora - Xmas Magic", file: "28 - Silent Aurora - Xmas Magic.mp3" },
        { name: "Chibiru - Love Is a bobba", file: "29 - Chibiru - Love Is a bobba.mp3" },
        { name: "estebantoon - PC-PERSONAL COMPUT", file: "30 - estebantoon - PC-PERSONAL COMPUT.mp3" }
    ],

    init: function() {
        const widget = document.getElementById("radio-widget");
        if (!widget) return;

        // 1. Forzamos a que siempre empiece oculta (auth.js decidirá cuándo mostrarla)
        widget.classList.add('hidden');

        // 2. Cargar la primera canción (Pausada por defecto)
        this.loadTrack(0);
        this.audio.volume = 0.5;

        // 3. Eventos de los botones
        document.getElementById('radio-play').onclick = () => this.play();
        document.getElementById('radio-pause').onclick = () => this.pause();
        document.getElementById('radio-next').onclick = () => this.next();
        document.getElementById('radio-prev').onclick = () => this.prev();
        document.getElementById('radio-vol').oninput = (e) => { this.audio.volume = e.target.value / 100; };
        
        // Cierre y apertura
        document.getElementById('btn-close-radio').onclick = () => {
            widget.classList.add('hidden');
            localStorage.setItem('radio_closed', 'true');
        };
        document.getElementById('nav-open-radio').onclick = () => {
            widget.classList.remove('hidden');
            localStorage.removeItem('radio_closed');
        };

        // 4. Lógica de Audio (Tiempos y Fin de canción)
        this.audio.ontimeupdate = () => this.updateTimer();
        this.audio.onended = () => this.next();

        // 5. Sistema Draggable (Arrastrar ventana)
        const handle = document.querySelector(".drag-handle");
        let isDragging = false, offX, offY;
        handle.onmousedown = (e) => {
            isDragging = true;
            offX = e.clientX - widget.getBoundingClientRect().left;
            offY = e.clientY - widget.getBoundingClientRect().top;
            handle.style.cursor = "grabbing";
        };
        document.onmousemove = (e) => {
            if (!isDragging) return;
            widget.style.left = (e.clientX - offX) + "px";
            widget.style.top = (e.clientY - offY) + "px";
        };
        document.onmouseup = () => { isDragging = false; handle.style.cursor = "move"; };
    },

    loadTrack: function(index) {
        this.currentIndex = index;
        const track = this.songs[index];
        this.audio.src = `assets/audio/radio/${track.file}`;
        document.getElementById('radio-track-name').textContent = track.name;
    },

    play: function() {
        this.audio.play();
        this.isPaused = false;
        document.getElementById('radio-play').classList.add('hidden');
        document.getElementById('radio-pause').classList.remove('hidden');
    },

    pause: function() {
        this.audio.pause();
        this.isPaused = true;
        document.getElementById('radio-play').classList.remove('hidden');
        document.getElementById('radio-pause').classList.add('hidden');
    },

    next: function() {
        let nextIdx = (this.currentIndex + 1) % this.songs.length;
        this.loadTrack(nextIdx);
        if (!this.isPaused) this.play();
    },

    prev: function() {
        let prevIdx = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
        this.loadTrack(prevIdx);
        if (!this.isPaused) this.play();
    },

    updateTimer: function() {
        const cur = document.getElementById('radio-time-current');
        const tot = document.getElementById('radio-time-total');
        if (!cur || !tot || isNaN(this.audio.duration)) return;

        cur.textContent = this.formatTime(this.audio.currentTime);
        tot.textContent = this.formatTime(this.audio.duration);
    },

    formatTime: function(secs) {
        const min = Math.floor(secs / 60);
        const sec = Math.floor(secs % 60);
        return min + ":" + (sec < 10 ? "0" : "") + sec;
    }
};

// Arrancar la radio cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    HabboRadio.init();
});
/* ==========================================================================
   js/app.js - FUNCIONES DEL LOBBY (RANKING)
   ========================================================================== */

// Añade aquí los nombres de usuario (Admins/Tests) que NO quieres que aparezcan en el ranking
const EXCLUDED_USERS = ['lupobalt780', 'testaccount']; 

async function loadLeaderboards() {
    const wealthDiv = document.getElementById('leaderboard-wealth-list');
    const winsDiv = document.getElementById('leaderboard-wins-list');
    if (!wealthDiv || !winsDiv) return;

    wealthDiv.innerHTML = '<span style="color: #666; text-align: center;">Cargando...</span>';
    winsDiv.innerHTML = '<span style="color: #666; text-align: center;">Cargando...</span>';

    // 1. TOP 10 RIQUEZA
    const { data: wealthData } = await db.from('users')
        .select('username, credits, look_string')
        .not('username', 'in', `(${EXCLUDED_USERS.join(',')})`)
        .order('credits', { ascending: false })
        .limit(10);

    // 2. TOP 10 VICTORIAS EN ARENA
    const { data: winsData } = await db.from('users')
        .select('username, arena_wins, look_string')
        .not('username', 'in', `(${EXCLUDED_USERS.join(',')})`)
        .order('arena_wins', { ascending: false })
        .limit(10);

    const renderList = (container, data, field) => {
        container.innerHTML = '';
        if (!data || data.length === 0) {
            container.innerHTML = '<span style="color: #666; text-align: center;">Sin datos.</span>';
            return;
        }
        
        data.forEach((user, index) => {
            const row = document.createElement('div');
            row.style = "display: flex; justify-content: space-between; align-items: center; background: #111; padding: 8px 15px; margin-bottom: 8px; border-radius: 5px; border: 1px solid #333;";
            
            const imgUrl = window.getAvatarUrl(user.look_string, '', true);

            const medalColor = index === 0 ? '#f1c40f' : (index === 1 ? '#bdc3c7' : (index === 2 ? '#cd7f32' : '#777'));

            const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
            const scoreLabel = field === 'credits' ? (isEn ? 'Credits' : 'Créditos') : (isEn ? 'Wins' : 'Victorias');
            const colorClass = field === 'credits' ? '#f1c40f' : '#e74c3c';

            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    <span style="color: ${medalColor}; font-weight: bold; font-size: 16px; width: 25px;">#${index + 1}</span>
                    <img src="${imgUrl}" style="height: 30px; margin-top: -5px;">
                    <span style="color: white; font-size: 14px;">${user.username || 'Anónimo'}</span>
                </div>
                <div style="color: ${colorClass}; font-weight: bold; font-size: 14px; white-space: nowrap;">${user[field] || 0} ${scoreLabel}</div>
            `;
            container.appendChild(row);
        });
    };

    renderList(wealthDiv, wealthData, 'credits');
    renderList(winsDiv, winsData, 'arena_wins');
}

// Funciones de Seguridad de Admin al arrancar
async function initAdminAndSecurity() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    // Pedimos el rol y la fecha de baneo
    const { data: userData } = await db.from('users').select('role, banned_until').eq('id', user.id).single();
    
    // 1. Expulsión si está baneado
    if (userData && userData.banned_until) {
        const banDate = new Date(userData.banned_until);
        if (banDate > new Date()) {
            alert("⚠️ ESTÁS BANEADO DEL SERVIDOR HASTA: " + banDate.toLocaleString());
            await db.auth.signOut();
            location.reload();
            return;
        }
    }

    // 2. Si es Admin u Owner, encendemos el botón oculto
    if (userData && (userData.role === 'admin' || userData.role === 'owner')) {
        const btnAdmin = document.getElementById('nav-admin');
        if (btnAdmin) btnAdmin.classList.remove('hidden');
    }

    // 3. Radar Global y Privado para los mensajes de los Admins
    db.channel('global_broadcasts')
        .on('broadcast', { event: 'admin_alert' }, async (payload) => {
            const msg = payload.payload.message;
            const target = payload.payload.target;
            
            if (target) {
                if (userData && userData.username && userData.username.toLowerCase() === target.toLowerCase()) {
                    alert("🔒 ALERTA PRIVADA DE MODERACIÓN 🔒\n\n" + msg);
                }
            } else {
                alert("📢 MENSAJE GLOBAL DEL SERVIDOR 📢\n\n" + msg);
            }
        })
        .subscribe();
}

// 4. Tracker de Usuarios Online (Presence)
window.OnlineUsers = {};
const presenceChannel = db.channel('online_tracker');
presenceChannel.on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    window.OnlineUsers = {};
    let count = 0;
    for (const key in state) {
        window.OnlineUsers[state[key][0].user_id] = true;
        count++;
    }
    const countEl = document.getElementById('online-count');
    if (countEl) countEl.textContent = count;
}).subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
        const { data: { user } } = await db.auth.getUser();
        if (user) await presenceChannel.track({ user_id: user.id });
    }
});

// Disparamos la función al hacer clic en el nuevo botón Top 10
const btnLeaderboard = document.getElementById('nav-leaderboard');
if (btnLeaderboard) {
    btnLeaderboard.addEventListener('click', loadLeaderboards);
}

// Y la disparamos al cargar la web
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initChallengeRadar, 1500); // Arrancamos el radar poco después de cargar
    setTimeout(initAdminAndSecurity, 1500); // Iniciar comprobación de seguridad
});

/* ==========================================================================
   RADAR GLOBAL DE RETOS DIRECTOS
   ========================================================================== */
async function initChallengeRadar() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    // Escuchar si alguien inserta una partida donde nosotros somos el invitado
    db.channel('global_radar')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'arena_matches', 
            filter: `guest_id=eq.${user.id}` 
        }, async (payload) => {
            const match = payload.new;
            
            if (match.status === 'pending_invite') {
                // 1. Buscar el nombre de quién nos reta
                const { data: hostData } = await db.from('users').select('username').eq('id', match.host_id).single();
                const hostName = hostData ? hostData.username : 'Alguien';
                
                // 2. Preparar el mensaje bilingüe
                const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
                const msg = isEn 
                    ? `⚔️ ${hostName} has challenged you for ${match.bet_amount} Credits!\nDo you accept?`
                    : `⚔️ ¡${hostName} te ha retado por ${match.bet_amount} Créditos!\n¿Aceptas el duelo?`;

                // 3. Preguntar al usuario
                if (confirm(msg)) {
                    // SI ACEPTA: Le forzamos a ir a la pestaña Arena y le abrimos la mesa de apuestas para que iguale
                    const navBtn = document.getElementById('nav-find-match');
                    if (navBtn) navBtn.click(); 
                    
                    if (typeof ArenaLobby !== 'undefined') {
                        ArenaLobby.currentMode = 'friend';
                        // Pasamos también los objetos para que no salga "Misterio"
                        ArenaLobby.openBettingSetup(match.id, match.bet_amount, match.bet_items);
                    }
                } else {
                    // SI RECHAZA: Actualizamos el estado a declinado para avisar al host
                    await db.from('arena_matches').update({ status: 'declined' }).eq('id', match.id);
                }
            }
        })
        .subscribe();
}
/* ==========================================================================
   SISTEMA DE NOTIFICACIONES TOAST (No intrusivas)
   ========================================================================== */
window.showToast = function(message, type = 'reward') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    
    // Configuramos colores e icono de moneda de tu API
    const borderColor = type === 'reward' ? '#f1c40f' : '#e74c3c';
    const iconHtml = type === 'reward' 
        ? '<img src="https://habboapi.site/api/image/CF_10_coin_gold" style="height: 22px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));">' 
        : '<span style="font-size: 18px;">⚠️</span>';

    // Diseño oscuro Titán
    toast.style = `background: #1a1a1a; color: white; padding: 12px 20px; border-radius: 8px; border-left: 4px solid ${borderColor}; display: flex; align-items: center; gap: 10px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.8); opacity: 0; transform: translateY(20px); transition: all 0.3s ease; font-size: 13px;`;
    
    toast.innerHTML = `${iconHtml} <span>${message}</span>`;
    container.appendChild(toast);

    // Animación de entrada
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; }, 10);
    
    // Animación de salida y destrucción tras 4 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

/* ==========================================================================
   RADAR DE ACTIVIDAD (ANTI-AFK AVANZADO)
   ========================================================================== */
window.lastActivityTime = Date.now();

let lastClickX = -1;
let lastClickY = -1;
let identicalClicks = 0;

const updateActivity = (e) => {
    // 1. Filtro básico: Si es un evento simulado por código, ignorarlo
    if (!e.isTrusted) return; 

    // 2. Filtro Anti-Macro: Comprobamos coordenadas de los clics
    if (e.type === 'click') {
        if (e.clientX === lastClickX && e.clientY === lastClickY) {
            identicalClicks++;
            // Si hace 5 clics seguidos en el MISMO pixel exacto, es un autoclicker. Dejamos de contarle el tiempo.
            if (identicalClicks > 5) return; 
        } else {
            identicalClicks = 0; // Es humano, reseteamos sospechas
        }
        lastClickX = e.clientX;
        lastClickY = e.clientY;
    }

    // Si pasa los filtros, actualizamos su reloj de vida
    window.lastActivityTime = Date.now();
};

// Quitamos el 'mousemove' porque es facilísimo de falsear y satura el navegador. 
// Un humano real que está jugando va a hacer clics y a usar el teclado.
window.addEventListener('click', updateActivity);
window.addEventListener('keydown', updateActivity);