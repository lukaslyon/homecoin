import Dexie from "dexie";

export const db = new Dexie("homecoin")

db.version(1).stores({
    cryptoKeys: "public, private, pair",
    chain: "id"
})