import { useContext } from "react"
import { PeerProvider } from "./contexts/PeerProvider"
import PeerSelector from "./components/PeerSelector"
import { Login } from "./pages/Login"

function App() {

  return (
    <PeerProvider>
      <Login />
    </PeerProvider>
  )
}

export default App
