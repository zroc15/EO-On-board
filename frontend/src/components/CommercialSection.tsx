import { useState, useEffect } from 'react';
import { CommercialScope, PRODUCT_OPTIONS, DeploymentType } from '../types';

interface Props {
  data?: CommercialScope | null;
  onSave: (data: CommercialScope) => void;
  disabled: boolean;
}

export default function CommercialSection({ data, onSave, disabled }: Props) {
  const [formData, setFormData] = useState<CommercialScope>({
    products_sold: [],
    contract_start_date: '',
    deployment_type: undefined,
    term_length: undefined,
    sow_created: false,
    sow_approved: false,
    sow_document_url: ''
  });

  useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        contract_start_date: data.contract_start_date ? new Date(data.contract_start_date).toISOString().split('T')[0] : ''
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleProductToggle = (product: string) => {
    setFormData((prev) => ({
      ...prev,
      products_sold: prev.products_sold.includes(product)
        ? prev.products_sold.filter((p) => p !== product)
        : [...prev.products_sold, product]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-4xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <h3 className="text-lg font-semibold text-gray-900">Products Sold</h3>
            <p className="mt-1 text-sm text-gray-500">Select all products included in this deployment.</p>
          </div>

          <div className="col-span-full">
            <div className="grid grid-cols-2 gap-3">
              {PRODUCT_OPTIONS.map((product) => (
                <div key={product} className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={formData.products_sold.includes(product)}
                      onChange={() => handleProductToggle(product)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label className="font-medium text-gray-900">{product}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Contract Details</h3>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Contract Start Date
            </label>
            <input
              type="date"
              value={formData.contract_start_date || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, contract_start_date: e.target.value }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Deployment Type
            </label>
            <select
              value={formData.deployment_type || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, deployment_type: e.target.value as DeploymentType }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">Select...</option>
              <option value="POC">POC</option>
              <option value="Production">Production</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Term Length (months)
            </label>
            <input
              type="number"
              value={formData.term_length || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, term_length: parseInt(e.target.value) || undefined }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Statement of Work (SOW)</h3>
            <p className="mt-1 text-sm text-gray-500">
              SOW must be created and approved before moving to Leadership Approval.
            </p>
          </div>

          <div className="sm:col-span-3">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={formData.sow_created}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sow_created: e.target.checked }))}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label className="font-medium text-gray-900">SOW Created</label>
              </div>
            </div>
          </div>

          <div className="sm:col-span-3">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={formData.sow_approved}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sow_approved: e.target.checked }))}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label className="font-medium text-gray-900">SOW Approved</label>
              </div>
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-900">
              SOW Document URL
            </label>
            <input
              type="url"
              value={formData.sow_document_url || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, sow_document_url: e.target.value }))}
              disabled={disabled}
              placeholder="https://..."
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
          Save Commercial Data
        </button>
      </div>
    </form>
  );
}
