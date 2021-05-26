function makeMethodsEnumerable(Class) {
    const proto = Class.prototype
    const protoDesc = Object.getOwnPropertyDescriptors(proto)
    for (let member in protoDesc) {
        if (protoDesc[member].value instanceof Function && member !== 'constructor') {
            protoDesc[member].enumerable = true;
        }
    }
    Object.defineProperties(Class.prototype, protoDesc)
}

module.exports = makeMethodsEnumerable;