// The Firebase service worker needs to know our app's configuration
// in order to correctly receive background push notifications.

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// This uses the explicit values because process.env is not available in a service worker.
const firebaseConfig = {
    apiKey: "AIzaSyC1zBAdkHa6DgeHwb71bcGtCvfl43eAY0g",
    authDomain: "gsstore-79ac2.firebaseapp.com",
    projectId: "gsstore-79ac2",
    storageBucket: "gsstore-79ac2.firebasestorage.app",
    messagingSenderId: "848039396273",
    appId: "1:848039396273:web:9625574716c4b7c3c0f390",
    measurementId: "G-M93D0X2PNM"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/vite.svg'
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (error) {
    console.error('Failed to initialize Firebase in service worker', error);
}
