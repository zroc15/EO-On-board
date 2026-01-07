import { useState, useEffect } from 'react';
import { Stakeholders } from '../types';

interface Props {
  data?: Stakeholders | null;
  onSave: (data: Stakeholders) => void;
  disabled: boolean;
}

export default function StakeholdersSection({ data, onSave, disabled }: Props) {
  const [formData, setFormData] = useState<Stakeholders>({
    eliteops_account_rep: '',
    eliteops_solutions_architect: '',
    zscaler_account_rep: '',
    zscaler_se: '',
    customer_primary_name: '',
    customer_primary_email: '',
    customer_primary_phone: '',
    customer_secondary_name: '',
    customer_secondary_email: '',
    customer_secondary_phone: ''
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Stakeholders, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-4xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <h3 className="text-lg font-semibold text-gray-900">EliteOps Team</h3>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-900">
              Account Rep
            </label>
            <input
              type="text"
              value={formData.eliteops_account_rep || ''}
              onChange={(e) => handleChange('eliteops_account_rep', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-900">
              Solutions Architect <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.eliteops_solutions_architect}
              onChange={(e) => handleChange('eliteops_solutions_architect', e.target.value)}
              required
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Zscaler Team</h3>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-900">
              Zscaler Account Rep
            </label>
            <input
              type="text"
              value={formData.zscaler_account_rep || ''}
              onChange={(e) => handleChange('zscaler_account_rep', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-900">
              Zscaler SE
            </label>
            <input
              type="text"
              value={formData.zscaler_se || ''}
              onChange={(e) => handleChange('zscaler_se', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Contacts</h3>
            <p className="mt-1 text-sm text-gray-500">
              No deployment without a named technical owner on the customer side.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Primary Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customer_primary_name}
              onChange={(e) => handleChange('customer_primary_name', e.target.value)}
              required
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Primary Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.customer_primary_email}
              onChange={(e) => handleChange('customer_primary_email', e.target.value)}
              required
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Primary Contact Phone
            </label>
            <input
              type="tel"
              value={formData.customer_primary_phone || ''}
              onChange={(e) => handleChange('customer_primary_phone', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Secondary Contact Name
            </label>
            <input
              type="text"
              value={formData.customer_secondary_name || ''}
              onChange={(e) => handleChange('customer_secondary_name', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Secondary Contact Email
            </label>
            <input
              type="email"
              value={formData.customer_secondary_email || ''}
              onChange={(e) => handleChange('customer_secondary_email', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Secondary Contact Phone
            </label>
            <input
              type="tel"
              value={formData.customer_secondary_phone || ''}
              onChange={(e) => handleChange('customer_secondary_phone', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Stakeholders
        </button>
      </div>
    </form>
  );
}
