/* ==========================================================================
   js/inventory.js - GESTIÓN DEL INVENTARIO Y CANJEO
   ========================================================================== */

const Inventory = {
    // Aquí guardaremos la info del catálogo para saber qué imagen y valor tiene cada ID
    shopReference: {}, 

    init: async function() {
        // Cargamos la info de la tienda para saber las fotos y los valores
        const { data } = await db.from('shop_items').select('*');
        if (data) {
            data.forEach(item => {
                this.shopReference[item.id] = item;
            });
        }
        
        // El inventario se actualiza cada pocos segundos automáticamente (o al comprar)
        this.loadInventory();
        setInterval(() => this.loadInventory(), 5000);
    },

    loadInventory: async function() {
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        const { data, error } = await db.from('users').select('inventory').eq('id', user.id).single();
        if (error || !data) return;

        this.renderInventory(data.inventory);
    },

    renderInventory: function(inventoryData) {
        const container = document.getElementById('inventory-items');
        if (!container) return;
        container.innerHTML = '';

        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
        const t_empty = isEn ? 'Your inventory is empty.' : 'Inventario vacío...';

        if (!inventoryData || Object.keys(inventoryData).length === 0) {
            container.innerHTML = `<span style="color: #666; font-size: 12px; margin-left: 10px;">${t_empty}</span>`;
            return;
        }

        for (const [itemId, quantity] of Object.entries(inventoryData)) {
            if (quantity <= 0) continue; 
            
            const itemData = this.shopReference[itemId];
            if (!itemData) continue; 

            // DIBUJAR UNA SOLA CAJA POR OBJETO (STACK)
            const slot = document.createElement('div');
            slot.className = 'item-slot';
            slot.style.position = 'relative'; // Necesario para posicionar la cantidad encima
            
            // --- NUEVO: HACER QUE EL ITEM SEA ARRASTRABLE ---
            slot.draggable = true;
            slot.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', itemId);
                e.dataTransfer.effectAllowed = 'move';
                
                // 1. Truco de magia: Crear una imagen vacía para ocultar el bloque gigante del navegador
                const emptyImage = new Image();
                emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                e.dataTransfer.setDragImage(emptyImage, 0, 0);

                // 2. Avisarle al motor qué ID de objeto estamos moviendo para que dibuje el fantasma
                if (typeof Da21Engine !== 'undefined') {
                    Da21Engine.draggingItemId = itemId;
                }
            });

            // 3. Limpiar al soltar (colocado o cancelado)
            slot.addEventListener('dragend', () => {
                if (typeof Da21Engine !== 'undefined') {
                    Da21Engine.draggingItemId = null;
                    Da21Engine.render();
                }
            });
            // ------------------------------------------------
            
            // Si hay más de 1, mostramos la etiqueta de cantidad (ej: x5)
            let badgeHtml = '';
            if (quantity > 1) {
                badgeHtml = `<div style="position: absolute; top: -5px; right: -5px; background: #e74c3c; color: white; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 10px; z-index: 5; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">x${quantity}</div>`;
            }

            slot.innerHTML = `
                ${badgeHtml}
                <img src="${itemData.image_url}" alt="${itemData.name}" title="${itemData.name}" style="height: 40px; pointer-events: none;">
            `;
            
            // EVENTO IMPORTANTE: Canjeo con doble clic
            slot.addEventListener('dblclick', () => {
                if (itemData.type === 'currency') {
                    this.redeemCoin(itemId, itemData.name, itemData.value, quantity);
                } else if (itemData.type === 'rare') {
                    // Aquí meteremos luego la lógica de soltar el mueble en la sala
                    console.log("Menú de furni en desarrollo...");
                }
            });

            container.appendChild(slot);
        }
    },

    redeemCoin: async function(itemId, name, value, maxQuantity) {
        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
        const t_name = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic(name) : name;
        
        let amountToRedeem = 1;

        // Si tiene más de 1 unidad, preguntamos cuántas quiere canjear
        if (maxQuantity > 1) {
            const promptMsg = isEn 
                ? `You have ${maxQuantity}x ${t_name}.\nHow many do you want to exchange?` 
                : `Tienes ${maxQuantity}x ${t_name}.\n¿Cuántos deseas canjear?`;
            
            const answer = prompt(promptMsg, "1");
            
            // Si le da a cancelar o no escribe nada, abortamos
            if (answer === null || answer.trim() === "") return;
            
            amountToRedeem = parseInt(answer);

            // Validaciones de seguridad
            if (isNaN(amountToRedeem) || amountToRedeem <= 0) {
                const errNum = isEn ? "Please enter a valid number." : "Por favor, introduce un número válido.";
                alert(errNum);
                return;
            }
            if (amountToRedeem > maxQuantity) {
                const errMax = isEn ? "You don't have that many." : "No tienes tanta cantidad.";
                alert(errMax);
                return;
            }
        } else {
            // Si solo tiene 1, hacemos el confirm clásico
            const confirmMsg = isEn 
                ? `Do you want to exchange ${t_name} for ${value} Credits?` 
                : `¿Deseas canjear ${t_name} por ${value} Créditos?`;

            if (!confirm(confirmMsg)) return;
        }

        const { data: { user } } = await db.auth.getUser();
        
        // Obtenemos sus datos frescos de la BD[cite: 6]
        const { data: userData } = await db.from('users').select('credits, inventory').eq('id', user.id).single();
        
        let inv = userData.inventory;
        // Si por algún bug (o hackeo de consola) intenta canjear algo que no tiene, lo paramos[cite: 6]
        if (!inv[itemId] || inv[itemId] < amountToRedeem) {
            const errSync = isEn ? "Inventory error. Refreshing..." : "Error de sincronización. Recargando...";
            alert(errSync);
            this.loadInventory();
            return;
        }

        // Operación matemática: Restar la cantidad elegida del inventario y sumar el valor a los créditos[cite: 6]
        inv[itemId] -= amountToRedeem;
        
        // El valor a sumar es el valor del item multiplicado por la cantidad elegida
        const totalValue = value * amountToRedeem; 
        let newCredits = userData.credits + totalValue;

        // Limpiar el JSON si se queda a cero[cite: 6]
        if (inv[itemId] === 0) delete inv[itemId];

        // Guardar en la base de datos[cite: 6]
        const { error } = await db.from('users').update({ credits: newCredits, inventory: inv }).eq('id', user.id);

        if (!error) {
            document.getElementById('user-credits').textContent = newCredits;
            
            // NUEVO: Sonido al convertir moneda en créditos desde el inventario
            new Audio('assets/audio/coin_kaching.mp3').play().catch(e => console.log("Audio prevenido por el navegador"));
            
            const successMsg = isEn 
                ? `Exchange successful! You received ${totalValue} credits.` 
                : `¡Canjeo con éxito! Has recibido ${totalValue} créditos.`;
            alert(successMsg);
            
            this.loadInventory(); 
            
            // Actualizar también el lobby si estamos viéndolo
            if (typeof loadLeaderboard !== 'undefined') loadLeaderboard();
        } else {
            const errDb = isEn ? "Error saving exchange." : "Error al guardar el canjeo en la base de datos.";
            alert(errDb);
        }
    }
};

// Arrancamos el inventario un segundo después de entrar al Lobby para asegurar que la DB esté lista
setTimeout(() => {
    if (!document.getElementById('lobby-screen').classList.contains('hidden')) {
        Inventory.init();
    }
}, 1000);