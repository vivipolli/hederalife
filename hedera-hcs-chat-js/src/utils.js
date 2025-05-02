export function handleLog(message, data = null, status = "Default") {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        status,
        message,
        data: data ? JSON.stringify(data, null, 2) : null
    };

    console.log(`[${timestamp}] [${status}] ${message}`);
    if (data) {
        console.log('Data:', data);
    }

    return logEntry;
} 