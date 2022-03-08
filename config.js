import { initializeApp } from "firebase/app"

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyB_OtGwExSWok51CrZbbWi6Iejpig1L5Nk",
  authDomain: "dynamictimetable-ebd1d.firebaseapp.com",
  projectId: "dynamictimetable-ebd1d",
  storageBucket: "dynamictimetable-ebd1d.appspot.com",
  messagingSenderId: "33867548746",
  appId: "1:33867548746:web:5d183b16a32311ca4bbeb3"
};

// alternate config, un-comment if exceed daily requests

/*const firebaseConfig = {
  apiKey: "AIzaSyCaCS5GdFs5V-ZDBaWAhKlJt9pET5Wbvfs",
  authDomain: "dynamictimetable-alternate.firebaseapp.com",
  projectId: "dynamictimetable-alternate",
  storageBucket: "dynamictimetable-alternate.appspot.com",
  messagingSenderId: "951835937440",
  appId: "1:951835937440:web:976d7d6d3c5520539417c5"
};*/

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;