import React from 'react';
import KitchenDisplaySystem from './KitchenDisplaySystem';

interface KitchenDashboardProps {
  email?: string;
  password?: string;
}

const KitchenDashboard: React.FC<KitchenDashboardProps> = () => {
  return <KitchenDisplaySystem />;
};

export default KitchenDashboard;