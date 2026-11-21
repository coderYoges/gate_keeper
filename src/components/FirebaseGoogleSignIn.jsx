import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import styled from 'styled-components'
import { auth } from '../firebase'
import { ErrorMessage, Hint } from './FormPrimitives'

const SignInLayout = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
`

const SignInPanel = styled.section`
  width: min(420px, 100%);
  display: grid;
  gap: 16px;
  padding: 28px;
  border: 1px solid #26332c;
  border-radius: 12px;
  background: #151d18;

  h1 {
    margin: 0;
    color: #edf3ef;
    font-size: 22px;
  }

  p {
    margin: 0;
    color: #9aa79f;
    font-size: 12px;
    line-height: 1.55;
  }
`

const GoogleSignInButton = styled.button`
  min-height: 42px;
  border: 1px solid #c8f169;
  border-radius: 7px;
  background: #c8f169;
  color: #17231e;
  font-size: 13px;
  font-weight: 700;

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`

const authErrorMessages = {
  'auth/unauthorized-domain': 'Add this site to Firebase Authentication’s authorized domains.',
  'auth/popup-blocked': 'Allow pop-ups for this site, then try again.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before sign-in completed.',
  'auth/cancelled-popup-request': 'A sign-in request is already in progress. Try again in a moment.',
  'auth/operation-not-allowed': 'Enable Google sign-in in Firebase Authentication before continuing.',
  'auth/network-request-failed': 'The network request failed. Check your connection and try again.',
}

function getAuthErrorMessage(error) {
  return authErrorMessages[error?.code]
    || `Google sign-in failed${error?.code ? ` (${error.code})` : ''}. Please try again.`
}

export function FirebaseGoogleSignIn({ checkingAuth, error: authStateError }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn() {
    setLoading(true)
    setError('')

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    } catch (signInError) {
      console.error('Firebase Google sign-in failed.', { code: signInError?.code })
      setError(getAuthErrorMessage(signInError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SignInLayout>
      <SignInPanel aria-labelledby="google-sign-in-title">
        <h1 id="google-sign-in-title">{checkingAuth ? 'Checking sign-in…' : 'Sign in to continue'}</h1>
        <p>Sign in with your Google account to securely save session records.</p>
        {authStateError && <ErrorMessage role="alert">{authStateError}</ErrorMessage>}
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        <GoogleSignInButton type="button" onClick={handleSignIn} disabled={checkingAuth || loading}>
          {checkingAuth ? 'Checking…' : loading ? 'Signing in…' : 'Continue with Google'}
        </GoogleSignInButton>
        <Hint>Your account must use Google sign-in enabled for this Firebase project.</Hint>
      </SignInPanel>
    </SignInLayout>
  )
}
