export declare class AuthService {
    private static getUserResponse;
    private static createToken;
    static register(data: any): Promise<{
        message: string;
    }>;
    static verifyOtp(data: any): Promise<{
        message: string;
        user: any;
        token: string;
    }>;
    static resendOtp(data: any): Promise<{
        message: string;
    }>;
    static login(data: any): Promise<any>;
    static getCurrentUser(userId: string): Promise<any>;
}
//# sourceMappingURL=auth.service.d.ts.map