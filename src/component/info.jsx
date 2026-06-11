import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw, Search, Users, User, CreditCard, Shirt, TrendingUp, Award, Clock, AlertCircle, Activity, BarChart3, Download, FileText } from "lucide-react";
import { fetchParticipant } from "../services/userApi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper untuk flatten peserta + couple
const flattenParticipants = (participants) => {
  let rows = [];
  participants.forEach((p, index) => {
    // Peserta utama
    rows.push({
      No: rows.length + 1,
      Nama: `${p.first_name} ${p.last_name}`,
      Kategori: p.category,
      Jersey: p.jersey_size,
      Status: p.payment_info?.status || "pending",
      "Total Bayar": p.payment_info?.total_pay || 0,
      Bib: p.bib_name,
      "Nomor Peserta": p.num_peserta,
      "Nama Komunitas": p.nama_komunitas,
    });

    // Kalau couple, tambahkan pasangan juga
    if (p.category === "couple" && p.couple_detail) {
      rows.push({
        No: rows.length + 1,
        Nama: `${p.couple_detail.first_name} ${p.couple_detail.last_name}`,
        Kategori: p.category + " (Pasangan)",
        Jersey: p.couple_detail.jersey_size,
        Status: p.payment_info?.status || "pending", // ikut status utama
        "Total Bayar": 0, // biasanya pasangan tidak ada payment terpisah
        Bib: p.couple_detail.bib_name,
        "Nomor Peserta": p.couple_detail.num_peserta,
      });
    }
  });
  return rows;
};

// === Export Excel ===
const exportExcel = (data) => {
  const flat = flattenParticipants(data);
  const worksheet = XLSX.utils.json_to_sheet(flat);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Peserta");
  XLSX.writeFile(workbook, "peserta.xlsx");
};

// === Export PDF ===
const exportPDF = (data) => {
  const flat = flattenParticipants(data);
  const doc = new jsPDF();
  doc.text("Data Peserta Event", 14, 10);

  autoTable(doc, {
    head: [["No", "Nama", "Kategori", "Jersey", "Status", "Total Bayar", "BIB", "Nomor Peserta","Nama Komunitas"]],
    body: flat.map((p) => [
      p.No,
      p.Nama,
      p.Kategori,
      p.Jersey,
      p.Status,
      `Rp ${(p["Total Bayar"] || 0).toLocaleString("id-ID")}`,
      p.Bib,
      p["Nomor Peserta"],
      p["Nama Komunitas"],
    ]),
    startY: 20,
  });

  doc.save("peserta.pdf");
};

// ==============================
// Status Badge Component
// ==============================
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "success": 
        return {
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-700 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-700",
          icon: <Award className="w-3 h-3" />
        };
      case "pending": 
        return {
          bg: "bg-amber-100 dark:bg-amber-900/30",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-700",
          icon: <Clock className="w-3 h-3" />
        };
      case "failed":  
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200 dark:border-red-700",
          icon: <AlertCircle className="w-3 h-3" />
        };
      default: 
        return {
          bg: "bg-slate-100 dark:bg-slate-800/50",
          text: "text-slate-700 dark:text-slate-400",
          border: "border-slate-200 dark:border-slate-600",
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
      {config.icon}
      {status || "pending"}
    </span>
  );
};

