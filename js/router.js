/* ==========================================================================
   js/router.js - GESTIÓN DE VISTAS (Navegación Modular)
   ========================================================================== */

const Router = {
    // Obtenemos todas las secciones que tienen la clase 'view-section'
    sections: [],

    init: function() {
        this.sections = document.querySelectorAll('.view-section');

        // Escuchamos los clics en los botones del menú principal
        document.querySelectorAll('.main-menu button[data-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                this.navigate(targetId);
            });
        });
    },

    // Función principal para cambiar de pantalla
    navigate: function(sectionId) {
        // 1. Ocultamos todas las secciones
        this.sections.forEach(sec => sec.classList.add('hidden'));

        // 2. Mostramos la sección destino
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.remove('hidden');
            console.log(`[Router] Navegando a: ${sectionId}`);
        }

        // 3. Lógica específica al entrar en secciones
        if (sectionId === 'profile-section') {
            // Siempre que entramos a personaje, volvemos al menú de elección inicial
            document.getElementById('profile-choice-menu').classList.remove('hidden');
            document.getElementById('imager-section').classList.add('hidden');
            document.getElementById('editor-section').classList.add('hidden');
        }
    },

    // Función para volver al inicio (Bienvenida)
    goHome: function() {
        this.navigate('lobby-welcome');
    }
};
// Arrancamos el router manualmente
Router.init();