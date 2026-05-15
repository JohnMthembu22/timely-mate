// Invoice and Quote Templates

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'invoice' | 'quote';
  generateHTML: (data: any) => string;
}

// Template data interface
export interface TemplateData {
  // Document details
  documentNumber: string;
  documentType: 'Invoice' | 'Quote';
  issueDate: string;
  dueDate?: string;
  expiryDate?: string;
  status: string;
  
  // Company details (from)
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite?: string;
  companyLogo?: string;
  
  // Client details (to)
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  
  // Items
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  
  // Totals
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  
  // Additional info
  notes?: string;
  terms?: string;
}

// Modern Blue Template
export const modernBlueTemplate: Template = {
  id: 'modern-blue',
  name: 'Modern Blue',
  description: 'Clean and professional with blue accents',
  category: 'invoice',
  generateHTML: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.documentType} ${data.documentNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          color: #333; 
          line-height: 1.6;
          background: #f8f9fa;
        }
        .container { 
          max-width: 800px; 
          margin: 20px auto; 
          background: white; 
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); 
          color: white; 
          padding: 40px; 
          position: relative;
        }
        .header h1 { 
          font-size: 2.5em; 
          font-weight: 300; 
          margin-bottom: 10px;
        }
        .header .doc-number { 
          font-size: 1.2em; 
          opacity: 0.9;
        }
        .company-info { 
          position: absolute; 
          top: 40px; 
          right: 40px; 
          text-align: right;
        }
        .main-content { 
          padding: 40px; 
        }
        .invoice-details { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 40px;
          gap: 40px;
        }
        .bill-to, .invoice-info { 
          flex: 1; 
        }
        .bill-to h3, .invoice-info h3 { 
          color: #2196f3; 
          margin-bottom: 15px; 
          font-size: 1.1em;
          border-bottom: 2px solid #e3f2fd;
          padding-bottom: 5px;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .items-table th { 
          background: #2196f3; 
          color: white; 
          padding: 15px; 
          text-align: left; 
          font-weight: 500;
        }
        .items-table td { 
          padding: 15px; 
          border-bottom: 1px solid #eee; 
        }
        .items-table tr:hover { 
          background: #f8f9fa; 
        }
        .totals { 
          margin-left: auto; 
          width: 300px; 
          margin-top: 30px;
        }
        .totals table { 
          width: 100%; 
          border-collapse: collapse;
        }
        .totals td { 
          padding: 8px 0; 
          border-bottom: 1px solid #eee;
        }
        .totals .total-row { 
          font-weight: bold; 
          font-size: 1.2em; 
          color: #2196f3;
          border-top: 2px solid #2196f3;
        }
        .footer { 
          background: #f8f9fa; 
          padding: 30px 40px; 
          border-top: 1px solid #eee;
        }
        .footer h4 { 
          color: #2196f3; 
          margin-bottom: 15px;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 500;
          text-transform: uppercase;
        }
        .status-draft { background: #ffc107; color: #856404; }
        .status-sent { background: #17a2b8; color: white; }
        .status-paid { background: #28a745; color: white; }
        .status-overdue { background: #dc3545; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.documentType.toUpperCase()}</h1>
          <div class="doc-number">${data.documentNumber}</div>
          <div class="company-info">
            <strong>${data.companyName}</strong><br>
            ${data.companyAddress.replace(/\n/g, '<br>')}<br>
            ${data.companyEmail}<br>
            ${data.companyPhone}
          </div>
        </div>
        
        <div class="main-content">
          <div class="invoice-details">
            <div class="bill-to">
              <h3>Bill To:</h3>
              <strong>${data.clientName}</strong><br>
              ${data.clientEmail}<br>
              ${data.clientAddress.replace(/\n/g, '<br>')}
            </div>
            <div class="invoice-info">
              <h3>${data.documentType} Details:</h3>
              <strong>Issue Date:</strong> ${new Date(data.issueDate).toLocaleDateString()}<br>
              ${data.dueDate ? `<strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}<br>` : ''}
              ${data.expiryDate ? `<strong>Valid Until:</strong> ${new Date(data.expiryDate).toLocaleDateString()}<br>` : ''}
              <strong>Status:</strong> <span class="status-badge status-${data.status.toLowerCase()}">${data.status}</span>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="width: 80px;">Qty</th>
                <th style="width: 120px;">Unit Price</th>
                <th style="width: 120px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>R ${item.unitPrice.toFixed(2)}</td>
                  <td>R ${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">R ${data.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>VAT (${data.vatRate}%):</td>
                <td style="text-align: right;">R ${data.vatAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Total:</td>
                <td style="text-align: right;">R ${data.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        ${data.notes || data.terms ? `
          <div class="footer">
            ${data.notes ? `
              <h4>Notes:</h4>
              <p>${data.notes}</p>
            ` : ''}
            ${data.terms ? `
              <h4>Terms & Conditions:</h4>
              <p>${data.terms}</p>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `
};

// Classic Template
export const classicTemplate: Template = {
  id: 'classic',
  name: 'Classic',
  description: 'Traditional black and white professional design',
  category: 'invoice',
  generateHTML: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.documentType} ${data.documentNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Times New Roman', serif; 
          color: #000; 
          line-height: 1.5;
          background: white;
        }
        .container { 
          max-width: 800px; 
          margin: 20px auto; 
          padding: 40px;
          border: 2px solid #000;
        }
        .header { 
          border-bottom: 3px solid #000; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 { 
          font-size: 2.5em; 
          font-weight: bold; 
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
        .company-info { 
          text-align: right; 
          margin-bottom: 30px;
          font-size: 0.9em;
        }
        .invoice-details { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 40px;
        }
        .bill-to, .invoice-info { 
          width: 45%; 
        }
        .bill-to h3, .invoice-info h3 { 
          border-bottom: 1px solid #000; 
          margin-bottom: 15px; 
          padding-bottom: 5px;
          font-size: 1.1em;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0;
          border: 2px solid #000;
        }
        .items-table th, .items-table td { 
          border: 1px solid #000; 
          padding: 12px; 
          text-align: left; 
        }
        .items-table th { 
          background: #f0f0f0; 
          font-weight: bold;
        }
        .totals { 
          margin-left: auto; 
          width: 250px; 
          margin-top: 30px;
          border: 2px solid #000;
        }
        .totals table { 
          width: 100%; 
          border-collapse: collapse;
        }
        .totals td { 
          padding: 8px 12px; 
          border-bottom: 1px solid #000;
        }
        .totals .total-row { 
          font-weight: bold; 
          font-size: 1.1em; 
          background: #f0f0f0;
        }
        .footer { 
          border-top: 2px solid #000; 
          padding-top: 20px; 
          margin-top: 40px;
        }
        .footer h4 { 
          margin-bottom: 10px;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.documentType.toUpperCase()}</h1>
          <div style="font-size: 1.2em; margin-top: 10px;">${data.documentNumber}</div>
        </div>
        
        <div class="company-info">
          <strong>${data.companyName}</strong><br>
          ${data.companyAddress.replace(/\n/g, '<br>')}<br>
          Email: ${data.companyEmail} | Phone: ${data.companyPhone}
        </div>
        
        <div class="invoice-details">
          <div class="bill-to">
            <h3>BILL TO:</h3>
            <strong>${data.clientName}</strong><br>
            ${data.clientEmail}<br>
            ${data.clientAddress.replace(/\n/g, '<br>')}
          </div>
          <div class="invoice-info">
            <h3>${data.documentType.toUpperCase()} INFORMATION:</h3>
            <strong>Issue Date:</strong> ${new Date(data.issueDate).toLocaleDateString()}<br>
            ${data.dueDate ? `<strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}<br>` : ''}
            ${data.expiryDate ? `<strong>Valid Until:</strong> ${new Date(data.expiryDate).toLocaleDateString()}<br>` : ''}
            <strong>Status:</strong> ${data.status.toUpperCase()}
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th style="width: 80px;">QTY</th>
              <th style="width: 120px;">UNIT PRICE</th>
              <th style="width: 120px;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>R ${item.unitPrice.toFixed(2)}</td>
                <td>R ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">R ${data.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>VAT (${data.vatRate}%):</td>
              <td style="text-align: right;">R ${data.vatAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>TOTAL:</td>
              <td style="text-align: right;">R ${data.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        ${data.notes || data.terms ? `
          <div class="footer">
            ${data.notes ? `
              <h4>NOTES:</h4>
              <p>${data.notes}</p><br>
            ` : ''}
            ${data.terms ? `
              <h4>TERMS & CONDITIONS:</h4>
              <p>${data.terms}</p>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `
};

// Minimalist Template
export const minimalistTemplate: Template = {
  id: 'minimalist',
  name: 'Minimalist',
  description: 'Clean and simple design with lots of white space',
  category: 'invoice',
  generateHTML: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.documentType} ${data.documentNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Helvetica Neue', Arial, sans-serif; 
          color: #444; 
          line-height: 1.7;
          background: white;
        }
        .container { 
          max-width: 700px; 
          margin: 40px auto; 
          padding: 60px;
        }
        .header { 
          margin-bottom: 60px;
        }
        .header h1 { 
          font-size: 2em; 
          font-weight: 300; 
          color: #222;
          margin-bottom: 5px;
        }
        .header .doc-number { 
          font-size: 1.1em; 
          color: #888;
        }
        .company-info { 
          text-align: right; 
          margin-bottom: 50px;
          color: #666;
          font-size: 0.9em;
        }
        .invoice-details { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 50px;
          gap: 60px;
        }
        .bill-to, .invoice-info { 
          flex: 1; 
        }
        .bill-to h3, .invoice-info h3 { 
          color: #222; 
          margin-bottom: 20px; 
          font-size: 0.9em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 40px 0;
        }
        .items-table th { 
          border-bottom: 1px solid #ddd; 
          padding: 15px 0; 
          text-align: left; 
          font-weight: 600;
          color: #555;
          font-size: 0.9em;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .items-table td { 
          padding: 20px 0; 
          border-bottom: 1px solid #f0f0f0; 
        }
        .totals { 
          margin-left: auto; 
          width: 250px; 
          margin-top: 40px;
        }
        .totals table { 
          width: 100%; 
          border-collapse: collapse;
        }
        .totals td { 
          padding: 10px 0; 
        }
        .totals .total-row { 
          font-weight: 600; 
          font-size: 1.1em; 
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        .footer { 
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid #eee;
        }
        .footer h4 { 
          color: #555;
          font-size: 0.9em;
          font-weight: 600;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .footer p {
          color: #666;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.documentType}</h1>
          <div class="doc-number">${data.documentNumber}</div>
        </div>
        
        <div class="company-info">
          <strong>${data.companyName}</strong><br>
          ${data.companyAddress.replace(/\n/g, '<br>')}<br>
          ${data.companyEmail} • ${data.companyPhone}
        </div>
        
        <div class="invoice-details">
          <div class="bill-to">
            <h3>Bill To</h3>
            <strong>${data.clientName}</strong><br>
            ${data.clientEmail}<br>
            ${data.clientAddress.replace(/\n/g, '<br>')}
          </div>
          <div class="invoice-info">
            <h3>${data.documentType} Details</h3>
            <strong>Issue Date:</strong> ${new Date(data.issueDate).toLocaleDateString()}<br>
            ${data.dueDate ? `<strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}<br>` : ''}
            ${data.expiryDate ? `<strong>Valid Until:</strong> ${new Date(data.expiryDate).toLocaleDateString()}<br>` : ''}
            <strong>Status:</strong> ${data.status}
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="width: 60px;">Qty</th>
              <th style="width: 100px;">Unit Price</th>
              <th style="width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>R ${item.unitPrice.toFixed(2)}</td>
                <td>R ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <table>
            <tr>
              <td>Subtotal</td>
              <td style="text-align: right;">R ${data.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>VAT (${data.vatRate}%)</td>
              <td style="text-align: right;">R ${data.vatAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total</td>
              <td style="text-align: right;">R ${data.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        ${data.notes || data.terms ? `
          <div class="footer">
            ${data.notes ? `
              <h4>Notes</h4>
              <p>${data.notes}</p>
            ` : ''}
            ${data.terms ? `
              <h4>Terms & Conditions</h4>
              <p>${data.terms}</p>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `
};

// Corporate Template
export const corporateTemplate: Template = {
  id: 'corporate',
  name: 'Corporate',
  description: 'Professional corporate design with green accents',
  category: 'invoice',
  generateHTML: (data: TemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.documentType} ${data.documentNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          color: #333; 
          line-height: 1.6;
          background: #fafafa;
        }
        .container { 
          max-width: 800px; 
          margin: 20px auto; 
          background: white;
          box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); 
          color: white; 
          padding: 30px 40px;
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          right: 0;
          height: 10px;
          background: linear-gradient(45deg, transparent 0%, rgba(76,175,80,0.3) 50%, transparent 100%);
        }
        .header h1 { 
          font-size: 2.2em; 
          font-weight: 600; 
          margin-bottom: 8px;
        }
        .header .doc-number { 
          font-size: 1.1em; 
          opacity: 0.95;
        }
        .company-info { 
          position: absolute; 
          top: 30px; 
          right: 40px; 
          text-align: right;
          font-size: 0.9em;
        }
        .main-content { 
          padding: 40px; 
        }
        .invoice-details { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 40px;
          background: #f8f9fa;
          padding: 25px;
          border-radius: 8px;
        }
        .bill-to, .invoice-info { 
          flex: 1; 
        }
        .bill-to h3, .invoice-info h3 { 
          color: #4caf50; 
          margin-bottom: 15px; 
          font-size: 1em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .items-table th { 
          background: #4caf50; 
          color: white; 
          padding: 15px; 
          text-align: left; 
          font-weight: 600;
          font-size: 0.9em;
        }
        .items-table td { 
          padding: 15px; 
          border-bottom: 1px solid #e9ecef; 
        }
        .items-table tr:nth-child(even) { 
          background: #f8f9fa; 
        }
        .totals { 
          margin-left: auto; 
          width: 300px; 
          margin-top: 30px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        .totals table { 
          width: 100%; 
          border-collapse: collapse;
        }
        .totals td { 
          padding: 8px 0; 
        }
        .totals .total-row { 
          font-weight: bold; 
          font-size: 1.2em; 
          color: #4caf50;
          border-top: 2px solid #4caf50;
          padding-top: 12px;
        }
        .footer { 
          background: #f8f9fa; 
          padding: 30px 40px; 
          border-top: 3px solid #4caf50;
        }
        .footer h4 { 
          color: #4caf50; 
          margin-bottom: 15px;
          font-weight: 600;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.8em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-draft { background: #fff3cd; color: #856404; }
        .status-sent { background: #d1ecf1; color: #0c5460; }
        .status-paid { background: #d4edda; color: #155724; }
        .status-overdue { background: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.documentType.toUpperCase()}</h1>
          <div class="doc-number">${data.documentNumber}</div>
          <div class="company-info">
            <strong>${data.companyName}</strong><br>
            ${data.companyAddress.replace(/\n/g, '<br>')}<br>
            ${data.companyEmail}<br>
            ${data.companyPhone}
          </div>
        </div>
        
        <div class="main-content">
          <div class="invoice-details">
            <div class="bill-to">
              <h3>Bill To</h3>
              <strong>${data.clientName}</strong><br>
              ${data.clientEmail}<br>
              ${data.clientAddress.replace(/\n/g, '<br>')}
            </div>
            <div class="invoice-info">
              <h3>${data.documentType} Information</h3>
              <strong>Issue Date:</strong> ${new Date(data.issueDate).toLocaleDateString()}<br>
              ${data.dueDate ? `<strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}<br>` : ''}
              ${data.expiryDate ? `<strong>Valid Until:</strong> ${new Date(data.expiryDate).toLocaleDateString()}<br>` : ''}
              <strong>Status:</strong> <span class="status-badge status-${data.status.toLowerCase()}">${data.status}</span>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th style="width: 80px;">QTY</th>
                <th style="width: 120px;">UNIT PRICE</th>
                <th style="width: 120px;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>R ${item.unitPrice.toFixed(2)}</td>
                  <td>R ${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">R ${data.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>VAT (${data.vatRate}%):</td>
                <td style="text-align: right;">R ${data.vatAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Total:</td>
                <td style="text-align: right;">R ${data.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        ${data.notes || data.terms ? `
          <div class="footer">
            ${data.notes ? `
              <h4>Notes:</h4>
              <p>${data.notes}</p>
            ` : ''}
            ${data.terms ? `
              <h4>Terms & Conditions:</h4>
              <p>${data.terms}</p>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `
};

// Available templates
export const invoiceTemplates: Template[] = [
  modernBlueTemplate,
  classicTemplate,
  minimalistTemplate,
  corporateTemplate
];

export const quoteTemplates: Template[] = [
  { ...modernBlueTemplate, category: 'quote' },
  { ...classicTemplate, category: 'quote' },
  { ...minimalistTemplate, category: 'quote' },
  { ...corporateTemplate, category: 'quote' }
];

// Get template by ID
export const getTemplateById = (id: string): Template | undefined => {
  return [...invoiceTemplates, ...quoteTemplates].find(template => template.id === id);
};

// Default company information (can be made configurable later)
export const getDefaultCompanyInfo = () => ({
  companyName: 'Timely Mate',
  companyAddress: '123 Business Street\nCape Town, 8001\nSouth Africa',
  companyEmail: 'hello@timelymate.com',
  companyPhone: '+27 21 123 4567',
  companyWebsite: 'www.timelymate.com'
}); 