// ==============================
// Category Badge Component
// ==============================
const CategoryBadge = ({ category }) => {
  const isCouple = category === "couple";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${
      isCouple 
        ? "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-700" 
        : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700"
    }`}>
      {isCouple ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
      {category}
    </span>
  );
};

// ==============================
// Participant Row Component
// ==============================
const ParticipantRow = ({ participant, index, isExpanded, toggle }) => {
  const { id, first_name, last_name, num_peserta, bib_name, category, jersey_size, payment_info, nama_komunitas ,couple_detail } = participant;

  return (
    <React.Fragment>
      <tr
        className={`border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-200 ${
          category === "couple" ? "cursor-pointer group" : ""
        } ${isExpanded ? "bg-violet-50/30 dark:bg-violet-900/10 border-violet-200/50 dark:border-violet-700/50" : ""}`}
        onClick={() => category === "couple" && toggle(id)}
        role={category === "couple" ? "button" : undefined}
        tabIndex={category === "couple" ? 0 : undefined}
      >
        {/* Nomor urut */}
        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
          {index + 1}
        </td>

        {/* Nama Peserta */}
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            {category === "couple" && (
              <div className={`transition-colors duration-200 ${isExpanded ? 'text-violet-500' : 'text-gray-400 group-hover:text-violet-400'}`}>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {first_name} {last_name}
            </span>
          </div>
        </td>

        {/* Kategori */}
        <td className="py-4 px-6">
          <CategoryBadge category={category} />
        </td>

        {/* Jersey */}
        <td className="py-4 px-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700 shadow-sm">
            <Shirt className="w-3 h-3" />
            {jersey_size}
          </span>
        </td>

        {/* Status Bayar */}
        <td className="py-4 px-6">
          <StatusBadge status={payment_info?.status} />
        </td>

        {/* Total Bayar */}
        <td className="py-4 px-6">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Rp {(payment_info?.total_pay || 0).toLocaleString('id-ID')}
          </div>
        </td>

        {/* Bib */}
        <td className="py-4 px-6">
          <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">{bib_name}</span>
        </td>

        {/* Nomor Peserta */}
        <td className="py-4 px-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">{num_peserta}</span>
        </td>

        {/* Nama Komunitas */}
        <td className="py-4 px-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">{nama_komunitas}</span>
        </td>
      </tr>

      {/* Dropdown pasangan couple */}
      {category === "couple" && isExpanded && couple_detail && (
        <tr className="bg-gradient-to-r from-violet-50/50 via-blue-50/30 to-purple-50/50 dark:from-violet-900/10 dark:via-blue-900/5 dark:to-purple-900/10">
          <td colSpan={8} className="py-4 px-6">
            <div className="ml-8 p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-violet-200/50 dark:border-violet-700/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Detail Pasangan
                  </h4>
                  <div className="grid grid-cols-8 gap-4">
                    {/* Nama Lengkap */}
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nama Lengkap
                      </label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {couple_detail.first_name} {couple_detail.last_name}
                      </p>
                    </div>

                    {/* Nomor Bib */}
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nomor Bib
                      </label>
                      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {couple_detail.bib_name}
                      </p>
                    </div>

                    {/* Ukuran Jersey */}
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Ukuran Jersey
                      </label>
                      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                        <Shirt className="w-3 h-3" />
                        {couple_detail.jersey_size}
                      </p>
                    </div>

                    {/* Nomor Peserta */}
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nomor Peserta
                      </label>
                      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {couple_detail.num_peserta}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

// ==============================
// Stats Card Component
// ==============================
const StatsCard = ({ title, total, jerseyData, icon: Icon, gradient }) => (
  <div className={`relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 p-6 group`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">peserta</p>
        </div>
      </div>
      
      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-3 capitalize">{title}</h3>
      
      {Object.keys(jerseyData).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Jersey Terjual (Success)
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(jerseyData).map(([size, count]) => (
              <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold shadow-sm">
                <Shirt className="w-3 h-3" />
                {size}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// ==============================
// Main Info Component
// ==============================
const Info = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedParticipant, setExpandedParticipant] = useState({});
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const toggleParticipant = (id) => {
    setExpandedParticipant(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchParticipant();
      setParticipants(res.data);
    } catch (err) {
      setError(err.message || "Gagal memuat data peserta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getParticipants(); }, []);

  // Filter peserta
  const filteredParticipants = participants.filter(p => {
    const search = searchName.toLowerCase();
    const status = p.payment_info?.status || "pending";

    const matchName = `${p.first_name} ${p.last_name}`.toLowerCase().includes(search);
    const matchBib = p.bib_name?.toLowerCase().includes(search);
    const matchNumPeserta = p.num_peserta?.toString().includes(search);

    const matchStatus = filterStatus ? status === filterStatus : true;
    const matchCategory = filterCategory ? p.category === filterCategory : true;

    return (matchName || matchBib || matchNumPeserta) && matchStatus && matchCategory;
  });

  // Prioritaskan success
  const sortedParticipants = [
    ...filteredParticipants.filter(p => p.payment_info?.status === "success"),
    ...filteredParticipants.filter(p => p.payment_info?.status !== "success"),
  ];

  // Statistik per kategori - HANYA untuk peserta yang statusnya "success"
  const categoryStats = {};
  
  // Daftar kategori yang valid (tanpa "skuy" dan "fefe")
  const validCategories = ["early", "reguler", "couple", "komunitas"];
  
  // Inisialisasi stats untuk kategori valid
  validCategories.forEach(cat => {
    categoryStats[cat] = { total: 0, jersey: {} };
  });
  
  // Hitung statistik hanya untuk peserta yang statusnya "success"
  participants.forEach(p => {
    // Hanya hitung jika statusnya "success" dan kategori valid
    if (p.payment_info?.status === "success" && validCategories.includes(p.category)) {
      if (!categoryStats[p.category]) {
        categoryStats[p.category] = { total: 0, jersey: {} };
      }
      categoryStats[p.category].total += 1;
      const size = p.jersey_size;
      categoryStats[p.category].jersey[size] = (categoryStats[p.category].jersey[size] || 0) + 1;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#141314] dark:to-[#1a1a1a] p-4 sm:p-6 lg:p-8">
      {/* Enhanced Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200/50 dark:border-gray-700/50">
          <Activity className="w-4 h-4 text-violet-500" />
          <span className="font-medium">Admin</span>
          <span className="text-gray-300">/</span>
          <span className="text-violet-600 dark:text-violet-400 font-semibold">Peserta</span>
        </div>
      </div>

      {/* Enhanced Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Data Peserta Event</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola dan pantau data peserta serta status pembayaran
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

      {/* Statistik Per Kategori */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(categoryStats).map(([cat, data]) => (
          <StatsCard 
            key={cat}
            title={cat}
            total={data.total}
            jerseyData={data.jersey}
            icon={cat === 'couple' ? Users : TrendingUp}
            gradient={cat === 'couple' ? 'from-violet-500 to-purple-600' : 'from-blue-500 to-indigo-600'}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama peserta..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all duration-200 dark:bg-gray-700/50 dark:text-white outline-none text-sm font-medium bg-gray-50/50 dark:bg-gray-700/30"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          {/* Filter Kategori */}
          <select
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all duration-200 dark:bg-gray-700/50 dark:text-white outline-none font-medium bg-gray-50/50 dark:bg-gray-700/30"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="early">Early Bid</option>
            <option value="reguler">Regular</option>
            <option value="couple">Couple</option>
            <option value="komunitas">Komunitas</option>
          </select>

          {/* Filter Status */}
          <select
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all duration-200 dark:bg-gray-700/50 dark:text-white outline-none font-medium bg-gray-50/50 dark:bg-gray-700/30"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Refresh */}
            <button
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              onClick={getParticipants}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {/* Download Button */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value === "excel") exportExcel(sortedParticipants);
                  if (e.target.value === "pdf") exportPDF(sortedParticipants);
                  e.target.value = ""; // Reset select
                }}
                className="appearance-none px-5 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-200 dark:bg-gray-700/50 dark:text-white outline-none font-medium bg-gray-50/50 dark:bg-gray-700/30 cursor-pointer"
              >
                <option value="">Download</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Download className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Participants Table */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-500" />
                Daftar Peserta
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Informasi lengkap peserta event
              </p>
            </div>
            {!loading && !error && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {sortedParticipants.length} Peserta
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg">Loading data peserta...</span>
              </div>
            </div>
          ) : error ? (
            <div className="px-6 py-12">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">Terjadi Kesalahan</p>
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <table className="min-w-full">
                <thead className="bg-gray-50/80 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Nama Peserta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Jersey
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status Bayar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Total Bayar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      BIB
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Nomor Peserta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      NAMA KOMUNITAS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedParticipants.length > 0 ? (
                    sortedParticipants.map((p, index) => (
                      <ParticipantRow
                        key={p.id}
                        participant={p}
                        index={index}
                        isExpanded={expandedParticipant[p.id]}
                        toggle={toggleParticipant}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
                            <Users className="w-10 h-10 text-gray-400" />
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            <p className="text-xl font-semibold mb-1">Tidak ada data peserta</p>
                            <p className="text-sm">Coba ubah filter pencarian Anda</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Table Footer */}
              {sortedParticipants.length > 0 && (
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Menampilkan {sortedParticipants.length} peserta
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Last updated: {new Date().toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Info;