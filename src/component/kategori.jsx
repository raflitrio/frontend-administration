import React, { useEffect, useState } from "react";
import { fetchKategori, createKategori, updateOpenClose, deleteKategori, updateKategori } from "../services/userApi";
import { useAuth } from "../context/useAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Tag,
  Users,
  DollarSign,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Plus,
  Save,
  Activity,
  Package,
  CheckCircle
} from 'lucide-react';



const Kategori = () => {
  const { user } = useAuth();
  const [kategoris, setKategoris] = useState([]);
  const [formData, setFormData] = useState({
    nama_kategori: "",
    jumlah: "",
    harga: "",
    open_close: "",
    discount: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLocked] = useState(true); // selalu locked


  useEffect(() => {
    loadKategori();
  }, []);

  const loadKategori = async () => {
    try {
      setIsLoading(true);
      const data = await fetchKategori();
      setKategoris(data);
    } catch (err) {
      toast.error(err.message || "Gagal fetch kategori");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    nama_kategori: formData.nama_kategori,
    jumlah: parseInt(formData.jumlah, 10),
    harga: parseInt(formData.harga, 10),
    open_close: formData.open_close,
    discount: parseInt(formData.discount, 10),
  };

  try {
    const data = await createKategori(payload, user.token); // <-- kirim token
    toast.success(data.message);
    setFormData({
      nama_kategori: "",
      jumlah: "",
      harga: "",
      open_close: "open",
      discount: 0,
    });
    loadKategori(); // reload table
  } catch (err) {
    toast.error(err.message);
  }
};



const handleUpdateKategori = async (id) => {
  try {
    const kategori = kategoris.find((k) => k.id_kategori === id);

    await updateKategori(id, {
      nama_kategori: kategori.nama_kategori,
      jumlah: parseInt(kategori.jumlah, 10),
      harga: parseInt(kategori.harga, 10),
      open_close: kategori.open_close,
      discount: parseInt(kategori.discount, 10) || 0,
    }, user?.token);

    toast.success("Kategori berhasil diperbarui!");
    loadKategori();
  } catch (err) {
    toast.error(err.message || "Gagal update kategori");
  }
};




  const handleStatusChange = async (id, newStatus) => {
    try {
      const kategori = kategoris.find((k) => k.id_kategori === id);

      // kirim semua field sesuai backend
      await updateOpenClose(id, {
        open_close: newStatus,
        jumlah: parseInt(kategori.jumlah, 10),
        harga: parseInt(kategori.harga, 10),
        discount: parseInt(kategori.discount, 10) || 0,
      });

      toast.success("Status berhasil diperbarui!");
      loadKategori();
    } catch (err) {
      toast.error(err.message || "Gagal update status");
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
      await deleteKategori(id);
      toast.success("Kategori berhasil dihapus");
      loadKategori(); // refresh list kategori
    } catch (err) {
      toast.error(err.message || "Gagal menghapus kategori");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open':
        return { 
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
          icon: <ToggleRight className="w-4 h-4" />,
          label: 'Open'
        };
      case 'close':
        return { 
          color: 'bg-red-100 text-red-700 border-red-200', 
          icon: <ToggleLeft className="w-4 h-4" />,
          label: 'Close'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-700 border-gray-200', 
          icon: <ToggleLeft className="w-4 h-4" />,
          label: 'Unknown'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#141314] dark:to-[#1a1a1a] p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />


      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200/50 dark:border-gray-700/50">
          <Activity className="w-4 h-4 text-violet-500" />
          <span className="font-medium">Admin</span>
          <span className="text-gray-300">/</span>
          <span className="text-violet-600 dark:text-violet-400 font-semibold">Kategori</span>
        </div>
      </div>

      {/* Title & stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Kategori</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola kategori peserta dan kuota pendaftaran
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Kategori</p>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {kategoris.length}
          </p>      
        </div>

      </div>

      {/* Form tambah kategori */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Kategori Baru</h2>
        </div>
        

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Nama Kategori */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nama Kategori
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="nama_kategori"
                placeholder="Contoh: Fun Run"
                disabled={isLocked}
                value={formData.nama_kategori}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jumlah Kuota</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="jumlah"
                placeholder="0"
                disabled={isLocked}
                value={formData.jumlah}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Harga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Harga (Rp)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="harga"
                placeholder="0"
                disabled={isLocked}
                value={formData.harga}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="open_close"
                disabled={isLocked}
                value={formData.open_close}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200 appearance-none"
                required
              >
                <option value="">Pilih Status</option>
                <option value="open">Open</option>
                <option value="close">Close</option>
              </select>
            </div>
          </div>

          {/* Discount */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount (%)</label>
            <div className="relative">
              <input
                type="number"
                name="discount"
                placeholder="0"
                disabled={isLocked}
                value={formData.discount}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700/50 dark:text-white outline-none transition-all duration-200"
                min="0"
                max="100"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300 text-sm">%</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={isLocked}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              Simpan Kategori
            </button>
          </div>
        </form>

        {/* Success Message */}
        {message && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-800 dark:text-emerald-200 font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table kategori */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-500" /> Daftar Kategori
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kelola status dan kuota setiap kategori</p>
          </div>
          {!isLoading && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{kategoris.length} Kategori</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total records</p>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg">Loading kategori...</span>
              </div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50/80 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID & Nama</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kuota</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Dibuat Oleh</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kategoris.length > 0 ? (
                  kategoris.map((k) => {
                    const isKomunitas = k.nama_kategori?.toLowerCase().trim() === "komunitas";
                    const statusConfig =
                      k.open_close === "open"
                        ? { color: "bg-green-100 text-green-700 border-green-300" }
                        : { color: "bg-red-100 text-red-700 border-red-300" };

                    return (
                      <tr key={k.id_kategori} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        {/* Nama Kategori */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs font-semibold">{k.nama_kategori?.toUpperCase()}</td>

                        {/* Jumlah */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isKomunitas ? (
                            <span className="text-gray-400 italic">–</span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={k.jumlah}
                              onChange={(e) =>
                                setKategoris((prev) =>
                                  prev.map((item) =>
                                    item.id_kategori === k.id_kategori
                                      ? { ...item, jumlah: e.target.value }
                                      : item
                                  )
                                )
                              }
                              onBlur={() => handleStatusChange(k.id_kategori, k.open_close)}
                              className="w-20 border rounded px-2 py-1 text-sm text-center"
                            />
                          )}
                        </td>

                        {/* Harga */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isKomunitas ? (
                            <span className="text-gray-400 italic">–</span>
                          ) : (
                            <input
                              type="number"
                              value={k.harga}
                              onChange={(e) =>
                                setKategoris((prev) =>
                                  prev.map((item) =>
                                    item.id_kategori === k.id_kategori
                                      ? { ...item, harga: e.target.value }
                                      : item
                                  )
                                )
                              }
                              onBlur={() => handleUpdateKategori(k.id_kategori)} // ✅ Sekarang didefinisikan
                              className="w-24 border rounded px-2 py-1 text-center"
                            />
                          )}
                        </td>

                  {/* Discount (masih bisa untuk semua) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={k.discount}
                            onChange={(e) =>
                              setKategoris((prev) =>
                                prev.map((item) =>
                                  item.id_kategori === k.id_kategori
                                    ? { ...item, discount: e.target.value }
                                    : item
                                )
                              )
                            }
                            onBlur={() => handleStatusChange(k.id_kategori, k.open_close)}
                            className="w-20 border rounded px-2 py-1 text-sm"
                            min="0"
                            max="100"
                          />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={k.open_close}
                            onChange={(e) =>
                              setKategoris((prev) =>
                                prev.map((item) =>
                                  item.id_kategori === k.id_kategori
                                    ? { ...item, open_close: e.target.value }
                                    : item
                                )
                              )
                            }
                            onBlur={() => handleStatusChange(k.id_kategori, k.open_close)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm outline-none transition-all duration-200 ${statusConfig.color}`}
                          >
                            <option value="open">Open</option>
                            <option value="close">Close</option>
                          </select>
                        </td>

                        {/* Dibuat Oleh */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {k.user_name?.charAt(0).toUpperCase() ||
                                k.id_users?.charAt(0).toUpperCase() ||
                                "U"}
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {k.user_name || k.id_users || "Unknown"}
                            </div>
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDelete(k.id_kategori)}
                            disabled={isLocked}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          <p className="text-xl font-semibold mb-1">Belum ada kategori</p>
                          <p className="text-sm">Tambahkan kategori baru untuk memulai</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>



            </table>
          )}
        </div>

        {/* Table Footer */}
        {kategoris.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{kategoris.length}</span> kategori
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

export default Kategori;
