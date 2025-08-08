import { NextRequest, NextResponse } from 'next/server';
import { extractDebtInfoWithOpenAI } from '@/lib/pdf-parser';
import pdf from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Please use a file smaller than 10MB.' }, { status: 400 });
    }

    // Convert PDF to text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfText = '';
    try {
      // Extract text from PDF
      const pdfData = await pdf(buffer);
      pdfText = pdfData.text;
      
      if (!pdfText.trim()) {
        return NextResponse.json({ error: 'No readable text found in PDF. The file may be image-based or corrupted.' }, { status: 400 });
      }
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json({ error: 'Unable to read PDF file. Please ensure it is a valid PDF document.' }, { status: 400 });
    }

    // Try to extract debt information using AI if API key is available
    let extractedInfo;
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        extractedInfo = await extractDebtInfoWithOpenAI(pdfText);
      } else {
        // Fallback to pattern matching
        extractedInfo = await extractDebtInfoWithPatterns(pdfText);
      }
    } catch (aiError) {
      console.warn('AI extraction failed, falling back to pattern matching:', aiError);
      // Fallback to pattern matching
      extractedInfo = await extractDebtInfoWithPatterns(pdfText);
    }

    return NextResponse.json({ 
      ...extractedInfo,
      text: pdfText.substring(0, 1000) // Return first 1000 chars for debugging
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF. Please try again or add the debt manually.' },
      { status: 500 }
    );
  }
}

// Fallback pattern matching function for when AI is not available
async function extractDebtInfoWithPatterns(pdfText: string): Promise<any> {
  const patterns = {
    balance: /(?:current balance|balance|amount owed|outstanding balance)[\s:$]*([0-9,]+\.?\d*)/i,
    apr: /(?:annual percentage rate|apr|interest rate|rate)[\s:]*([0-9]+\.?\d*)%?/i,
    minPayment: /(?:minimum payment|min payment|payment due|minimum due)[\s:$]*([0-9,]+\.?\d*)/i,
    dueDay: /(?:payment due date|due date)[\s:]*\w+\s+(\d{1,2})/i,
  };

  const extracted: any = {
    confidence: 0.6,
    name: 'Imported Debt',
    type: 'credit_card',
  };

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

  return extracted;
}