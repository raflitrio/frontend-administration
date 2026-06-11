import React, { useEffect, useState } from "react";
import { getSales, generateSales } from "../services/userApi";
import { 
  Activity,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]); // default array biar map aman
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 items per page

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      setSales(data || []); // pastikan selalu array
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal ambil data sales");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSales = async () => {
    try {
      setLoading(true);
      const data = await generateSales(); // backend generate otomatis
      setSales(data?.sales || []); // safe fallback jika null
      setError("");
      setCurrentPage(1); // Reset ke halaman pertama setelah generate
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal generate sales");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Format angka ke Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Calculate stats from sales data
  const stats = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.total_sales || 0), 0),
    totalAdminFee: sales.reduce((sum, s) => sum + (s.total_admin || 0), 0),
    totalItems: sales.reduce((sum, s) => sum + (s.jumlah || 0), 0),
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = sales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

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
          <span className="text-violet-600 dark:text-violet-400 font-semibold">Sales</span>
        </div>
      </div>

      {/* Enhanced Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Sales Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your sales transactions
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
        {/* Total Sales */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSales}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-violet-600 font-medium">All transactions</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatRupiah(stats.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Sales income</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Admin Fee */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Admin Fees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatRupiah(stats.totalAdminFee)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-red-600 font-medium">Service charges</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Items */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-blue-600 font-medium">All quantities</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button - Enhanced */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <button
          onClick={handleGenerateSales}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Generate Sales Otomatis
        </button>
        
        {!loading && sales.length > 0 && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {sales.length} Sales Records
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}
      </div>

      {/* Error Message - Enhanced */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Enhanced Sales Table with Pagination */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-500" />
                Sales Transactions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track and manage your sales records
              </p>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg">Loading sales data...</span>
              </div>
            </div>
          ) : (
            <>
              <table className="min-w-full">
                <thead className="bg-gray-50/80 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      ID Sales
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Nama Sales
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Ref Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Bersih
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Kotor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                      Pengguna
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Total Sales
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Total Admin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentSales.length > 0 ? (
                    currentSales.map((s) => (
                      <tr key={s.id_sales} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900 dark:text-white">{s.id_sales}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">{s.nama_sales}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-violet-600 dark:text-violet-400">{s.ref_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900 dark:text-white">{formatRupiah(s.biaya_admin)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900 dark:text-white">{formatRupiah(s.biaya_sales)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {s.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                          {s.jumlah}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="font-bold text-green-600 dark:text-green-400">{formatRupiah(s.total_sales)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="font-bold text-red-600 dark:text-red-400">{formatRupiah(s.total_admin)}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
                            <BarChart3 className="w-10 h-10 text-gray-400" />
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            <p className="text-xl font-semibold mb-1">No sales data found</p>
                            <p className="text-sm">Your sales transactions will appear here</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {sales.length > itemsPerPage && (
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sales.length)} of {sales.length} sales
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
        {!loading && sales.length > 0 && currentPage === totalPages && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sales.length)} of {sales.length} sales
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

export default Sales;