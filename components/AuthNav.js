import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function AuthNav({ user, loading, isConfigured, onSignIn, onSignOut }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const displayName = user?.displayName || user?.email || 'User'
  const email = user?.email || ''

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleAuth(action) {
    setError('')
    setBusy(true)
    try {
      await action()
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className={styles.authArea}>
        <Link href="/about" className={styles.authButton}>About Plan Well</Link>
        <p className={styles.authNotice}>Firebase setup required</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.authArea}>
        <Link href="/about" className={styles.authButton}>About Plan Well</Link>
        <p className={styles.authNotice}>Checking sign in...</p>
      </div>
    )
  }

  return (
    <div className={styles.authArea}>
      {user ? (
        <>
          <Link href="/about" className={styles.authButton}>About Plan Well</Link>
          <div className={styles.userMenu} ref={profileRef}>
            <button
              type="button"
              className={styles.userNameButton}
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userChevron} aria-hidden="true">&#9662;</span>
            </button>
            {profileOpen && (
              <div className={styles.userDropdown}>
                <p className={styles.dropdownName}>{displayName}</p>
                <p className={styles.dropdownEmail}>{email}</p>
              </div>
            )}
          </div>
          <Link href="/my-plans" className={styles.authButton}>My Meal Plans</Link>
          <button type="button" className={styles.authButton} onClick={() => handleAuth(onSignOut)} disabled={busy}>
            {busy ? 'Signing out...' : 'Logout'}
          </button>
        </>
      ) : (
        <>
          <Link href="/about" className={styles.authButton}>About Plan Well</Link>
          <button type="button" className={styles.authButton} onClick={() => handleAuth(onSignIn)} disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </>
      )}
      {error && <p className={styles.authError}>{error}</p>}
    </div>
  )
}
