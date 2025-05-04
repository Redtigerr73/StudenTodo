// Script de diagnostic PWA pour dépanner les problèmes d'installation

// Fonction pour vérifier l'état de l'enregistrement du service worker
async function checkServiceWorkerStatus() {
    console.log('Diagnostic PWA: Vérification du service worker...');
    
    // 1. Vérifier si le navigateur prend en charge les service workers
    if (!('serviceWorker' in navigator)) {
        console.error('Diagnostic PWA: Ce navigateur ne prend pas en charge les Service Workers');
        return false;
    }
    
    try {
        // 2. Vérifier si un service worker est déjà enregistré
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
            console.log('Diagnostic PWA: Service workers existants:', registrations);
            registrations.forEach(reg => {
                console.log(`- Service worker pour: ${reg.scope}`);
                console.log(`  État: ${reg.active ? 'Actif' : 'Inactif'}`);
                console.log(`  Mode mise à jour: ${reg.updateViaCache}`);
            });
        } else {
            console.log('Diagnostic PWA: Aucun service worker enregistré, tentative d\'enregistrement...');
        }
        
        // 3. Tenter d'enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Diagnostic PWA: Service worker enregistré avec succès!', registration);
        return true;
    } catch (error) {
        console.error('Diagnostic PWA: Échec de l\'enregistrement du service worker:', error);
        return false;
    }
}

// Fonction pour vérifier le manifeste Web
async function checkManifest() {
    console.log('Diagnostic PWA: Vérification du manifeste...');
    
    try {
        // Essayer de récupérer le manifeste
        const response = await fetch('/manifest.json');
        if (!response.ok) {
            console.error(`Diagnostic PWA: Échec du chargement du manifeste - Code d'état: ${response.status}`);
            return false;
        }
        
        const manifest = await response.json();
        console.log('Diagnostic PWA: Manifeste chargé avec succès:', manifest);
        
        // Vérifier les propriétés essentielles du manifeste
        const requiredProps = ['name', 'short_name', 'start_url', 'display', 'icons'];
        const missingProps = requiredProps.filter(prop => !manifest[prop]);
        
        if (missingProps.length > 0) {
            console.error('Diagnostic PWA: Le manifeste manque de propriétés requises:', missingProps);
            return false;
        }
        
        // Vérifier les icônes
        if (!manifest.icons || manifest.icons.length === 0) {
            console.error('Diagnostic PWA: Le manifeste ne contient pas d\'icônes');
            return false;
        }
        
        // Vérifier les tailles d'icônes recommandées (192px et 512px)
        const iconSizes = manifest.icons.map(icon => icon.sizes);
        const hasSizes = ['192x192', '512x512'].every(size => 
            iconSizes.some(s => s.includes(size)));
            
        if (!hasSizes) {
            console.warn('Diagnostic PWA: Le manifeste ne contient pas toutes les tailles d\'icônes recommandées (192x192, 512x512)');
        }
        
        // Vérifier les URL des icônes
        for (const icon of manifest.icons) {
            try {
                const iconResponse = await fetch(icon.src);
                if (!iconResponse.ok) {
                    console.error(`Diagnostic PWA: L'icône ${icon.src} n'est pas accessible - Code d'état: ${iconResponse.status}`);
                }
            } catch (error) {
                console.error(`Diagnostic PWA: Erreur lors de la vérification de l'icône ${icon.src}:`, error);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Diagnostic PWA: Erreur lors de la vérification du manifeste:', error);
        return false;
    }
}

// Fonction pour vérifier l'événement 'beforeinstallprompt'
function checkInstallPrompt() {
    console.log('Diagnostic PWA: Configuration de la détection de l\'événement beforeinstallprompt...');
    
    // Vérifier les critères d'installation
    const criteria = [
        { description: 'Utilisation de HTTPS', value: window.location.protocol === 'https:' },
        { description: 'Service Worker enregistré', value: 'serviceWorker' in navigator }
    ];
    
    // Afficher les critères dans la console
    console.log('Diagnostic PWA: Critères d\'installation:');
    criteria.forEach(c => console.log(`- ${c.description}: ${c.value ? 'Oui' : 'Non'}`));
    
    // Si en localhost, ajouter une note spéciale
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Diagnostic PWA: En développement local (localhost), l\'installation est possible sans HTTPS');
    }
    
    // Surveiller l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('Diagnostic PWA: Événement beforeinstallprompt déclenché!', e);
        // Empêcher Chrome d'afficher automatiquement la fenêtre
        e.preventDefault();
        
        // Stocker l'événement pour une utilisation ultérieure
        window.deferredPrompt = e;
        
        // Créer un bouton d'installation manuel
        const installContainer = document.createElement('div');
        installContainer.id = 'pwa-install-debug';
        installContainer.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: #03173d; color: white; 
                        padding: 15px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 9999;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">Installer l'application</p>
                <button id="pwa-install-debug-btn" style="background: white; color: #03173d; border: none; 
                                                           padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    Installer maintenant
                </button>
            </div>
        `;
        document.body.appendChild(installContainer);
        
        // Ajouter l'événement de clic
        document.getElementById('pwa-install-debug-btn').addEventListener('click', async () => {
            if (!window.deferredPrompt) {
                console.log('Diagnostic PWA: La référence à l\'événement d\'installation a été perdue');
                return;
            }
            
            // Afficher la fenêtre d'installation
            window.deferredPrompt.prompt();
            
            // Attendre que l'utilisateur réponde
            const choiceResult = await window.deferredPrompt.userChoice;
            console.log('Diagnostic PWA: Résultat du choix d\'installation:', choiceResult.outcome);
            
            // Effacer la référence
            window.deferredPrompt = null;
            
            // Supprimer le bouton
            document.getElementById('pwa-install-debug').remove();
        });
        
        console.log('Diagnostic PWA: Bouton d\'installation manuel ajouté à la page');
    });
    
    // Surveiller si l'application est déjà installée
    window.addEventListener('appinstalled', (e) => {
        console.log('Diagnostic PWA: Application installée!', e);
    });
}

// Fonction principale pour exécuter toutes les vérifications
async function runPwaChecks() {
    try {
        console.log('Diagnostic PWA: Démarrage des vérifications...');
        
        const manifestOk = await checkManifest();
        const serviceWorkerOk = await checkServiceWorkerStatus();
        
        if (manifestOk && serviceWorkerOk) {
            console.log('Diagnostic PWA: Configuration de base validée');
            checkInstallPrompt();
        } else {
            console.warn('Diagnostic PWA: Certaines vérifications ont échoué, l\'installation pourrait ne pas être possible');
        }
    } catch (error) {
        console.error('Diagnostic PWA: Erreur lors des vérifications:', error);
    }
}

// Exporter les fonctions pour les rendre disponibles à l'extérieur
window.pwaDiagnostic = {
    runChecks: runPwaChecks,
    checkServiceWorker: checkServiceWorkerStatus,
    checkManifest: checkManifest
};
