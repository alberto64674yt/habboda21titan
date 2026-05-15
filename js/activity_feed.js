/* ==========================================================================
   js/activity_feed.js - KILLFEED Y NOTIFICACIONES EN VIVO
   ========================================================================== */

const ActivityFeed = {
    channel: null,
    maxItems: 20, // Máximo de mensajes que se ven en la lista
    history: [],  // NUEVO: Memoria para guardar los mensajes y poder retraducirlos

    init: function() {
        // FIX: self: true permite que el que gana también vea su propio mensaje en el Feed
        this.channel = db.channel('public_activity_feed', {
            config: { broadcast: { self: true } }
        })
            .on('broadcast', { event: 'new_activity' }, (payload) => {
                this.addActivity(payload.payload.data, payload.payload.type);
            })
            .subscribe();

        // NUEVO: Escuchar cuando cambias de idioma en el menú para redibujar el historial
        window.addEventListener('languageChanged', () => this.reRender());
    },

    addActivity: function(data, type) {
        // 1. Calculamos la hora exacta en la que llega el mensaje
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        // 2. Guardamos los datos crudos en la memoria (el más nuevo primero)
        this.history.unshift({ data: data, type: type, timeStr: timeStr });
        
        // 3. Si nos pasamos de 20 mensajes, borramos el más viejo para no saturar
        if (this.history.length > this.maxItems) {
            this.history.pop();
        }

        // 4. Mandamos a pintar la lista
        this.reRender();
    },

    reRender: function() {
        const list = document.getElementById('activity-feed-list');
        const emptyMsg = document.getElementById('text-activity-empty');
        if (!list) return;

        if (this.history.length > 0 && emptyMsg) {
            emptyMsg.style.display = 'none';
        }

        // Borramos la lista de la pantalla para redibujarla desde cero
        list.innerHTML = ''; 

        const isEn = typeof LanguageManager !== 'undefined' && LanguageManager.current === 'en';
        const iconMoneda = '<img src="https://habboapi.site/api/image/CF_10_coin_gold" style="height: 12px; vertical-align: middle;">';

        // Recorremos la memoria y dibujamos cada mensaje en el idioma actual
        this.history.forEach(entry => {
            const item = document.createElement('div');
            item.style = "background: #111; border-left: 4px solid #3498db; padding: 10px; border-radius: 4px; font-size: 13px; color: #ddd; display: flex; align-items: center; gap: 10px; animation: fadeIn 0.3s ease;";
            
            let icon = '📢';
            if (entry.type === 'arena') { icon = '⚔️'; item.style.borderLeftColor = '#e74c3c'; }
            if (entry.type === 'ruleta') { icon = '🎰'; item.style.borderLeftColor = '#f1c40f'; }
            if (entry.type === 'holodado') { icon = '🎲'; item.style.borderLeftColor = '#3498db'; }

            // Sacamos el texto del diccionario según el idioma actual (Inglés/Español)
            let messageTemplate = typeof LanguageManager !== 'undefined' && LanguageManager.dict[entry.data.key] 
                                    ? LanguageManager.dict[entry.data.key][isEn ? 'en' : 'es'] 
                                    : entry.data.key;

            // Inyectamos las variables (nombres y dineros)
            messageTemplate = messageTemplate.replace(':user:', entry.data.user || '');
            messageTemplate = messageTemplate.replace(':pot:', entry.data.pot || '');
            messageTemplate = messageTemplate.replace(':rival:', entry.data.rival || '');
            messageTemplate = messageTemplate.replace(':win:', entry.data.win || '');
            messageTemplate = messageTemplate.replace(/:coin:/g, iconMoneda);

            item.innerHTML = `
                <span style="font-size: 16px;">${icon}</span>
                <span style="color: #888;">[${entry.timeStr}]</span>
                <span style="flex: 1;">${messageTemplate}</span>
            `;

            // Como los guardamos usando "unshift" (el más nuevo arriba), hacemos appendChild normal
            list.appendChild(item); 
        });
    },
    
    // Solo enviamos los DATOS crudos por la radio, no el texto HTML
    sendActivity: function(data, type) {
        if (this.channel) {
            this.channel.send({
                type: 'broadcast',
                event: 'new_activity',
                payload: { data: data, type: type }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ActivityFeed.init(), 2000);
});