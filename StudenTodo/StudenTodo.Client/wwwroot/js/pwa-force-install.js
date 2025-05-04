// Module pour forcer l'installation PWA et gérer la détection
let deferredPrompt = null;
let dotNetHelper = null;

// Initialiser la détection de l'événement beforeinstallprompt
export function initInstallDetection(helper) {
    console.log('PWA Force Install: Initialisation de la détection...');
    dotNetHelper = helper;
    
    // Vérifier si l'application peut être installée
    checkInstallability();
    
    // Si nous avons déjà capturé l'événement beforeinstallprompt mais pas encore initialisé
    if (window.deferredPrompt) {
        deferredPrompt = window.deferredPrompt;
        updateInstallButton(true);
    }
    
    // Écouter l'événement beforeinstallprompt pour le capturer
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Écouter l'événement appinstalled pour savoir quand l'application a été installée
    window.addEventListener('appinstalled', handleAppInstalled);
}

// Vérifier si l'application peut être installée (critères de base)
function checkInstallability() {
    console.log('PWA Force Install: Vérification des critères d\'installation...');
    
    // PWA requiert HTTPS sauf pour localhost
    const isSecureContext = window.isSecureContext || 
                           location.protocol === 'https:' || 
                           location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
        console.warn('PWA Force Install: L\'application n\'est pas servie en HTTPS ou localhost');
        return false;
    }
    
    // Vérifier si le navigateur supporte les service workers
    if (!('serviceWorker' in navigator)) {
        console.warn('PWA Force Install: Le navigateur ne supporte pas les service workers');
        return false;
    }
    
    console.log('PWA Force Install: Critères de base remplis');
    return true;
}

// Gérer l'événement beforeinstallprompt
function handleBeforeInstallPrompt(e) {
    // Empêcher Chrome d'afficher automatiquement l'invite d'installation
    e.preventDefault();
    
    console.log('PWA Force Install: Événement beforeinstallprompt capturé');
    
    // Stocker l'événement pour pouvoir le déclencher plus tard
    deferredPrompt = e;
    window.deferredPrompt = e;
    
    // Informer le composant Blazor que l'application peut être installée
    updateInstallButton(true);
}

// Gérer l'événement appinstalled
function handleAppInstalled(e) {
    console.log('PWA Force Install: Application installée avec succès');
    
    // Réinitialiser l'état
    deferredPrompt = null;
    window.deferredPrompt = null;
    
    // Informer le composant Blazor que l'application a été installée
    updateInstallButton(false);
}

// Mettre à jour l'état du bouton d'installation dans le composant Blazor
function updateInstallButton(canInstall) {
    console.log(`PWA Force Install: Mise à jour du bouton d'installation (${canInstall})`);
    
    if (dotNetHelper) {
        try {
            dotNetHelper.invokeMethodAsync('UpdateInstallButtonVisibility', canInstall);
        } catch (error) {
            console.error('PWA Force Install: Erreur lors de la mise à jour du bouton:', error);
        }
    }
}

// Déclencher l'invite d'installation
export async function triggerInstall() {
    console.log('PWA Force Install: Tentative de déclenchement de l\'installation');
    
    // Si nous n'avons pas d'événement en attente, vérifier si nous pouvons en obtenir un
    if (!deferredPrompt) {
        console.warn('PWA Force Install: Aucun événement d\'installation disponible');
        
        // Si le navigateur est Safari sur iOS, montrer un message spécial
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isiOS && isSafari) {
            showIOSInstallInstructions();
            return;
        }
        
        // Pour d'autres navigateurs, vérifier si l'application est déjà installée
        if ('getInstalledRelatedApps' in navigator) {
            try {
                const relatedApps = await navigator.getInstalledRelatedApps();
                if (relatedApps.length > 0) {
                    console.log('PWA Force Install: Application déjà installée');
                    alert('Cette application est déjà installée sur votre appareil.');
                    return;
                }
            } catch (error) {
                console.error('PWA Force Install: Erreur lors de la vérification des applications installées:', error);
            }
        }
        
        // Si nous arrivons ici, l'application n'est pas installable pour le moment
        alert('Cette application ne peut pas être installée pour le moment. Veuillez vérifier que vous utilisez un navigateur compatible (Chrome, Edge, Opera, Samsung Internet) et que vous êtes sur HTTPS.');
        return;
    }
    
    // Afficher l'invite d'installation
    deferredPrompt.prompt();
    
    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Force Install: Utilisateur a ${outcome === 'accepted' ? 'accepté' : 'refusé'} l'installation`);
    
    // Effacer l'événement
    deferredPrompt = null;
    window.deferredPrompt = null;
}

// Afficher des instructions spéciales pour Safari iOS
function showIOSInstallInstructions() {
    // Créer un élément de dialogue pour les instructions
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.right = '0';
    dialog.style.bottom = '0';
    dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    dialog.style.zIndex = '10000';
    dialog.style.display = 'flex';
    dialog.style.justifyContent = 'center';
    dialog.style.alignItems = 'center';
    
    // Contenu du dialogue
    dialog.innerHTML = `
        <div style="background-color: white; padding: 20px; border-radius: 10px; max-width: 90%; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <h3 style="margin-top: 0; color: #03173d;">Comment installer cette application sur iOS</h3>
            <ol style="padding-left: 20px; margin-bottom: 20px;">
                <li>Appuyez sur le bouton <strong>Partager</strong> <span style="font-size: 1.2em;">⬆️</span> en bas de l'écran</li>
                <li>Faites défiler jusqu'à voir <strong>Sur l'écran d'accueil</strong> <span style="font-size: 1.2em;">➕</span></li>
                <li>Appuyez dessus, puis sur <strong>Ajouter</strong> en haut à droite</li>
            </ol>
            <button style="background-color: #03173d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; width: 100%;" onclick="this.parentNode.parentNode.remove()">Compris</button>
        </div>
    `;
    
    // Ajouter le dialogue au document
    document.body.appendChild(dialog);
    
    // Permettre de fermer le dialogue en cliquant à l'extérieur
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
}

// Fonction auto-exécutée pour vérifier si le service worker est déjà enregistré
(async function() {
    if ('serviceWorker' in navigator) {
        try {
            // Enregistrer le service worker s'il n'est pas déjà enregistré
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('PWA Force Install: Service worker enregistré avec succès:', registration);
        } catch (error) {
            console.error('PWA Force Install: Erreur lors de l\'enregistrement du service worker:', error);
        }
    }
})();
