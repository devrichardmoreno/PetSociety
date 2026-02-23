package Pet.Society.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Envía un email con el token de recuperación de contraseña
     */
    public void sendPasswordResetToken(String toEmail, String token, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Pet Society");
            helper.setTo(toEmail);
            helper.setSubject("Recuperación de contraseña - Pet Society");

            // Crear el contenido HTML del email
            String htmlContent = buildPasswordResetEmailHtml(userName, token);

            helper.setText(htmlContent, true); // true indica que es HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar el email: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error inesperado al enviar el email: " + e.getMessage(), e);
        }
    }

    /**
     * Construye el contenido HTML del email de recuperación de contraseña
     */
    private String buildPasswordResetEmailHtml(String userName, String token) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background-color: #ffffff;
                        border-radius: 10px;
                        padding: 30px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #45AEDD;
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .token-box {
                        background-color: #f8f9fa;
                        border: 2px dashed #45AEDD;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .token {
                        font-family: 'Courier New', monospace;
                        font-size: 18px;
                        font-weight: bold;
                        color: #45AEDD;
                        word-break: break-all;
                        letter-spacing: 1px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #45AEDD;
                        color: #ffffff;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e0e0e0;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🐾 Pet Society</h1>
                    </div>
                    <div class="content">
                        <h2>Recuperación de contraseña</h2>
                        <p>Hola <strong>%s</strong>,</p>
                        <p>Recibimos una solicitud para restablecer tu contraseña. Usá el siguiente token para completar el proceso:</p>
                        
                        <div class="token-box">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Tu token de recuperación:</p>
                            <div class="token">%s</div>
                        </div>

                        <div class="warning">
                            <strong>⚠️ Importante:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Este token expira en <strong>30 minutos</strong></li>
                                <li>Si no solicitaste este cambio, ignorá este email</li>
                                <li>Nunca compartas este token con nadie</li>
                            </ul>
                        </div>

                        <p style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:4200/reset-password?token=%s" class="button">Restablecer contraseña</a>
                        </p>

                        <p style="margin-top: 20px; font-size: 14px; color: #666;">
                            O copiá el token de arriba y ingresalo manualmente en la página de recuperación.
                        </p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas.</p>
                        <p>&copy; 2024 Pet Society. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, token, token);
    }

    /**
     * Envía un email de verificación de cuenta
     */
    public void sendEmailVerification(String toEmail, String token, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Pet Society");
            helper.setTo(toEmail);
            helper.setSubject("Verifica tu cuenta - Pet Society");

            // Crear el contenido HTML del email
            String htmlContent = buildEmailVerificationHtml(userName, token);

            helper.setText(htmlContent, true); // true indica que es HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar el email de verificación: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error inesperado al enviar el email de verificación: " + e.getMessage(), e);
        }
    }

    /**
     * Construye el contenido HTML del email de verificación
     */
    private String buildEmailVerificationHtml(String userName, String token) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background-color: #ffffff;
                        border-radius: 10px;
                        padding: 30px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #45AEDD;
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #45AEDD;
                        color: #ffffff;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e0e0e0;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .info {
                        background-color: #e7f3ff;
                        border-left: 4px solid #45AEDD;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🐾 Pet Society</h1>
                    </div>
                    <div class="content">
                        <h2>¡Bienvenido a Pet Society!</h2>
                        <p>Hola <strong>%s</strong>,</p>
                        <p>Gracias por registrarte en Pet Society. Para completar tu registro y asegurar que tu email es válido, necesitamos que verifiques tu cuenta.</p>
                        
                        <div class="info">
                            <strong>📧 Verificación de email:</strong>
                            <p style="margin: 10px 0;">Hacé clic en el botón de abajo para verificar tu dirección de email:</p>
                        </div>

                        <p style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:4200/verify-email?token=%s" class="button">Verificar mi email</a>
                        </p>

                        <p style="margin-top: 20px; font-size: 14px; color: #666;">
                            Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
                            <span style="word-break: break-all; color: #45AEDD;">http://localhost:4200/verify-email?token=%s</span>
                        </p>

                        <div class="info">
                            <strong>⏰ Importante:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Este enlace expira en <strong>24 horas</strong></li>
                                <li>Si no verificás tu email, algunas funcionalidades pueden estar limitadas</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas.</p>
                        <p>&copy; 2024 Pet Society. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, token, token);
    }
}
