import { NextApiRequest, NextApiResponse } from "next";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

// Obtener valores de variables de entorno
const APP_ID ='6b72f1e5e75f4bd0b658eb9d332e0d96';
const APP_CERTIFICATE = 'fbcfa7d10a8c45e1949729e25f5f777b';

// Constantes
const TOKEN_EXPIRATION_IN_SECONDS = 3600; // 1 hora
const DEFAULT_UID = 0;

interface TokenResponse {
  token: string;
  expiresIn: number;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse | ErrorResponse>
) {
  // Verificar método HTTP
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Validar configuración
    if (!APP_ID || !APP_CERTIFICATE) {
      console.error('Faltan credenciales de Agora');
      return res.status(500).json({ error: 'Error en la configuración del servidor' });
    }

    // Validar y obtener parámetros
    const { channel } = req.query;
    
    if (!channel || typeof channel !== "string") {
      return res.status(400).json({ error: 'Se requiere un nombre de canal válido' });
    }

    // Validar formato del canal
    if (!/^[a-zA-Z0-9_-]+$/.test(channel)) {
      return res.status(400).json({ 
        error: 'El nombre del canal solo puede contener letras, números, guiones y guiones bajos' 
      });
    }

    // Generar timestamp de expiración
    const expirationTimestamp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_IN_SECONDS;

    // Generar token
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      DEFAULT_UID,
      RtcRole.PUBLISHER,
      expirationTimestamp
    );

    // Validar que el token se generó correctamente
    if (!token) {
      throw new Error('Error al generar el token');
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      token,
      expiresIn: TOKEN_EXPIRATION_IN_SECONDS
    });

  } catch (error) {
    console.error('Error al generar token:', error);
    return res.status(500).json({ 
      error: 'Error al generar el token' 
    });
  }
}