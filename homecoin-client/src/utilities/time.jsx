import moment from "moment";

export const formatDateTime = (timestamp) => {
    const date = new Date(timestamp)
    return moment(date).format()
}