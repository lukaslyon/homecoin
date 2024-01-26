const stringToUint = (string) => {
    const _string = btoa(encodeURIComponent(string))
    const charList = _string.split('')
    const uintArray = []
    for (var i = 0; i < charList.length; i++) {
        uintArray.push(charList[i].charCodeAt(0))
    }
    return new Uint8Array(uintArray)
}

const uintToString = (uintArray) => {
    const encodedString = String.fromCharCode.apply(null, uintArray)
    const decodedString = decodeURIComponent(atob(encodedString))
    return decodedString
}

const jsonToArrayBuffer = (data) => {
    return new TextEncoder().encode(JSON.stringify(data))
}

const stringToArrayBuffer = (string) => {
    return new TextEncoder().encode(string)
}

const arrayBufferToBase64 = (ab) => {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(ab)))
}

const arrayBufferToHex = (buffer) => { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

const hexToArrayBuffer = (hex) => {
    return new Uint8Array(hex.match(/../g).map(h=>parseInt(h,16))).buffer
}

export const digest = (data) => {
    return new Promise((res, rej) => {
        var _data
        if (typeof(data) === 'string'){
            _data = stringToArrayBuffer(data)
        }
        else if (typeof(data) === 'object'){
            _data = jsonToArrayBuffer(data)
        }
        else rej("Invalid Data Type")
        window.crypto.subtle.digest("SHA-1", _data).then((hash) => {
            const _hash = arrayBufferToHex(hash)
            res(_hash)
        }).catch((err) => {
            rej(err)
        })
    })
}

export const sign = (key, data) => {
    return new Promise((res, rej) => {
        const _data = jsonToArrayBuffer(data)
        window.crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, _data).then((signature) => {
            res(arrayBufferToHex(signature))
        }).catch((err) => {
            rej(err)
        })
    })
}

export const generateKeyPair = () => {
    return new Promise((res, rej) => {
        window.crypto.subtle.generateKey(
            {
                name: "RSASSA-PKCS1-v1_5",
                modulusLength: 2048,
                hash: "SHA-256",
                publicExponent: new Uint8Array([1,0,1])
            },
            true,
            ['sign', 'verify'])
        .then((keypair) => {
            res(keypair)})
        .catch((err) => {
            rej(err)
        })
    })
}

export const publicKeyToHex = (key) => {
    return new Promise((res, rej) => {
        window.crypto.subtle.exportKey("spki", key)
        .then((keyBuffer) => {
            res(arrayBufferToHex(keyBuffer))
        })
        .catch((err) => {
            rej(err)
        })
    })
}

export const privateKeyToHex = (key) => {
    return new Promise((res, rej) => {
        window.crypto.subtle.exportKey("pkcs8", key)
        .then((keyBuffer) => {
            res(arrayBufferToHex(keyBuffer))
        })
        .catch((err) => {
            rej(err)
        })
    })
}

export const hexToPublicKey = (key) => {
    return new Promise((res, rej) => {
        window.crypto.subtle.importKey("spki", hexToArrayBuffer(key), {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            hash: "SHA-256",
            publicExponent: new Uint8Array([1,0,1])
        }, true, ["verify"])
        .then((key) => {
            res(key)
        })
    })

}

export const hexToKeyPair = (keyPair) => {
    return new Promise((res, rej) => {
        const _keyPair = {
            publicKey: null,
            privateKey: null
        }
        window.crypto.subtle.importKey("spki", hexToArrayBuffer(keyPair.publicKey), {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            hash: "SHA-256",
            publicExponent: new Uint8Array([1,0,1])
        }, true, ["verify"])
        .then((cryptoKey) => {
            _keyPair.publicKey = cryptoKey
            window.crypto.subtle.importKey("pkcs8", hexToArrayBuffer(keyPair.privateKey), {
                name: "RSASSA-PKCS1-v1_5",
                modulusLength: 2048,
                hash: "SHA-256",
                publicExponent: new Uint8Array([1,0,1])
            }, true, ["sign"])
            .then((cryptoKey) => {
                _keyPair.privateKey = cryptoKey
                res(_keyPair)
            })
            .catch((err) => {
                rej(err)
            })
        })
        .catch((err) => {
            rej(err)
        })
    })
}

export const verifySignature = (publicKey, data, signature) => {
    return new Promise((res, rej) => {
        window.crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, hexToArrayBuffer(signature), jsonToArrayBuffer(data))
        .then((valid) => {
            res(valid)
        })
        .catch((err) => {
            rej(err)
        })
    })
}
