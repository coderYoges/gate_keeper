import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`)
}

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

export async function saveSessionRecord(userId, sessionRecord) {
  if (auth.currentUser?.uid !== userId) {
    const error = new Error('The active Firebase user does not match the session owner.')
    error.code = 'auth/user-mismatch'
    throw error
  }

  const { sessionId, ...record } = sessionRecord
  await setDoc(doc(db, 'game-users', sessionId), {
    ...record,
    ownerUid: userId,
    createdAt: serverTimestamp(),
  })
}

export async function getSessionRecords(userId) {
  if (auth.currentUser?.uid !== userId) {
    const error = new Error('The active Firebase user does not match the session owner.')
    error.code = 'auth/user-mismatch'
    throw error
  }

  const recordsQuery = query(
    collection(db, 'game-users'),
    where('ownerUid', '==', userId),
  )
  const snapshot = await getDocs(recordsQuery)
  return snapshot.docs.map((record) => ({
    ...record.data(),
    sessionId: record.id,
  }))
}
