import { useState, createContext, useEffect } from "react";
import { generateKeyPair, publicKeyToHex, privateKeyToHex, digest } from "../crypto/subtle";
import useIndexedDB from "../hooks/useIndexedDB";

export const KeyContext = createContext()

export const KeyProvider = (props) => {
    const [keyPair, setKeyPair, keyPairLoaded] = useIndexedDB("keyPair", "homecoin", {})
    const [publicHex, setPublicHex] = useState("")
    const [uuid, setUUID] = useState("")

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

    useEffect(() => {
        if (publicHex !== ""){
            digest(publicHex).then((hash) => {
                setUUID(`${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`)
            })
        }
    }, [publicHex])

    return (
        <KeyContext.Provider value={{keyPair, publicHex, uuid, keyPairLoaded}}>
            {props.children}
        </KeyContext.Provider>
    )

}