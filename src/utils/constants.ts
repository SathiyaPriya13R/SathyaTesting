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
        USER_NOT_FOUND: "The email and password combination provided does not match our records. Please verify and try again.",
        UPDATE_PASSWORD: "Update password function initiated",
        UPDATE_PASSWORD_COMPLETED: "Updated password function completed",
        UPDATE_PASSWORD_FAILED: "Updated password function failed",
        TOKEN_OTHER_SERVICE_START: "token generation service call started ",
        TOKEN_OTHER_SERVICE_COMPLETED: "token generation service call completed ",
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
        PROFILE_GET_COMPLETED: "Profile get function completed",
        PROFILE_UPDATE_STARTED: "Profile update function started",
        PROFILE_UPDATE_FAILED: "Profile update function failed",
        PROFILE_UPDATE_COMPLETED: "Profile update function completed",
        LOGOUT_FUNCTION_STARTED: "Logout function started",
        LOGOUT_FUNCTION_COMPLETED: "Logout function completed",
        LOGOUT_FUNCTION_FAILED: "Logout function failed",
        PWD_EXPIERATION_STARTED: "Password expieration function started",
        PWD_EXPIERATION_COMPLETED: "Password expieration function completed",
        PWD_EXPIERATION_FAILED: "Password expieration function failed",
        PROVIDER_SPEC_FUNCTION_STARTED: "Provider Spec function started",
        PROVIDER_SPEC_FUNCTION_COMPLETED: "Provider Spec function completed",
        PROVIDER_SPEC_FUNCTION_FAILED: "Provider Spec function failed",
        USER_ALREADY_LOGEEDIN: "The user is currently logged in on another device.",
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
        TOKEN_DELETED_SUCCESSFULLY: "Token has been deleted successfully",
        DECRYPT_ERROR: "Decrypted error",
        SUCCESS: "Success",
        FAILED: "Failed",
        INVALID_SESSION: "Invalid session",
        USER_NOT_ALLOWED: "User Not allowed",
        NO_TOKEN_FOUND: "Unable to locate a valid user token. Please log out and log back in to resolve this issue",
        TOKEN_EXPIRED: "The token you provided is expired",
        DATA_FOUND: "{{}} data found",
        DATA_NOT_FOUND: "{{}} data not found",
        INVALID_USERTYPE: "Invalid user_type",
        PROFILE_UPDATE_SUCCESSFUL: "Profile has been updated",
        PROFILE_UPDATE_FAILED: "Profile update failed",
        LOGOUT_FUNCTION_COMPLETED: "Logout successfully",
        PASSWORD_RESET: "User have requested for password reset. Please update your new password and try again",
        PWD_NOT_EXPIRED: "Password generation link is not expired",
        PWD_EXPIRED: "Password generation link is expired",
        EMAIL_EMPTY: "Email field is empty",
        INVALID_TYPE: "Invalid type",
    };
    REDIS_CONNECTION = {
        CONNECT: 'Connected to Redis',
        READY: 'Redis client is ready',
        END: 'Redis client connection ended',
        RECONNECTING: 'Redis client is reconnecting',
        CLOSE: 'Redis client is offline',
    }
    ERROR_MESSAGE = {
        INVALID_EMAIL: 'Entered email is not valid',
        NOT_USER: 'Entered Email is not valid user',
        RESETPWD_AS_OLD: "You cannot set the same password as your old one. Please choose a new password.",
        ERROR_FETCHING_TOKEN_DETAILS: "Error fetching token details:",
        ERROR_STORING_TOKEN_DETAILS: 'Error storing token details:',
        FETCHING_PROGRESS_PERCENTAGE_MSG_FAILED: "Fetching progress percentage failed",
        TOKEN_FAILED: "Auth token generation failed",
        CONNECTION_FAILED: "Connection validate failed",
        RECORD_NOT_FOUND: "Record not found. Please ensure the correct details are provided.",
    };
    DASHBOARD_MESSAGES = {
        DASHBOARD_STATISTICS: 'Dashboard statistics',
        APP_FILTER: 'App filter'
    }

    PROVIDER_MESSAGES = {
        PROVIDER: 'Provider list',
        PROVIDER_VIEWPLAN: 'Provider view plan list',
        PROVIDER_FUNCTION_STARTED: 'Provider list function started',
        PROVIDER_FUNCTION_COMPLETED: 'Provider list fucntion completed',
        PROVIDER_FUNCTION_FAILED: 'Provider list funciton failed',
        PROVIDER_VIEWPLAN_FUNCTION_STARTED: 'Provider view plan list function started',
        PROVIDER_VIEWPLAN_FUNCTION_COMPLETED: 'Provider view plan list fucntion completed',
        PROVIDER_VIEWPLAN_FUNCTION_FAILED: 'Provider view plan list funciton failed'
    }

    PAYER_MESSAGES = {
        PATER: 'Payer list',
        PAYER_HISTORY: 'Payer history list',
        PAYER_FUNCTION_STARTED: 'Payer list function started',
        PAYER_HISTORY_FUNCTION_STARTED: 'Payer history list function started',
        PAYER_FUNCTION_COMPLETED: 'Payer list fucntion completed',
        PAYER_HISTORY_FUNCTION_COMPLETED: 'Payer history list fucntion completed',
        PAYER_FUNCTION_FAILED: 'Payer list funciton failed',
        PAYER_HISTORY_FUNCTION_FAILED: 'Payer history list funciton failed'
    }

    LOCATION_MESSAGES = {
        LOCATION: 'Location list',
        LOCATION_FUNCTION_STARTED: 'Location list function started',
        LOCATION_FUNCTION_COMPLETED: 'Location list fucntion completed',
        LOCATION_FUNCTION_FAILED: 'Location list funciton failed',
        LOCATION_STATUS_UPDATE_STARTED: 'Location status update funciton started',
        LOCATION_STATUS_UPDATE_COMPLETED: 'Location status update function completed',
        LOCATION_STATUS_UPDATE_FAILED: 'Location status update function failed',
        LOCATION_STATUS_UPDATE_SUCCEFULLY: 'Location status updated successfully'
    }

    DOCUMENT_DETAILS_MESSAGE = {
        DOCUMENT: 'Document details',
        DOCUMENT_FUNCTION_STARTED: 'Document details function started',
        DOCUMENT_FUNCTION_COMPLETED: 'Document details fucntion completed',
        DOCUMENT_FUNCTION_FAILED: 'Document details funciton failed',
    }

    SERVICE = "Service"


    STATUS_ACTIVE = 'Active';
    STATUS_INACTIVE = 'Inactive';
    STATUS_DELETED = 'Deleted';

    USER_TYPE = ['Group', 'Provider', 'User_Provider', 'User_Group']
    STATISTICS_TYPE = ['Month', 'Week']
}