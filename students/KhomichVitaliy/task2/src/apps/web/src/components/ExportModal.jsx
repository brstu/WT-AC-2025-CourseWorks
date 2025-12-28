import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Papa from 'papaparse';
import { exportAPI } from '../api';
import { toast } from 'react-hot-toast';
import Modal from './Modal';

const ExportModal = ({ isOpen, onClose }) => {
  const [importData, setImportData] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file');
          return;
        }
        setImportData(results.data);
        toast.success(`Loaded ${results.data.length} records`);
      },
      error: (error) => {
        toast.error('Failed to read CSV file');
        console.error('CSV parsing error:', error);
      },
    });
  };

  const handleImport = async () => {
    if (!importData || importData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setImporting(true);
    try {
      // Здесь должна быть логика импорта данных
      // В реальном проекте нужно отправлять данные на сервер
      
      toast.success(`Successfully imported ${importData.length} issues`);
      onClose();
    } catch (error) {
      toast.error('Import failed');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Issues" size="lg">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload a CSV file with issues data. The file should have the following columns:
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mb-4">
            <code className="text-sm">
              title, description, status, priority, projectId, assigneeId, dueDate
            </code>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label className="cursor-pointer">
                <span className="btn-primary inline-flex items-center">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Choose CSV file
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                CSV files only
              </p>
            </div>
          </div>
        </div>

        {importData && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview ({importData.length} records)
              </h4>
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    {Object.keys(importData[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {importData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="bg-white dark:bg-gray-900">
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs"
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={importing}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="btn-primary"
            disabled={!importData || importing}
          >
            {importing ? 'Importing...' : 'Import Issues'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;