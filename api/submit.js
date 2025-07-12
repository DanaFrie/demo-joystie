import { google } from 'googleapis';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullName, email, phone, childAge, calculatorResult } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !childAge) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['fullName', 'email', 'phone', 'childAge']
      });
    }

    // Google Sheets credentials from environment variables
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

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare data for Google Sheets
    const timestamp = new Date().toLocaleString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const rowData = [
      timestamp,
      fullName,
      email,
      phone,
      childAge,
      calculatorResult || 'לא בוצע חישוב',
      req.headers['user-agent'] || 'Unknown',
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown IP'
    ];

    // Add to Google Sheets
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'הרשמות!A:H'; // Sheet name and range

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });

    // Log success
    console.log(`Registration added successfully: ${email} at ${timestamp}`);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'הרשמה נשמרה בהצלחה',
      timestamp,
      sheetResponse: {
        updatedRows: response.data.updates.updatedRows,
        updatedRange: response.data.updates.updatedRange
      }
    });

  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'שגיאה בשמירת ההרשמה',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}