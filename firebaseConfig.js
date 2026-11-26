// firebaseConfig.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = process.env.FIREBASE_CREDENTIALS
  ? JSON.parse(process.env.FIREBASE_CREDENTIALS)
  : require('./chave-firebase.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = db;