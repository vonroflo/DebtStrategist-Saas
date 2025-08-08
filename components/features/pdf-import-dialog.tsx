"use client";

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { extractDebtInfoFromPDF, ExtractedDebtInfo } from '@/lib/pdf-parser';
import { Debt } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/algos/utils';

interface PDFImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDebtExtracted: (debt: Omit<Debt, 'id'>) => void;
}

type ImportStep = 'upload' | 'processing' | 'review' | 'complete';

export function PDFImportDialog({ open, onOpenChange, onDebtExtracted }: PDFImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedDebtInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a valid PDF file');
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      const extracted = await extractDebtInfoFromPDF(file);
      setExtractedInfo(extracted);
      setStep('review');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process PDF';
      setError(errorMessage);
      setStep('upload');
      console.error('PDF processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedInfo) return;

    const debtData: Omit<Debt, 'id'> = {
      name: extractedInfo.name || 'Imported Debt',
      balance: extractedInfo.balance || 0,
      apr: (extractedInfo.apr || 0) / 100, // Convert percentage to decimal
      minPayment: extractedInfo.minPayment || 0,
      dueDay: extractedInfo.dueDay,
      type: extractedInfo.type || 'credit_card',
    };

    onDebtExtracted(debtData);
    setStep('complete');
    
    // Reset after a short delay
    setTimeout(() => {
      resetDialog();
      onOpenChange(false);
    }, 2000);
  };

  const resetDialog = () => {
    setStep('upload');
    setFile(null);
    setExtractedInfo(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const getStepProgress = () => {
    switch (step) {
      case 'upload': return 25;
      case 'processing': return 50;
      case 'review': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import from PDF Statement
          </DialogTitle>
          <DialogDescription>
            Upload your credit card or loan statement and we'll extract the debt information automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('pdf-upload')?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {file ? file.name : 'Drop your PDF statement here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600">💡</div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Supported Documents</p>
                    <ul className="text-xs space-y-1">
                      <li>• Credit card statements</li>
                      <li>• Personal loan statements</li>
                      <li>• Mortgage statements</li>
                      <li>• Auto loan statements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium mb-2">Processing your statement...</p>
              <p className="text-sm text-muted-foreground">
                Extracting debt information using AI
              </p>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && extractedInfo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Review Extracted Information</h3>
                <Badge variant={extractedInfo.confidence > 0.8 ? 'default' : 'secondary'}>
                  {Math.round(extractedInfo.confidence * 100)}% confidence
                </Badge>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{extractedInfo.name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <p className="font-medium capitalize">
                        {extractedInfo.type?.replace('_', ' ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Balance</Label>
                      <p className="font-medium">
                        {extractedInfo.balance ? formatCurrency(extractedInfo.balance) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">APR</Label>
                      <p className="font-medium">
                        {extractedInfo.apr ? `${extractedInfo.apr}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Min Payment</Label>
                      <p className="font-medium">
                        {extractedInfo.minPayment ? formatCurrency(extractedInfo.minPayment) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Due Day</Label>
                      <p className="font-medium">
                        {extractedInfo.dueDay ? `${extractedInfo.dueDay}th` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please review the extracted information for accuracy. You can edit these details after adding the debt.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-medium mb-2">Debt Added Successfully!</p>
              <p className="text-sm text-muted-foreground">
                Your debt has been added to your payoff plan.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={processFile} disabled={!file || isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process PDF'
                )}
              </Button>
            </>
          )}

          {step === 'review' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleConfirm}>
                Add This Debt
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}