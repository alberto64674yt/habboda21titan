/* ==========================================================================
   js/shop.js - CATÁLOGO DE LA TIENDA
   ========================================================================== */

const Shop = {
    items: [],

    init: async function() {
        await this.loadShopItems();
    },

    loadShopItems: async function() {
        // Traemos solo los objetos que están a la venta, ordenados por nuestro nuevo sort_order
        const { data, error } = await db.from('shop_items').select('*').eq('on_sale', true).order('sort_order', { ascending: true });
        
        if (error) {
            console.error("Error cargando la tienda:", error);
            return;
        }
        
        this.items = data;
        this.renderShop();
    },

    renderShop: function() {
        const containerCurrency = document.getElementById('shop-container-currency');
        const containerRares = document.getElementById('shop-container-rares');
        if (!containerCurrency || !containerRares) return;
        
        containerCurrency.innerHTML = '';
        containerRares.innerHTML = '';

        // Detectar idioma para los textos de los botones
        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
        const t_buy = isEn ? 'Buy' : 'Comprar';
        const t_buy_multi = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('Comprar Varios') : 'Comprar Varios';
        const t_credits = isEn ? 'Credits' : 'Créditos';

        const now = new Date();

        this.items.forEach(item => {
            const t_name = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic(item.name) : item.name;
            const t_desc = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic(item.description) : item.description;

            // 1. Verificaciones de Agotado/Descatalogado
            let isExpired = item.expires_at ? new Date(item.expires_at) < now : false;
            let isSoldOut = item.stock_limit !== null && item.current_stock <= 0;
            
            // 2. Economía Dinámica: Calcular la subida de precio si hay unidades perdidas
            let dynamicPrice = item.price;
            if (item.lost_units > 0 && item.retired_pct > 0) {
                dynamicPrice = item.price + Math.floor(item.price * (item.lost_units * item.retired_pct) / 100);
            }

            // 3. Preparar los escudos visuales
            let classes = 'shop-item';
            let badgeHtml = '';
            let btnAttr = '';

            if (isExpired) {
                classes += ' sold-out';
                badgeHtml = `<div class="sold-out-badge">${typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('shop-expired') : 'DESCATALOGADO'}</div>`;
                btnAttr = 'disabled';
            } else if (isSoldOut) {
                classes += ' sold-out';
                badgeHtml = `<div class="sold-out-badge">${typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('shop-sold-out') : 'AGOTADO'}</div>`;
                btnAttr = 'disabled';
            }

            // 4. Mostrar el stock restante en formato 9/10
            let stockHtml = '';
            if (item.stock_limit !== null) {
                const t_stock = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('shop-units-left') : 'Unidades restantes:';
                stockHtml = `<p style="color: #f39c12; font-size: 11px; margin-bottom: 5px;"><b>${t_stock} ${item.current_stock}/${item.stock_limit}</b></p>`;
            }

            // NUEVO: Cuenta atrás de caducidad
            let timerHtml = '';
            if (item.expires_at && !isExpired && !isSoldOut) {
                const t_expires = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('shop-expires-in') : 'Expira en:';
                timerHtml = `<p style="color: #e74c3c; font-size: 11px; margin-bottom: 5px; font-weight: bold; background: rgba(0,0,0,0.5); padding: 4px; border-radius: 4px;">⏳ ${t_expires} <span class="countdown-timer" data-expires="${item.expires_at}">Calculando...</span></p>`;
            }

            // 5. El botón de Varios solo aparece si es una moneda (currency)
            let multiBtnHtml = '';
            if (item.type === 'currency' && !btnAttr) {
                multiBtnHtml = `<button class="btn-buy-multi" data-id="${item.id}" style="width: 100%; padding: 5px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 5px; font-size: 11px;">${t_buy_multi}</button>`;
            }

            const div = document.createElement('div');
            div.className = classes;
            div.innerHTML = `
                ${badgeHtml}
                <img src="${item.image_url}" alt="${t_name}" style="height: 50px; margin-bottom: 10px;">
                <h4 style="color: white; font-size: 14px;">${t_name}</h4>
                <p style="color: #aaa; font-size: 11px; margin-bottom: 5px;">${t_desc}</p>
                ${stockHtml}
                ${timerHtml}
                <button class="btn-buy" data-id="${item.id}" ${btnAttr} style="width: 100%; padding: 8px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    ${t_buy} (${dynamicPrice} ${t_credits})
                </button>
                ${multiBtnHtml}
            `;
            
            // Separar visualmente por categorías
            if (item.type === 'currency') {
                containerCurrency.appendChild(div);
            } else {
                containerRares.appendChild(div);
            }
        });

        // Eventos
        document.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', (e) => this.buyItem(e.target.dataset.id, false));
        });
        document.querySelectorAll('.btn-buy-multi').forEach(btn => {
            btn.addEventListener('click', (e) => this.buyItem(e.target.dataset.id, true));
        });

        // NUEVO: Iniciar intervalo de la cuenta atrás
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => this.updateTimers(), 1000);
        this.updateTimers(); // Llamada inmediata
    },

    // ¡OJO! Ya no le pasamos el 'price' a la función, el servidor es el único que manda.
    buyItem: async function(itemId, isMultiple) {
        let quantity = 1;

        if (isMultiple) {
            const promptMsg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('¿Cuántos deseas comprar?') : '¿Cuántos deseas comprar?';
            const answer = prompt(promptMsg, "2");
            if (answer === null || answer.trim() === "") return; 
            quantity = parseInt(answer);
            if (isNaN(quantity) || quantity <= 0) return alert(typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('Número inválido') : 'Número inválido');
        }

        const { data: { user } } = await db.auth.getUser();
        if (!user) return alert("Debes iniciar sesión.");

        // SEGURIDAD: Llamamos al Banquero con los nombres blindados (p_)
        const { data: success, error } = await db.rpc('secure_shop_buy', {
            p_user_id: user.id,
            p_item_id: itemId,
            p_quantity: quantity
        });

        // ESTO ES LO IMPORTANTE: Si el servidor falla, te escupe el motivo exacto en la cara
        if (error) {
            console.error("❌ ERROR DEL SERVIDOR:", error.message || error);
            const t_err_srv = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('shop-error-server') : 'Error:';
            const t_err_cons = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('shop-error-console') : 'Revisa la consola (F12)';
            return alert(`${t_err_srv} ${error.message || t_err_cons}`);
        }

        if (!success) {
            const t_err_unk = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('shop-error-unknown') : 'Compra rechazada de forma desconocida.';
            return alert(t_err_unk);
        }

        const { data: userData } = await db.from('users').select('credits').eq('id', user.id).single();
        document.getElementById('user-credits').textContent = userData.credits;
        
        // NUEVO: Sonido de caja registradora al comprar en la tienda
        new Audio('assets/audio/coin_kaching.mp3').play().catch(e => console.log("Audio prevenido por el navegador"));

        const successMsg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic('Compra realizada. ¡Revisa tu inventario!') : "¡Compra realizada con éxito!";
        alert(successMsg);
        
        if (window.Inventory) Inventory.loadInventory();
        this.loadShopItems(); // Recargamos para actualizar el stock visualmente
    },

    updateTimers: function() {
        const timers = document.querySelectorAll('.countdown-timer');
        if (timers.length === 0) return;
        
        const now = new Date().getTime();
        
        timers.forEach(el => {
            const expDate = new Date(el.dataset.expires);
            // Ajustamos la zona horaria para asegurarnos que la cuenta es 100% fiel al servidor
            const exp = expDate.getTime() + (expDate.getTimezoneOffset() * 60000); 
            const diff = exp - now;
            
            if (diff <= 0) {
                el.textContent = "00:00:00";
                if (!el.dataset.expired) {
                    el.dataset.expired = "true";
                    setTimeout(() => this.loadShopItems(), 1000); // Recarga automática si caduca viéndolo
                }
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                
                let t = '';
                if (days > 0) t += `${days}d `;
                t += `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
                el.textContent = t;
            }
        });
    }
};

// Arrancar cuando cargue la sección
document.getElementById('nav-shop').addEventListener('click', () => {
    Shop.init();
});
// REFRESCAR TIENDA AL CAMBIAR IDIOMA
window.addEventListener('languageChanged', () => {
    const shopSection = document.getElementById('shop-section');
    if (shopSection && !shopSection.classList.contains('hidden')) {
        Shop.renderShop(); // Redibujamos con los nuevos nombres en inglés/español
    }
});