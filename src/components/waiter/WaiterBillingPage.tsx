import React from 'react';
import BillingPayments from '../staff/BillingPayments';

interface WaiterBillingPageProps {
  // Add any props needed from WaiterDashboard, e.g. user, etc.
}

const WaiterBillingPage: React.FC<WaiterBillingPageProps> = (props) => {
  // Pass props as needed to BillingPayments
  return <BillingPayments {...props} />;
};

export default WaiterBillingPage;
