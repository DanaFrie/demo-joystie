import { google } from 'googleapis';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, timestamp } = req.body;

    // Validate input
    if (!name || !phone || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, phone, email' 
      });
    }

    // Google service account credentials
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
    };

    // Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare data row
    const now = new Date();
    const israelTime = now.toLocaleString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const rowData = [
      timestamp || israelTime,
      name,
      phone,
      email,
      req.headers['user-agent'] || 'Unknown',
      req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unknown'
    ];

    // Append to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });

    console.log(`✅ Registration saved: ${email} at ${israelTime}`);

    return res.status(200).json({
      success: true,
      message: 'נשמר בהצלחה',
      timestamp: israelTime,
      updatedRows: response.data.updates.updatedRows
    });

  } catch (error) {
    console.error('❌ Google Sheets error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'שגיאה בשמירה',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}