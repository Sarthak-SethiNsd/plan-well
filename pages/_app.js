import { useEffect } from 'react'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    function preventNumberInputWheelChange() {
      const activeElement = document.activeElement
      if (activeElement instanceof HTMLInputElement && activeElement.type === 'number') activeElement.blur()
    }

    document.addEventListener('wheel', preventNumberInputWheelChange, true)
    return () => document.removeEventListener('wheel', preventNumberInputWheelChange, true)
  }, [])

  return <Component {...pageProps} />
}
