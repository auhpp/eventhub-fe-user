import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AddSessionModal = ({ open, onOpenChange, value, onValueChange, selectedSessionIds, onCancel, onSubmit, event }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm khung giờ</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Select value={value} onValueChange={onValueChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn khung giờ" />
                        </SelectTrigger>
                        <SelectContent>
                            {event?.eventSessions?.filter(s => !selectedSessionIds.includes(s.id)).map(session => (
                                <SelectItem key={session.id} value={session.id.toString()}>
                                    {new Date(session.startDateTime).toLocaleString('vi-VN')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={onSubmit}>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddSessionModal