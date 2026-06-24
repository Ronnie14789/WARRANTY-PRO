import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

export const ClaimsPage = () => (
  <div className="space-y-4">
    <Card>
      <h3 className="mb-3 text-lg font-semibold">Search & Filters</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input placeholder="Claim Number" />
        <Input placeholder="Vehicle Registration" />
        <Input placeholder="VIN" />
        <Input placeholder="Vehicle Model" />
        <Input placeholder="Part Number" />
        <Input placeholder="Part Name" />
        <Input type="date" />
        <Input placeholder="Status / Investigator" />
      </div>
    </Card>

    <Card>
      <p className="text-sm text-slate-500">Claims table integrates with /api/v1/claims filters.</p>
    </Card>
  </div>
);
