import React, { useState, useEffect, useMemo } from "react";
import { fetchKomunitas, createKomunitas, deleteKomunitas, updateKomunitas } from "../services/userApi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Users,
  Plus,
  Save,
  Activity,
  Hash,
  DollarSign,
  Copy,
  Trash,
  Edit,
  Search
} from 'lucide-react';

const Komunitas = () => {
  const [editingId, setEditingId] = useState(null);
  const [nama, setNama] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [harga, setHarga] = useState("");
  const [biayaAdmin, setBiayaAdmin] = useState("");
  const [komunitasList, setKomunitasList] = useState([]); // daftar komunitas
  const [isLoading, setIsLoading] = useState(false);      // indikator loading
  const [searchTerm, setSearchTerm] = useState("");       // search term

  // 🔒 State online/offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadKomunitas();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      toast.warn("Anda sedang offline, beberapa fitur dinonaktifkan ❌");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadKomunitas = async () => {
    try {
      setIsLoading(true);
      const data = await fetchKomunitas();
      setKomunitasList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Gagal fetch komunitas: " + error.message);
      setKomunitasList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getExistingBiayaAdmin = () => {
    // Jika ada komunitas yang sudah ada, ambil biaya admin dari komunitas pertama
    if (komunitasList.length > 0) {
      return komunitasList[0].biaya_admin || 0;
    }
    // Jika tidak ada komunitas sama sekali, gunakan default 0
    return 0;
  };

  const handleSubmitKomunitas = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error("Tidak bisa submit saat offline ❌");
      return;
    }

    if (!nama || !jumlah || !harga) {
      toast.error("Nama, jumlah anggota, dan harga harus diisi");
      return;
    }

    // Validasi angka
    const jumlahNum = parseInt(jumlah, 10);
    const hargaNum = parseInt(harga, 10);
    
    if (isNaN(jumlahNum) || jumlahNum <= 0) {
      toast.error("Jumlah anggota harus berupa angka positif");
      return;
    }
    
    if (isNaN(hargaNum) || hargaNum <= 0) {
      toast.error("Harga harus berupa angka positif");
      return;
    }

    // Jika biaya admin tidak diisi, gunakan nilai dari komunitas yang sudah ada
    let biayaAdminValue;
    if (biayaAdmin === "" || biayaAdmin === null || biayaAdmin === undefined) {
      biayaAdminValue = getExistingBiayaAdmin();
    } else {
      biayaAdminValue = parseInt(biayaAdmin, 10);
      if (isNaN(biayaAdminValue)) {
        biayaAdminValue = getExistingBiayaAdmin();
      }
    }

    // Pastikan biaya admin tidak negatif
    biayaAdminValue = Math.max(0, biayaAdminValue);

    // Buat payload dengan struktur yang sesuai backend
    const payload = {
      nama: nama.trim(),
      jumlah: jumlahNum,
      harga: hargaNum,
      biaya_admin: biayaAdminValue
    };

    try {
      if (editingId) {
        // Untuk update
        const data = await updateKomunitas(editingId, payload);
        toast.success(data.message || "Komunitas berhasil diperbarui");
        resetForm();
        loadKomunitas();
      } else {
        // Untuk create
        const data = await createKomunitas(payload);
        toast.success(data.message || "Komunitas berhasil ditambahkan");
        resetForm();
        loadKomunitas();
      }
    } catch (error) {
      console.error("Error creating/updating komunitas:", error);
      
      let errorMessage = "Terjadi kesalahan saat menyimpan data";
      
      if (error.response?.data?.error) {
        errorMessage = "Error: " + error.response.data.error;
      } else if (error.message) {
        errorMessage = "Gagal: " + error.message;
      }
      
      // Tambahkan saran troubleshooting
      if (errorMessage.includes("kategori")) {
        errorMessage += " - Pastikan semua field diisi dengan benar.";
      }
      
      toast.error(errorMessage);
    }
  };

  const handleSubmitBiayaAdmin = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error("Tidak bisa submit saat offline ❌");
      return;
    }

    if (!biayaAdmin) {
      toast.error("Biaya admin harus diisi");
      return;
    }

    const biayaAdminValue = parseInt(biayaAdmin, 10);
    if (isNaN(biayaAdminValue) || biayaAdminValue < 0) {
      toast.error("Biaya admin harus berupa angka positif");
      return;
    }

    try {
      for (const k of komunitasList) {
        await updateKomunitas(k.id_komunitas, {
          nama: k.nama,
          jumlah: k.jumlah,
          harga: k.harga,
          biaya_admin: biayaAdminValue,
        });
      }
      toast.success("Biaya admin berhasil diterapkan ke semua komunitas");
      loadKomunitas();
    } catch (err) {
      console.error("Error updating biaya admin:", err);
      toast.error(err.message || "Gagal menerapkan biaya admin global");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNama("");
    setJumlah("");
    setHarga("");
    setBiayaAdmin("");
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Ref code copied!');
    } catch {
      toast.error('Failed to copy ref code');
    }
  };

  const handleDelete = async (id) => {
    if (!isOnline) {
      toast.error("Tidak bisa menghapus saat offline ❌");
      return;
    }

    if (!window.confirm("Yakin ingin menghapus komunitas ini?")) return;

    try {
      await deleteKomunitas(id);
      toast.success("Komunitas berhasil dihapus");
      loadKomunitas();
    } catch (err) {
      console.error("Error deleting komunitas:", err);
      toast.error(err.message || "Gagal menghapus komunitas");
    }
  };

  // Handle edit
  const handleEdit = (k) => {
    setEditingId(k.id_komunitas);
    setNama(k.nama || "");
    setJumlah(String(k.jumlah || ""));
    setHarga(String(k.harga || ""));
    setBiayaAdmin(String(k.biaya_admin || 0));
  };

  const handleCancelEdit = () => resetForm();

  // Filter komunitas berdasarkan search term
  const filteredKomunitas = useMemo(() => {
    if (!searchTerm.trim()) {
      return komunitasList;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return komunitasList.filter(komunitas => 
      komunitas.nama.toLowerCase().includes(term) || 
      komunitas.ref_code.toLowerCase().includes(term)
    );
  }, [komunitasList, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#141314] dark:to-[#1a1a1a] p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200/50 dark:border-gray-700/50">
          <Activity className="w-4 h-4 text-violet-500" />
          <span className="font-medium">Admin</span>
          <span className="text-gray-300">/</span>
          <span className="text-violet-600 dark:text-violet-400 font-semibold">Komunitas</span>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Komunitas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola komunitas peserta dan kuota pendaftaran
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Komunitas</p>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {komunitasList.length}
          </p>
        </div>
      </div>

      {/* Form Cards - Dibagi menjadi 2 form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Form Komunitas */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingId ? "Edit Komunitas" : "Tambah Komunitas Baru"}
            </h2>
          </div>
          
          <form onSubmit={handleSubmitKomunitas} className="space-y-4">
            {/* Nama Komunitas */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Komunitas"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-violet-500 focus:border-violet-500 
                          dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Jumlah Anggota */}
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="1"
                value={jumlah ?? ""}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="Jumlah Anggota"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-violet-500 focus:border-violet-500 
                          dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Harga */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="1"
                value={harga ?? ""}
                onChange={(e) => setHarga(e.target.value)}
                placeholder="Harga"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-violet-500 focus:border-violet-500 
                          dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Biaya Admin (opsional untuk form ini) */}
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="0"
                value={biayaAdmin ?? ""}
                onChange={(e) => setBiayaAdmin(e.target.value)}
                placeholder={`Biaya Admin (opsional - akan mengikuti ${komunitasList.length > 0 ? 'komunitas lain' : 'default 0'} jika kosong)`}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-violet-500 focus:border-violet-500 
                          dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
              />
            </div>

            {/* Tombol Simpan */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 
                        hover:from-violet-600 hover:to-purple-600 text-white py-3 rounded-lg 
                        font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {editingId ? "Update Komunitas" : "Tambah Komunitas"}
            </button>
          </form>
        </div>

        {/* Form Biaya Admin */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Atur Biaya Admin
            </h2>
          </div>
          
          <form onSubmit={handleSubmitBiayaAdmin} className="space-y-4">
            {/* Biaya Admin */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="0"
                value={biayaAdmin ?? ""}
                onChange={(e) => setBiayaAdmin(e.target.value)}
                placeholder="Masukkan Biaya Admin"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Tombol Terapkan ke Semua */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 
                        hover:from-indigo-600 hover:to-blue-600 text-white py-3 rounded-lg 
                        font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Terapkan ke Semua Komunitas
            </button>
            
            {/* Informasi */}
            <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <p className="font-medium">Catatan:</p>
              <p>Biaya admin akan diterapkan ke semua komunitas yang ada.</p>
              <p className="mt-1">Jika tidak mengisi biaya admin saat menambah komunitas baru, sistem akan otomatis menggunakan biaya admin dari komunitas lainnya.</p>
              {komunitasList.length > 0 && (
                <p className="mt-1">Biaya admin saat ini: {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(getExistingBiayaAdmin())}</p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:text-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-500" /> Daftar Komunitas
            </h2>
            
            {/* Search Bar */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan nama atau ref code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-violet-500 focus:border-violet-500 
                          dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
              />
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredKomunitas.length} dari {komunitasList.length} Komunitas
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg">Loading komunitas...</span>
              </div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50/80 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Sales/Afiliator</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Kuota</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Harga</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Biaya Admin</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Ref Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredKomunitas.length > 0 ? (
                  filteredKomunitas.map((k) => (
                    <tr key={k.id_komunitas} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-sm font-semibold">{k.nama}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                          {k.jumlah} anggota
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(k.harga)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(k.biaya_admin)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{k.ref_code}</code>
                          <button
                            onClick={() => copyToClipboard(k.ref_code)}
                            className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 flex gap-1">
                        <button
                          onClick={() => handleEdit(k)}
                          disabled={!isOnline}
                          className={`p-2 rounded-md flex items-center gap-1 text-xs ${
                            !isOnline
                              ? "bg-gray-400 cursor-not-allowed text-white"
                              : "bg-yellow-500 hover:bg-yellow-600 text-white"
                          }`}
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(k.id_komunitas)}
                          disabled={!isOnline}
                          className={`p-2 rounded-md flex items-center gap-1 text-xs ${
                            !isOnline
                              ? "bg-gray-400 cursor-not-allowed text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          <Trash className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                      {searchTerm ? 
                        `Tidak ada komunitas yang cocok dengan pencarian "${searchTerm}"` : 
                        "Belum ada komunitas. Tambahkan komunitas baru untuk memulai."
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Komunitas;