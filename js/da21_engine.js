/* ==========================================================================
   js/da21_engine.js - MOTOR CORREGIDO
   ========================================================================== */

const Da21Engine = {
    canvas: null,
    ctx: null,
    room: { width: 10, height: 10, name: "" },
    images: { tile: new Image() },
    tileW: 64, 
    tileH: 32,
    wallHeight: 130,
    camera: { x: 0, y: 0 },
	// Variables para el ratón
    mouseX: 0,
    mouseY: 0,
    hoveredTile: { x: -1, y: -1 },
    
    // Variables de Muebles
    currentRoomId: null,
    roomItems: [],
    itemImages: {},
    draggingItemId: null, 
    selectedItemDbId: null, 
    movingItem: null,       

    // Variables de Cámara (Arrastre/Panning)
    isPanning: false,
    lastPanX: 0,
    lastPanY: 0,
    hasPanned: false, // <-- Nos dirá si el usuario solo hizo clic o si arrastró

    init: function() {
        this.canvas = document.getElementById('da21-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        document.getElementById('btn-leave-room')?.addEventListener('click', () => this.stopAndLeave());
        
        // La ruta es relativa al index.html, así que assets/img/ es correcto
        this.images.tile.src = 'assets/img/tile_floor.png';
        
        this.images.tile.onload = () => {
            if (!document.getElementById('game-canvas-section').classList.contains('hidden')) {
                this.render();
            }
        };
        
        // EVENTOS DEL RATÓN EN EL CANVAS
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e)); // Detener arrastre al salir del cuadro
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

        // CONECTAR BOTONES DEL MENÚ MUEBLE
        document.getElementById('btn-furni-pickup')?.addEventListener('click', () => this.pickupSelectedItem());
        document.getElementById('btn-furni-move')?.addEventListener('click', () => this.moveSelectedItem());
        
        // EVENTOS DE DRAG & DROP (Soltar muebles)
        this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e)); // <-- CAMBIADO para que funcione el fantasma
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
        this.canvas.addEventListener('dragleave', (e) => { // <-- NUEVO para limpiar al salir
            this.hoveredTile = { x: -1, y: -1 };
            this.render();
        });
    },

    startRoom: function(roomId, width, height, name) {
        this.currentRoomId = roomId;
        this.room.width = parseInt(width) || 10;
        this.room.height = parseInt(height) || 10;
        this.room.name = name;
        
        this.loadRoomItems(); // Cargar los muebles al entrar

        // Le damos 100ms exactos al navegador para que el "display: block" 
        // aplique sus medidas antes de medir el lienzo.
        setTimeout(() => {
            const parent = this.canvas.parentElement;
            // Medimos el hueco real. Si falla, forzamos 800x600.
            this.canvas.width = parent.clientWidth || 800; 
            this.canvas.height = parent.clientHeight || 600;

            this.centerCamera();
            
            // FORZAMOS EL RENDER. Sin condiciones. Si la imagen falla, 
            // al menos verás las paredes grises dibujarse.
            this.render();
        }, 100);
    },

    centerCamera: function() {
        // Centro horizontal
        this.camera.x = this.canvas.width / 2;
        
        // Altura total del suelo de la sala
        const roomTotalHeight = (this.room.width + this.room.height) * (this.tileH / 2);
        
        // Calculamos el centro normal para salas pequeñas
        let targetY = (this.canvas.height / 2) - (roomTotalHeight / 2) + 40;

        // Si el tamaño de la sala hace que se salga por abajo en nuestro lienzo de 600px, 
        // la forzamos a pegarse al techo. (140px es el mínimo para no cortar las paredes de 130px).
        if (roomTotalHeight > 400) {
            targetY = 140; 
        }

        this.camera.y = targetY;
    },

    mapToScreen: function(mapX, mapY) {
        const screenX = (mapX - mapY) * (this.tileW / 2) + this.camera.x;
        const screenY = (mapX + mapY) * (this.tileH / 2) + this.camera.y;
        return { x: screenX, y: screenY };
    },

    // DE PANTALLA A MAPA ISOMÉTRICO
    screenToMap: function(screenX, screenY) {
        const adjX = screenX - this.camera.x;
        const adjY = screenY - this.camera.y - (this.tileH / 2);

        const mapX = (adjX / (this.tileW / 2) + adjY / (this.tileH / 2)) / 2;
        const mapY = (adjY / (this.tileH / 2) - adjX / (this.tileW / 2)) / 2;

        return { x: Math.round(mapX), y: Math.round(mapY) };
    },

    handleDragOver: function(e) {
        e.preventDefault(); // Obligatorio para que el navegador permita soltar
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        const tile = this.screenToMap(this.mouseX, this.mouseY);
        
        if (tile.x >= 0 && tile.x < this.room.width && tile.y >= 0 && tile.y < this.room.height) {
            this.hoveredTile = tile;
        } else {
            this.hoveredTile = { x: -1, y: -1 };
        }
        this.render(); // ¡Esto dibuja el fantasma!
    },

    handleMouseDown: function(e) {
        this.isPanning = true;
        this.hasPanned = false; // Reseteamos el medidor de arrastre
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
    },

    handleMouseUp: function(e) {
        this.isPanning = false;
    },

    handleMouseMove: function(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // --- MAGIA DE LA CÁMARA ---
        if (this.isPanning) {
            const dx = e.clientX - this.lastPanX;
            const dy = e.clientY - this.lastPanY;
            
            // Si nos movemos más de 3 píxeles apretando, lo consideramos un "arrastre" y no un clic fallido
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                this.hasPanned = true; 
            }

            this.camera.x += dx;
            this.camera.y += dy;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
        }

        const tile = this.screenToMap(this.mouseX, this.mouseY);
        
        if (tile.x >= 0 && tile.x < this.room.width && tile.y >= 0 && tile.y < this.room.height) {
            this.hoveredTile = tile;
        } else {
            this.hoveredTile = { x: -1, y: -1 };
        }
        
        this.render(); 
    },

    // NUEVO: Radar de Hitbox para los muebles
    getClickedItem: function() {
        // Buscamos al revés para priorizar los muebles que están "arriba" de la pila (dibujados últimos)
        for (let i = this.roomItems.length - 1; i >= 0; i--) {
            const item = this.roomItems[i];
            if (item.hitbox && 
                this.mouseX >= item.hitbox.x && this.mouseX <= item.hitbox.x + item.hitbox.w &&
                this.mouseY >= item.hitbox.y && this.mouseY <= item.hitbox.y + item.hitbox.h) {
                
                if (this.movingItem && this.movingItem.id === item.id) continue; // Ignorar el que estamos moviendo
                return item;
            }
        }
        return null;
    },

    handleClick: async function(e) {
        // Protección: Si el usuario acaba de arrastrar la cámara, ignoramos el clic
        if (this.hasPanned) return;

        // 1. ¿ESTAMOS EN MODO MOVER? (Si es así, el clic sirve para soltar el mueble)
        if (this.movingItem) {
            if (this.hoveredTile.x !== -1) {
                // Comprobamos reglas de apilamiento
                const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[this.movingItem.item_id] : null;
                const isCurrency = ref && ref.type === 'currency';
                const itemsOnTile = this.roomItems.filter(i => i.x === this.hoveredTile.x && i.y === this.hoveredTile.y && i.id !== this.movingItem.id);
                
                if (itemsOnTile.length > 0) {
                    if (!isCurrency) {
                        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
                        alert(isEn ? "Rares cannot be stacked!" : "¡Los raros no se pueden apilar!");
                        return;
                    }
                    const hasRare = itemsOnTile.some(i => {
                        const iRef = typeof Inventory !== 'undefined' ? Inventory.shopReference[i.item_id] : null;
                        return iRef && iRef.type !== 'currency';
                    });
                    if (hasRare) {
                        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
                        alert(isEn ? "Tile occupied by a rare!" : "¡La baldosa ya está ocupada por un raro!");
                        return;
                    }
                }
                // Si todo es válido, guardamos la nueva posición en la base de datos
                await db.from('room_items').update({ x: this.hoveredTile.x, y: this.hoveredTile.y }).eq('id', this.movingItem.id);
                this.movingItem = null;
                this.loadRoomItems();
            }
            return; // Terminamos aquí si estábamos moviendo
        }

        // 2. CLIC NORMAL (Para seleccionar un mueble y abrir el menú usando Hitbox)
        const clickedItem = this.getClickedItem();

        if (clickedItem) {
            this.selectedItemDbId = clickedItem.id;

            const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[clickedItem.item_id] : null;
            if (!ref) return;

            const ui = document.getElementById('ui-furni-info');
            ui.classList.remove('hidden');
            
            // Traducir textos
            const t_name = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic(ref.name) : ref.name;
            const t_desc = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic(ref.description) : ref.description;
            
            document.getElementById('ui-furni-name').textContent = t_name;
            document.getElementById('ui-furni-image').src = ref.image_url;
            document.getElementById('ui-furni-desc').textContent = t_desc;

            // Mostrar controles solo si eres el dueño
            const { data: { user } } = await db.auth.getUser();
            const roomOwnerName = document.getElementById('ui-room-owner-name').textContent;
            document.getElementById('ui-furni-owner-name').textContent = roomOwnerName;

            const { data: roomData } = await db.from('rooms').select('owner_id').eq('id', this.currentRoomId).single();
            const controls = document.getElementById('ui-furni-controls');
            
            if (user && roomData && user.id === roomData.owner_id) {
                controls.style.display = 'flex';
            } else {
                controls.style.display = 'none'; 
            }
        } else {
            document.getElementById('ui-furni-info')?.classList.add('hidden');
            this.selectedItemDbId = null;
        }
    },

    // LA MAGIA: DOBLE CLIC PARA CANJEAR DINERO DIRECTAMENTE DESDE EL SUELO
    handleDoubleClick: async function(e) {
        // Añadimos la protección del hasPanned aquí también
        if (this.hasPanned || this.movingItem) return;
        
        // Usamos el radar de Hitbox
        const clickedItem = this.getClickedItem();
        if (!clickedItem) return;

        const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[clickedItem.item_id] : null;
        
        // Si no es dinero, lo ignoramos
        if (!ref || ref.type !== 'currency') return; 

        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        // Validar que sea el dueño
        const { data: roomData } = await db.from('rooms').select('owner_id').eq('id', this.currentRoomId).single();
        if (!roomData || user.id !== roomData.owner_id) {
            const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
            alert(isEn ? "You can only redeem items in your own room." : "Solo puedes canjear objetos en tu propia sala.");
            return;
        }

        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
        const t_name = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic(ref.name) : ref.name;
        const confirmMsg = isEn 
            ? `Do you want to pick up and exchange ${t_name} for ${ref.value} Credits?` 
            : `¿Deseas recoger y canjear ${t_name} por ${ref.value} Créditos?`;

        if (!confirm(confirmMsg)) return;

        // SEGURIDAD: Que Supabase haga el borrado y la suma a la vez
        const { data: success, error } = await db.rpc('secure_redeem_coin', {
            user_id: user.id,
            item_db_id: clickedItem.id,
            coin_value: ref.value
        });

        if (error || !success) {
            const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
            alert(isEn ? "Error redeeming coin." : "Error al canjear la moneda.");
            return;
        }

        // Leer saldo real del servidor para actualizar la UI
        const { data: userData } = await db.from('users').select('credits').eq('id', user.id).single();
        if (userData) {
            document.getElementById('user-credits').textContent = userData.credits;
        }

        // NUEVO: Sonido de pasta al recoger y canjear moneda directamente desde la sala
        new Audio('assets/audio/coin_kaching.mp3').play().catch(e => console.log("Audio prevenido por el navegador"));

        document.getElementById('ui-furni-info').classList.add('hidden');
        this.selectedItemDbId = null;
        this.loadRoomItems(); 
        
        if (typeof loadLeaderboard !== 'undefined') loadLeaderboard(); // Actualizar Top 5
    },

    // CARGAR MUEBLES DE LA BD
    loadRoomItems: async function() {
        if (!this.currentRoomId) return;
        const { data, error } = await db.from('room_items').select('*').eq('room_id', this.currentRoomId);
        if (!error && data) {
            this.roomItems = data;
            this.render(); // Redibujar cuando lleguen los datos
        }
    },

    // SOLTAR MUEBLE EN LA SALA
    handleDrop: async function(e) {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain');
        if (!itemId || !this.currentRoomId) return;

        const rect = this.canvas.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const dropY = e.clientY - rect.top;
        const tile = this.screenToMap(dropX, dropY);

        // Si lo suelta fuera de las baldosas de la sala, ignorar
        if (tile.x < 0 || tile.x >= this.room.width || tile.y < 0 || tile.y >= this.room.height) return;

        // --- LÓGICA DE APILAR ---
        const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[itemId] : null;
        if (!ref) return;
        const isCurrency = ref.type === 'currency';

        // Miramos qué hay en esa baldosa
        const itemsOnTile = this.roomItems.filter(i => i.x === tile.x && i.y === tile.y);
        if (itemsOnTile.length > 0) {
            if (!isCurrency) {
                const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
                alert(isEn ? "Rares cannot be stacked!" : "¡Los raros no se pueden apilar!");
                return;
            }
            const hasRare = itemsOnTile.some(i => {
                const iRef = typeof Inventory !== 'undefined' ? Inventory.shopReference[i.item_id] : null;
                return iRef && iRef.type !== 'currency';
            });
            if (hasRare) {
                const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
                alert(isEn ? "Tile occupied by a rare!" : "¡La baldosa ya está ocupada por un raro!");
                return;
            }
        }
        // -------------------------

        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        // SEGURIDAD: Llamamos al Guardia de Sala de Supabase
        const { data: success, error } = await db.rpc('secure_place_item', {
            user_id: user.id,
            target_room_id: this.currentRoomId,
            item_id: itemId,
            pos_x: tile.x,
            pos_y: tile.y
        });

        if (error || !success) {
            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('Error al colocar el objeto.') : "Error al colocar el objeto.";
            alert(msg);
            return;
        }

        if (window.Inventory) Inventory.loadInventory();
        this.loadRoomItems();
    },

    // -----------------------------------------------------
    // ACCIONES DE LOS BOTONES DEL MENÚ MUEBLE
    // -----------------------------------------------------
    pickupSelectedItem: async function() {
        if (!this.selectedItemDbId) return;

        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        // SEGURIDAD: Llamamos al Guardia de Sala de Supabase
        const { data: success, error } = await db.rpc('secure_pickup_item', {
            user_id: user.id,
            item_db_id: this.selectedItemDbId
        });

        if (error || !success) {
            const msg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('Error al recoger el objeto.') : "Error al recoger el objeto.";
            alert(msg);
            return;
        }

        document.getElementById('ui-furni-info').classList.add('hidden');
        this.selectedItemDbId = null;
        if (window.Inventory) Inventory.loadInventory();
        this.loadRoomItems();
    },

    moveSelectedItem: function() {
        if (!this.selectedItemDbId) return;
        const item = this.roomItems.find(i => i.id === this.selectedItemDbId);
        if (!item) return;

        // Activamos el modo fantasma y ocultamos el menú
        this.movingItem = item;
        this.selectedItemDbId = null;
        document.getElementById('ui-furni-info').classList.add('hidden');
        this.render(); // El motor redibujará el mueble pegado al ratón automáticamente
    },

    render: function() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawWalls();
        this.drawFloor();
        this.drawItems(); // <-- Dibuja los muebles al final
    },

    // DIBUJAR MUEBLES (CON Z-INDEX ISOMÉTRICO Y APILAMIENTO)
    drawItems: function() {
        this.roomItems.forEach((item, idx) => item._idx = idx);
        this.roomItems.sort((a, b) => {
            const depthA = a.x + a.y;
            const depthB = b.x + b.y;
            if (depthA !== depthB) return depthA - depthB;
            return a._idx - b._idx;
        });

        const tileHeights = {}; 

        this.roomItems.forEach(item => {
            // MAGIA: Si estamos moviendo este mueble, lo ocultamos del suelo
            if (this.movingItem && item.id === this.movingItem.id) return;

            const pos = this.mapToScreen(item.x, item.y);
            const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[item.item_id] : null;
            if (!ref) return;

            // Extraemos los offsets de la base de datos (Si no hay, usamos 0 y 8 por defecto)
            const offsetX = ref.offset_x !== undefined && ref.offset_x !== null ? ref.offset_x : 0;
            const offsetY = ref.offset_y !== undefined && ref.offset_y !== null ? ref.offset_y : 8;

            if (!this.itemImages[item.item_id]) {
                const img = new Image();
                img.src = ref.image_url;
                img.onload = () => this.render(); 
                this.itemImages[item.item_id] = img;
            }

            const img = this.itemImages[item.item_id];
            if (img.complete && img.width > 0) {
                const key = `${item.x},${item.y}`;
                const currentZ = tileHeights[key] || 0; 

                // Usamos los offsets individuales de cada mueble aquí
                const drawX = pos.x - (img.width / 2) + offsetX;
                const drawY = pos.y - img.height + (this.tileH / 2) - currentZ + offsetY; 
                this.ctx.drawImage(img, drawX, drawY);

                // ¡LA HITBOX! Guardamos la posición exacta de la imagen para el clic
                item.hitbox = { x: drawX, y: drawY, w: img.width, h: img.height };

                // Leemos la altura de apilamiento de la BD (si no tiene, por defecto 4)
                const stackHeight = ref.stack_height !== undefined && ref.stack_height !== null ? ref.stack_height : 4;
                tileHeights[key] = currentZ + stackHeight; 
            }
        });

        // --- DIBUJAR EL FANTASMA (Arrastrando O Moviendo) ---
        const ghostItemId = this.draggingItemId || (this.movingItem ? this.movingItem.item_id : null);

        if (ghostItemId && this.hoveredTile.x !== -1) {
            const ref = typeof Inventory !== 'undefined' ? Inventory.shopReference[ghostItemId] : null;
            if (ref) {
                // Extraemos los offsets de la base de datos también para el fantasma
                const offsetX = ref.offset_x !== undefined && ref.offset_x !== null ? ref.offset_x : 0;
                const offsetY = ref.offset_y !== undefined && ref.offset_y !== null ? ref.offset_y : 8;

                if (!this.itemImages[ghostItemId]) {
                    const img = new Image();
                    img.src = ref.image_url;
                    img.onload = () => this.render();
                    this.itemImages[ghostItemId] = img;
                }
                const ghostImg = this.itemImages[ghostItemId];
                
                if (ghostImg.complete && ghostImg.width > 0) {
                    const pos = this.mapToScreen(this.hoveredTile.x, this.hoveredTile.y);
                    
                    const key = `${this.hoveredTile.x},${this.hoveredTile.y}`;
                    const currentZ = tileHeights[key] || 0;

                    // Usamos los offsets individuales aquí también
                    const drawX = pos.x - (ghostImg.width / 2) + offsetX;
                    const drawY = pos.y - ghostImg.height + (this.tileH / 2) - currentZ + offsetY;

                    this.ctx.globalAlpha = 0.6; 
                    this.ctx.drawImage(ghostImg, drawX, drawY);
                    this.ctx.globalAlpha = 1.0; 
                }
            }
        }
    },

    drawWalls: function() {
        const ctx = this.ctx;
        const pLeft = this.mapToScreen(0, this.room.height);
        const pCenter = this.mapToScreen(0, 0);
        const pRight = this.mapToScreen(this.room.width, 0);

        // Pared Izquierda
        ctx.fillStyle = '#6b7a8f';
        ctx.beginPath();
        ctx.moveTo(pLeft.x, pLeft.y);
        ctx.lineTo(pCenter.x, pCenter.y);
        ctx.lineTo(pCenter.x, pCenter.y - this.wallHeight);
        ctx.lineTo(pLeft.x, pLeft.y - this.wallHeight);
        ctx.fill();

        // Puerta (Hueco negro)
        ctx.fillStyle = '#000000';
        const d1 = this.mapToScreen(0, Math.min(this.room.height, 4));
        const d2 = this.mapToScreen(0, Math.min(this.room.height, 3));
        ctx.beginPath();
        ctx.moveTo(d1.x, d1.y);
        ctx.lineTo(d2.x, d2.y);
        ctx.lineTo(d2.x, d2.y - 80);
        ctx.lineTo(d1.x, d1.y - 80);
        ctx.fill();

        // Pared Derecha
        ctx.fillStyle = '#8293a8';
        ctx.beginPath();
        ctx.moveTo(pCenter.x, pCenter.y);
        ctx.lineTo(pRight.x, pRight.y);
        ctx.lineTo(pRight.x, pRight.y - this.wallHeight);
        ctx.lineTo(pCenter.x, pCenter.y - this.wallHeight);
        ctx.fill();
    },

    drawFloor: function() {
        for (let x = 0; x < this.room.width; x++) {
            for (let y = 0; y < this.room.height; y++) {
                const pos = this.mapToScreen(x, y);
                
                this.ctx.drawImage(this.images.tile, pos.x - (this.tileW / 2), pos.y);

                // Si el ratón está aquí, dibujamos amarillo Habbo
                if (this.hoveredTile.x === x && this.hoveredTile.y === y) {
                    this.ctx.fillStyle = 'rgba(241, 196, 15, 0.4)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(pos.x, pos.y);
                    this.ctx.lineTo(pos.x + (this.tileW / 2), pos.y + (this.tileH / 2));
                    this.ctx.lineTo(pos.x, pos.y + this.tileH);
                    this.ctx.lineTo(pos.x - (this.tileW / 2), pos.y + (this.tileH / 2));
                    this.ctx.fill();
                }
            }
        }
    },

    stopAndLeave: function() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // LA CLAVE: No usar 'window.RoomManager', usamos typeof
        let target = 'all-rooms-section';
        if (typeof RoomManager !== 'undefined' && RoomManager.lastSection) {
            target = RoomManager.lastSection;
        }
        
        // Simular clic en el botón correspondiente para volver al lugar exacto
        if (target === 'my-rooms-section') {
            document.getElementById('nav-my-rooms').click();
        } else {
            document.getElementById('nav-all-rooms').click();
        }
    },
};

document.addEventListener('DOMContentLoaded', () => Da21Engine.init());