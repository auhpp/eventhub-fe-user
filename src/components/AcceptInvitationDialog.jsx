import React from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";

const AcceptInvitationDialog = ({ open, onOpenChange, onConfirm, title, description }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="items-center text-center gap-2">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full mb-2">
                        <PartyPopper size={32} />
                    </div>
                    <DialogTitle className="text-xl">{title ? title : 'Xác nhận tham gia'}?</DialogTitle>
                    <DialogDescription>
                        {description ? description : <>
                            Bạn có chắc chắn muốn tham gia sự kiện này không?<br />
                            Vé mời sẽ được gửi đến email của bạn ngay sau khi xác nhận.
                        </>
                        }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
                       Xác nhận
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AcceptInvitationDialog;