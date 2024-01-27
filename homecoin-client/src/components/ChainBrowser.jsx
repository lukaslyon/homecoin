import { useContext } from "react"
import { ChainContext } from "../contexts/ChainProvider"
import { Block } from "./Block"
import "../../styles/Block.css"

export const ChainBrowser = (props) => {
    const { chain } = useContext(ChainContext)
    return(
        <div className="chain-browser-container">
            <div className="chain-browser">
                {
                    chain.chain.toReversed().map((block) => {
                        return(
                            <Block key={block.header.merkleRoot} block={block}/>
                        )
                    })
                }
            </div>
        </div>
    )
}