// Vercel Edge Function for Excel OneDrive Integration
export default async function handler(req, res) {
  // Enable CORS
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
    const { name, phone, email, triggerTime } = req.body;

    // Validate required fields
    if (!name || !phone || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, phone, email' 
      });
    }

    // Get Microsoft Graph access token
    const accessToken = await getAccessToken();
    
    // Add row to Excel
    const result = await addRowToExcel(accessToken, {
      name,
      phone,
      email,
      triggerTime: triggerTime || new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Data saved to Excel',
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('Excel API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save to Excel',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get access token from Microsoft Graph
async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID,
    client_secret: process.env.AZURE_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token request failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Add row to Excel file in OneDrive
async function addRowToExcel(accessToken, userData) {
  // Excel file path in OneDrive
  const excelPath = process.env.EXCEL_FILE_PATH;
  const worksheetName = process.env.WORKSHEET_NAME; 
  
  // Graph API endpoint for Excel
  const graphUrl = `https://graph.microsoft.com/v1.0/me/drive/root:${excelPath}:/workbook/worksheets('${worksheetName}')/tables('Table1')/rows`;

  // Prepare row data
  const timestamp = new Date().toLocaleString('he-IL', {
    timeZone: 'Asia/Jerusalem'
  });

  const rowData = {
    values: [[
      timestamp,
      userData.name,
      userData.phone,
      userData.email,
      userData.triggerTime
    ]]
  };

  const response = await fetch(graphUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(rowData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Excel API failed: ${response.status} - ${error}`);
  }

  return await response.json();
}