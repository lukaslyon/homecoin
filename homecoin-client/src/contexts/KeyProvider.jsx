import { useState, createContext } from "react";

const KeyContext = React.createContext()

const KeyProvider = (props) => {
    const [keyPair, setKeyPair] = useState(null);

    useEffect(() => {
        const keypair = window.crypto.subtle.generateKey(
            {
                name: "RSASSA-PKCS1-v1_5",
                modulusLength: 2048,
                hash: "SHA-256",
                publicExponent: new Uint8Array([1,0,1])
            },
            false,
            ['sign', 'verify']
        );
        setKeyPair(keypair);
    },[])

    return (
        <KeyKontext.Provider value={{loggedIn, setLoggedIn}}>
            {props.children}
        </KeyKontext.Provider>
    )

}