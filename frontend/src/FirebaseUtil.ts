//import * as firebaseLib from "firebase/app";
import firebase from "firebase";

/**
 * utter hack to avoid static module loading from Firebase.
 */
export function firebaseInit() {
  var firebaseConfig = {
    "projectId": "elder-telemed",
    "appId": "1:449738671107:web:e88aa19cb1688f69343a36",
    "databaseURL": "https://elder-telemed.firebaseio.com",
    "storageBucket": "elder-telemed.appspot.com",
    "locationId": "us-central",
    "apiKey": "AIzaSyCptwwtXCqGWlNnuCh7EVbAXdkwm4_jLoA",
    "authDomain": "elder-telemed.firebaseapp.com",
    "messagingSenderId": "449738671107",
    "measurementId": "G-B41Z646WGM"
  };
  if (firebaseConfig) {
    firebase.initializeApp(firebaseConfig);
  }
};
