const appConfig = window.SECURE_APP_CONFIG || { apiBaseUrl: "/api" };
const sessionStorageKey = "secureapp.session.token";

let sessionToken = sessionStorage.getItem(sessionStorageKey) || "";

const messagePanel = document.querySelector("#message-panel");
const publicInfoPanel = document.querySelector("#public-info");
const secureInfoPanel = document.querySelector("#secure-info");
const sessionPanel = document.querySelector("#session-panel");
const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");
const profileButton = document.querySelector("#load-profile");
const statusButton = document.querySelector("#load-status");
const logoutButton = document.querySelector("#logout");

function setMessage(text, type = "info") {
    messagePanel.textContent = text;
    messagePanel.dataset.type = type;
}

function saveSession(token) {
    sessionToken = token || "";
    if (sessionToken) {
        sessionStorage.setItem(sessionStorageKey, sessionToken);
    } else {
        sessionStorage.removeItem(sessionStorageKey);
    }
    sessionPanel.textContent = sessionToken
        ? "Token de sesión cargado. Las solicitudes protegidas incluirán un token Bearer."
        : "Sin sesión activa.";
}

async function apiRequest(path, options = {}, requiresAuth = false) {
    const headers = {
        Accept: "application/json",
        ...(options.headers || {})
    };

    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (requiresAuth && sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
    }

    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
        ...options,
        headers
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.message || `HTTP ${response.status}`);
    }

    return payload;
}

async function loadPublicInfo() {
    try {
        const payload = await apiRequest("/public/info");
        publicInfoPanel.textContent = JSON.stringify(payload, null, 2);
        setMessage("Conexión exitosa al endpoint público de API sobre HTTPS.", "success");
    } catch (error) {
        setMessage(`No fue posible cargar la información pública: ${error.message}`, "error");
    }
}

async function loadProfile() {
    try {
        const payload = await apiRequest("/secure/profile", {}, true);
        secureInfoPanel.textContent = JSON.stringify(payload, null, 2);
        setMessage("Perfil protegido cargado correctamente.", "success");
    } catch (error) {
        setMessage(`Error al cargar el perfil protegido: ${error.message}`, "error");
    }
}

async function loadSecureStatus() {
    try {
        const payload = await apiRequest("/secure/status", {}, true);
        secureInfoPanel.textContent = JSON.stringify(payload, null, 2);
        setMessage("Estado seguro cargado desde Spring.", "success");
    } catch (error) {
        setMessage(`Error al cargar el estado seguro: ${error.message}`, "error");
    }
}

registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const body = JSON.stringify({
        username: formData.get("register-username"),
        displayName: formData.get("register-display-name"),
        password: formData.get("register-password")
    });

    try {
        const payload = await apiRequest("/auth/register", { method: "POST", body });
        setMessage(payload.message, "success");
        registerForm.reset();
    } catch (error) {
        setMessage(`Error en el registro: ${error.message}`, "error");
    }
});

loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const body = JSON.stringify({
        username: formData.get("login-username"),
        password: formData.get("login-password")
    });

    try {
        const payload = await apiRequest("/auth/login", { method: "POST", body });
        saveSession(payload.token);
        secureInfoPanel.textContent = JSON.stringify(payload, null, 2);
        setMessage(`Sesión iniciada como ${payload.displayName}.`, "success");
        loginForm.reset();
    } catch (error) {
        saveSession("");
        setMessage(`Error de inicio de sesión: ${error.message}`, "error");
    }
});

profileButton.addEventListener("click", loadProfile);
statusButton.addEventListener("click", loadSecureStatus);
logoutButton.addEventListener("click", async () => {
    try {
        await apiRequest("/auth/logout", { method: "POST" }, true);
    } catch (error) {
        setMessage(`Advertencia al cerrar sesión: ${error.message}`, "error");
    } finally {
        saveSession("");
        secureInfoPanel.textContent = "{\n  \"message\": \"Sesión cerrada\"\n}";
    }
});

saveSession(sessionToken);
loadPublicInfo();
