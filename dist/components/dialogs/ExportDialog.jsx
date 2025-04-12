'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";
import { useTaskStore } from "@/store/TaskStore";
export function ExportDialog({ open, onOpenChange }) {
    const [format, setFormat] = useState('xlsx');
    const [includeCharts, setIncludeCharts] = useState(true);
    // Memoize the tasks to avoid recalculating them on every render
    const tasks = useMemo(() => useTaskStore(state => state.implementation.getFilteredTasks()), [useTaskStore(state => state.implementation.getFilteredTasks())]);
    const handleExport = async () => {
        const ExportService = (await import('@/services/ExportService')).ExportService;
        try {
            await ExportService.getInstance().exportTasks(tasks, format, {
                includeCharts: format === 'xlsx' ? includeCharts : false
            });
            onOpenChange(false);
        }
        catch (error) {
            console.error('Export failed:', error);
            // TODO: Show error toast
        }
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Tasks</DialogTitle>
          <DialogDescription>
            Choose your preferred export format and options.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <div className="col-span-3">
              <Select value={format} onValueChange={(value) => setFormat(value)}>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </Select>
            </div>
          </div>
          {format === 'xlsx' && (<div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 flex items-center space-x-2">
                <Checkbox id="charts" checked={includeCharts} onCheckedChange={(checked) => setIncludeCharts(checked)}/>
                <Label htmlFor="charts">Include charts and analytics</Label>
              </div>
            </div>)}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
