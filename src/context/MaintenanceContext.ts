import { createContext } from 'react';

type MaintenanceContextType = {
  isMaintenance: boolean;
  setMaintenance: (isActive: boolean) => void;
};

export const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenance: false,
  setMaintenance: () => {},
});
