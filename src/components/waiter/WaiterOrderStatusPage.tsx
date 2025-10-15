import React from 'react';
import OrderStatusManagement from '../staff/OrderStatusManagement';

interface WaiterOrderStatusPageProps {
  // Add any props needed from WaiterDashboard, e.g. user, etc.
}

const WaiterOrderStatusPage: React.FC<WaiterOrderStatusPageProps> = (props) => {
  // Pass props as needed to OrderStatusManagement
  return <OrderStatusManagement {...props} />;
};

export default WaiterOrderStatusPage;
