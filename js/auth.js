/* ==========================================================================
   js/auth.js - GESTIÓN DE USUARIOS (Login / Registro / Sesión)
   ========================================================================== */

const SUPABASE_URL = "https://ucvkrvxuxlsexszdqpfy.supabase.co"; // ¡Pon tu URL aquí!
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdmtydnh1eGxzZXhzemRxcGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODEyODcsImV4cCI6MjA5Mjk1NzI4N30.XSeNhAw3U50tb1-jhTMoCHabrcJv9uhCqVFqU_hijLQ"; // ¡Pon tu KEY aquí!

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Auth = {
    user: null,

    init: function() {
        this.setupEventListeners();
        this.checkSession();
    },

    setupEventListeners: function() {
        document.getElementById('btn-login').addEventListener('click', () => this.handleLogin());
        document.getElementById('btn-register').addEventListener('click', () => this.handleRegister());
        
        // Nuevo botón de cerrar sesión
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', async () => {
                await db.auth.signOut();
                location.reload(); // Recarga la página al salir
            });
        }
    },

    checkSession: async function() {
        const { data: { session } } = await db.auth.getSession();
        if (session) {
            this.user = session.user;
            this.loadLobby();
        }
    },

    handleLogin: async function() {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value.trim();
        const errorMsg = document.getElementById('auth-error');

        if (!email || !password) {
            errorMsg.textContent = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic("Introduce email y contraseña.") : "Introduce email y contraseña.";
            return;
        }

        errorMsg.style.color = "#AAAAAA";
        errorMsg.textContent = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic("Entrando...") : "Entrando...";
        const { data, error } = await db.auth.signInWithPassword({ email, password });

        if (error) {
            errorMsg.style.color = "#e74c3c"; // Rojo
            errorMsg.textContent = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic("Error: Credenciales inválidas.") : "Error: Credenciales inválidas.";
        } else {
            this.user = data.user;
            this.loadLobby();
        }
    },

    handleRegister: async function() {
        // Ahora leemos el nombre real que el jugador escriba
        const username = document.getElementById('auth-username').value.trim();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value.trim();
        const errorMsg = document.getElementById('auth-error');

        if (!username || !email || !password) {
            errorMsg.textContent = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic("Rellena usuario, email y contraseña.") : "Rellena usuario, email y contraseña.";
            return;
        }

        errorMsg.style.color = "#AAAAAA";
        errorMsg.textContent = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic("Creando cuenta...") : "Creando cuenta...";
        const { data, error } = await db.auth.signUp({ email, password });

        if (error) {
            errorMsg.style.color = "#e74c3c";
            errorMsg.textContent = "Error Auth: " + error.message;
        } else if (data.user) {
            // ADIÓS CHAPUZA. Usamos la variable 'username' de verdad.
            const { error: dbError } = await db.from('users').insert([{
                id: data.user.id,
                username: username,
                credits: 50,
                look_string: 'hr-115-42.hd-190-1.ch-210-66.lg-270-82.sh-290-91',
                inventory: {} 
            }]);

            if (dbError) {
                errorMsg.style.color = "#e74c3c";
                errorMsg.textContent = "Error BD: " + dbError.message;
            } else {
                errorMsg.style.color = "#2ecc71";
                errorMsg.textContent = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic("¡Cuenta creada! Ya puedes entrar.") : "¡Cuenta creada! Ya puedes entrar.";
            }
        }
    },

    loadLobby: async function() {
        const errorMsg = document.getElementById('auth-error');
        
        const { data, error } = await db
            .from('users')
            .select('*')
            .eq('id', this.user.id)
            .single();

        // ANTES NO HABÍA ESTO, POR ESO SE QUEDABA PILLADO SI FALLABA AL CARGAR
        if (error) {
            errorMsg.style.color = "#e74c3c";
            const failMsg = typeof LanguageManager !== 'undefined' ? LanguageManager.translateDynamic("Fallo al cargar perfil") : "Fallo al cargar perfil";
            errorMsg.textContent = failMsg + ": " + error.message;
            return;
        }

        if (data) {
            document.getElementById('user-name').textContent = data.username;
            document.getElementById('user-credits').textContent = data.credits;
            
            let avatarImg = data.look_string && data.look_string.includes("-")
                ? `https://www.habbo.es/habbo-imaging/avatarimage?figure=${data.look_string}&action=sit,wav`
                : `https://www.habbo.es/habbo-imaging/avatarimage?user=${data.look_string}&action=sit,wav`;
            
            document.getElementById('user-avatar').src = avatarImg;

            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('lobby-screen').classList.remove('hidden');
            
            // MOSTRAR LA RADIO AL LOGUEAR (Solo si el jugador no la cerró antes)
            const radioWidget = document.getElementById('radio-widget');
            if (radioWidget) {
                const isClosed = localStorage.getItem('radio_closed');
                if (isClosed !== 'true') {
                    radioWidget.classList.remove('hidden');
                }
            }

            if (window.Router) Router.init();
        }
    }
};

Auth.init();
