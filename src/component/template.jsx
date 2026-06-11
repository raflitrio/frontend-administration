import React, { useEffect, useState, useCallback } from "react";
import {
  fetchCurrentUser ,
  fetchUsers,
  fetchTemplates,
} from '../services/userApi';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

const initialFormData = () => ({
  template_name: "",
  id_users: "",
  template_description: "",
  template_content: null,
  template_image: null,
  template_image2: null,
  template_image3: null,
  template_video: null,
  template_category: "",
  template_sub_category: "",
  template_tags: "",
  template_status: "active",
  harga: "",
  template_image_preview: "",
  template_image2_preview: null,
  template_image3_preview: null,
  template_video_preview: null,
  template_content_preview: null,
});

export default function Template() {
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser , setCurrentUser ] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log("Templates state updated:", templates);
  }, [templates]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      
      const [userData, templateData, me] = await Promise.all([
        fetchUsers(),
        fetchTemplates(),
        fetchCurrentUser()
      ]);
      
      console.log("Template data:", templateData);
      console.log("Current User:", me);
      
      setUsers(Array.isArray(userData) ? userData : []);
      setCurrentUser(me);
      const processedTemplates = Array.isArray(templateData) ? templateData : [];
      console.log("Processed templates:", processedTemplates);
      setTemplates(processedTemplates);
      
      // Set default user ID
      const userId = me?.id_users || me?.ID || "";
      console.log("User ID yang akan digunakan:", userId);
      
      setFormData((prev) => ({
        ...prev,
        id_users: userId,
      }));
      
    } catch (err) {
      console.error("Load data error:", err);
      setError(err.message);
      setUsers([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [name]: file,
          [`${name}_preview`]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi id_users
    if (!formData.id_users) {
      setError("User ID is required. Please select a user.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && !key.includes('_preview')) {
        data.append(key, value);
      }
    });

    if (!formData.template_image && !editingId) {
      setError("Template image is required.");
      return;
    }

    try {
      setLoading(true);
      const endpoint = editingId 
        ? `${import.meta.env.VITE_BASE_URL}/input-template/${editingId}`
        : `${import.meta.env.VITE_BASE_URL}/input-template`;
      
      const res = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        body: data,
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Gagal menyimpan template");
      }
      
      // Reset form dan tutup setelah berhasil
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormData());
      setError("");
      
      // Reload data tanpa refresh halaman
      await loadData();
      
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData());
    // Jangan set showForm ke false di sini karena akan dipanggil saat klik "Tambah Template"
  }

  const handleEdit = (template) => {
    setEditingId(template.id_temp);
    setShowForm(true);
    setFormData({
      ...template,
      harga: template.harga || "",
      template_content: "",
      template_image_preview: "",
      template_image2_preview: null,
      template_image3_preview: null,
      template_video_preview: null,
    });
  }

  const handleDelete = async (id_temp) => {
    if (!window.confirm("Yakin ingin menghapus template ini?")) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/delete-template/${id_temp}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal menghapus template");
      }
      // Setelah berhasil, reload data tanpa reload halaman
      await loadData();
      setOpenDialog(false);
      setSelectedTemplate(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const renderImage = (imagePath) => {
    if (!imagePath) {
      return (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
          <span className="text-gray-500">No Image</span>
        </div>
      );
    }
    let cleanPath = imagePath.replace(/^\/+/, '');
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = 'uploads/' + cleanPath;
    }
    const imageUrl = `${import.meta.env.VITE_BASE_URL}/${cleanPath}`;
    return (
      <img
        src={imageUrl}
        className="w-full h-64 object-cover rounded"
        alt="Template"
        onError={(e) => {
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280'%3EImage not found%3C/text%3E%3C/svg%3E";
        }}
      />
    );
  };

  const renderVideo = (videoPath) => {
    if (!videoPath) return null;
    let cleanPath = videoPath.replace(/^\/+/, '');
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = 'uploads/' + cleanPath;
    }
    const videoUrl = `${import.meta.env.VITE_BASE_URL}/${cleanPath}`;
    return (
      <video 
        controls 
        className="w-full h-64"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    );
  };

  const getUserEmail = (userId) => {
    return users.find((user) => user.id_users === userId)?.email || "Unknown User";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <span>Admin</span>
        <span className="mx-2">/</span>
        <span className="font-semibold text-violet-500">Templates</span>
      </div>
      <h1 className="text-2xl font-bold mb-6">Templates</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            if (showForm) {
              // Jika form sedang terbuka, tutup dan reset
              setShowForm(false);
              resetForm();
            } else {
              // Jika form tertutup, buka dan reset data
              resetForm();
              setShowForm(true);
            }
          }}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2 rounded shadow"
        >
          {showForm ? "Tutup Form" : "Tambah Template"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label htmlFor="template_name" className="block text-sm font-medium text-gray-700">Nama Template *</label>
              <input 
                type="text"
                id="template_name"
                name="template_name"
                value={formData.template_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="harga" className="block text-sm font-medium text-gray-700">Harga *</label>
              <input 
                type="number"
                id="harga"
                name="harga"
                value={formData.harga}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="template_description" className="block text-sm font-medium text-gray-700">Deskripsi Template *</label>
              <textarea 
                id="template_description"
                name="template_description"
                value={formData.template_description}
                onChange={handleChange}
                required
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="template_category" className="block text-sm font-medium text-gray-700">Kategori Template *</label>
              <select 
                id="template_category"
                name="template_category"
                value={formData.template_category}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Pilih Kategori</option>
                <option value="business">Business</option>
                <option value="personal">Personal</option>
                <option value="education">Education</option>
                <option value="creative">Creative</option>
              </select>
            </div>

            <div className="col-span-1">
              <label htmlFor="template_sub_category" className="block text-sm font-medium text-gray-700">Sub Kategori</label>
              <input 
                type="text"
                id="template_sub_category"
                name="template_sub_category"
                value={formData.template_sub_category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="template_tags" className="block text-sm font-medium text-gray-700">Tags (pisahkan dengan koma)</label>
              <input 
                type="text"
                id="template_tags"
                name="template_tags"
                value={formData.template_tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="template_status" className="block text-sm font-medium text-gray-700">Status *</label>
              <select 
                id="template_status"
                name="template_status"
                value={formData.template_status}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-1">
              <label htmlFor="id_users" className="block text-sm font-medium text-gray-700">User *</label>
              <select 
                id="id_users"
                name="id_users"
                value={formData.id_users}
                onChange={handleChange}
                required
                className=
                "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Pilih User</option>
                {users.map((user) => (
                  <option key={user.id_users} value={user.id_users}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label htmlFor="template_content" className="block text-sm font-medium text-gray-700">File Template Content</label>
              <input 
                type="file"
                id="template_content"
                name="template_content"
                onChange={handleChange}
                accept=".pdf,.doc,.docx,.zip,.rar"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="template_image" className="block text-sm font-medium text-gray-700">Gambar Template Utama *</label>
              <input 
                type="file"
                id="template_image"
                name="template_image"
                onChange={handleChange}
                accept="image/*"
                required={!editingId}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {formData.template_image_preview && (
                <div className="mt-2">
                  <img 
                    src={formData.template_image_preview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="template_image2" className="block text-sm font-medium text-gray-700">Gambar Template 2</label>
              <input 
                type="file"
                id="template_image2"
                name="template_image2"
                onChange={handleChange}
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {formData.template_image2_preview && (
                <div className="mt-2">
                  <img 
                    src={formData.template_image2_preview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded"
                  />  
                </div>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="template_image3" className="block text-sm font-medium text-gray-700">Gambar Template 3</label>
              <input 
                type="file"
                id="template_image3"
                name="template_image3"
                onChange={handleChange}
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {formData.template_image3_preview && (
                <div className="mt-2">
                  <img 
                    src={formData.template_image3_preview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded"
                  />  
                </div>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="template_video" className="block text-sm font-medium text-gray-700">Video Template</label>
              <input 
                type="file"
                id="template_video"
                name="template_video"
                onChange={handleChange}
                accept="video/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {formData.template_video_preview && (
                <div className="mt-2">
                  <video 
                    src={formData.template_video_preview}
                    controls
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md"
            >
              {editingId ? "Update Template" : "Simpan Template"}
            </button>
          </div>
        </form>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        {["all", "active", "inactive"].map((status) => {
          const filteredTemplates = templates.filter((t) => {
            if (status === 'all') return true;
            return t.template_status === status;
          });

          return (
            <TabsContent value={status} key={status}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {filteredTemplates.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-500 py-8">
                    Tidak ada template {status === "all" ? "ditemukan" : status}.
                  </div>
                ) : (
                  filteredTemplates.map((template, index) => (
                    <Card
                      key={template.id_temp || index}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        console.log('Card clicked', template);
                        setSelectedTemplate(template);
                        setOpenDialog(true);
                      }}
                    >
                      <CardContent className="p-4">
                        {template.template_image_path ? 
                          renderImage(template.template_image_path) 
                        : (
                          <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded">
                            Template Image
                          </div>
                        )}
                        <h2 className="text-lg font-semibold mt-2">{template.template_name || 'Untitled'}</h2>
                        <p className="text-sm text-gray-500 line-clamp-2">{template.template_description || 'No description'}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm font-bold text-green-600">
                            Rp{template.harga ? parseFloat(template.harga).toLocaleString("id-ID") : '0'}
                          </p>
                          <Badge variant={template.template_status === 'active' ? 'default' : 'secondary'}>
                            {template.template_status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Dialog untuk detail template */}
      {openDialog && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-3xl">
            <button
              onClick={() => setOpenDialog(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{selectedTemplate.template_name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTemplate.template_image_path && renderImage(selectedTemplate.template_image_path)}
                {selectedTemplate.template_image2_path && renderImage(selectedTemplate.template_image2_path)}
                {selectedTemplate.template_image3_path && renderImage(selectedTemplate.template_image3_path)}
                {selectedTemplate.template_video_path && renderVideo(selectedTemplate.template_video_path)}
              </div>
              <p>{selectedTemplate.template_description}</p>
              <div className="text-sm text-gray-500">
                Kategori: {selectedTemplate.template_category} / {selectedTemplate.template_sub_category}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{selectedTemplate.template_tags}</Badge>
                <Badge variant="outline">{getUserEmail(selectedTemplate.id_users)}</Badge>
              </div>
              <div className="text-sm text-gray-500">
                Dibuat: {new Date(selectedTemplate.template_created_at).toLocaleDateString('id-ID')}
              </div>
              <div className="text-lg font-bold text-green-600">
                Rp{parseFloat(selectedTemplate.harga).toLocaleString("id-ID")}
              </div>
              {selectedTemplate.template_content_path && (
                <a 
                  href={`${import.meta.env.VITE_BASE_URL}/${selectedTemplate.template_content_path.replace(/^\/+/,'')}`}
                  download
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Download Template
                </a>
              )}
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setOpenDialog(false);
                    handleEdit(selectedTemplate);
                  }}
                  className="text-sm px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button 
                  onClick={() => {
                    setOpenDialog(false);
                    handleDelete(selectedTemplate.id_temp);
                  }}
                  className="text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}