import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import { PeerProvider } from './contexts/PeerProvider.jsx'
import { KeyProvider } from './contexts/KeyProvider.jsx'
import { ChainProvider } from './contexts/ChainProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <ChakraProvider>
        <KeyProvider>
            <ChainProvider>
                <PeerProvider>
                    <App />
                </PeerProvider>
            </ChainProvider>
        </KeyProvider>
    </ChakraProvider>
)
