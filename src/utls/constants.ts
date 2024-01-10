export default class AppConstants {
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
    }
    MESSAGES = {
        EMPTY_TOKEN:
            "Authentication token is missing. Please provide a valid token.",
        UNAUTHORIZED_USER:
            "Access denied. You are not authorized to perform this action.",
        INVALID_TOKEN:
            "Invalid token. Please provide a valid authentication token.",
        PORT_LISTEN: "Server is now running on port ",
    };
}