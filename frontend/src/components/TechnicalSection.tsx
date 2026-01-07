import { useState, useEffect } from 'react';
import { TechnicalEnvironment } from '../types';

interface Props {
  data?: TechnicalEnvironment | null;
  onSave: (data: TechnicalEnvironment) => void;
  disabled: boolean;
}

export default function TechnicalSection({ data, onSave, disabled }: Props) {
  const [formData, setFormData] = useState<TechnicalEnvironment>({
    idp: '',
    edr: '',
    mdm: '',
    device_os_mac_percent: 0,
    device_os_windows_percent: 0,
    device_os_linux_percent: 0,
    zia_critical_saas_apps: [],
    zpa_critical_internal_apps: [],
    zpa_app_types: [],
    branches_locations: '',
    lss_nss: false,
    siem: '',
    vpn: '',
    cloud_providers: [],
    replacing_tech: false,
    replacing_tech_details: ''
  });

  const [newSaasApp, setNewSaasApp] = useState({ name: '', importance: '' });
  const [newInternalApp, setNewInternalApp] = useState({ name: '', type: '' });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSaasApp = () => {
    if (newSaasApp.name && newSaasApp.importance) {
      setFormData((prev) => ({
        ...prev,
        zia_critical_saas_apps: [...prev.zia_critical_saas_apps, newSaasApp]
      }));
      setNewSaasApp({ name: '', importance: '' });
    }
  };

  const removeSaasApp = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      zia_critical_saas_apps: prev.zia_critical_saas_apps.filter((_, i) => i !== index)
    }));
  };

  const addInternalApp = () => {
    if (newInternalApp.name && newInternalApp.type) {
      setFormData((prev) => ({
        ...prev,
        zpa_critical_internal_apps: [...prev.zpa_critical_internal_apps, newInternalApp]
      }));
      setNewInternalApp({ name: '', type: '' });
    }
  };

  const removeInternalApp = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      zpa_critical_internal_apps: prev.zpa_critical_internal_apps.filter((_, i) => i !== index)
    }));
  };

  const handleCloudProviderToggle = (provider: string) => {
    setFormData((prev) => ({
      ...prev,
      cloud_providers: prev.cloud_providers.includes(provider)
        ? prev.cloud_providers.filter((p) => p !== provider)
        : [...prev.cloud_providers, provider]
    }));
  };

  const handleAppTypeToggle = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      zpa_app_types: prev.zpa_app_types.includes(type)
        ? prev.zpa_app_types.filter((t) => t !== type)
        : [...prev.zpa_app_types, type]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-4xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <h3 className="text-lg font-semibold text-gray-900">Identity & Endpoint</h3>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">IdP</label>
            <input
              type="text"
              value={formData.idp || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, idp: e.target.value }))}
              disabled={disabled}
              placeholder="Okta, Entra, Ping, etc."
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">EDR</label>
            <input
              type="text"
              value={formData.edr || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, edr: e.target.value }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">MDM</label>
            <input
              type="text"
              value={formData.mdm || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, mdm: e.target.value }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-900">Device OS Distribution (%)</label>
            <div className="mt-2 grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500">Mac</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_os_mac_percent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, device_os_mac_percent: parseInt(e.target.value) || 0 }))}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Windows</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_os_windows_percent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, device_os_windows_percent: parseInt(e.target.value) || 0 }))}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Linux</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_os_linux_percent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, device_os_linux_percent: parseInt(e.target.value) || 0 }))}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Zscaler ZIA - Critical SaaS Apps</h3>
          </div>

          <div className="col-span-full">
            {formData.zia_critical_saas_apps.map((app, index) => (
              <div key={index} className="flex items-center gap-4 mb-2 p-2 bg-gray-50 rounded">
                <span className="flex-1 text-sm">{app.name} - {app.importance}</span>
                <button
                  type="button"
                  onClick={() => removeSaasApp(index)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}

            {!disabled && (
              <div className="flex gap-4 mt-2">
                <input
                  type="text"
                  value={newSaasApp.name}
                  onChange={(e) => setNewSaasApp((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="App name"
                  className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                />
                <select
                  value={newSaasApp.importance}
                  onChange={(e) => setNewSaasApp((prev) => ({ ...prev, importance: e.target.value }))}
                  className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                >
                  <option value="">Importance</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  type="button"
                  onClick={addSaasApp}
                  className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Zscaler ZPA</h3>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-900 mb-2">Critical Internal Apps</label>
            {formData.zpa_critical_internal_apps.map((app, index) => (
              <div key={index} className="flex items-center gap-4 mb-2 p-2 bg-gray-50 rounded">
                <span className="flex-1 text-sm">{app.name} - {app.type}</span>
                <button
                  type="button"
                  onClick={() => removeInternalApp(index)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}

            {!disabled && (
              <div className="flex gap-4 mt-2">
                <input
                  type="text"
                  value={newInternalApp.name}
                  onChange={(e) => setNewInternalApp((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="App name"
                  className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                />
                <input
                  type="text"
                  value={newInternalApp.type}
                  onChange={(e) => setNewInternalApp((prev) => ({ ...prev, type: e.target.value }))}
                  placeholder="Type"
                  className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addInternalApp}
                  className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-900 mb-2">App Types</label>
            <div className="flex gap-3">
              {['web', 'client-server', 'SSH', 'RDP'].map((type) => (
                <div key={type} className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={formData.zpa_app_types.includes(type)}
                      onChange={() => handleAppTypeToggle(type)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label className="font-medium text-gray-900">{type}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-900">Branches / Locations</label>
            <textarea
              value={formData.branches_locations || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, branches_locations: e.target.value }))}
              disabled={disabled}
              rows={3}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="col-span-full border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Logging & Network</h3>
          </div>

          <div className="sm:col-span-2">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={formData.lss_nss}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lss_nss: e.target.checked }))}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-900">LSS / NSS Required</label>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">SIEM</label>
            <input
              type="text"
              value={formData.siem || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, siem: e.target.value }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">VPN</label>
            <input
              type="text"
              value={formData.vpn || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, vpn: e.target.value }))}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-900 mb-2">Cloud Providers</label>
            <div className="flex gap-3">
              {['AWS', 'Azure', 'GCP'].map((provider) => (
                <div key={provider} className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={formData.cloud_providers.includes(provider)}
                      onChange={() => handleCloudProviderToggle(provider)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label className="font-medium text-gray-900">{provider}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-full">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={formData.replacing_tech}
                  onChange={(e) => setFormData((prev) => ({ ...prev, replacing_tech: e.target.checked }))}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-900">Replacing Existing Technology</label>
              </div>
            </div>
            {formData.replacing_tech && (
              <textarea
                value={formData.replacing_tech_details || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, replacing_tech_details: e.target.value }))}
                disabled={disabled}
                placeholder="What technology is being replaced?"
                rows={2}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Technical Environment
        </button>
      </div>
    </form>
  );
}
