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
    sow_file_name: undefined,
    sow_file_data: undefined,
    sow_uploaded_at: undefined
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

    // Validate SOW upload
    if (!formData.sow_file_name && !uploadedFile) {
      alert('Please upload a Statement of Work (SOW) document to continue.');
      return;
    }

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, Word, or Excel document');
      return;
    }

    setUploadedFile(file);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        sow_file_name: file.name,
        sow_file_data: base64,
        sow_uploaded_at: new Date().toISOString()
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData((prev) => ({
      ...prev,
      sow_file_name: undefined,
      sow_file_data: undefined,
      sow_uploaded_at: undefined
    }));
  };

  const sowUploaded = formData.sow_file_name || uploadedFile;

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-4xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <h3 className="text-2xl font-bold text-gray-900 gradient-text">Scope</h3>
            <p className="mt-2 text-sm text-gray-600">Define the project scope and deployment details.</p>
          </div>

          {/* Products */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Products & Services <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PRODUCT_OPTIONS.map((product) => (
                <div key={product} className="relative flex items-start p-3 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-all hover:shadow-md">
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

          {/* Deployment Details */}
          <div className="col-span-full border-t-2 border-primary-100 pt-6 mt-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Deployment Details</h4>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Deployment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.deployment_type || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, deployment_type: e.target.value as DeploymentType }))}
              required
              disabled={disabled}
              className="block w-full rounded-lg border-2 border-gray-300 bg-white py-2.5 px-4 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:bg-gray-100"
            >
              <option value="">Select type...</option>
              <option value="POC">POC</option>
              <option value="Greenfield">Greenfield</option>
              <option value="Optimize">Optimize</option>
              <option value="ProServ">ProServ</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Contract Start Date
            </label>
            <input
              type="date"
              value={formData.contract_start_date || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, contract_start_date: e.target.value }))}
              disabled={disabled}
              className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-4 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:bg-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Term Length (months)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.term_length || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, term_length: parseInt(e.target.value) || undefined }))}
              disabled={disabled}
              placeholder="12"
              className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-4 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:bg-gray-100"
            />
          </div>

          {/* SOW Upload */}
          <div className="col-span-full border-t-2 border-primary-100 pt-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Statement of Work (SOW)</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Upload the approved SOW document. <span className="text-red-500 font-medium">Required to proceed.</span>
                </p>
              </div>
              {sowUploaded && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Uploaded
                </span>
              )}
            </div>

            {!sowUploaded ? (
              <div className="relative">
                <input
                  type="file"
                  id="sow-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={disabled}
                  className="sr-only"
                />
                <label
                  htmlFor="sow-upload"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    disabled
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-primary-300 bg-primary-50/30 hover:bg-primary-50 hover:border-primary-500'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-12 h-12 mb-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm font-semibold text-gray-700">
                      <span className="text-primary-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, Word, or Excel (max. 10MB)</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-primary-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{formData.sow_file_name || uploadedFile?.name}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded {formData.sow_uploaded_at ? new Date(formData.sow_uploaded_at).toLocaleString() : 'just now'}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-6 border-t-2 border-gray-100 px-4 py-4 sm:px-8 bg-gray-50/50 rounded-b-2xl">
        <button
          type="submit"
          disabled={disabled}
          className="group relative inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Scope
          <svg className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
