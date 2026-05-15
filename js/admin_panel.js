/* ==========================================================================
   js/admin_panel.js - PANEL DE CONTROL TITÁN
   ========================================================================== */

const AdminPanel = {
    selectedUserId: null,
    selectedUserName: null,

    init: function() {
        document.getElementById('admin-search-input')?.addEventListener('input', (e) => this.searchUser(e.target.value));
        document.getElementById('btn-admin-give-credits')?.addEventListener('click', () => this.giveCredits());
        document.getElementById('btn-admin-remove-credits')?.addEventListener('click', () => this.removeCredits());
        document.getElementById('btn-admin-open-give-item')?.addEventListener('click', () => this.openGiveItemMenu());
        document.getElementById('btn-admin-confirm-give-item')?.addEventListener('click', () => this.confirmGiveItem());
        document.getElementById('btn-admin-ban')?.addEventListener('click', () => this.banUser());
        document.getElementById('btn-admin-unban')?.addEventListener('click', () => this.unbanUser());
        document.getElementById('btn-admin-toggle-role')?.addEventListener('click', () => this.toggleRole());
        document.getElementById('btn-admin-broadcast')?.addEventListener('click', () => this.sendBroadcast());
        document.getElementById('btn-refresh-logs')?.addEventListener('click', () => this.loadLogs());
        
        // Los eventos de las pestañas ahora se disparan directamente a prueba de fallos desde el onclick del HTML
        
        document.getElementById('btn-admin-save-item')?.addEventListener('click', () => this.saveItem());
        document.getElementById('btn-admin-clear-item')?.addEventListener('click', () => this.clearItemForm());
        document.getElementById('btn-admin-delete-item')?.addEventListener('click', () => this.deleteItem());
    },

    searchUser: async function(query) {
        const resultsDiv = document.getElementById('admin-search-results');
        const actionsDiv = document.getElementById('admin-user-actions');
        
        if (query.trim().length < 2) {
            resultsDiv.classList.add('hidden');
            return;
        }

        const { data, error } = await db.from('users').select('id, username, role').ilike('username', `%${query}%`).limit(5);
        
        if (error || !data || data.length === 0) {
            resultsDiv.classList.add('hidden');
            return;
        }

        resultsDiv.innerHTML = '';
        data.forEach(user => {
            const div = document.createElement('div');
            const roleTag = user.role === 'owner' ? '👑 ' : (user.role === 'admin' ? '🛡️ ' : '');
            const onlineTag = (window.OnlineUsers && window.OnlineUsers[user.id]) ? ' 🟢' : ' 🔴';
            div.textContent = `${roleTag}${user.username}${onlineTag}`;
            div.onclick = () => {
                this.selectedUserId = user.id;
                this.selectedUserName = user.username;
                document.getElementById('admin-selected-user').textContent = user.username;
                document.getElementById('admin-search-input').value = '';
                resultsDiv.classList.add('hidden');
                
                // NUEVO: Cargar ficha al hacer clic
                this.loadUserCard(user.id);
            };
            resultsDiv.appendChild(div);
        });
        resultsDiv.classList.remove('hidden');
    },

    loadUserCard: async function(userId) {
        const actionsDiv = document.getElementById('admin-user-actions');
        const invList = document.getElementById('admin-user-inventory-list');
        
        // 1. Pedir datos del usuario
        const { data: userData } = await db.from('users').select('credits, banned_until, inventory').eq('id', userId).single();
        if (!userData) return;

        // 2. Rellenar créditos y estado
        document.getElementById('admin-info-credits').textContent = userData.credits;
        
        const isBanned = userData.banned_until && new Date(userData.banned_until) > new Date();
        const statusSpan = document.getElementById('admin-info-status');
        const btnBan = document.getElementById('btn-admin-ban');
        const btnUnban = document.getElementById('btn-admin-unban');

        if (isBanned) {
            statusSpan.textContent = this.getLang('admin-status-banned') + ' ' + new Date(userData.banned_until).toLocaleString();
            statusSpan.style.color = '#e74c3c';
            btnBan.classList.add('hidden');
            btnUnban.classList.remove('hidden');
        } else {
            statusSpan.textContent = this.getLang('admin-status-active');
            statusSpan.style.color = '#2ecc71';
            btnBan.classList.remove('hidden');
            btnUnban.classList.add('hidden');
        }

        // 3. Rellenar inventario (Necesitamos traer la tienda para los nombres)
        const { data: shopData } = await db.from('shop_items').select('id, name, image_url');
        const shopRef = {};
        if (shopData) shopData.forEach(i => shopRef[i.id] = i);

        invList.innerHTML = '';
        if (!userData.inventory || Object.keys(userData.inventory).length === 0) {
            invList.innerHTML = `<span style="color: #666; font-size: 12px;">${this.getLang('admin-inv-empty')}</span>`;
        } else {
            for (const [itemId, qty] of Object.entries(userData.inventory)) {
                if (qty <= 0) continue;
                const itemDef = shopRef[itemId];
                const itemName = itemDef ? this.getLang(itemDef.name) : 'ID: ' + itemId.substring(0,8);
                const itemImg = itemDef ? `<img src="${itemDef.image_url}" style="height: 20px;">` : '📦';

                const div = document.createElement('div');
                div.style = "display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; padding-bottom: 5px;";
                div.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${itemImg} <span style="color: white; font-size: 13px;">${itemName} <b style="color: #f39c12;">(x${qty})</b></span>
                    </div>
                    <button style="background: #c0392b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">${this.getLang('admin-btn-remove-item')}</button>
                `;
                div.querySelector('button').onclick = () => this.removeItem(itemId, itemName, qty);
                invList.appendChild(div);
            }
        }

        actionsDiv.classList.remove('hidden');
    },

    checkSelfUpdate: async function() {
        const { data: { user } } = await db.auth.getUser();
        if (user && user.id === this.selectedUserId) {
            const { data: userData } = await db.from('users').select('credits').eq('id', user.id).single();
            if (userData) document.getElementById('user-credits').textContent = userData.credits;
            if (window.Inventory) Inventory.loadInventory();
        }
    },

    getLang: function(key) {
        return typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic(key) : key;
    },

    giveCredits: async function() {
        if (!this.selectedUserId) return;
        const amountStr = prompt(`¿Cuántos créditos quieres dar a ${this.selectedUserName}?`, "100");
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) return alert(this.getLang('Número inválido'));

        const { data: { user } } = await db.auth.getUser();
        const { data: success } = await db.rpc('admin_give_credits', { admin_id: user.id, target_id: this.selectedUserId, amount: amount });
        
        if (success) {
            alert(`Se enviaron ${amount} créditos a ${this.selectedUserName}`);
            this.loadUserCard(this.selectedUserId);
            this.checkSelfUpdate();
        } else alert("Acceso Denegado o Error.");
    },

    removeCredits: async function() {
        if (!this.selectedUserId) return;
        const amountStr = prompt(`¿Cuántos créditos quieres QUITAR a ${this.selectedUserName}?`, "100");
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) return alert(this.getLang('Número inválido'));

        const { data: { user } } = await db.auth.getUser();
        const { data: success } = await db.rpc('admin_remove_credits', { admin_id: user.id, target_id: this.selectedUserId, amount: amount });
        
        if (success) {
            alert(`Se quitaron ${amount} créditos a ${this.selectedUserName}`);
            this.loadUserCard(this.selectedUserId);
            this.checkSelfUpdate();
        } else alert("Acceso Denegado o Error.");
    },

    openGiveItemMenu: async function() {
        const menu = document.getElementById('admin-give-item-menu');
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
            return;
        }

        const select = document.getElementById('admin-give-item-select');
        select.innerHTML = `<option value="">${this.getLang('admin-give-item-select')}</option>`;

        const { data, error } = await db.from('shop_items').select('id, name').order('name');
        if (!error && data) {
            data.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.id;
                opt.textContent = this.getLang(item.name);
                select.appendChild(opt);
            });
        }
        menu.classList.remove('hidden');
    },

    confirmGiveItem: async function() {
        if (!this.selectedUserId) return;
        
        const itemId = document.getElementById('admin-give-item-select').value;
        const amount = parseInt(document.getElementById('admin-give-item-amount').value);
        
        if (!itemId) return alert("Selecciona un objeto.");
        if (isNaN(amount) || amount <= 0) return alert("Cantidad inválida.");

        const { data: { user } } = await db.auth.getUser();
        const { data: success } = await db.rpc('admin_give_item', { admin_id: user.id, target_id: this.selectedUserId, item_id: itemId, amount: amount });
        
        if (success) {
            alert(`Se enviaron ${amount}x del item a ${this.selectedUserName}`);
            document.getElementById('admin-give-item-menu').classList.add('hidden');
            this.loadUserCard(this.selectedUserId);
            this.checkSelfUpdate();
        } else {
            alert("Acceso Denegado o Error.");
        }
    },

    removeItem: async function(itemId, itemName, currentQty) {
        if (!this.selectedUserId) return;
        const amountStr = prompt(`El usuario tiene ${currentQty}x ${itemName}.\n¿Cuántos quieres QUITARLE?`, "1");
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) return alert(this.getLang('Número inválido'));

        const { data: { user } } = await db.auth.getUser();
        const { data: success } = await db.rpc('admin_remove_item', { admin_id: user.id, target_id: this.selectedUserId, item_id: itemId, amount: amount });
        
        if (success) {
            alert(`Se quitaron ${amount}x ${itemName} a ${this.selectedUserName}`);
            this.loadUserCard(this.selectedUserId);
            this.checkSelfUpdate();
        } else {
            alert("Acceso Denegado o Error.");
        }
    },

    banUser: async function() {
        if (!this.selectedUserId) return;
        
        const banInput = prompt(
            `Estás a punto de BANEAR a ${this.selectedUserName}.\n` +
            `Escribe la fecha de desbaneo (Formato: YYYY-MM-DD HH:MM)\n\n` +
            `O déjalo en blanco para Baneo Permanente (Año 9999).`,
            ""
        );

        if (banInput === null) return; // Si el admin le da a cancelar

        // Por defecto, le clavamos el 31 de diciembre del 9999 (Permanente)
        let finalDateStr = "9999-12-31T23:59:59.000Z"; 
        
        if (banInput.trim() !== "") {
            // Si el admin ha escrito una fecha, comprobamos que sea válida
            const checkDate = new Date(banInput);
            if (isNaN(checkDate.getTime())) {
                return alert("Formato de fecha no válido. Recuerda: YYYY-MM-DD HH:MM (Ej: 2026-05-10 18:00)");
            }
            finalDateStr = checkDate.toISOString();
        }

        const formattedDate = new Date(finalDateStr).toLocaleString();
        if (!confirm(`¿Confirmas el castigo a ${this.selectedUserName} hasta:\n${formattedDate}?`)) return;

        const { data: { user } } = await db.auth.getUser();
        
        // Saltamos el banquero SQL de 24h y escribimos la fecha custom directamente en la tabla
        // Le metemos la condición de que el objetivo no tenga rol 'owner' para blindarte
        const { error } = await db.from('users')
            .update({ banned_until: finalDateStr })
            .eq('id', this.selectedUserId)
            .neq('role', 'owner');
        
        if (!error) {
            // Guardamos el log a mano ya que no usamos la función SQL cerrada
            await db.from('admin_logs').insert([{
                admin_id: user.id,
                action: 'BAN',
                target_username: this.selectedUserName,
                details: 'Baneado hasta: ' + formattedDate
            }]);

            alert(`¡${this.selectedUserName} ha sido baneado!`);
            this.loadUserCard(this.selectedUserId); // Recargamos la ficha para que se ponga en rojo
        } else {
            alert("No puedes banear a un Owner, o ha fallado la conexión con el servidor.");
        }
    },

    unbanUser: async function() {
        if (!this.selectedUserId) return;
        if (!confirm(`¿Desbanear a ${this.selectedUserName}?`)) return;

        const { data: { user } } = await db.auth.getUser();
        const { data: success } = await db.rpc('admin_unban_user', { admin_id: user.id, target_id: this.selectedUserId });
        
        if (success) {
            alert(`¡${this.selectedUserName} ha sido desbaneado!`);
            this.loadUserCard(this.selectedUserId);
        } else alert("Error o falta de permisos.");
    },

    toggleRole: async function() {
        if (!this.selectedUserId) return;
        if (!confirm(`¿Cambiar el rol de Admin de ${this.selectedUserName}? (Solo Owner)`)) return;

        const { data: { user } } = await db.auth.getUser();
        const { data: success } = await db.rpc('admin_toggle_role', { owner_uuid: user.id, target_id: this.selectedUserId });
        
        if (success) {
            alert(`Se han modificado los permisos de ${this.selectedUserName}`);
            document.getElementById('admin-selected-user').textContent = this.selectedUserName + " (Rol Actualizado)";
        } else alert("Solo el Owner puede dar o quitar permisos de Admin, o has intentado tocar a otro Owner.");
    },

    sendBroadcast: async function() {
        const msgInput = document.getElementById('admin-broadcast-msg');
        const targetInput = document.getElementById('admin-broadcast-target');
        
        const msg = msgInput.value.trim();
        const target = targetInput ? targetInput.value.trim() : '';
        if (!msg) return;

        db.channel('global_broadcasts').send({
            type: 'broadcast',
            event: 'admin_alert',
            payload: { message: msg, target: target }
        });

        // Autodisparo local para el Admin
        if (target) {
            alert(`🔒 MENSAJE PRIVADO ENVIADO A [${target}] 🔒\n\n${msg}`);
        } else {
            alert("📢 MENSAJE GLOBAL DEL SERVIDOR 📢\n\n" + msg);
        }
        msgInput.value = '';
    },

    loadArenaManager: async function() {
        const listDiv = document.getElementById('admin-arena-list');
        listDiv.innerHTML = '<span style="color: #aaa;">Buscando partidas...</span>';

        // Buscamos partidas fantasmas (en progreso o esperando)
        const { data, error } = await db.from('arena_matches')
            .select('*')
            .in('status', ['pending_invite', 'in_progress', 'waiting', 'playing'])
            .order('created_at', { ascending: false });

        if (error || !data) {
            listDiv.innerHTML = '<span style="color: #e74c3c;">Error cargando partidas.</span>';
            return;
        }

        if (data.length === 0) {
            listDiv.innerHTML = '<span style="color: #2ecc71;">No hay partidas bugeadas o activas ahora mismo. Todo limpio.</span>';
            return;
        }

        listDiv.innerHTML = '';
        data.forEach(match => {
            const date = new Date(match.created_at).toLocaleString();
            const div = document.createElement('div');
            div.style = "background: #222; padding: 10px; border-radius: 4px; border: 1px solid #333; display: flex; justify-content: space-between; align-items: center;";
            div.innerHTML = `
                <div>
                    <div style="color: #f1c40f; font-weight: bold; font-size: 14px;">Mesa de Apuestas #${match.id.substring(0,8)}</div>
                    <div style="color: #aaa; font-size: 11px;">Estado: <b style="color: #3498db;">${match.status}</b> | Bote Base: <b style="color: white;">${match.bet_amount}c</b></div>
                    <div style="color: #666; font-size: 10px;">Creada: ${date}</div>
                </div>
                <button class="btn-cancel-arena" data-id="${match.id}" style="background: #c0392b; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">🗑️ Borrar Partida</button>
            `;
            
            div.querySelector('.btn-cancel-arena').onclick = async (e) => {
                if (!confirm("¿Seguro que quieres borrar esta partida de la base de datos para desatascarla?")) return;
                
                // Pedimos nuestra ID para demostrar que somos admins
                const { data: { user } } = await db.auth.getUser(); 
                const matchId = e.target.dataset.id;

                // Lanzamos el misil (RPC)
                const { data: success, error: delErr } = await db.rpc('admin_delete_match', { 
                    admin_uuid: user.id, 
                    target_match_id: matchId 
                });

                if (delErr || !success) {
                    alert("Error: Supabase te ha denegado el permiso o la partida ya no existe.");
                } else {
                    alert("¡Partida desintegrada con éxito (de verdad)!");
                    this.loadArenaManager();
                }
            };
            listDiv.appendChild(div);
        });
    },

    loadLogs: async function() {
        const container = document.getElementById('logs-container');
        container.innerHTML = 'Cargando logs...';

        const { data, error } = await db.from('admin_logs')
            .select('*, admin:admin_id(username)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error || !data) {
            container.innerHTML = 'Error cargando auditoría.';
            return;
        }

        container.innerHTML = '';
        data.forEach(log => {
            const date = new Date(log.created_at).toLocaleString();
            const adminName = log.admin ? log.admin.username : 'Desconocido';
            container.innerHTML += `
                <div style="margin-bottom: 8px; border-bottom: 1px dashed #333; padding-bottom: 5px;">
                    <span style="color: #f39c12;">[${date}]</span> 
                    <b style="color: #3498db;">${adminName}</b> ejecutó 
                    <b style="color: #e74c3c;">${log.action}</b> sobre 
                    <b style="color: #2ecc71;">${log.target_username || 'N/A'}</b> 
                    -> <span style="color: white;">${log.details || ''}</span>
                </div>
            `;
        });
    }, // <-- Añadimos esta coma vital para separar funciones

    loadShopManager: async function(searchQuery = '') {
        const listDiv = document.getElementById('admin-shop-list');
        listDiv.innerHTML = '<span style="color: #aaa;">Cargando inventario...</span>';

        // Limitamos a 50 resultados para que NUNCA colapse. Si quieres uno antiguo, lo buscas.
        let query = db.from('shop_items').select('*').order('name');
        
        if (searchQuery.trim() !== '') {
            query = query.ilike('name', `%${searchQuery}%`);
        }
        
        const { data, error } = await query.limit(50);

        if (error || !data) {
            listDiv.innerHTML = '<span style="color: #e74c3c;">Error cargando items.</span>';
            return;
        }

        listDiv.innerHTML = '';
        if (data.length === 0) {
            listDiv.innerHTML = '<span style="color: #aaa;">No hay objetos.</span>';
            return;
        }

        const t_edit = this.getLang('admin-item-edit');
        const frag = document.createDocumentFragment();

        data.forEach(item => {
            const div = document.createElement('div');
            div.style = "display: flex; align-items: center; justify-content: space-between; background: #222; padding: 10px; border-radius: 4px; border: 1px solid #333;";
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.image_url}" loading="lazy" style="height: 30px; width: 30px; object-fit: contain;">
                    <span style="color: white; font-size: 13px;">${this.getLang(item.name)}</span>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn-edit" style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">${t_edit}</button>
                    <button class="btn-del" style="background: #c0392b; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">🗑️</button>
                </div>
            `;
            // Asignar los eventos
            div.querySelector('.btn-edit').onclick = () => this.editItem(item);
            div.querySelector('.btn-del').onclick = () => {
                // Truco: Metemos el ID en el form y llamamos a borrar directo
                document.getElementById('admin-item-id').value = item.id;
                this.deleteItem();
            };
            frag.appendChild(div);
        });
        
        listDiv.appendChild(frag);

        // Enganchar el buscador si no lo estaba
        const searchInput = document.getElementById('admin-search-item');
        if (searchInput && !searchInput.dataset.listening) {
            searchInput.dataset.listening = "true";
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimer);
                this.searchTimer = setTimeout(() => this.loadShopManager(e.target.value), 300);
            });
        }
    },

    editItem: function(item) {
        document.getElementById('admin-item-id').value = item.id;
        document.getElementById('admin-item-name').value = item.name;
        document.getElementById('admin-item-desc').value = item.description || '';
        document.getElementById('admin-item-img').value = item.image_url || '';
        document.getElementById('admin-item-price').value = item.price || 0;
        document.getElementById('admin-item-retired-price').value = item.retired_price || 0;
        document.getElementById('admin-item-value').value = item.value || 0;
        document.getElementById('admin-item-type').value = item.type || 'rare';
        document.getElementById('admin-item-pct').value = item.retired_pct || 10;
        document.getElementById('admin-item-offsetx').value = item.offset_x || 0;
        document.getElementById('admin-item-offsety').value = item.offset_y || 8;
        document.getElementById('admin-item-stack').value = item.stack_height || 4;
        document.getElementById('admin-item-stock').value = item.stock_limit || '';
        document.getElementById('admin-item-sort').value = item.sort_order || 0;
        
        if (item.expires_at) {
            const d = new Date(item.expires_at);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            document.getElementById('admin-item-expires').value = d.toISOString().slice(0,16);
        } else {
            document.getElementById('admin-item-expires').value = '';
        }

        document.getElementById('btn-admin-delete-item').classList.remove('hidden');
    },

    clearItemForm: function() {
        document.getElementById('admin-item-id').value = '';
        document.getElementById('admin-item-name').value = '';
        document.getElementById('admin-item-desc').value = '';
        document.getElementById('admin-item-img').value = '';
        document.getElementById('admin-item-price').value = '';
        document.getElementById('admin-item-retired-price').value = '0';
        document.getElementById('admin-item-value').value = '';
        document.getElementById('admin-item-type').value = 'rare';
        document.getElementById('admin-item-pct').value = '10';
        document.getElementById('admin-item-offsetx').value = '0';
        document.getElementById('admin-item-offsety').value = '8';
        document.getElementById('admin-item-stack').value = '4';
        document.getElementById('admin-item-stock').value = '';
        document.getElementById('admin-item-sort').value = '0';
        document.getElementById('admin-item-expires').value = '';
        
        document.getElementById('btn-admin-delete-item').classList.add('hidden');
    },

    saveItem: async function() {
        const itemData = {
            id: document.getElementById('admin-item-id').value,
            name: document.getElementById('admin-item-name').value,
            description: document.getElementById('admin-item-desc').value,
            image_url: document.getElementById('admin-item-img').value,
            price: document.getElementById('admin-item-price').value,
            retired_price: document.getElementById('admin-item-retired-price').value,
            value: document.getElementById('admin-item-value').value,
            type: document.getElementById('admin-item-type').value,
            retired_pct: document.getElementById('admin-item-pct').value,
            offset_x: document.getElementById('admin-item-offsetx').value,
            offset_y: document.getElementById('admin-item-offsety').value,
            stack_height: document.getElementById('admin-item-stack').value,
            stock_limit: document.getElementById('admin-item-stock').value,
            current_stock: document.getElementById('admin-item-stock').value, 
            sort_order: document.getElementById('admin-item-sort').value,
            expires_at: document.getElementById('admin-item-expires').value || null
        };

        if (!itemData.name || !itemData.image_url) return alert("El nombre y la imagen son obligatorios.");

        const { data: { user } } = await db.auth.getUser();
        const { data: success } = await db.rpc('admin_save_item', { admin_id: user.id, item_data: itemData });

        if (success) {
            alert("¡Objeto guardado correctamente!");
            this.clearItemForm();
            this.loadShopManager();
            if (window.Shop) Shop.loadShopItems();
            if (window.Inventory) Inventory.init(); 
        } else {
            alert("Error al guardar. Comprueba tus permisos.");
        }
    },

    deleteItem: async function() {
        const itemId = document.getElementById('admin-item-id').value;
        if (!itemId) return;

        if (!confirm(this.getLang('admin-confirm-delete'))) return;

        const { data: { user } } = await db.auth.getUser();
        const { data: success } = await db.rpc('admin_delete_item', { admin_id: user.id, target_item_id: itemId });

        if (success) {
            alert("¡Objeto eliminado!");
            this.clearItemForm();
            this.loadShopManager();
            if (window.Shop) Shop.loadShopItems();
            if (window.Inventory) Inventory.init(); 
        } else {
            alert("Error al eliminar. Comprueba tus permisos.");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => AdminPanel.init());