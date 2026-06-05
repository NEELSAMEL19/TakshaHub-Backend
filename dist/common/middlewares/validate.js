export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: result.error.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
    }
    if ("body" in result.data) {
        req.body = result.data.body;
    }
    next();
};
//# sourceMappingURL=validate.js.map