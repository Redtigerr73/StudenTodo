// Module pour suivre l'état de la connexion réseau
window.networkStatus = {
    dotNetHelper: null,

    // Initialiser le suivi de l'état de la connexion
    initialize: function (dotNetHelper) {
        this.dotNetHelper = dotNetHelper;

        // Ajouter des écouteurs d'événements pour les changements d'état de connexion
        window.addEventListener('online', this.handleOnlineEvent.bind(this));
        window.addEventListener('offline', this.handleOfflineEvent.bind(this));

        // Notifier l'état initial
        this.dotNetHelper.invokeMethodAsync('UpdateOnlineStatus', navigator.onLine);
    },

    // Gérer l'événement 'online'
    handleOnlineEvent: function () {
        if (this.dotNetHelper) {
            this.dotNetHelper.invokeMethodAsync('UpdateOnlineStatus', true);
        }
    },

    // Gérer l'événement 'offline'
    handleOfflineEvent: function () {
        if (this.dotNetHelper) {
            this.dotNetHelper.invokeMethodAsync('UpdateOnlineStatus', false);
        }
    },

    // Nettoyer les ressources
    dispose: function () {
        window.removeEventListener('online', this.handleOnlineEvent.bind(this));
        window.removeEventListener('offline', this.handleOfflineEvent.bind(this));
        this.dotNetHelper = null;
    }
};
