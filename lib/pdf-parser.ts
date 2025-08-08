import { Debt } from './types';

export interface ExtractedDebtInfo {
  name?: string;
  balance?: number;
  apr?: number;
  minPayment?: number;
  dueDay?: number;
  type?: Debt['type'];
  confidence: number; // 0-1 score of extraction confidence
}

export async function extractDebtInfoFromPDF(file: File): Promise<ExtractedDebtInfo> {
  try {
    // Convert PDF to text
    const pdfText = await extractTextFromPDF(file);
    
    // Use pattern matching to extract structured data (fallback when AI is not available)
    const extractedInfo = await extractDebtInfoWithPatterns(pdfText, file.name);
    
    return extractedInfo;
  } catch (error) {
    console.error('Error extracting debt info from PDF:', error);
    throw new Error('Failed to extract debt information from PDF. Please try adding the debt manually.');
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert PDF to text using FormData to send to API
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/extract-pdf', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to extract text from PDF');
    }
    
    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw new Error('Unable to process PDF file. Please check the file format and try again.');
  }
}

async function extractDebtInfoWithPatterns(pdfText: string, fileName: string): Promise<ExtractedDebtInfo> {
  // Pattern matching for debt information extraction
  const patterns = {
    balance: /(?:current balance|balance|amount owed|outstanding balance)[\s:$]*([0-9,]+\.?\d*)/i,
    apr: /(?:annual percentage rate|apr|interest rate|rate)[\s:]*([0-9]+\.?\d*)%?/i,
    minPayment: /(?:minimum payment|min payment|payment due|minimum due)[\s:$]*([0-9,]+\.?\d*)/i,
    dueDay: /(?:payment due date|due date)[\s:]*\w+\s+(\d{1,2})/i,
  };

  const extracted: ExtractedDebtInfo = {
    confidence: 0.6, // Reasonable confidence for pattern matching
  };

  // Extract name from filename or content
  if (fileName.toLowerCase().includes('chase')) {
    extracted.name = 'Chase Credit Card';
    extracted.type = 'credit_card';
  } else if (fileName.toLowerCase().includes('capital')) {
    extracted.name = 'Capital One Card';
    extracted.type = 'credit_card';
  } else if (pdfText.toLowerCase().includes('chase')) {
    extracted.name = 'Chase Credit Card';
    extracted.type = 'credit_card';
  } else if (pdfText.toLowerCase().includes('capital one')) {
    extracted.name = 'Capital One Card';
    extracted.type = 'credit_card';
  } else if (pdfText.toLowerCase().includes('loan')) {
    extracted.name = 'Personal Loan';
    extracted.type = 'loan';
  } else {
    extracted.name = 'Credit Card';
    extracted.type = 'credit_card';
  }

  // Extract balance
  const balanceMatch = pdfText.match(patterns.balance);
  if (balanceMatch) {
    extracted.balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
  }

  // Extract APR
  const aprMatch = pdfText.match(patterns.apr);
  if (aprMatch) {
    extracted.apr = parseFloat(aprMatch[1]);
  }

  // Extract minimum payment
  const minPaymentMatch = pdfText.match(patterns.minPayment);
  if (minPaymentMatch) {
    extracted.minPayment = parseFloat(minPaymentMatch[1].replace(/,/g, ''));
  }

  // Extract due day
  const dueDayMatch = pdfText.match(patterns.dueDay);
  if (dueDayMatch) {
    extracted.dueDay = parseInt(dueDayMatch[1]);
  }

  // Increase confidence if we found multiple fields
  let fieldsFound = 0;
  if (extracted.balance) fieldsFound++;
  if (extracted.apr) fieldsFound++;
  if (extracted.minPayment) fieldsFound++;
  if (extracted.dueDay) fieldsFound++;
  
  extracted.confidence = Math.min(0.9, 0.3 + (fieldsFound * 0.15));

  return extracted;
}

// Server-side function for actual AI extraction
export async function extractDebtInfoWithOpenAI(pdfText: string): Promise<ExtractedDebtInfo> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Extract debt information from this statement and return valid JSON with these fields:
{
  "name": "debt name",
  "balance": number,
  "apr": number (percentage),
  "minPayment": number,
  "dueDay": number (1-31),
  "type": "credit_card|loan|mortgage|other",
  "confidence": number (0-1)
}

Statement: ${pdfText}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI extraction failed:', error);
    throw new Error('Failed to extract debt information with AI');
  }
}