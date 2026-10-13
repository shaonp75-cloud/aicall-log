import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getStoredSupabaseConfig, 
  getSupabaseClient, 
  SupabaseConfig 
} from './services/supabaseClient';
import { 
  NormalizedOrder, 
  mapSupabaseRowToOrder 
} from './services/orderMapper';
import { OrdersHeader } from './components/OrdersHeader';
import { MetricCards } from './components/MetricCards';
import { StatusTabs } from './components/StatusTabs';
import { OrdersTableExact } from './components/OrdersTableExact';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';
import { AudioPlayerModal } from './components/AudioPlayerModal';
import { TranscriptModal } from './components/TranscriptModal';
import { OrderDetailModalExact } from './components/OrderDetailModalExact';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('call_log_auth_token') === 'shaonp75_authenticated_session';
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [orders, setOrders] = useState<NormalizedOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state matching image.png
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // Dropdown & Tab synced
  const [dateRangeLabel, setDateRangeLabel] = useState<string>('14 Oct 2026 — 14 Oct 2026');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5; // Matches screenshot showing 5 rows per page

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [selectedAudioOrder, setSelectedAudioOrder] = useState<NormalizedOrder | null>(null);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [selectedTranscriptOrder, setSelectedTranscriptOrder] = useState<NormalizedOrder | null>(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState<boolean>(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<NormalizedOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const isConnected = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

  const handleLogout = () => {
    localStorage.removeItem('call_log_auth_token');
    setIsAuthenticated(false);
  };

  // Fetch real data from Supabase
  const fetchSupabaseOrders = useCallback(async (isSilent = false) => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      setOrders([]);
      return;
    }

    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const client = getSupabaseClient(supabaseConfig);
      if (!client) {
        throw new Error('Supabase client could not be initialized.');
      }

      const tableName = supabaseConfig.tableName.trim() || 'orders';

      // Attempt to query with created_at order, or fallback to regular select
      let { data, error: queryError } = await client
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) {
        // Fallback without created_at order if column doesn't exist
        const fallback = await client.from(tableName).select('*');
        if (fallback.error) {
          throw fallback.error;
        }
        data = fallback.data;
      }

      if (data) {
        const mapped = data.map((row: Record<string, unknown>, idx: number) =>
          mapSupabaseRowToOrder(row, idx)
        );
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Error fetching Supabase orders:', e);
      setError(e.message || 'Failed to fetch orders from Supabase.');
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [supabaseConfig]);

  // Initial fetch on mount & config changes
  useEffect(() => {
    if (isConnected) {
      fetchSupabaseOrders();
    } else {
      setOrders([]);
    }
  }, [isConnected, fetchSupabaseOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchId = order.orderNumber.toLowerCase().includes(q) || order.id.toLowerCase().includes(q);
        const matchName = order.customerName.toLowerCase().includes(q);
        const matchPhone = order.phone.toLowerCase().includes(q) || order.phoneMasked.toLowerCase().includes(q);
        const matchProduct = order.product.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchProduct) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== 'ALL') {
        const statusLower = order.orderStatus.toLowerCase();
        const targetLower = selectedStatus.toLowerCase();
        if (!statusLower.includes(targetLower)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchTerm, selectedStatus]);

  // KPI Metrics (Calculated on real database records)
  const totalOrders = orders.length;
  const confirmedCount = orders.filter((o) => o.orderStatus.toLowerCase().includes('confirm')).length;
  const cancelledCount = orders.filter((o) => o.orderStatus.toLowerCase().includes('cancel')).length;
  const pendingCount = orders.filter((o) => o.orderStatus.toLowerCase().includes('pend')).length;

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Reset page on search or status change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      'Order ID',
      'Date',
      'Time',
      'Customer',
      'Phone',
      'Product',
      'Total Bill',
      'Order Status',
      'Call Duration',
      'Call Disposition',
      'Cancel Reason',
      'Recording URL',
      'Transcript URL',
    ];

    const escape = (val: unknown) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = filteredOrders.map((o) => [
      escape(o.orderNumber),
      escape(o.dateStr),
      escape(o.timeStr),
      escape(o.customerName),
      escape(o.phone),
      escape(o.product),
      escape(o.totalBill),
      escape(o.orderStatus),
      escape(o.callDuration),
      escape(o.callDisposition),
      escape(o.cancelReason),
      escape(o.recordingUrl),
      escape(o.transcriptUrl),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supabase_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error notification banner if any */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="font-semibold underline ml-2"
            >
              Reconfigure Supabase
            </button>
          </div>
        )}

        {/* 1. Orders Header (Title, Subtitle, Search bar, Date selector, Status dropdown, Export) */}
        <OrdersHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          dateRangeLabel={dateRangeLabel}
          onDateRangeChange={setDateRangeLabel}
          onExport={handleExportCSV}
          onOpenSupabaseModal={() => setIsConnectModalOpen(true)}
          isConnected={isConnected}
          tableName={supabaseConfig.tableName || 'dograh_log'}
          onRefresh={() => fetchSupabaseOrders(true)}
          isRefreshing={isRefreshing}
          userEmail="shaonp75@gmail.com"
          onLogout={handleLogout}
        />

        {/* 2. Four KPI Metric Cards (Total Orders, Confirmed, Cancelled, Pending) */}
        <MetricCards
          totalOrders={totalOrders}
          confirmedCount={confirmedCount}
          cancelledCount={cancelledCount}
          pendingCount={pendingCount}
          isConnected={isConnected}
        />

        {/* 3. Pill Filter Tabs (All orders, Confirmed, Cancelled, Pending) */}
        <StatusTabs
          currentTab={selectedStatus}
          onTabChange={setSelectedStatus}
        />

        {/* 4. Table exactly matching image.png */}
        <OrdersTableExact
          orders={paginatedOrders}
          totalCount={filteredOrders.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onOpenRecording={(order) => {
            setSelectedAudioOrder(order);
            setIsAudioModalOpen(true);
          }}
          onOpenTranscript={(order) => {
            setSelectedTranscriptOrder(order);
            setIsTranscriptModalOpen(true);
          }}
          onOpenDetail={(order) => {
            setSelectedDetailOrder(order);
            setIsDetailModalOpen(true);
          }}
          isConnected={isConnected}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          isLoading={isLoading}
          tableName={supabaseConfig.tableName || 'dograh_log'}
          onRefresh={() => fetchSupabaseOrders(true)}
        />
      </div>

      {/* Supabase Connection Modal */}
      <SupabaseConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={(newConfig) => {
          setSupabaseConfig(newConfig);
          setCurrentPage(1);
        }}
      />

      {/* Audio Player Modal */}
      <AudioPlayerModal
        order={selectedAudioOrder}
        isOpen={isAudioModalOpen}
        onClose={() => {
          setIsAudioModalOpen(false);
          setSelectedAudioOrder(null);
        }}
      />

      {/* Transcript Modal */}
      <TranscriptModal
        order={selectedTranscriptOrder}
        isOpen={isTranscriptModalOpen}
        onClose={() => {
          setIsTranscriptModalOpen(false);
          setSelectedTranscriptOrder(null);
        }}
        onPlayAudio={(order) => {
          setIsTranscriptModalOpen(false);
          setSelectedAudioOrder(order);
          setIsAudioModalOpen(true);
        }}
      />

      {/* Order Detail Modal */}
      <OrderDetailModalExact
        order={selectedDetailOrder}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailOrder(null);
        }}
        onOpenAudio={(order) => {
          setSelectedAudioOrder(order);
          setIsAudioModalOpen(true);
        }}
        onOpenTranscript={(order) => {
          setSelectedTranscriptOrder(order);
          setIsTranscriptModalOpen(true);
        }}
      />
    </div>
  );
}
