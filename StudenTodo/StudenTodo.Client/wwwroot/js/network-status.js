// Script pour gérer l'état de la connexion réseau
window.networkStatus = {
    dotNetReference: null,
    
    // Initialisation avec référence au composant Blazor
    initialize: function (dotNetRef) {
        this.dotNetReference = dotNetRef;
        
        // Envoyer l'état initial au composant Blazor
        this.updateStatus(navigator.onLine);
        
        // Ajouter des écouteurs d'événements pour les changements d'état
        window.addEventListener('online', this.handleOnlineEvent.bind(this));
        window.addEventListener('offline', this.handleOfflineEvent.bind(this));
        
        console.log('Surveillance de l\'état réseau initialisée');
    },
    
    // Nettoyage lors de la suppression du composant
    dispose: function () {
        // Supprimer les écouteurs d'événements
        window.removeEventListener('online', this.handleOnlineEvent.bind(this));
        window.removeEventListener('offline', this.handleOfflineEvent.bind(this));
        
        this.dotNetReference = null;
        console.log('Surveillance de l\'état réseau arrêtée');
    },
    
    // Gestionnaire d'événement pour l'état 'online'
    handleOnlineEvent: function () {
        this.updateStatus(true);
    },
    
    // Gestionnaire d'événement pour l'état 'offline'
    handleOfflineEvent: function () {
        this.updateStatus(false);
    },
    
    // Mise à jour de l'état et notification du composant Blazor
    updateStatus: function (isOnline) {
        if (this.dotNetReference) {
            this.dotNetReference.invokeMethodAsync('UpdateOnlineStatus', isOnline);
            console.log(`État réseau mis à jour: ${isOnline ? 'En ligne' : 'Hors ligne'}`);
        }
    }
};
