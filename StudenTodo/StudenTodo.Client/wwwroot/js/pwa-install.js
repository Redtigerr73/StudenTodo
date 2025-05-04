// Variable pour stocker l'événement d'installation
let deferredPrompt;
let installButton;

window.addEventListener('load', () => {
    installButton = document.getElementById('pwa-install-button');
    
    if (installButton) {
        // Cacher le bouton initialement
        installButton.style.display = 'none';
        
        // Ajouter un écouteur d'événement au bouton
        installButton.addEventListener('click', installPWA);
    }
});

// Écouter l'événement beforeinstallprompt qui se déclenche
// lorsque le PWA est installable
window.addEventListener('beforeinstallprompt', (e) => {
    // Empêcher Chrome 67 et versions antérieures d'afficher automatiquement
    // la boîte de dialogue d'installation
    e.preventDefault();
    
    // Stocker l'événement pour l'utiliser plus tard
    deferredPrompt = e;
    
    // Afficher le bouton d'installation si disponible
    if (installButton) {
        installButton.style.display = 'block';
    }
    
    console.log('L\'application peut être installée. Le bouton d\'installation est visible.');
});

// Fonction pour installer le PWA
async function installPWA() {
    if (!deferredPrompt) {
        console.log('Aucun événement d\'installation disponible');
        return;
    }
    
    // Afficher l'invite d'installation
    deferredPrompt.prompt();
    
    // Attendre que l'utilisateur réponde à l'invite
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
        console.log('L\'utilisateur a accepté l\'installation du PWA');
        // Cacher le bouton d'installation une fois accepté
        if (installButton) {
            installButton.style.display = 'none';
        }
    } else {
        console.log('L\'utilisateur a refusé l\'installation du PWA');
    }
    
    // L'événement prompt() ne peut être utilisé qu'une seule fois
    deferredPrompt = null;
}

// Écouter l'événement appinstalled
window.addEventListener('appinstalled', (evt) => {
    console.log('L\'application a été installée avec succès', evt);
    // Cacher le bouton d'installation s'il est visible
    if (installButton) {
        installButton.style.display = 'none';
    }
});
