import { initializeApp, getApp, getApps } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

let persistencePromise = null

function ensureFirebase() {
  if (!auth || !db) {
    throw new Error('Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* environment variables.')
  }
}

function ensurePersistence() {
  if (!auth) return Promise.resolve()
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence)
  }
  return persistencePromise
}

export async function signInWithGoogle() {
  ensureFirebase()
  await ensurePersistence()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(auth, provider)
  await saveUser(result.user)
  return result
}

export async function signOutUser() {
  if (!auth) return
  await signOut(auth)
}

export async function saveUser(user) {
  ensureFirebase()

  if (!user) return
  

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      lastLogin: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function saveFeedback({ user, rating, feedback }) {
  ensureFirebase()
  if (!user) {
    throw new Error('Please sign in before submitting feedback.')
  }

  return addDoc(collection(db, 'feedback'), {
    uid: user.uid,
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    rating,
    feedback,
    createdAt: serverTimestamp(),
    appVersion: 'v1.0',
  })
}

export async function saveMealPlan({ user, weight, state, dietType, mealsPerDay, plan }) {
  ensureFirebase()
  if (!user) return null

  return addDoc(collection(db, 'mealPlans'), {
    userId: user.uid,
    displayName: user.displayName || '',
    email: user.email || '',
    createdAt: serverTimestamp(),
    weight,
    state,
    dietType,
    mealsPerDay,
    plan,
  })
}

export async function getMealPlans(userId) {
  ensureFirebase()
  if (!userId) return []

  const plansQuery = query(
    collection(db, 'mealPlans'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(plansQuery)

  return snapshot.docs.map(mealPlanDoc => ({
    id: mealPlanDoc.id,
    ...mealPlanDoc.data(),
  }))
}

export async function deleteMealPlan(planId) {
  ensureFirebase()
  if (!planId) return

  await deleteDoc(doc(db, 'mealPlans', planId))
}
