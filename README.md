# SecureApp - Enterprise Architecture Workshop

This project implements a secure two-server design:

- Server 1 (Apache): serves async HTML+JavaScript client over HTTPS.
- Server 2 (Spring): exposes REST endpoints over HTTPS.

## Implemented in this repository

- Spring backend with secure auth endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/health`
- Password hashing with BCrypt (`spring-security-crypto`), no plaintext passwords.
- Async client for register/login in `apache-client/`.
- TLS-ready Spring config in `application.properties` (keystore via env vars).

## Local run (Spring)

1. Set SSL env vars if needed:

```powershell
$env:SSL_KEY_STORE="ecikeystores/ecikeystore.p12"
$env:SSL_KEY_STORE_PASSWORD="123456"
$env:SSL_KEY_ALIAS="ecikeypair"
$env:SERVER_PORT="5000"
```

2. Run backend:

```powershell
./mvnw spring-boot:run
```

3. Test endpoint:

```powershell
curl -k https://localhost:5000/api/health
```

## AWS deployment target architecture

- EC2 instance A:
  - Apache HTTP Server
  - Serves static files from `apache-client/`
  - TLS certificate from Let's Encrypt
- EC2 instance B:
  - Java 17 + Spring Boot app
  - Reverse proxy or direct HTTPS endpoint
  - TLS certificate from Let's Encrypt

## Apache setup (server A)

1. Install Apache (Amazon Linux 2023 guide):
   - Follow AWS LAMP guide in class hint.
2. Copy `apache-client/*` to Apache web root (`/var/www/html/`).
3. Configure HTTPS virtual host (example in `ops/apache-secureapp.conf`).
4. Install certbot and generate cert:

```bash
sudo dnf install -y certbot python3-certbot-apache
sudo certbot --apache -d client.your-domain.com
```

## Spring server setup (server B)

1. Build jar:

```powershell
./mvnw clean package
```

2. Copy jar to EC2 and run with env vars.
3. Terminate TLS either:
   - in Spring directly using PKCS12, or
   - with Nginx/Apache reverse proxy + Let's Encrypt in front of Spring.

Recommended for workshop rubric: use Let's Encrypt certificate for public Spring domain.

## Security checklist

- [x] Passwords hashed with BCrypt
- [x] Async client using fetch/await
- [x] HTTPS enabled in Spring configuration
- [ ] Let's Encrypt certificate active on Apache server
- [ ] Let's Encrypt certificate active on Spring/API domain
- [ ] Both servers deployed separately in AWS

## Testing checklist for submission evidence

Capture screenshots/videos of:

1. HTTPS browser lock on Apache client URL.
2. HTTPS call from client to Spring API URL.
3. Register success response.
4. Login success response.
5. Login failure response (wrong password).
6. Password hash evidence (never plaintext).

## Final deliverables

- GitHub repo with source code and this README.
- Architecture diagram (client -> Apache -> Spring).
- Deployment instructions and commands used.
- Screenshots from tests.
- Demo video explaining security features and AWS deployment.
