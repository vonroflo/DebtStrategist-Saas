"use client";

import { Strategy } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Target, Settings, CheckCircle } from 'lucide-react';
import { getStrategyLabel, getStrategyDescription } from '@/lib/algos/strategies';

interface StrategySelectorProps {
  selectedStrategy: Strategy;
  onStrategyChange: (strategy: Strategy) => void;
  className?: string;
}

const strategyIcons = {
  AVALANCHE: TrendingDown,
  SNOWBALL: Target,
  CUSTOM: Settings,
};

const strategyBenefits = {
  AVALANCHE: 'Minimizes total interest paid',
  SNOWBALL: 'Builds momentum with quick wins',
  CUSTOM: 'Flexible to your priorities',
};

const strategies: Strategy[] = ['AVALANCHE', 'SNOWBALL', 'CUSTOM'];

export function StrategySelector({ selectedStrategy, onStrategyChange, className }: StrategySelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Choose Your Strategy</CardTitle>
        <CardDescription>
          Select the debt payoff strategy that works best for you
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4 md:grid-cols-1">
          {strategies.map((strategy) => {
            const IconComponent = strategyIcons[strategy];
            const isSelected = selectedStrategy === strategy;
            
            return (
              <div
                key={strategy}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onStrategyChange(strategy)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {getStrategyLabel(strategy)}
                        </h3>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {getStrategyDescription(strategy)}
                      </p>
                      <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
                        {strategyBenefits[strategy]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Avalanche saves the most money, while Snowball provides psychological wins. 
            You can switch strategies anytime to see the difference.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}