import { useContext, useLayoutEffect } from "react"
import { PeerContext, PeerProvider } from "./contexts/PeerProvider"
import PeerSelector from "./components/PeerSelector"
import { Login } from "./pages/Login"
import { Dashboard } from "./pages/Dashboard"
import { ChainProvider } from "./contexts/ChainProvider"

function App() {

  const { connected } = useContext(PeerContext)

  useLayoutEffect(() => {
    document.body.style.backgroundColor = "var(--gray-200, #CBD5E0)";
  })

  return (
    <>
      {connected ? <Dashboard /> : <Login />}
    </>
  )
}

export default App
