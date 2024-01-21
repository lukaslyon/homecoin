import { useContext } from "react";
import { PeerContext } from "../contexts/PeerProvider";

const PeerItem = (props) => {

    const { peer } = useContext(PeerContext)

    return(
        <li>
            {props.label}
        </li>
    )
}

const PeerSelector = () => {

    const { nodes } = useContext(PeerContext)
    
    return(
        <ul>
            {nodes.map((n) => {
                return(<PeerItem label={n} key={n} />)
            })}
        </ul>
    )
}

export default PeerSelector;