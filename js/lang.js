/* ==========================================================================
   js/lang.js - SISTEMA DE TRADUCCIÓN AUTOMÁTICA COMPLETA
   ========================================================================== */

const LanguageManager = {
    current: 'es',
    
    dict: {
        // MENÚ Y HEADER
        'nav-home': { es: 'Inicio', en: 'Home' },
        'nav-find-match': { es: 'Arena Titán', en: 'Titan Arena' },
        'nav-my-rooms': { es: 'Mis Salas', en: 'My Rooms' },
        'nav-all-rooms': { es: 'Todas las Salas', en: 'All Rooms' },
        'nav-shop': { es: 'Tienda', en: 'Shop' },
        'nav-profile': { es: 'Personaje', en: 'Profile' },
        'btn-logout': { es: 'Salir', en: 'Logout' },
        'text-inventory': { es: 'Inventario', en: 'Inventory' },
        'text-wallet-credits': { es: 'Créditos', en: 'Credits' },
		// PANTALLA DE LOGIN
        'text-login-title': { es: 'Habbo Da21', en: 'Habbo Da21' },
        'text-login-subtitle': { es: 'Servidor Titán', en: 'Titan Server' },
        'auth-username': { es: 'Nombre de Keko (Usuario)', en: 'Avatar Name (Username)' },
        'auth-email': { es: 'Correo electrónico', en: 'Email address' },
        'auth-password': { es: 'Contraseña', en: 'Password' },
        'btn-login': { es: 'Entrar', en: 'Login' },
        'btn-register': { es: 'Registrarse', en: 'Register' },
        'nav-open-radio': { es: '📻 Radio', en: '📻 Radio' },
		// MENSAJES DE ESTADO DE AUTENTICACIÓN
        'Introduce email y contraseña.': { es: 'Introduce email y contraseña.', en: 'Please enter email and password.' },
        'Entrando...': { es: 'Entrando...', en: 'Logging in...' },
        'Error: Credenciales inválidas.': { es: 'Error: Invalid credentials.', en: 'Error: Invalid credentials.' },
        'Rellena usuario, email y contraseña.': { es: 'Rellena usuario, email y contraseña.', en: 'Please fill username, email, and password.' },
        'Creando cuenta...': { es: 'Creando cuenta...', en: 'Creating account...' },
        '¡Cuenta creada! Ya puedes entrar.': { es: '¡Cuenta creada! Ya puedes entrar.', en: 'Account created! You can now login.' },
        'Fallo al cargar perfil': { es: 'Fallo al cargar perfil', en: 'Failed to load profile' },
		
		// MINIGAMES
		'text-nav-minigames': { es: '💰 Minijuegos', en: '💰 Minigames' },
        'text-clicker-title': { es: 'Clicker Titán', en: 'Titan Clicker' },
        'text-clicker-desc': { es: 'Haz clic en la moneda de oro. ¡100 clics = 25 Créditos!', en: 'Click the gold coin. 100 clicks = 25 Credits!' },
        'text-clicker-progress': { es: 'Progreso:', en: 'Progress:' },
        'text-clicker-fast': { es: '¡Vas muy rápido! Frena un poco.', en: 'You are clicking too fast! Slow down.' },
        'text-clicker-reward': { es: '¡Has ganado 25 Créditos en el Clicker!', en: 'You earned 25 Credits from the Clicker!' },
        'text-memory-title': { es: 'Memoria Titán', en: 'Titan Memory' },
        'text-memory-desc': { es: 'Encuentra las 8 parejas en 45 segundos. ¡Gana 50 Créditos!', en: 'Find the 8 pairs in 45 seconds. Win 50 Credits!' },
        'text-memory-header': { es: 'Memoria Titán', en: 'Titan Memory' },
        'text-memory-time': { es: 'Tiempo: ', en: 'Time: ' },
        'btn-start-memory': { es: '▶ Iniciar Partida', en: '▶ Start Match' },
        'text-memory-win': { es: '¡Memoria de Titán! Has ganado 50 Créditos.', en: 'Titan Memory! You won 50 Credits.' },
        'text-memory-lose': { es: '¡Tiempo agotado! Has perdido.', en: 'Time is up! You lost.' },
        'text-minigames-title': { es: 'Ganar Créditos', en: 'Earn Credits' },
        'text-tab-free': { es: 'Juegos Gratis', en: 'Free Games' },
        'text-tab-bet': { es: 'Apostando', en: 'Betting' },
        'text-roulette-title': { es: 'La Ruleta Da21', en: 'Da21 Roulette' },
		'text-roulette-desc': { es: 'Apuesta a colores y multiplica tus créditos.', en: 'Bet on colors and multiply your credits.' },
        'text-select-color': { es: '1. Elige un color:', en: '1. Choose a color:' },
        'text-bet-amount': { es: '2. Tu apuesta (Créditos):', en: '2. Your bet (Credits):' },
        'btn-spin-roulette': { es: '🎰 Apostar y Girar', en: '🎰 Bet and Spin' },
		'text-holodice-title': { es: 'Holodado Titán', en: 'Titan Holodice' },
        'text-holodice-desc': { es: 'Adivina el número y dobla tu apuesta (x2).', en: 'Guess the number and double your bet (x2).' },
        'text-holodice-select': { es: '1. Elige un número (1-6):', en: '1. Choose a number (1-6):' },
        'btn-spin-holodice': { es: '🎲 Lanzar Dado', en: '🎲 Roll Dice' },
        'text-afk-title': { es: '¿Sigues ahí, Titán?', en: 'Are you there, Titan?' },
        'text-afk-desc': { es: 'Llevas un rato inactivo. Haz clic abajo para demostrar que no eres un bot y reclamar tus créditos de fidelidad.', en: 'You have been inactive. Click below to prove you are not a bot and claim your loyalty credits.' },
        'text-reward-daily': { es: '¡Has recibido 50 Créditos de recompensa diaria!', en: 'You received 50 Credits daily reward!' },
        'text-reward-timed': { es: '¡+5 Créditos por tu fidelidad en el servidor!', en: '+5 Credits for playing in the server!' },

        // RADIO
        'text-radio-title': { es: 'Habbo Radio', en: 'Habbo Radio' },
        'text-radio-loading': { es: 'Cargando emisora...', en: 'Loading station...' },
        'text-radio-paused': { es: 'Radio Pausada', en: 'Radio Paused' },

        // LOBBY
        // LOBBY
        'text-lobby-title': { es: 'Da21 Titán', en: 'Da21 Titan' },
        'text-lobby-desc': { es: 'El servidor definitivo de apuestas y dados. La fortuna favorece a los valientes.', en: 'The ultimate dice and betting server. Fortune favors the bold.' },
        // INICIO Y LEADERBOARD
        'lang-nav-leaderboard': { es: 'Top 10', en: 'Top 10' },
        'text-activity-title': { es: '📡 Actividad en Vivo', en: '📡 Live Activity' },
        'text-activity-empty': { es: 'Esperando actividad en el servidor...', en: 'Waiting for server activity...' },
        'text-nav-leaderboard': { es: 'Salón de la Fama', en: 'Hall of Fame' },
        'text-top-wealth': { es: '👑 Top 10 Riqueza', en: '👑 Top 10 Wealth' },
        'text-top-wins': { es: '⚔️ Top 10 Arena (Victorias)', en: '⚔️ Top 10 Arena (Wins)' },

        // TIENDA (TÍTULO)
        'text-shop-title': { es: 'Catálogo de Créditos y Rares', en: 'Credits & Rares Catalog' },
        'text-shop-credits-title': { es: 'Créditos', en: 'Credits' },
        'text-shop-rares-title': { es: 'Rares', en: 'Rares' },
		'Comprar Varios': { es: 'Comprar Varios', en: 'Buy Multiple' },
        '¿Cuántos deseas comprar?': { es: '¿Cuántos deseas comprar?', en: 'How many do you want to buy?' },
        'Número inválido': { es: 'Por favor, introduce un número válido mayor que 0.', en: 'Please enter a valid number greater than 0.' },

        // SECCIÓN SALAS (TÍTULOS HTML Y FORMULARIOS)
        'text-my-rooms-title': { es: 'Mis Salas', en: 'My Rooms' },
        'text-all-rooms-title': { es: 'Explorador de Salas', en: 'Room Explorer' },
		'text-matchmaking-title': { es: 'Arena Titán', en: 'Titan Arena' },
        'text-matchmaking-wip': { es: 'El sistema de retos está en desarrollo...', en: 'The challenge system is under development...' },
        'btn-leave-room': { es: '⬅ Salir de la Sala', en: '⬅ Leave Room' },
		'text-room-owner': { es: 'Dueño:', en: 'Owner:' },
        'text-unknown': { es: 'Desconocido', en: 'Unknown' },
        'btn-open-create-room': { es: '+ Crear Nueva Sala', en: '+ Create New Room' },
        'form-room-title': { es: 'Gestionar Sala', en: 'Manage Room' },
        'new-room-name': { es: 'Nombre de tu sala...', en: 'Room name...' },
        'search-room-input': { es: 'Escribe para buscar...', en: 'Type to search...' },
        'btn-save-room': { es: 'Guardar', en: 'Save' },
        'btn-cancel-room': { es: 'Cancelar', en: 'Cancel' },
        'size-warning': { es: '⚠️ Aviso: Si cambias el tamaño, todos los muebles colocados se enviarán a tu inventario.', en: '⚠️ Warning: Resizing will return all furniture to your inventory.' },
		'btn-leave-room': { es: '⬅ Salir de la Sala', en: '⬅ Leave Room' },
		'Ponle un nombre a la sala.': { es: 'Ponle un nombre a la sala.', en: 'Please give the room a name.' },
        'Error al guardar:': { es: 'Error al guardar:', en: 'Error saving:' },
		'text-furni-owner': { es: 'Dueño:', en: 'Owner:' },
        'btn-furni-move': { es: 'Mover', en: 'Move' },
        'btn-furni-rotate': { es: 'Girar', en: 'Rotate' },
        'btn-furni-pickup': { es: 'Recoger', en: 'Pick Up' },

        // PERFIL Y EDITOR
        'text-profile-title': { es: 'Configurar Avatar', en: 'Avatar Setup' },
        'text-profile-choice-subtitle': { es: '¿Cómo quieres establecer tu personaje?', en: 'How do you want to set your character?' },
        'btn-mode-imager': { es: 'Importar Nombre Habbo', en: 'Import Habbo Name' },
        'btn-mode-editor': { es: 'Abrir Editor Avanzado', en: 'Open Pro Editor' },
        'habbo-name-input': { es: 'Nombre en Habbo', en: 'Habbo Username' },
        'text-imager-title': { es: 'Importar desde Habbo.es', en: 'Import from Habbo.es' },
        'text-editor-title': { es: 'Creador de Kekos 2.0 (Pro)', en: 'Avatar Builder 2.0 (Pro)' },
        'btn-save-imager': { es: 'Guardar Nombre', en: 'Save Username' },
        'btn-descargar-pro': { es: 'Guardar Avatar', en: 'Save Avatar' },
		
		// ARENA TITÁN (FASE 4)
        'arena-tab-public': { es: 'Partidas Públicas', en: 'Public Matches' },
        'arena-tab-friend': { es: 'Retar a un Amigo', en: 'Challenge Friend' },
        'arena-tab-ia': { es: 'Jugar vs IA', en: 'Play vs AI' },
        'arena-btn-create': { es: 'Crear Partida', en: 'Create Match' },
        'arena-btn-refresh': { es: 'Refrescar', en: 'Refresh' },
        'arena-btn-join': { es: 'Unirse', en: 'Join' },
        'arena-text-pot': { es: 'Bote Actual:', en: 'Current Pot:' },
        'arena-rule-margin': { es: 'Debes apostar con un margen de ±5 créditos para unirte.', en: 'You must bet within ±5 credits to join.' },
        'arena-vs-ia-limit': { es: 'La IA solo acepta hasta 100 Créditos.', en: 'AI only accepts up to 100 Credits.' },
        'arena-input-friend': { es: 'Nombre de usuario del amigo...', en: 'Friend\'s username...' },
        'arena-btn-send-challenge': { es: 'Enviar Reto', en: 'Send Challenge' },
        
        // INTERFAZ DE DUELO
        'arena-btn-roll': { es: 'Tirar Dados', en: 'Roll Dice' },
        'arena-btn-stand': { es: 'Plantarse', en: 'Stand' },
        'arena-status-waiting': { es: 'Esperando rival...', en: 'Waiting for opponent...' },
        'arena-status-turn': { es: 'Turno de:', en: 'Turn of:' },
        'arena-abandon-win': { es: '¡Has ganado! (Tu rival huyó como un cobarde)', en: 'You won! (Your opponent fled like a coward)' },
        'arena-timeout-loss': { es: '¡Tiempo agotado! Has perdido tu turno y la apuesta.', en: 'Time out! You lost your turn and the bet.' },
        'arena-tie-msg': { es: '¡Empate! Los dados se reinician. ¡Sigue la ronda!', en: 'Tie! Dice are reset. The round continues!' },
        'arena-win-pot': { es: '¡Llegaste a :score: y ganaste el bote!', en: 'You reached :score: and won the pot!' },
        'arena-lose-pot': { es: 'Has perdido la apuesta. Los objetos se han esfumado.', en: 'You lost the bet. The items have vanished.' },
        'arena-tie-retry': { es: '¡Empate a :score:! Las reglas exigen reiniciar la ronda...', en: 'Tie at :score:! Rules require restarting the round...' },
        'arena-ia-tie': { es: '¡La IA empata y se planta! Reiniciando ronda...', en: 'AI ties and stands! Restarting round...' },
        'arena-tie-nodice': { es: '¡Empate sin dados! Reiniciando ronda...', en: 'Tie without dice! Restarting round...' },
        'arena-ia-error': { es: 'Error al crear la partida oficial contra la IA.', en: 'Error creating official match against AI.' },
		'arena-challenge-expired': { es: 'El reto ha caducado porque el jugador no responde. Apuesta devuelta.', en: 'The challenge expired because the player did not respond. Bet refunded.' },
        'arena-challenge-declined': { es: 'Tu reto ha sido rechazado o el jugador abandonó la mesa. Apuesta devuelta.', en: 'Your challenge was declined or the player left the table. Bet refunded.' },

        // ==================================================================
        // TRADUCCIÓN DINÁMICA: Contenido de la Tienda y Alertas
        // (Las claves coinciden exactamente con los nombres en la base de datos SQL)
        // ==================================================================
        'Moneda De Bronce': { es: 'Moneda De Bronce', en: 'Bronze Coin' },
        'Moneda De Plata': { es: 'Moneda De Plata', en: 'Silver Coin' },
        'Moneda De Oro': { es: 'Moneda De Oro', en: 'Gold Coin' },
        'Saco De Créditos': { es: 'Saco De Créditos', en: 'Credit Sack' },
        'Barra De Oro': { es: 'Barra De Oro', en: 'Gold Bar' },
        
        // Descripciones de las monedas
        'Canjeable por 1 crédito.': { es: 'Canjeable por 1 crédito.', en: 'Redeemable for 1 credit.' },
        'Canjeable por 5 créditos.': { es: 'Canjeable por 5 créditos.', en: 'Redeemable for 5 credits.' },
        'Canjeable por 10 créditos.': { es: 'Canjeable por 10 créditos.', en: 'Redeemable for 10 credits.' },
        'Canjeable por 20 créditos.': { es: 'Canjeable por 20 créditos.', en: 'Redeemable for 20 credits.' },
        'Canjeable por 50 créditos.': { es: 'Canjeable por 50 créditos.', en: 'Redeemable for 50 credits.' },

        // Alertas de compra
        'Compra realizada. ¡Revisa tu inventario!': { es: 'Compra realizada. ¡Revisa tu inventario!', en: 'Purchase complete. Check your inventory!' },
        '¡Canjeo con éxito! Has recibido créditos.': { es: '¡Canjeo con éxito! Has recibido créditos.', en: 'Exchange successful! Credits received.' },
        'No tienes suficientes créditos.': { es: 'No tienes suficientes créditos.', en: 'You do not have enough credits.' },
        'Estás a punto de comprar ":item:" por :price: Créditos. ¿Confirmar?': { es: 'Estás a punto de comprar ":item:" por :price: Créditos. ¿Confirmar?', en: 'About to buy ":item:" for :price: Credits. Confirm?' },
        
        // Alertas de Seguridad (Banqueros Supabase)
        'Error de compra.': { es: 'Error en la compra. Revisa tu saldo.', en: 'Purchase error. Check your balance.' },
        'Error al colocar el objeto.': { es: 'Error al colocar el objeto. ¿Es tu sala y lo tienes en tu inventario?', en: 'Error placing item. Are you the room owner and have the item?' },
        'Error al recoger el objeto.': { es: 'Error al recoger el objeto.', en: 'Error picking up item.' },

        // Alertas de Borrado de Sala
        '¿Seguro que quieres borrar esta sala? Los muebles volverán a tu inventario.': { es: '¿Seguro que quieres borrar esta sala? Los muebles volverán a tu inventario.', en: 'Are you sure you want to delete this room? Furniture will return to your inventory.' },
        'Error al borrar la sala.': { es: 'Error al borrar la sala.', en: 'Error deleting room.' },

        // PANEL DE ADMINISTRACIÓN
        'nav-admin': { es: '🛡️ Admin', en: '🛡️ Admin' },
        'admin-title': { es: 'Panel de Control Titán', en: 'Titan Control Panel' },
        'admin-tab-users': { es: 'Usuarios & Castigos', en: 'Users & Bans' },
        'admin-tab-give': { es: 'Dar Objetos/Créditos', en: 'Give Items/Credits' },
        'admin-tab-shop': { es: 'Gestor de Tienda', en: 'Shop Manager' },
        'admin-tab-logs': { es: 'Auditoría (Logs)', en: 'Audit Logs' },
        'admin-search-user': { es: 'Buscar usuario (ej: manolo)...', en: 'Search user (e.g. manolo)...' },
        'admin-btn-ban': { es: 'Banear (24h)', en: 'Ban (24h)' },
        'admin-btn-unban': { es: 'Desbanear', en: 'Unban' },
        'admin-btn-make-admin': { es: 'Dar Rango Admin', en: 'Grant Admin Role' },
        'admin-btn-remove-admin': { es: 'Quitar Rango Admin', en: 'Revoke Admin Role' },
        'admin-broadcast': { es: 'Mensaje Global (Alerta a todos):', en: 'Global Broadcast (Alert everyone):' },
        'admin-btn-send-alert': { es: 'Enviar Alerta', en: 'Send Alert' },
        'text-online-players': { es: 'Online:', en: 'Online:' },
        'admin-tab-arena': { es: 'Gestor Arena', en: 'Arena Manager' },
        
        // TIENDA (Raros y Stock)
        'shop-sold-out': { es: 'AGOTADO', en: 'SOLD OUT' },
        'shop-expired': { es: 'DESCATALOGADO', en: 'RETIRED' },
        'shop-units-left': { es: 'Unidades restantes:', en: 'Units left:' },
        'shop-expires-in': { es: 'Se descatalogará en:', en: 'Retires in:' },
        'shop-error-server': { es: 'Error:', en: 'Error:' },
        'shop-error-unknown': { es: 'Compra rechazada de forma desconocida.', en: 'Purchase rejected for unknown reason.' },
        'shop-error-console': { es: 'Revisa la consola (F12)', en: 'Check the console (F12)' },

        // GESTOR DE TIENDA (NUEVO)
        'admin-btn-save-item': { es: '💾 Guardar Objeto', en: '💾 Save Item' },
        'admin-btn-clear-form': { es: 'Limpiar Formulario', en: 'Clear Form' },
        'admin-lbl-basic': { es: 'Datos Básicos', en: 'Basic Data' },
        'admin-lbl-eco': { es: 'Economía y Tienda', en: 'Economy & Shop' },
        'admin-lbl-coords': { es: 'Coordenadas Isométricas', en: 'Isometric Coords' },
        'admin-lbl-limits': { es: 'Límites', en: 'Limits' },
        'admin-lbl-order': { es: 'Orden Visual', en: 'Visual Order' },
        'admin-form-sort': { es: 'Orden (1, 2, 3...)', en: 'Order (1, 2, 3...)' },
        'admin-form-name': { es: 'Nombre del Objeto', en: 'Item Name' },
        'admin-form-desc': { es: 'Descripción', en: 'Description' },
        'admin-form-price': { es: 'Precio Base', en: 'Base Price' },
        'admin-form-retired-price': { es: 'Precio Descat.', en: 'Retired Price' },
        'admin-form-image': { es: 'URL de la Imagen', en: 'Image URL' },
        'admin-form-type': { es: 'Tipo de Objeto', en: 'Item Type' },
        'admin-form-value': { es: 'Valor Canjeo (Monedas)', en: 'Redeem Value (Coins)' },
        'admin-form-offsetx': { es: 'Offset X (Desvío Horizontal)', en: 'Offset X (Horizontal Shift)' },
        'admin-form-offsety': { es: 'Offset Y (Elevación)', en: 'Offset Y (Elevation)' },
        'admin-form-stack': { es: 'Grosor (Para apilar encima)', en: 'Thickness (Stacking)' },
        'admin-form-stock': { es: 'Stock Total (Vacío = Infinito)', en: 'Total Stock (Empty = Infinite)' },
        'admin-form-expires': { es: 'Fecha Límite de Venta', en: 'Sale Expiration Date' },
        'admin-form-pct': { es: '% Subida si se destruye', en: '% Price Increase if destroyed' },
        'admin-type-rare': { es: 'Raro (Decoración)', en: 'Rare (Decoration)' },
        'admin-type-currency': { es: 'Moneda (Canjeable)', en: 'Currency (Redeemable)' },
        'admin-item-edit': { es: 'Editar', en: 'Edit' },
        
        // MENÚ DAR OBJETOS
        'admin-give-item-select': { es: '-- Selecciona un objeto --', en: '-- Select an item --' },

        // ELIMINAR OBJETOS
        'admin-btn-delete-item': { es: '🗑️ Eliminar', en: '🗑️ Delete' },
        'admin-confirm-delete': { es: '¿Seguro que quieres borrar este objeto del juego para siempre?', en: 'Are you sure you want to permanently delete this item?' },

        // MODERACIÓN AVANZADA
        'admin-user-credits': { es: 'Créditos actuales:', en: 'Current credits:' },
        'admin-user-status': { es: 'Estado:', en: 'Status:' },
        'admin-status-active': { es: '🟢 Activo', en: '🟢 Active' },
        'admin-status-banned': { es: '🔴 Baneado hasta:', en: '🔴 Banned until:' },
        'admin-user-inventory': { es: 'Inventario del Jugador:', en: 'Player Inventory:' },
        'admin-btn-remove-credits': { es: '- Quitar Créditos', en: '- Remove Credits' },
        'admin-btn-remove-item': { es: '🗑️ Quitar', en: '🗑️ Remove' },
        'admin-btn-unban': { es: 'Desbanear', en: 'Unban' },
        'admin-inv-empty': { es: 'El inventario está vacío.', en: 'Inventory is empty.' },
        
        // KILLFEED EN VIVO
        'feed-arena-win': { es: '<b style="color: #e74c3c;">:user:</b> le ha ganado un bote total de <b style="color: #f1c40f;">:pot::coin:</b> a <b>:rival:</b> a los dados!', en: '<b style="color: #e74c3c;">:user:</b> won a total pot of <b style="color: #f1c40f;">:pot::coin:</b> against <b>:rival:</b> at dice!' },
        'feed-holodice-win': { es: '<b style="color: #3498db;">:user:</b> apostó :pot::coin: en el Holodado y ganó <b style="color: #2ecc71;">:win::coin:</b>!', en: '<b style="color: #3498db;">:user:</b> bet :pot::coin: on Holodice and won <b style="color: #2ecc71;">:win::coin:</b>!' },
        'feed-roulette-win': { es: '<b style="color: #f1c40f;">:user:</b> apostó :pot::coin: en la Ruleta y ganó <b style="color: #2ecc71;">:win::coin:</b>!', en: '<b style="color: #f1c40f;">:user:</b> bet :pot::coin: on Roulette and won <b style="color: #2ecc71;">:win::coin:</b>!' },
		
        // DONACIONES / APOYO
        'text-nav-donate': { es: 'Apoyar', en: 'Support' },
        'text-donate-title': { es: '❤️ Apoyar al Creador', en: '❤️ Support the Creator' },
        'text-donate-desc': { es: 'Habbo Da21 Titán es un proyecto 100% gratuito y no estamos afiliados a Sulake. No hay facturas de servidor que pagar, esto es puramente voluntario. Si valoras el esfuerzo, las horas de programación metidas aquí y quieres invitarme a algo o apoyar el desarrollo continuo, tienes las opciones abajo. ¡Mil gracias!', en: 'Habbo Da21 Titan is a 100% free project and we are not affiliated with Sulake. There are no server bills to pay, this is purely voluntary. If you value the effort, the programming hours put into this, and want to buy me a treat or support the continuous development, you have the options below. Thank you!' },
        'btn-donate-close': { es: 'Cerrar', en: 'Close' },

        // ==========================================================================
        // 📦 TRADUCCIONES DE MUEBLES NUEVOS (Añadidos desde el Panel Admin)
        // ==========================================================================
        
        // EJEMPLO DE MUEBLE:
        // 'Trono de Hielo VIP': { es: 'Trono de Hielo VIP', en: 'VIP Ice Throne' },
        
        // ESTRUCTURA (Copia y pega la línea de abajo sin las barras // para añadir uno real):
        // 'Nombre exacto puesto en el Panel': { es: 'Nombre a mostrar en Español', en: 'Nombre a mostrar en Inglés' },

        // (Opcional) EJEMPLO DE DESCRIPCIÓN:
        // 'Un trono legendario que congela la sala.': { es: 'Un trono legendario que congela la sala.', en: 'A legendary throne that freezes the room.' },
		
    },

    init: function() {
        const switcher = document.getElementById('lang-switch');
        const switcherLogin = document.getElementById('lang-switch-login');

        const changeHandler = (e) => {
            const newLang = e.target.value;
            if (switcher) switcher.value = newLang;
            if (switcherLogin) switcherLogin.value = newLang;
            this.setLanguage(newLang);
        };

        if (switcher) switcher.addEventListener('change', changeHandler);
        if (switcherLogin) switcherLogin.addEventListener('change', changeHandler);

        this.setLanguage(switcher ? switcher.value : 'es'); 
    },

    // Función auxiliar para traducir textos que no tienen ID (como los items de la tienda)
    // Si la frase existe en el diccionario, la devuelve traducida; si no, devuelve la original.
    translateDynamic: function(text) {
        if (!text) return text;
        const lang = this.current;
        if (this.dict[text] && this.dict[text][lang]) {
            return this.dict[text][lang];
        }
        return text; // Devolvemos el texto original si no hay traducción
    },

    setLanguage: function(lang) {
        this.current = lang;
        
        // 1. Traducir textos estáticos con ID
        for (const [id, texts] of Object.entries(this.dict)) {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'INPUT') el.placeholder = texts[lang];
                else el.innerHTML = texts[lang];
            }
        }

        // 2. Traducir selectores especiales (Privacidad, Tamaños y Filtros)
        const pubSelect = document.getElementById('new-room-public');
        if (pubSelect) {
            pubSelect.options[0].text = lang === 'es' ? 'Pública (Todos la ven)' : 'Public (Everyone sees it)';
            pubSelect.options[1].text = lang === 'es' ? 'Privada (Solo tú)' : 'Private (Only you)';
        }

        const sizeSelect = document.getElementById('new-room-size');
        if (sizeSelect) {
            const sizes = { es: ['Pequeña', 'Mediana', 'Grande', 'Titán'], en: ['Small', 'Medium', 'Large', 'Titan'] };
            for(let i=0; i<4; i++) {
                const base = sizeSelect.options[i].value; 
                sizeSelect.options[i].text = `${sizes[lang][i]} (${base})`;
            }
        }

        const filterSelect = document.getElementById('search-filter');
        if (filterSelect) {
            filterSelect.options[0].text = lang === 'es' ? 'Buscar por Nombre de Sala' : 'Search by Room Name';
            filterSelect.options[1].text = lang === 'es' ? 'Buscar por Dueño' : 'Search by Owner';
        }

        // 3. Avisar a los otros scripts de que el idioma ha cambiado para que redibujen sus listas dinámicas
        window.dispatchEvent(new Event('languageChanged'));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    LanguageManager.init();
});