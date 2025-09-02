import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Check, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DraftSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  className?: string;
}

export function DraftSaveIndicator({ isSaving, lastSaved, className = '' }: DraftSaveIndicatorProps) {
  if (isSaving) {
    return (
      <Badge variant="secondary" className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Sauvegarde...</span>
      </Badge>
    );
  }

  if (lastSaved) {
    return (
      <Badge variant="outline" className={`flex items-center gap-2 text-green-700 border-green-200 bg-green-50 ${className}`}>
        <Check className="w-3 h-3" />
        <span className="text-xs">
          Sauvegardé {formatDistanceToNow(lastSaved, { addSuffix: true, locale: fr })}
        </span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`flex items-center gap-2 text-orange-700 border-orange-200 bg-orange-50 ${className}`}>
      <AlertTriangle className="w-3 h-3" />
      <span className="text-xs">Non sauvegardé</span>
    </Badge>
  );
}

interface DraftRestoreNotificationProps {
  onRestore: () => void;
  onIgnore: () => void;
  lastSaved: Date;
}

export function DraftRestoreNotification({ onRestore, onIgnore, lastSaved }: DraftRestoreNotificationProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Save className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-1">
            Brouillon trouvé
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            Nous avons trouvé un brouillon de votre candidature sauvegardé{' '}
            {formatDistanceToNow(lastSaved, { addSuffix: true, locale: fr })}.
            Ce brouillon est conservé de manière permanente jusqu'à soumission de votre candidature.
            Voulez-vous le restaurer ?
          </p>
          <div className="flex gap-2">
            <button
              onClick={onRestore}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Restaurer le brouillon
            </button>
            <button
              onClick={onIgnore}
              className="px-3 py-1.5 bg-white text-blue-600 text-sm border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
            >
              Commencer à zéro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
