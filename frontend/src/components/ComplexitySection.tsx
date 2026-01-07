import { useState } from 'react';
import { ComplexityLevel } from '../types';

interface Props {
  complexityLevel?: ComplexityLevel;
  onSave: (level: ComplexityLevel) => void;
  disabled: boolean;
}

export default function ComplexitySection({ complexityLevel, onSave, disabled }: Props) {
  const [selected, setSelected] = useState<ComplexityLevel | ''>((complexityLevel || ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      onSave(selected as ComplexityLevel);
    }
  };

  const complexityLevels = [
    {
      level: 'L1' as ComplexityLevel,
      title: 'L1: Straightforward',
      description: 'Simple deployment with standard configuration. Junior engineers can handle.',
      examples: [
        'Standard ZIA deployment for < 500 users',
        'Basic ZPA deployment with < 5 applications',
        'Single office location',
        'Standard IdP integration (Okta/Entra)'
      ]
    },
    {
      level: 'L2' as ComplexityLevel,
      title: 'L2: Normal Deployment',
      description: 'Moderate complexity with some customization required.',
      examples: [
        'ZIA deployment for 500-2000 users',
        'ZPA deployment with 5-20 applications',
        'Multiple office locations',
        'Custom DLP policies',
        'Some legacy technology migration'
      ]
    },
    {
      level: 'L3' as ComplexityLevel,
      title: 'L3: Senior Engineer Required',
      description: 'Complex deployment with significant customization and integrations.',
      examples: [
        'ZIA deployment for > 2000 users',
        'ZPA deployment with > 20 applications',
        'Complex multi-cloud environment',
        'Advanced DLP with custom classifiers',
        'Major VPN replacement',
        'Multiple SIEM integrations'
      ]
    },
    {
      level: 'L4' as ComplexityLevel,
      title: 'L4: Expert Required',
      description: 'Highly complex deployment requiring extensive expertise and planning.',
      examples: [
        'Enterprise-scale deployment (> 10,000 users)',
        'Complex Zero Trust architecture transformation',
        'Custom integrations and automation',
        'Multi-tenant/MSP deployments',
        'High-security environments (financial, government)',
        'Extensive legacy technology replacement'
      ]
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="max-w-4xl">
          <h3 className="text-lg font-semibold text-gray-900">Complexity Scoring</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select the complexity level for this deployment. This determines which engineers can be assigned.
          </p>

          <div className="mt-6 space-y-4">
            {complexityLevels.map((item) => (
              <div
                key={item.level}
                className={`relative border rounded-lg p-4 cursor-pointer transition ${
                  selected === item.level
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                    : 'border-gray-300 hover:border-gray-400'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setSelected(item.level)}
              >
                <div className="flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      type="radio"
                      name="complexity"
                      value={item.level}
                      checked={selected === item.level}
                      onChange={() => !disabled && setSelected(item.level)}
                      disabled={disabled}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-gray-900">{item.title}</label>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.level === 'L1'
                            ? 'bg-green-100 text-green-800'
                            : item.level === 'L2'
                            ? 'bg-blue-100 text-blue-800'
                            : item.level === 'L3'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.level}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{item.description}</p>
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Examples:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {item.examples.map((example, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {complexityLevel && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Complexity:</strong> {complexityLevel}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <button
          type="submit"
          disabled={disabled || !selected}
          className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Complexity Level
        </button>
      </div>
    </form>
  );
}
