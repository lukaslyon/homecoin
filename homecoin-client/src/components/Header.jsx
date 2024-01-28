import { ConnectedPeerCounter } from "./ConnectedPeerCounter"
import { HomecoinBalance } from "./HomecoinBalance"
import "../../styles/Header.css"
import { PendingTransactions } from "./PendingTransactions"
import { NewTransactionCard } from "./NewTransactionCard"
import { Button, useDisclosure } from "@chakra-ui/react"
import { SettingsIcon } from "@chakra-ui/icons"
import { SettingsModal } from "./SettingsModal"

export const Header = (props) => {

    const {isOpen, onOpen, onClose} = useDisclosure()

    return(
        <div className="page-header">
            <div className="stat-cards-container">
                <div className="stat-cards">
                    <NewTransactionCard onModalOpen={props.onModalOpen}/>
                    <HomecoinBalance />
                    <PendingTransactions />
                    <ConnectedPeerCounter />
                </div>
            </div>
            <div className="settings-box">
                <Button size="lg" variant="outline" colorScheme="blue" leftIcon={<SettingsIcon />} onClick={onOpen}>
                    Settings
                </Button>
            </div>
            <SettingsModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
        </div>
    )
}