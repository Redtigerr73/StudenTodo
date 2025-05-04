// Vérifier les mises à jour du service worker
let newWorker;
let refreshing;

// Éviter les rechargements multiples de la page
navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
});

// Fonction pour vérifier les mises à jour
function checkForUpdates() {
    // Vérifier si le service worker est pris en charge
    if ('serviceWorker' in navigator) {
        // Enregistrer les gestionnaires d'événements pour la mise à jour
        navigator.serviceWorker.ready
            .then(registration => {
                // Vérifier périodiquement les mises à jour (toutes les heures)
                registration.addEventListener('updatefound', () => {
                    newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        // Si le nouveau service worker est installé
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });

                // Planifier une vérification périodique des mises à jour
                setInterval(() => {
                    registration.update();
                    console.log('Vérification des mises à jour du service worker');
                }, 60 * 60 * 1000); // Vérifier toutes les heures
            })
            .catch(error => {
                console.error('Erreur lors de l\'enregistrement du service worker :', error);
            });
    }
}

// Afficher une notification de mise à jour
function showUpdateNotification() {
    // Créer ou afficher votre propre UI pour notifier l'utilisateur
    const updateElement = document.getElementById('pwa-update-available');
    
    if (updateElement) {
        updateElement.style.display = 'block';
        
        // Ajouter un gestionnaire d'événements pour le bouton de mise à jour
        const updateButton = document.getElementById('pwa-update-button');
        if (updateButton) {
            updateButton.addEventListener('click', () => {
                if (newWorker) {
                    // Déclencher le message au service worker
                    newWorker.postMessage({ action: 'skipWaiting' });
                    
                    // Cacher la notification
                    updateElement.style.display = 'none';
                }
            });
        }
    } else {
        console.log('Une mise à jour est disponible ! Rafraîchissez la page pour l\'appliquer.');
    }
}

// Démarrer la vérification des mises à jour lorsque la page est chargée
window.addEventListener('load', checkForUpdates);
