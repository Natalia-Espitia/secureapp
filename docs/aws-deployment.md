# Guía de Despliegue en AWS

## Topología

- `EC2`: Apache + sitio estático + Spring Boot + certificado de Let's Encrypt para `arepnat.duckdns.org`

## 1. Preparar la EC2 actual

1. Confirma que el registro de DuckDNS para `arepnat.duckdns.org` apunta a la IP pública de la EC2 con Apache.
2. Instala los módulos de Apache requeridos para TLS y proxy:

```bash
sudo dnf install -y mod_ssl
sudo mkdir -p /var/www/secureapp
```

3. Copia el cliente estático:

```bash
sudo cp -r apache/site/* /var/www/secureapp/
```

4. Habilita el sitio de Apache usando `deploy/apache/secureapp.conf`.
5. Asegúrate de que el Security Group permita entradas por `80` y `443`.

## 2. Instalar Java 17 en la misma EC2

```bash
sudo dnf install -y java-17-amazon-corretto-headless
```

## 3. Compilar y copiar el jar de Spring

Desde tu máquina de desarrollo:

```bash
mvn clean package
scp target/secureapp-0.0.1-SNAPSHOT.jar ec2-user@<YOUR_EC2_PUBLIC_IP>:/tmp/
```

En la EC2:

```bash
sudo mkdir -p /opt/secureapp/data /opt/secureapp/certs
sudo mv /tmp/secureapp-0.0.1-SNAPSHOT.jar /opt/secureapp/
```

## 4. Reutilizar el certificado existente de Let's Encrypt

Si Apache ya tiene el certificado para `arepnat.duckdns.org`, conviértelo a PKCS12 para Spring:

```bash
sudo bash deploy/scripts/build-pkcs12-from-letsencrypt.sh \
  arepnat.duckdns.org \
  /opt/secureapp/certs/secureapp-local.p12 \
  "<CHANGE_ME>" \
  secureapp-local
```

## 5. Instalar el servicio de Spring

1. Copia `deploy/spring/secureapp.service` a `/etc/systemd/system/secureapp.service`.
2. Reemplaza la contraseña placeholder del keystore.
3. Mantén `SERVER_ADDRESS=127.0.0.1` para que el backend no sea público.
4. Inicia el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now secureapp
sudo systemctl status secureapp
```

## 6. Configurar el proxy inverso de Apache

Directivas importantes:

- `ProxyPass /api https://127.0.0.1:5000/api`
- `ProxyPassReverse /api https://127.0.0.1:5000/api`
- `SSLProxyEngine on`
- `SSLProxyCheckPeerName off`

Después de copiar la configuración:

```bash
sudo apachectl configtest
sudo systemctl restart httpd
```

## 7. Lista de validación

Ejecuta estas verificaciones y toma capturas:

```bash
curl -I https://arepnat.duckdns.org
curl https://arepnat.duckdns.org/api/public/info
```

Luego, desde el navegador:

1. Abre `https://arepnat.duckdns.org`.
2. Registra un usuario.
3. Inicia sesión.
4. Carga el perfil protegido.
5. Muestra el candado del navegador y los detalles del certificado.