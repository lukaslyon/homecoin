import { useContext } from "react"
import { ChainContext } from "../contexts/ChainProvider"
import { BlockCard } from "./BlockCard"
import "../../styles/Block.css"

export const TransactionBrowser = (props) => {
    const { unminedBlocks } = useContext(ChainContext)
    return(
        <div className="chain-browser-container">
            <div className="chain-browser">
                {
                    unminedBlocks.toReversed().map((block) => {
                        return(
                            <BlockCard key={block.header.id} block={block} unmined={true}/>
                        )
                    })
                }
            </div>
        </div>
    )
}