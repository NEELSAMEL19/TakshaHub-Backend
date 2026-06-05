export const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};
export const serializeBigInt = (obj) => {
    return JSON.parse(JSON.stringify(obj, (_, value) => typeof value === "bigint" ? value.toString() : value));
};
//# sourceMappingURL=utils.js.map