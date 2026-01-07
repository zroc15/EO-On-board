import { useState, useEffect } from 'react';
import { AdministrativeDetails, CustomerBandwidth } from '../types';

interface Props {
  data?: AdministrativeDetails | null;
  onSave: (data: AdministrativeDetails) => void;
  disabled: boolean;
}

export default function AdministrativeSection({ data, onSave, disabled }: Props) {
  const [formData, setFormData] = useState<AdministrativeDetails>({
    primary_timezone: '',
    desired_go_live_date: '',
    customer_bandwidth: undefined,
    known_blackout_periods: [],
    additional_notes: ''
  });

  const [newBlackout, setNewBlackout] = useState({ start: '', end: '', reason: '' });

  useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        desired_go_live_date: data.desired_go_live_date ? new Date(data.desired_go_live_date).toISOString().split('T')[0] : ''
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addBlackoutPeriod = () => {
    if (newBlackout.start && newBlackout.end && newBlackout.reason) {
      setFormData((prev) => ({
        ...prev,
        known_blackout_periods: [...prev.known_blackout_periods, newBlackout]
      }));
      setNewBlackout({ start: '', end: '', reason: '' });
    }
  };

  const removeBlackoutPeriod = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      known_blackout_periods: prev.known_blackout_periods.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-4xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <h3 className="text-lg font-semibold text-gray-900">Administrative Reality Check</h3>
            <p className="mt-1 text-sm text-gray-500">
              Without this information, deployment dates are fantasy.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Primary Timezone
            </label>
            <select
              value={formData.primary_timezone || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, primary_timezone: e.target.value }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">Select timezone...</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">GMT/UK</option>
              <option value="Europe/Paris">CET</option>
              <option value="Asia/Singapore">Singapore</option>
              <option value="Asia/Tokyo">Japan</option>
              <option value="Australia/Sydney">Australia</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Desired Go-Live Date
            </label>
            <input
              type="date"
              value={formData.desired_go_live_date || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, desired_go_live_date: e.target.value }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Customer Bandwidth
            </label>
            <select
              value={formData.customer_bandwidth || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, customer_bandwidth: e.target.value as CustomerBandwidth }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">Select...</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              How much time can the customer dedicate to this project?
            </p>
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Known Blackout Periods</h3>
            <p className="mt-1 text-sm text-gray-500">
              Holidays, company events, or other times when deployment work cannot happen.
            </p>
          </div>

          <div className="col-span-full">
            {formData.known_blackout_periods.map((period, index) => (
              <div key={index} className="flex items-center gap-4 mb-2 p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
                  </span>
                  <p className="text-sm text-gray-500">{period.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBlackoutPeriod(index)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}

            {!disabled && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newBlackout.start}
                    onChange={(e) => setNewBlackout((prev) => ({ ...prev, start: e.target.value }))}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newBlackout.end}
                    onChange={(e) => setNewBlackout((prev) => ({ ...prev, end: e.target.value }))}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reason</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBlackout.reason}
                      onChange={(e) => setNewBlackout((prev) => ({ ...prev, reason: e.target.value }))}
                      placeholder="Holiday freeze, etc."
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={addBlackoutPeriod}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm whitespace-nowrap"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <label className="block text-sm font-medium text-gray-900">
              Additional Notes
            </label>
            <textarea
              value={formData.additional_notes || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, additional_notes: e.target.value }))}
              disabled={disabled}
              rows={4}
              placeholder="Any other important information about the customer's availability, constraints, or special requirements..."
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
          Save Administrative Details
        </button>
      </div>
    </form>
  );
}
