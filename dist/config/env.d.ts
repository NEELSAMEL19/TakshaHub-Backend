declare const env: {
    NODE_ENV: "development" | "production" | "test";
    DATABASE_URL: string;
    OTP_SECRET: string;
    JWT_ACCESS_SECRET: string;
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    PORT?: string | undefined;
    BCRYPT_ROUNDS?: string | undefined;
    LOG_LEVEL?: string | undefined;
    MAIL_USER?: string | undefined;
    MAIL_PASSWORD?: string | undefined;
    CORS_ORIGIN?: string | undefined;
};
export default env;
//# sourceMappingURL=env.d.ts.map