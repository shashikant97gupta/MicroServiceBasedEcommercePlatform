export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(
        message:string,
        statusCode: number,
        isOperational: true,
        details?: any
    ) {
        super(message)
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this);
        }
    }
}

// Not found error
export class NotFoundError extends AppError {
    constructor(message = "Resources not found"){
        super(message, 404, true)
    }
}

// validation error (use for zoi/zod/react-hook-form validation errors)
export class ValidationError extends AppError {
    constructor(message = "Invalid request data", details?:any){
        super(message, 400, true, details)
    }
}

// Authentication error
export class AuthError extends AppError {
    constructor(message = "Unauthorizes"){
        super(message, 401, true)
    }
}

// Forbidden error (for insufficient permission)
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden access"){
        super(message, 403, true)
    }
}

// Database Error (for mongodb/postgres)
export class DatabaseError extends AppError {
    constructor(message = "Database error", details?:any){
        super(message, 500, true, details);
    }
}

// Rate Limit Error (if user exceeds API limits)
export class RateLimitError extends AppError {
    constructor(message = "Too many requests, please try again later", details?:any){
        super(message, 429, true);
    }
}