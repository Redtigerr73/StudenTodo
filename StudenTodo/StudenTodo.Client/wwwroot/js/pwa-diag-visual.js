// Script de diagnostic PWA avec affichage visuel des résultats
window.pwaDiagnosticVisual = {
    results: [],
    
    init: function() {
        this.checkPWAStatus()
            .then(() => this.displayResults());
    },
    
    addResult: function(test, success, message) {
        this.results.push({
            test: test,
            success: success,
            message: message
        });
        console.log(`Test PWA [${success ? 'RÉUSSI' : 'ÉCHEC'}]: ${test} - ${message}`);
    },
    
    async checkPWAStatus: function() {
        // 1. Vérifier si le navigateur supporte les PWA
        const hasServiceWorker = 'serviceWorker' in navigator;
        this.addResult(
            'Support Service Worker',
            hasServiceWorker,
            hasServiceWorker ? 'Le navigateur supporte les service workers' : 'Le navigateur ne supporte pas les service workers'
        );
        
        if (!hasServiceWorker) return;
        
        // 2. Vérifier si le protocole est sécurisé
        const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        this.addResult(
            'Contexte sécurisé',
            isSecureContext,
            isSecureContext ? 'L\'application est servie dans un contexte sécurisé' : 'L\'application n\'est pas servie via HTTPS ou localhost'
        );
        
        // 3. Vérifier le manifest.json
        try {
            const manifestResponse = await fetch('manifest.json');
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();
                
                // Vérifier les champs obligatoires
                const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
                const missingFields = requiredFields.filter(field => !manifest[field]);
                
                this.addResult(
                    'Manifest.json valide',
                    missingFields.length === 0,
                    missingFields.length === 0 
                        ? 'Le manifest.json contient tous les champs requis' 
                        : `Le manifest.json est invalide. Champs manquants: ${missingFields.join(', ')}`
                );
                
                // Vérifier les icônes
                if (manifest.icons && manifest.icons.length > 0) {
                    const has192 = manifest.icons.some(icon => icon.sizes === '192x192');
                    const has512 = manifest.icons.some(icon => icon.sizes === '512x512');
                    
                    this.addResult(
                        'Icônes 192x192 et 512x512',
                        has192 && has512,
                        has192 && has512 
                            ? 'Les icônes 192x192 et 512x512 sont présentes' 
                            : `Icônes manquantes: ${!has192 ? '192x192' : ''} ${!has512 ? '512x512' : ''}`
                    );
                    
                    // Vérifier l'existence des icônes
                    for (const icon of manifest.icons) {
                        try {
                            const iconResponse = await fetch(icon.src);
                            this.addResult(
                                `Icône ${icon.src}`,
                                iconResponse.ok,
                                iconResponse.ok 
                                    ? `L'icône ${icon.src} est accessible` 
                                    : `L'icône ${icon.src} n'est pas accessible (${iconResponse.status})`
                            );
                        } catch (e) {
                            this.addResult(
                                `Icône ${icon.src}`,
                                false,
                                `Erreur lors de l'accès à l'icône ${icon.src}: ${e.message}`
                            );
                        }
                    }
                } else {
                    this.addResult('Icônes dans manifest', false, 'Aucune icône définie dans le manifest');
                }
            } else {
                this.addResult(
                    'Accès au manifest.json',
                    false,
                    `Impossible d'accéder au manifest.json (${manifestResponse.status})`
                );
            }
        } catch (e) {
            this.addResult('Accès au manifest.json', false, `Erreur lors de l'accès au manifest.json: ${e.message}`);
        }
        
        // 4. Vérifier l'état du service worker
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            this.addResult(
                'Service Worker enregistré',
                registrations.length > 0,
                registrations.length > 0 
                    ? `${registrations.length} service worker(s) enregistré(s)` 
                    : 'Aucun service worker enregistré'
            );
            
            if (registrations.length > 0) {
                registrations.forEach((reg, index) => {
                    this.addResult(
                        `Service Worker #${index + 1}`,
                        true,
                        `Scope: ${reg.scope}, État: ${reg.active ? 'Actif' : 'Inactif'}`
                    );
                });
            }
        } catch (e) {
            this.addResult(
                'Vérification des service workers',
                false,
                `Erreur lors de la vérification des service workers: ${e.message}`
            );
        }
        
        // 5. Vérifier si l'événement beforeinstallprompt peut être déclenché
        this.addResult(
            'Événement beforeinstallprompt',
            true,
            'En attente de l\'événement beforeinstallprompt. Si l\'application est déjà installée ou ne remplit pas les critères, cet événement ne sera pas déclenché.'
        );
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            this.addResult(
                'Événement beforeinstallprompt',
                true,
                'Événement beforeinstallprompt déclenché! L\'application peut être installée.'
            );
            this.displayResults();
            
            // Afficher un bouton d'installation d'urgence
            this.displayInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            this.addResult(
                'Installation PWA',
                true,
                'L\'application a été installée avec succès!'
            );
            window.deferredPrompt = null;
            this.displayResults();
        });
    },
    
    displayResults: function() {
        // Créer ou mettre à jour le conteneur de résultats
        let container = document.getElementById('pwa-diagnostic-results');
        if (!container) {
            container = document.createElement('div');
            container.id = 'pwa-diagnostic-results';
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.right = '10px';
            container.style.backgroundColor = '#fff';
            container.style.border = '1px solid #ccc';
            container.style.borderRadius = '5px';
            container.style.padding = '10px';
            container.style.zIndex = '9999';
            container.style.maxWidth = '400px';
            container.style.maxHeight = '80vh';
            container.style.overflow = 'auto';
            container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // Ajouter un titre
            const title = document.createElement('h3');
            title.textContent = 'Diagnostic PWA';
            title.style.margin = '0 0 10px 0';
            title.style.padding = '0 0 5px 0';
            title.style.borderBottom = '1px solid #ccc';
            container.appendChild(title);
            
            // Ajouter un bouton pour fermer
            const closeButton = document.createElement('button');
            closeButton.textContent = 'X';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '5px';
            closeButton.style.right = '5px';
            closeButton.style.border = 'none';
            closeButton.style.background = 'none';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '16px';
            closeButton.onclick = function() {
                container.style.display = 'none';
            };
            container.appendChild(closeButton);
            
            document.body.appendChild(container);
        }
        
        // Vider le conteneur
        while (container.childNodes.length > 2) {
            container.removeChild(container.lastChild);
        }
        
        // Afficher les résultats
        for (const result of this.results) {
            const resultElement = document.createElement('div');
            resultElement.style.marginBottom = '5px';
            resultElement.style.padding = '5px';
            resultElement.style.borderLeft = `3px solid ${result.success ? 'green' : 'red'}`;
            
            const testName = document.createElement('div');
            testName.textContent = result.test;
            testName.style.fontWeight = 'bold';
            
            const testMessage = document.createElement('div');
            testMessage.textContent = result.message;
            testMessage.style.fontSize = '0.9em';
            testMessage.style.color = '#666';
            
            resultElement.appendChild(testName);
            resultElement.appendChild(testMessage);
            container.appendChild(resultElement);
        }
    },
    
    displayInstallButton: function() {
        // Ne rien faire si le bouton existe déjà ou s'il n'y a pas d'événement d'installation
        if (document.getElementById('pwa-install-emergency') || !window.deferredPrompt) {
            return;
        }
        
        const button = document.createElement('button');
        button.id = 'pwa-install-emergency';
        button.textContent = 'Installer l\'application';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.left = '50%';
        button.style.transform = 'translateX(-50%)';
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '10000';
        button.style.fontSize = '16px';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        
        button.onclick = async () => {
            if (!window.deferredPrompt) {
                return;
            }
            
            // Afficher l'invite d'installation
            window.deferredPrompt.prompt();
            
            // Attendre la réponse de l'utilisateur
            const { outcome } = await window.deferredPrompt.userChoice;
            
            // Mettre à jour les résultats
            this.addResult(
                'Réponse à l\'installation',
                outcome === 'accepted',
                outcome === 'accepted' 
                    ? 'L\'utilisateur a accepté l\'installation' 
                    : 'L\'utilisateur a refusé l\'installation'
            );
            
            // Effacer la référence
            window.deferredPrompt = null;
            
            // Supprimer le bouton
            button.remove();
            
            // Mettre à jour l'affichage des résultats
            this.displayResults();
        };
        
        document.body.appendChild(button);
    }
};

// Initialiser le diagnostic quand la page est chargée
window.addEventListener('load', () => {
    // Attendre un peu pour s'assurer que tout est chargé
    setTimeout(() => {
        window.pwaDiagnosticVisual.init();
    }, 1000);
});
