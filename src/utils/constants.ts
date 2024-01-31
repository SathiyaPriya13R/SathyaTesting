export default class AppConstants {
    REDIS_AUTH_TOKEN_KEYNAME = "Auth_tokenDetails"
    DBCONNECTION = {
        SUCCESSFUL: "Connected to DataBase",
        UNSUCCESSFUL: "DataBase connection error",
        ERROR: "DataBase connection error",
        RECONNECTED: "Reconnected to DataBase",
        DISCONNECTED: "DataBase disconnected. Reconnecting...",
        CONNECTED_SUCCESSFUL: "Connection has been established successfully.",
    };
    LOGGER_MESSAGE = {
        GET_DATA_TOKEN_FAILED: "getDataByToken - Error:",
        GET_DATA_TOKEN_INVALID: "getDataByToken - Invalid token",
        USER_VALIDATION_SUCCESSFUL: 'User validation successful',
        PASSWORD_CHANGE: 'Password changed successful',
        PASSWORD_CHANGE_FAILED: 'Password change failed',
        LOGIN_STARTED: 'Login function is started',
        LOGIN_FAILED: 'Login function is failed',
        LOGIN_COMPLETED: 'Login function is completed',
        PASSWORD_GENERATION: 'Password generated successful',
        PASSWORD_GENERATION_FAILED: 'Password generated failed',
        FORGET_PASSWORD: "Forget password function initiated",
        EMAIL_SEND: "Email send successful",
        EMAIL_SEND_FAILED: "Email send failed",
        FORGET_PASSWORD_COMPLETED: "Forget password function completed",
        FORGET_PASSWORD_FAILED: "Forget password failed",
        USER_NOT_FOUND: "User Not found for the email you provide",
        UPDATE_PASSWORD: "Update password function initiated",
        UPDATE_PASSWORD_COMPLETED: "Updated password function completed",
        UPDATE_PASSWORD_FAILED: "Updated password function failed",
        MIST_TOKEN_OTHER_SERVICE_START: "MIST token generation service call started ",
        MIST_TOKEN_OTHER_SERVICE_COMPLETED: "MIST token generation service call completed ",
        TERMS_OF_SERVICE: 'Terms of service send successful',
        TERMS_OF_SERVICE_COMPLETED: "Terms of service completed",
        TERMS_OF_SERVICE_FAILED: 'Terms of service send failed',
        TERMS_OF: "Terms service function initiated",
        PRIVACY_POLICY: "Privacy Policy - ",
        DASHBOARD_SUMMARY_STARTED: "Dashboard summary function started",
        DASHBOARD_SUMMARY_FAILED: "Dashboard summary function failed",
        DASHBOARD_SUMMARY_COMPLETED: "Dashboard summary function completed",
        PROFILE_GET_STARTED: "Profile get function started",
        PROFILE_GET_FAILED: "Profile get function failed",
        PROFILE_GET_COMPLETED: "Profile get function completed"
    }
    MESSAGES = {
        EMPTY_TOKEN:
            "Authentication token is missing. Please provide a valid token.",
        UNAUTHORIZED_USER:
            "Access denied. You are not authorized to perform this action.",
        INVALID_TOKEN:
            "Invalid token. Please provide a valid authentication token.",
        PORT_LISTEN: "Server is now running on port ",
        LINK_GENERATED: "Password link Generated",
        UPDATED_PASSWORD: "Password has been updated",
        RESET_PASSWORD_SUB: "ORCA CRED Password Change Activity Reset",
        TOEKN_DETAILS_STORED_SUCCESSFULLY: 'Token details stored successfully:',
        DECRYPT_ERROR: "Decrypted error",
        SUCCESS: "Success",
        FAILED: "Failed",
        INVALID_SESSION: "Invalid session",
        USER_NOT_ALLOWED: "User Not allowed",
        NO_TOKEN_FOUND: "Unable to locate a valid user token. Please log out and log back in to resolve this issue",
        TOKEN_EXPIRED: "The token you provide is expired"
    };
    REDIS_CONNECTION = {
        CONNECT: 'Connected to Redis',
        READY: 'Redis client is ready',
        END: 'Redis client connection ended',
        RECONNECTING: 'Redis client is reconnecting',
        CLOSE: 'Redis client is offline',
    }
    ERROR_MESSAGE = {
        INVALID_EMAIL: 'Enterted email is not valid',
        NOT_USER: 'Enterted Email is not valid user',
        RESETPWD_AS_OLD: "You cannot set the same password as your old one. Please choose a new password.",
        ERROR_FETCHING_TOKEN_DETAILS: "Error fetching token details:",
        ERROR_STORING_TOKEN_DETAILS: 'Error storing token details:',
        FETCHING_PROGRESS_PERCENTAGE_MSG_FAILED: "Fetching progress percentage failed",
        MIST_TOKEN_FAILED: "MIST Auth token generation failed",
        MIST_CONNECTION_FAILED: "MIST Connection validate failed",
        RECORD_NOT_FOUND: "Record not found. Please ensure the correct details are provided.",
    };

    STATUS_ACTIVE = 'Active';
    STATUS_INACTIVE = 'Inactive';
    STATUS_DELETED = 'Deleted';

    USER_TYPE = ['Group', 'Provider', 'User_Provider', 'User_Group']
    STATISTICS_TYPE = ['Month', 'Week']
}