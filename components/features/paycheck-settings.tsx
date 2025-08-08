"use client";

import { PayFrequency } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Calendar } from 'lucide-react';

interface PaycheckSettingsProps {
  paycheckAmount: number;
  payFrequency: PayFrequency;
  onPaycheckAmountChange: (amount: number) => void;
  onPayFrequencyChange: (frequency: PayFrequency) => void;
  className?: string;
}

const frequencyLabels = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly (Every 2 weeks)',
  monthly: 'Monthly',
};

export function PaycheckSettings({
  paycheckAmount,
  payFrequency,
  onPaycheckAmountChange,
  onPayFrequencyChange,
  className
}: PaycheckSettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Paycheck Settings
        </CardTitle>
        <CardDescription>
          Tell us about your income to create your personalized payoff plan
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paycheck-amount">Extra Amount Per Paycheck</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="paycheck-amount"
                type="number"
                step="0.01"
                placeholder="450.00"
                value={paycheckAmount || ''}
                onChange={(e) => onPaycheckAmountChange(parseFloat(e.target.value) || 0)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Amount available for debt payments beyond minimums
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pay-frequency">Pay Frequency</Label>
            <Select value={payFrequency} onValueChange={onPayFrequencyChange}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often you get paid
            </p>
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">💡 Quick Calculation Tip</p>
            <p className="text-blue-700 text-xs">
              Take your monthly discretionary income and divide by your pay periods per month. 
              For bi-weekly: multiply by 12 and divide by 26.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}