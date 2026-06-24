import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

export const InvestigationsPage = () => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold">Technical Investigation</h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Input type="date" placeholder="Inspection Date" />
      <Input placeholder="Inspection Location" />
      <Input placeholder="Inspector Name" />
      <Input placeholder="Root Cause Category" />
      <Input placeholder="Visual Inspection Notes" />
      <Input placeholder="Measurements" />
      <Input placeholder="Wear Pattern Analysis" />
      <Input placeholder="Damage Description" />
      <Input placeholder="Recommended Action" />
      <Input placeholder="Repair Method" />
      <Input placeholder="Replacement Recommendation" />
      <Input placeholder="Preventive Measures" />
    </div>
  </Card>
);
