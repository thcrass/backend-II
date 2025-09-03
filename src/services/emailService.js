import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendPasswordResetEmail(email, resetLink) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperación de contraseña',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Recuperación de contraseña</h2>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                    <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                        Restablecer contraseña
                    </a>
                    <p><strong>Este enlace expirará en ${process.env.PASSWORD_RESET_EXPIRES || 60} minutos.</strong></p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">
                        Este es un correo automático, por favor no responder.
                    </p>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error enviando email:', error);
            throw new Error('Error al enviar el correo de recuperación');
        }
    }

    async sendPurchaseConfirmation(email, ticket) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Confirmación de compra - Ticket #${ticket.code}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>¡Compra confirmada!</h2>
                    <p>Gracias por tu compra. Aquí están los detalles:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3>Ticket #${ticket.code}</h3>
                        <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString('es-ES')}</p>
                        <p><strong>Total:</strong> $${ticket.amount}</p>
                        <p><strong>Comprador:</strong> ${ticket.purchaser}</p>
                    </div>
                    
                    <p>En breve procesaremos tu pedido y te notificaremos sobre el envío.</p>
                    
                    <hr>
                    <p style="font-size: 12px; color: #666;">
                        Este es un correo automático, por favor no responder.
                    </p>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email de compra enviado:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error enviando email de compra:', error);
            throw new Error('Error al enviar el correo de confirmación');
        }
    }
}

export const emailService = new EmailService();