export function merge(obj1: Object, obj2?: Object) {
    if (!obj2) return obj1;
    return {
        ...obj1,
        ...obj2,
    };
}
