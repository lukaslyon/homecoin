import { useContext } from "react"
import { ChainContext } from "../contexts/ChainProvider"
import { Block } from "./Block"
import "../../styles/Block.css"

export const TransactionBrowser = (props) => {
    const { unminedBlocks } = useContext(ChainContext)
    return(
        <div className="chain-browser-container">
            <div className="chain-browser">
                {
                    unminedBlocks.toReversed().map((block) => {
                        return(
                            <Block key={block.header.merkleRoot} block={block}/>
                        )
                    })
                }
            </div>
        </div>
    )
}