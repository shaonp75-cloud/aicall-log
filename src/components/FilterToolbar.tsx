import React from 'react';
import { Search, Filter, Download, Plus, RotateCcw, Globe } from 'lucide-react';
import { FilterState, OrderStatus, CallDisposition } from '../types/order';

interface FilterToolbarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
  totalFilteredCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filter,
  onFilterChange,
  onOpenAddModal,
  onExportCSV,
  onResetData,
  lang,
  onToggleLang,
  totalFilteredCount,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  };

  const handleStatusChange = (status: OrderStatus | 'ALL') => {
    onFilterChange({ ...filter, status });
  };

  const handleDispositionChange = (disposition: CallDisposition | 'ALL') => {
    onFilterChange({ ...filter, disposition });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    const isSame = filter.sortBy === sortBy;
    onFilterChange({
      ...filter,
      sortBy,
      sortOrder: isSame && filter.sortOrder === 'desc' ? 'asc' : 'desc',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
      {/* Top row: Search bar + Actions (Language, Export, Reset, Add Order) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              lang === 'bn'
                ? 'আইডি, নাম, ফোন নম্বর বা পণ্য দিয়ে খুঁজুন...'
                : 'Search by Order ID, Name, Phone, or Product...'
            }
            value={filter.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-colors"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ ...filter, search: '' })}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'bn' ? 'বাংলা' : 'English'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            title={lang === 'bn' ? 'সিএসভি ফাইল এক্সপোর্ট করুন' : 'Export CSV'}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title={lang === 'bn' ? 'নমুনা ডাটা রিসেট' : 'Reset sample data'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
          </button>

          {/* Add Order Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন অর্ডার যুক্ত করুন' : 'New Order'}</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Status pills / segment buttons + Call Disposition Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {lang === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}
          </span>
          {(['ALL', 'Confirmed', 'Pending', 'Processing', 'Delivered', 'Cancelled', 'Returned'] as const).map((st) => {
            const isActive = filter.status === st;
            const labelMap: Record<string, { bn: string; en: string }> = {
              ALL: { bn: 'সবগুলো', en: 'All' },
              Confirmed: { bn: 'নিশ্চিত', en: 'Confirmed' },
              Pending: { bn: 'অপেক্ষমান', en: 'Pending' },
              Processing: { bn: 'প্রক্রিয়াধীন', en: 'Processing' },
              Delivered: { bn: 'ডেলিভার্ড', en: 'Delivered' },
              Cancelled: { bn: 'বাতিল', en: 'Cancelled' },
              Returned: { bn: 'রিটার্ন', en: 'Returned' },
            };
            return (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {lang === 'bn' ? labelMap[st]?.bn || st : labelMap[st]?.en || st}
              </button>
            );
          })}
        </div>

        {/* Dropdowns: Call Disposition & Sort */}
        <div className="flex items-center gap-2">
          {/* Call Disposition select */}
          <select
            value={filter.disposition}
            onChange={(e) => handleDispositionChange(e.target.value as CallDisposition | 'ALL')}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">{lang === 'bn' ? 'সকল কল ফলাফল' : 'All Dispositions'}</option>
            <option value="Confirmed on Call">Confirmed on Call</option>
            <option value="Follow-up Needed">Follow-up Needed</option>
            <option value="No Answer / Unreachable">No Answer / Unreachable</option>
            <option value="Cancelled by Customer">Cancelled by Customer</option>
            <option value="Busy / Call Later">Busy / Call Later</option>
            <option value="Wrong Number">Wrong Number</option>
          </select>

          {/* Sort selector */}
          <select
            value={filter.sortBy}
            onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            <option value="createdAt">{lang === 'bn' ? 'তারিখ অনুয়ায়ী' : 'Date'}</option>
            <option value="totalBill">{lang === 'bn' ? 'মোট বিল অনুয়ায়ী' : 'Total Bill'}</option>
            <option value="callDurationSeconds">{lang === 'bn' ? 'কলের সময়কাল' : 'Call Duration'}</option>
            <option value="id">{lang === 'bn' ? 'অর্ডার আইডি' : 'Order ID'}</option>
          </select>

          {/* Count Badge */}
          <span className="text-[11px] text-slate-500 font-mono pl-1">
            {totalFilteredCount} {lang === 'bn' ? 'টি রো' : 'rows'}
          </span>
        </div>
      </div>
    </div>
  );
};
