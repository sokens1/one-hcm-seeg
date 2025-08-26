import { useContext } from 'react';
import { MaintenanceContext } from '@/context/MaintenanceContext';

export const useMaintenance = () => useContext(MaintenanceContext);
