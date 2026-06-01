import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCRcGE2KqSVy0KdYX0IHdek63KDbV4_Ku4",
  authDomain: "fir-dbad3.firebaseapp.com",
  projectId: "fir-dbad3",
  storageBucket: "fir-dbad3.firebasestorage.app",
  messagingSenderId: "983475345918",
  appId: "1:983475345918:web:16e651b5c55c8f0d7d08af",
  measurementId: "G-0FDMY0TTMB"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)