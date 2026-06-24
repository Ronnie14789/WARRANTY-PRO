import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

const schema = z.object({
  registrationNumber: z.string().min(1),
  vin: z.string().min(6),
  chassisNumber: z.string().min(1),
  engineNumber: z.string().min(1),
  model: z.string().min(1),
  make: z.string().min(1),
  year: z.string().min(1),
  mileage: z.string().min(1),
  fleetOwner: z.string().min(1),
  driverName: z.string().min(1),
  driverContact: z.string().min(1),
  failedPart: z.string().min(1),
  partNumber: z.string().min(1),
  failureDate: z.string().min(1),
  failureLocation: z.string().min(1),
  breakdownLocation: z.string().min(1),
  symptoms: z.string().min(1),
  incidentDescription: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

const fields: Array<{ key: keyof FormValues; label: string; type?: string }> = [
  { key: 'registrationNumber', label: 'Registration Number' },
  { key: 'vin', label: 'VIN' },
  { key: 'chassisNumber', label: 'Chassis Number' },
  { key: 'engineNumber', label: 'Engine Number' },
  { key: 'model', label: 'Vehicle Model' },
  { key: 'make', label: 'Vehicle Make' },
  { key: 'year', label: 'Vehicle Year', type: 'number' },
  { key: 'mileage', label: 'Mileage', type: 'number' },
  { key: 'fleetOwner', label: 'Fleet Owner' },
  { key: 'driverName', label: 'Driver Name' },
  { key: 'driverContact', label: 'Driver Contact' },
  { key: 'failedPart', label: 'Failed Part' },
  { key: 'partNumber', label: 'Part Number' },
  { key: 'failureDate', label: 'Failure Date', type: 'date' },
  { key: 'failureLocation', label: 'Failure Location' },
  { key: 'breakdownLocation', label: 'Breakdown Location' },
  { key: 'symptoms', label: 'Symptoms' },
  { key: 'incidentDescription', label: 'Description of Incident' }
];

export const ClaimWizardPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (values: FormValues) => {
    alert(`Claim prepared for submission: ${values.registrationNumber}`);
  };

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold">Multi-step Claim Wizard</h3>
      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        {fields.map(({ key, label, type }) => (
          <label key={key} className="space-y-1 text-sm">
            <span>{label}</span>
            <Input type={type ?? 'text'} {...register(key)} />
            {errors[key] ? <span className="text-xs text-red-600">{errors[key]?.message as string}</span> : null}
          </label>
        ))}

        <label className="md:col-span-2 space-y-2 text-sm">
          <span>Evidence Upload (JPG, PNG, PDF, MP4)</span>
          <Input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.mp4" />
        </label>

        <div className="md:col-span-2">
          <Button type="submit">Submit Claim</Button>
        </div>
      </form>
    </Card>
  );
};
