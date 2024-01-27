import { ConnectedPeerCounter } from "./ConnectedPeerCounter"
import { HomecoinBalance } from "./HomecoinBalance"
import "../../styles/Header.css"
import { PendingTransactions } from "./PendingTransactions"
import { NewTransactionCard } from "./NewTransactionCard"
import { Button } from "@chakra-ui/react"
import { SettingsIcon } from "@chakra-ui/icons"

export const Header = (props) => {

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
                <Button size="lg" variant="outline" colorScheme="blue" leftIcon={<SettingsIcon />}>
                    Settings
                </Button>
            </div>
        </div>
    )
}