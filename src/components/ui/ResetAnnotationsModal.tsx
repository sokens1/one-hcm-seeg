import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ResetAnnotationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (resetStatus: boolean) => void;
  protocolName: string;
  candidateName: string;
}

export function ResetAnnotationsModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  protocolName,
  candidateName 
}: ResetAnnotationsModalProps) {
  const [resetStatus, setResetStatus] = useState(false);

  const handleConfirm = () => {
    onConfirm(resetStatus);
    onClose();
    setResetStatus(false); // Reset pour la prochaine fois
  };

  const handleCancel = () => {
    onClose();
    setResetStatus(false); // Reset pour la prochaine fois
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Réinitialiser les annotations
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Vous êtes sur le point de réinitialiser toutes les annotations du {protocolName} pour <strong>{candidateName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              id="reset-annotations-only"
              checked={!resetStatus}
              onCheckedChange={(checked) => setResetStatus(!checked)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label 
                htmlFor="reset-annotations-only" 
                className="text-sm font-medium cursor-pointer"
              >
                Réinitialiser uniquement les annotations
              </Label>
              <p className="text-xs text-muted-foreground">
                Les scores et commentaires seront remis à zéro, mais le statut du candidat restera inchangé.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Checkbox
              id="reset-annotations-and-status"
              checked={resetStatus}
              onCheckedChange={setResetStatus}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label 
                htmlFor="reset-annotations-and-status" 
                className="text-sm font-medium cursor-pointer"
              >
                Réinitialiser les annotations et le statut
              </Label>
              <p className="text-xs text-muted-foreground">
                Les scores et commentaires seront remis à zéro, et le statut du candidat sera ramené au statut précédent (ex: "embauche" → "incubation").
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            className="w-full sm:w-auto gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Confirmer la réinitialisation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
