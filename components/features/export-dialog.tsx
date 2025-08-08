"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Table, Loader2, CheckCircle } from 'lucide-react';
import { ExportData, exportToCSV, exportToPDF } from '@/lib/export-utils';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExportData;
}

type ExportFormat = 'csv' | 'pdf';
type ExportStep = 'select' | 'processing' | 'complete';

export function ExportDialog({ open, onOpenChange, data }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [step, setStep] = useState<ExportStep>('select');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setStep('processing');

    try {
      // Add a small delay to show the processing state
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (selectedFormat === 'csv') {
        await exportToCSV(data);
      } else {
        await exportToPDF(data);
      }

      setStep('complete');
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setStep('select');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedFormat('pdf');
    onOpenChange(false);
  };

  const formatOptions = [
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF Report',
      description: 'Complete plan with charts and summary',
      icon: FileText,
      recommended: true,
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV Data',
      description: 'Payment schedule for spreadsheet analysis',
      icon: Table,
      recommended: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Plan
          </DialogTitle>
          <DialogDescription>
            Download your debt payoff plan for offline reference or sharing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'select' && (
            <div className="space-y-3">
              {formatOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedFormat === option.id;
                
                return (
                  <Card 
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedFormat(option.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{option.name}</h3>
                              {option.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isSelected 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {isSelected && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">📊 What's Included</p>
                  <ul className="text-xs space-y-1">
                    <li>• Complete debt summary and strategy details</li>
                    <li>• Payment schedule with dates and amounts</li>
                    <li>• Interest savings calculations</li>
                    <li>• Next move recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium mb-2">Generating your export...</p>
              <p className="text-sm text-muted-foreground">
                Creating {selectedFormat.toUpperCase()} file with your debt payoff plan
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-medium mb-2">Export Complete!</p>
              <p className="text-sm text-muted-foreground">
                Your {selectedFormat.toUpperCase()} file has been downloaded successfully.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'select' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                Export {selectedFormat.toUpperCase()}
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