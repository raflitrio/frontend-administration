import React, { useState, useEffect } from 'react';
import { fetchPayments } from '../services/userApi';
import { 
  Activity,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const statusConfig = {
  success: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  pending: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock className="w-3 h-3" />,
  },
  failed: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <XCircle className="w-3 h-3" />,
  },
};

const Home = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 items per page

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const res = await fetchPayments();
        if (res.success) {
          // Sort by date descending (newest first)
          const sortedPayments = res.data.sort((a, b) => new Date(b.pay_date) - new Date(a.pay_date));
          setPayments(sortedPayments);
        }
      } catch (err) {
        console.error('Gagal fetch payments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPayments();
  }, []);

  // Calculate stats from payments data
  const stats = {
    totalPayments: payments.length,
    successPayments: payments.filter(p => p.pay_stat === 'success').length,
    pendingPayments: payments.filter(p => p.pay_stat === 'waiting for payment').length,
    failedPayments: payments.filter(p => p.pay_stat === 'failed').length,
  };

  // Get only the 10 most recent payments for display
  const recentPayments = payments.slice(0, 10);
  
  // Pagination logic for recent payments (10 items max)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = recentPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(recentPayments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#141314] dark:to-[#1a1a1a] p-4 sm:p-6 lg:p-8">
      {/* Enhanced Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200/50 dark:border-gray-700/50">
          <Activity className="w-4 h-4 text-violet-500" />
          <span className="font-medium">Admin</span>
          <span className="text-gray-300">/</span>
          <span className="text-violet-600 dark:text-violet-400 font-semibold">Dashboard</span>
        </div>
      </div>

      {/* Enhanced Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your payment transactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Payments */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPayments}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600 font-medium">All time</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Successful Payments */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Successful</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successPayments}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-emerald-600 font-medium">
                    {stats.totalPayments > 0 ? Math.round((stats.successPayments / stats.totalPayments) * 100) : 0}% success rate
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-amber-600 font-medium">Awaiting confirmation</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Failed Payments */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Failed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failedPayments}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-red-600 font-medium">Need attention</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Payments Table with Pagination */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-500" />
                Recent Payments (10 Terbaru)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track and manage your latest transactions
              </p>
            </div>
            {!isLoading && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {recentPayments.length} Recent Transactions
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg">Loading payments...</span>
              </div>
            </div>
          ) : (
            <>
              <table className="min-w-full">
                <thead className="bg-gray-50/80 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Peserta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentPayments.length > 0 ? (
                    currentPayments.map((p, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                              {p.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {p.customer_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Customer
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                            {p.nama_kategori.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                              {p.metode}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap ">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border text-gray-400 shadow-sm ${statusConfig[p.pay_stat]?.color || ''}`}>
                            {statusConfig[p.pay_stat]?.icon}
                            {p.pay_stat}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white font-medium">
                            {new Date(p.pay_date).toLocaleDateString('id-ID', { year:'numeric', month:'short', day:'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(p.pay_date).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
                            <CreditCard className="w-10 h-10 text-gray-400" />
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            <p className="text-xl font-semibold mb-1">No payments found</p>
                            <p className="text-sm">Your payment transactions will appear here</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {recentPayments.length > itemsPerPage && (
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, recentPayments.length)} of {recentPayments.length} recent payments
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          currentPage === 1 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                currentPage === pageNumber
                                  ? 'bg-violet-500 text-white'
                                  : 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          currentPage === totalPages 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Table Footer */}
        {!isLoading && recentPayments.length > 0 && currentPage === totalPages && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, recentPayments.length)} of {recentPayments.length} recent payments
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;