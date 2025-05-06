import { Dialog,DialogContent,DialogTitle,DialogHeader,DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface EditTaskDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  taskName: string;
  setTaskName: (name: string) => void;
  taskTime: string;
  setTaskTime: (name: string) => void;
  handleSubmitTask: () => void;
  loading: boolean;
}

export default function EditTaskDialog({
  open,
  setOpen,
  taskName,
  setTaskName,
  taskTime,
  setTaskTime,
  handleSubmitTask,
  loading,
}: EditTaskDialogProps) {


  const handleCloseDialog = () =>{
    setOpen(false);
    setTaskName('')
    setTaskTime('')
  }
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCloseDialog();
      }
      setOpen(isOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Edit Task</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Task name"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
        />
        <Input
          placeholder="Task Time"
          value={taskTime}
          onChange={e => setTaskTime(e.target.value)}
        />

        <DialogFooter>
          <Button onClick={handleSubmitTask} disabled={loading}>
          {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
