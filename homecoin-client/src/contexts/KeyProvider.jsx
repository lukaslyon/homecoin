import { useState, createContext, useEffect } from "react";
import { generateKeyPair, publicKeyToHex, privateKeyToHex } from "../crypto/subtle";
import useIndexedDB from "../hooks/useIndexedDB";

export const KeyContext = createContext()

export const KeyProvider = (props) => {
    const [keyPair, setKeyPair, keyPairLoaded] = useIndexedDB("keyPair", "homecoin", {})
    const [publicHex, setPublicHex] = useState("")

    useEffect(() => {
        if ((Object.keys(keyPair).length === 0)&&keyPairLoaded){
            generateKeyPair()
            .then((kp) => {
                setKeyPair(kp)
            })
        }
        if ((Object.keys(keyPair).length !== 0)&&keyPairLoaded) {
            publicKeyToHex(keyPair.publicKey).then((hex) => {
            setPublicHex(hex)
        })}

    },[keyPair, keyPairLoaded, publicHex])

    return (
        <KeyContext.Provider value={{keyPair, publicHex}}>
            {props.children}
        </KeyContext.Provider>
    )

}