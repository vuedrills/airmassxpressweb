/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    // Config from .env.local
    apiKey: "AIzaSyBPpSxq_HsxRJAUo7uE_TcCAhwTnHXyl-8",
    authDomain: "airmass-9ca5e.firebaseapp.com",
    projectId: "airmass-9ca5e",
    storageBucket: "airmass-9ca5e.firebasestorage.app",
    messagingSenderId: "471283919436",
    appId: "1:471283919436:web:57a89e342cc122897aa2e9",
    measurementId: "G-XK0GBHJK08"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png', // Ensure you have a logo
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);

    // Broadcast to all clients (pages) so they can update their UI
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'FCM_MESSAGE',
                payload: payload
            });
        });
    });
});
