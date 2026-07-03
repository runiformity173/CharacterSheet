const CHECK_MOD = 2147483647;
let currentChecksum;
function getChecksum(object) {
    let total = 0;
    if (Array.isArray(object)) {
        let j = 0;
        for (const i of object) total += getChecksum(i)*++j;
    } else if (typeof object === 'object' && object !== null) {
        for (const [i, j] of Object.entries(object)) {
            total += getChecksum(i) * getChecksum(j);
        }
    } else if (typeof object === 'string') {
        let j = 0;
        for (const i of object) {
            total += i.charCodeAt(0)*++j;
        }
    } else if (typeof object=== "number") {
        total += object;
    } else if (typeof object === "boolean") {
        total += 1007*(1 + object);
    } else {
        console.log(object, typeof object);
    }
    return total % CHECK_MOD;
}