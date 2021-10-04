import * as Firebase from "firebase";
require("@firebase/firestore")

const firebaseConfig = {
    apiKey: "AIzaSyDhCDpaYcNXnVi45Zb44rkIBbAirHC86TM",
    authDomain: "wireless-library-3c0e5.firebaseapp.com",
    projectId: "wireless-library-3c0e5",
    storageBucket: "wireless-library-3c0e5.appspot.com",
    messagingSenderId: "574317121218",
    appId: "1:574317121218:web:8a1fb8f0c665a541deb55b"
  };
   firebase.initializeApp(firebaseConfig);  
   export default firebase.firestore();