/* ==========================================================================
   js/rooms.js - GESTIÓN DE SALAS (CON EDICIÓN Y SEGURIDAD DE MUEBLES)
   ========================================================================== */

const RoomManager = {
    init: function() {
        this.setupEvents();
    },

    setupEvents: function() {
        // Botones del formulario
        document.getElementById('btn-open-create-room')?.addEventListener('click', () => this.openForm(null));
        document.getElementById('btn-save-room')?.addEventListener('click', () => this.saveRoom());
        document.getElementById('btn-cancel-room')?.addEventListener('click', () => {
            document.getElementById('create-room-form').classList.add('hidden');
        });

        // Buscador
        document.getElementById('search-room-input')?.addEventListener('input', () => this.loadAllRooms());

        // Botones del menú principal
        document.getElementById('nav-my-rooms')?.addEventListener('click', () => this.loadMyRooms());
        document.getElementById('nav-all-rooms')?.addEventListener('click', () => this.loadAllRooms());
    },

    openForm: function(roomData) {
        const form = document.getElementById('create-room-form');
        const title = document.getElementById('form-room-title');
        const inputId = document.getElementById('edit-room-id');
        const inputOldSize = document.getElementById('edit-room-old-size');
        const warning = document.getElementById('size-warning');

        if (roomData) {
            title.textContent = "Editar Sala";
            inputId.value = roomData.id;
            const sizeVal = `${roomData.width}x${roomData.height}`;
            inputOldSize.value = sizeVal; // Guardamos el tamaño viejo correctamente
            document.getElementById('new-room-name').value = roomData.name;
            document.getElementById('new-room-public').value = roomData.is_public.toString();
            document.getElementById('new-room-size').value = sizeVal;
            warning.classList.remove('hidden');
        } else {
            title.textContent = "Crear Nueva Sala";
            inputId.value = "";
            inputOldSize.value = "";
            document.getElementById('new-room-name').value = "";
            document.getElementById('new-room-public').value = "true";
            document.getElementById('new-room-size').value = "10x10";
            warning.classList.add('hidden');
        }
        form.classList.remove('hidden');
        
        // NUEVO: Forzar el cambio a la pestaña "Mis Salas" para que el usuario VEA el formulario de inmediato
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
        document.getElementById('my-rooms-section').classList.remove('hidden');
    },

    saveRoom: async function() {
        const id = document.getElementById('edit-room-id').value;
        const name = document.getElementById('new-room-name').value.trim();
        const isPublic = document.getElementById('new-room-public').value === "true";
        const size = document.getElementById('new-room-size').value;

        // Comprobación de nombre (Traducida)
        if (!name) {
            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('Ponle un nombre a la sala.') : 'Ponle un nombre a la sala.';
            alert(msg);
            return;
        }

        const [width, height] = size.split('x').map(n => parseInt(n));

        // 1. Obtener ID del usuario autenticado
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        // 2. Consultar el 'username' en la tabla 'users'
        const { data: userData, error: userError } = await db
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            console.error("Error obteniendo username:", userError);
            alert("Error crítico: No se pudo verificar tu nombre de usuario.");
            return;
        }

        // 3. Preparar los datos COMPLETOS (incluyendo owner_name)
        const roomData = {
            name: name,
            is_public: isPublic,
            width: width,
            height: height,
            owner_id: user.id,
            owner_name: userData.username
        };

        let error;
        if (id) {
            // EDITAR SALA EXISTENTE: Añadimos .select() para pillar el bloqueo de Supabase
            const { data, error: err } = await db.from('rooms').update({
                name: name,
                is_public: isPublic,
                width: width,
                height: height
            }).eq('id', id).select();
            
            error = err;
            if (!err && (!data || data.length === 0)) {
                return alert("⚠️ Bloqueo: Supabase denegó la edición. Necesitas crear una política RLS (Update) para la tabla 'rooms'.");
            }
        } else {
            // CREAR SALA NUEVA
            const { error: err } = await db.from('rooms').insert([roomData]);
            error = err;
        }

        if (error) {
            // Error al guardar (Traducido)
            const errMsg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('Error al guardar:') : 'Error al guardar:';
            alert(errMsg + " " + error.message);
        } else {
            document.getElementById('create-room-form').classList.add('hidden');
            // NUEVO: Refrescar AMBAS listas para que no haya desincronizaciones
            this.loadMyRooms(); 
            this.loadAllRooms(); 
        }
    },

    deleteRoom: async function(roomId) {
        const confirmMsg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('¿Seguro que quieres borrar esta sala? Los muebles volverán a tu inventario.') : "¿Seguro que quieres borrar esta sala? Los muebles volverán a tu inventario.";
        
        if (!confirm(confirmMsg)) return;
        
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        // SEGURIDAD: Supabase borra la sala y devuelve los muebles en la misma transacción
        const { data: success, error } = await db.rpc('secure_delete_room', {
            user_id: user.id,
            target_room_id: roomId
        });

        if (error || !success) {
            const errMsg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('Error al borrar la sala.') : "Error al borrar la sala.";
            alert(errMsg);
            return;
        }

        if (window.Inventory) Inventory.loadInventory();
        // NUEVO: Esconder el form si estaba abierto y refrescar AMBAS listas
        document.getElementById('create-room-form').classList.add('hidden');
        this.loadMyRooms();
        this.loadAllRooms();
    },

    loadMyRooms: async function() {
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;
        const { data } = await db.from('rooms').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
        this.renderList(data, 'my-rooms-list');
    },

    loadAllRooms: async function() {
        const queryStr = document.getElementById('search-room-input').value.toLowerCase().trim();
        const filterType = document.getElementById('search-filter').value;
        
        // Comprobar si somos Admin para ver también las privadas
        let isAdmin = false;
        const { data: { user } } = await db.auth.getUser();
        if (user) {
            const { data: uData } = await db.from('users').select('role').eq('id', user.id).single();
            if (uData && (uData.role === 'admin' || uData.role === 'owner')) isAdmin = true;
        }
        
        let query = db.from('rooms').select('*').order('created_at', { ascending: false });
        
        // Si no es admin, filtramos solo las públicas. Si es Admin, carga todo sin filtro.
        if (!isAdmin) {
            query = query.eq('is_public', true);
        }

        if (queryStr) {
            if (filterType === 'name') query = query.ilike('name', `%${queryStr}%`);
            else query = query.ilike('owner_name', `%${queryStr}%`);
        }
        
        const { data } = await query;
        // Pasamos el booleano isAdmin a renderList para que pinte los botones de moderar
        this.renderList(data, 'all-rooms-list', isAdmin); 
    },

    renderList: function(rooms, containerId, isAdmin = false) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        // Detectar el idioma actual desde el LanguageManager
        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
        const t_owner = isEn ? 'Owner' : 'Dueño';
        const t_size = isEn ? 'Size' : 'Tamaño';
        const t_edit = isEn ? '✏️ Edit' : '✏️ Editar';
        const t_delete = isEn ? '🗑️ Delete' : '🗑️ Borrar';
        const t_no_rooms = isEn ? 'No rooms found.' : 'No hay salas.';

        if (!rooms || rooms.length === 0) {
            container.innerHTML = `<p style="color: #666; font-size: 14px; grid-column: 1 / -1;">${t_no_rooms}</p>`;
            return;
        }

        rooms.forEach(room => {
            const div = document.createElement('div');
            div.className = 'shop-item'; 
            div.style.transition = 'transform 0.2s';
            div.onmouseover = () => div.style.transform = 'scale(1.03)';
            div.onmouseout = () => div.style.transform = 'scale(1)';

            const t_public = isEn ? '🌍 Public' : '🌍 Pública';
            const t_private = isEn ? '🔒 Private' : '🔒 Privada';
            const privacyTag = room.is_public 
                ? `<span style="color: #2ecc71; font-size: 11px;">${t_public}</span>` 
                : `<span style="color: #e74c3c; font-size: 11px;">${t_private}</span>`;

            let controls = '';
            // Se activan si son tus salas, o si eres Admin y estás viendo las globales
            if (containerId === 'my-rooms-list' || isAdmin) {
                const roomJSON = JSON.stringify(room).replace(/'/g, "\\'"); 
                const modTag = (isAdmin && containerId !== 'my-rooms-list') ? '<span style="color:#e74c3c; font-size: 10px; display:block; margin-bottom:5px;">🛡️ Modo Mod</span>' : '';
                controls = `
                    <div style="margin-top: 15px; text-align: center;">
                        ${modTag}
                        <div style="display: flex; gap: 5px; justify-content: center;">
                            <button onclick='RoomManager.openForm(${roomJSON})' style="padding: 5px 10px; background: #f39c12; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">${t_edit}</button>
                            <button onclick="RoomManager.deleteRoom('${room.id}')" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">${t_delete}</button>
                        </div>
                    </div>
                `;
            }

            div.innerHTML = `
                <div style="font-size: 45px; margin-bottom: 10px; cursor: pointer;" onclick="RoomManager.enterRoom('${room.id}', '${room.name}', '${room.width}', '${room.height}', '${room.owner_name}')">🏠</div>
                <h3 style="color: white; font-size: 15px; margin-bottom: 5px; word-wrap: break-word;">${room.name}</h3>
                <p style="color: #aaa; font-size: 11px; margin-bottom: 5px;">${t_owner}: <b>${room.owner_name}</b></p>
                <p style="color: #aaa; font-size: 11px; margin-bottom: 10px;">${t_size}: ${room.width}x${room.height}</p>
                ${privacyTag}
                ${controls}
            `;
            container.appendChild(div);
        });
    },

    // Variable para saber de dónde venimos
    lastSection: 'all-rooms-section', 

    enterRoom: function(roomId, roomName, width, height, ownerName) {
        const myRoomsVisible = !document.getElementById('my-rooms-section').classList.contains('hidden');
        this.lastSection = myRoomsVisible ? 'my-rooms-section' : 'all-rooms-section';

        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
        document.getElementById('game-canvas-section').classList.remove('hidden');
        
        // Inyectamos la información en sus respectivas etiquetas
        document.getElementById('ui-room-name').textContent = roomName;
        
        const t_unknown = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en' ? 'Unknown' : 'Desconocido';
        document.getElementById('ui-room-owner-name').textContent = ownerName || t_unknown;

        if (typeof Da21Engine !== 'undefined') {
            // Pasamos también el roomId para que la BD sepa dónde guardarlo
            Da21Engine.startRoom(roomId, width, height, roomName);
        } else {
            console.error("Error crítico: No se ha detectado el motor Da21Engine.");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => RoomManager.init(), 1000);
});
window.addEventListener('languageChanged', () => {
    if (!document.getElementById('my-rooms-section').classList.contains('hidden')) RoomManager.loadMyRooms();
    if (!document.getElementById('all-rooms-section').classList.contains('hidden')) RoomManager.loadAllRooms();
});