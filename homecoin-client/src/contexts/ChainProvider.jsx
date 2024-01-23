import { createContext, useState, useEffect } from "react";
import { PeerProvider } from "./PeerProvider";

export const ChainContext = createContext()

export const ChainProvider = (props) => {

    const [homecoinBalance, setHomecoinBalance] = useState(100.00)
    const [pendingTransactions, setPendingTransactions] = useState(0)

    const { connections } = useContext(PeerProvider)

    useEffect(() => {

    }, [connections])

    return(
        <ChainContext.Provider value={{homecoinBalance: homecoinBalance, pendingTransactions: pendingTransactions}}>
            {props.children}
        </ChainContext.Provider>
    )
}