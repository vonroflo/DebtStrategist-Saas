"use client";

import { useState } from 'react';
import { Debt } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, CreditCard, Home, DollarSign, FileText, Upload } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/algos/utils';
import { PDFImportDialog } from './pdf-import-dialog';

interface DebtTableProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onUpdateDebt: (id: string, debt: Partial<Debt>) => void;
  onDeleteDebt: (id: string) => void;
  className?: string;
}

const debtTypeIcons = {
  credit_card: CreditCard,
  loan: DollarSign,
  mortgage: Home,
  other: FileText,
};

const debtTypeLabels = {
  credit_card: 'Credit Card',
  loan: 'Loan',
  mortgage: 'Mortgage',
  other: 'Other',
};

export function DebtTable({ debts, onAddDebt, onUpdateDebt, onDeleteDebt, className }: DebtTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPDFImportOpen, setIsPDFImportOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    apr: '',
    minPayment: '',
    dueDay: '',
    type: 'credit_card' as Debt['type'],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      balance: '',
      apr: '',
      minPayment: '',
      dueDay: '',
      type: 'credit_card',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const debtData = {
      name: formData.name,
      balance: parseFloat(formData.balance),
      apr: parseFloat(formData.apr) / 100, // Convert percentage to decimal
      minPayment: parseFloat(formData.minPayment),
      dueDay: formData.dueDay ? parseInt(formData.dueDay) : undefined,
      type: formData.type,
    };

    if (editingDebt) {
      onUpdateDebt(editingDebt.id, debtData);
      setEditingDebt(null);
    } else {
      onAddDebt(debtData);
      setIsAddDialogOpen(false);
    }
    
    resetForm();
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name,
      balance: debt.balance.toString(),
      apr: (debt.apr * 100).toString(), // Convert decimal to percentage
      minPayment: debt.minPayment.toString(),
      dueDay: debt.dueDay?.toString() || '',
      type: debt.type || 'credit_card',
    });
  };

  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Your Debts</CardTitle>
            <CardDescription>
              {debts.length === 0 
                ? "Add your debts to get started with your payoff plan"
                : `${debts.length} debt${debts.length !== 1 ? 's' : ''} • Total: ${formatCurrency(totalBalance)}`
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPDFImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import PDF
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manually
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Debt</DialogTitle>
                <DialogDescription>
                  Enter the details of your debt to include it in your payoff plan.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="debt-name">Name</Label>
                  <Input
                    id="debt-name"
                    type="text"
                    placeholder="e.g., Chase Freedom Card"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="debt-balance">Current Balance</Label>
                    <Input
                      id="debt-balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="debt-apr">APR (%)</Label>
                    <Input
                      id="debt-apr"
                      type="number"
                      step="0.01"
                      placeholder="23.99"
                      value={formData.apr}
                      onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="debt-min-payment">Minimum Payment</Label>
                    <Input
                      id="debt-min-payment"
                      type="number"
                      step="0.01"
                      placeholder="25.00"
                      value={formData.minPayment}
                      onChange={(e) => setFormData({ ...formData, minPayment: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="debt-due-day">Due Day (Optional)</Label>
                    <Input
                      id="debt-due-day"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="15"
                      value={formData.dueDay}
                      onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="debt-type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: Debt['type']) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select debt type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="loan">Personal Loan</SelectItem>
                      <SelectItem value="mortgage">Mortgage</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button type="submit">Add Debt</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* PDF Import Dialog */}
          <PDFImportDialog
            open={isPDFImportOpen}
            onOpenChange={setIsPDFImportOpen}
            onDebtExtracted={onAddDebt}
          />
        </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {debts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No debts added yet</p>
            <p className="text-sm">Add your first debt to start building your payoff plan</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">APR</TableHead>
                  <TableHead className="text-right">Min Payment</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((debt) => {
                  const IconComponent = debtTypeIcons[debt.type || 'other'];
                  return (
                    <TableRow key={debt.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{debt.name}</div>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {debtTypeLabels[debt.type || 'other']}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(debt.balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(debt.apr)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(debt.minPayment)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(debt)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onDeleteDebt(debt.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(totalBalance)}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(totalMinPayment)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            {/* Edit Dialog */}
            <Dialog open={!!editingDebt} onOpenChange={(open) => !open && setEditingDebt(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Debt</DialogTitle>
                  <DialogDescription>
                    Update the details of your debt.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="edit-debt-name">Name</Label>
                    <Input
                      id="edit-debt-name"
                      type="text"
                      placeholder="e.g., Chase Freedom Card"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="edit-debt-balance">Current Balance</Label>
                      <Input
                        id="edit-debt-balance"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="edit-debt-apr">APR (%)</Label>
                      <Input
                        id="edit-debt-apr"
                        type="number"
                        step="0.01"
                        placeholder="23.99"
                        value={formData.apr}
                        onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="edit-debt-min-payment">Minimum Payment</Label>
                      <Input
                        id="edit-debt-min-payment"
                        type="number"
                        step="0.01"
                        placeholder="25.00"
                        value={formData.minPayment}
                        onChange={(e) => setFormData({ ...formData, minPayment: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="edit-debt-due-day">Due Day (Optional)</Label>
                      <Input
                        id="edit-debt-due-day"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="15"
                        value={formData.dueDay}
                        onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="edit-debt-type">Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: Debt['type']) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select debt type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="loan">Personal Loan</SelectItem>
                        <SelectItem value="mortgage">Mortgage</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditingDebt(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">Update Debt</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}