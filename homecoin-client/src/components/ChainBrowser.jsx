import { useContext } from "react"
import { ChainContext } from "../contexts/ChainProvider"
import { BlockCard } from "./BlockCard"
import "../../styles/Block.css"

export const ChainBrowser = (props) => {
    const { chain } = useContext(ChainContext)
    return(
        <div className="chain-browser-container">
            <div className="chain-browser">
                {
                    chain.chain.toReversed().map((block) => {
                        return(
                            <BlockCard key={block.header.merkleRoot} block={block}/>
                        )
                    })
                }
            </div>
        </div>
    )
}