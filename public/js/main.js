// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registration successful:', registration);
        } catch (err) {
            console.error('ServiceWorker registration failed:', err);
        }
    });
}

// Install Button Logic
let deferredPrompt;
const installButton = document.getElementById('installButton');
const installButtonMobile = document.getElementById('installButtonMobile');

// Function to handle install click
const handleInstallClick = async (e) => {
    e.preventDefault();
    if (!deferredPrompt) {
        console.log('No installation prompt available');
        return;
    }

    try {
        // Show the installation prompt
        const result = await deferredPrompt.prompt();
        console.log('Install prompt result:', result);
        
        // Wait for the user to respond to the prompt
        const choiceResult = await deferredPrompt.userChoice;
        console.log('User choice:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            if (installButton) installButton.style.display = 'none';
            if (installButtonMobile) installButtonMobile.style.display = 'none';
        } else {
            console.log('User dismissed the install prompt');
        }
    } catch (err) {
        console.error('Error during installation:', err);
    }

    // Clear the deferredPrompt so it can't be used again
    deferredPrompt = null;
};

// Check if app can be installed
const checkInstallable = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        // App is already installed
        if (installButton) installButton.style.display = 'none';
        if (installButtonMobile) installButtonMobile.style.display = 'none';
        return false;
    }
    return true;
};

// Add event listeners
if (installButton) {
    installButton.addEventListener('click', handleInstallClick);
}
if (installButtonMobile) {
    installButtonMobile.addEventListener('click', handleInstallClick);
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install buttons if app is installable
    if (checkInstallable()) {
        if (installButton) installButton.style.display = 'flex';
        if (installButtonMobile) installButtonMobile.style.display = 'block';
    }
    
    console.log('beforeinstallprompt event was fired');
});

// Listen for successful installation
window.addEventListener('appinstalled', (evt) => {
    // Hide the install buttons
    if (installButton) installButton.style.display = 'none';
    if (installButtonMobile) installButtonMobile.style.display = 'none';
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    console.log('App was successfully installed');
    
    // Optionally show a success message
    if (window.M && M.toast) {
        M.toast({html: 'App successfully installed!'});
    }
}); 