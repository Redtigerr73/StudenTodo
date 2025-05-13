export function saveSessions(key, dataJson) {
    localStorage.setItem(key, dataJson);
}

export function loadSessions(key) {
    return localStorage.getItem(key);
}
