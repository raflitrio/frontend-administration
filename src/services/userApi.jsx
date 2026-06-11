const BASE_URL = import.meta.env.VITE_BASE_URL;

async function handleResponse(res, errorMessage) {
  if (!res.ok) {
    throw new Error(errorMessage || "Request failed");
  }
  return res.json();
}

export const fetchUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, {
    credentials: "include",
  });
  return handleResponse(res, "Failed to fetch users");
};

export const fetchCurrentUser = async () => {
  const res = await fetch(`${BASE_URL}/api/me`, {
    method: 'GET',
    credentials: 'include', // HARUS ADA
  });
  const data = await handleResponse(res, "Failed to fetch current user");
  return data.user;
};


export const fetchTemplates = async () => {
  const res = await fetch(`${BASE_URL}/templates`, { // pastikan endpoint ini benar
    credentials: "include",
  });
  return handleResponse(res, "Failed to fetch templates");
};


export async function fetchKategori() {
  const res = await fetch(`${BASE_URL}/api/kategori`);
  if (!res.ok) {
    throw new Error("Gagal mengambil data kategori");
  }
  return res.json();
}



export const createKategori = async (payload, token) => {
  const res = await fetch(`${BASE_URL}/api/input-kategori`, {
    method: "POST",
    credentials: "include",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // kalau backend pakai JWT
    },
    body: JSON.stringify(payload),
  });

  // Debug response mentah
  const text = await res.text();
  console.log("Response mentah:", text);

  // Kalau mau parse JSON, coba parse setelah log
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Response bukan JSON valid");
    throw err;
  }

  if (!res.ok) {
    throw new Error(data?.message || "Gagal membuat kategori");
  }

  return data;
};




// Hapus kategori berdasarkan ID
export async function deleteKategori(id) {
  const res = await fetch(`${BASE_URL}/api/kategori/${id}`, {
    method: "DELETE",
    credentials: "include", // pastikan cookie terkirim
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal menghapus kategori");
  }

  return res.json();
}



export async function fetchKomunitas() {
  const res = await fetch(`${BASE_URL}/api/komunitas`);
  if (!res.ok) {
    throw new Error("Gagal mengambil data kategori");
  }
  return res.json();
}


export async function createKomunitas(payload) {
  const res = await fetch(`${BASE_URL}/api/input-komunitas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Gagal menambahkan kategori");
  }
  return res.json();
}

  
export async function deleteKomunitas(id) {
  const res = await fetch(`${BASE_URL}/api/komunitas/${id}`, {
    method: "DELETE",
    credentials: "include", // pastikan cookie terkirim
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal menghapus kategori");
  }

  return res.json();
}



export async function updateKomunitas(id, payload) {
  const res = await fetch(`${BASE_URL}/api/updatekomunitas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Gagal memperbarui komunitas");
  }

  return res.json();
}




export async function fetchPayments() {
  const res = await fetch(`${BASE_URL}/api/getallpay`);
  if (!res.ok) {
    throw new Error("Gagal mengambil data kategori");
  }
  return res.json();
}

export async function updateOpenClose(id, { open_close, jumlah, harga, discount }) {
  // kalau discount dari form masih persen (contoh: 20), ubah ke float (0.2)
  const discountValue = discount > 1 ? discount / 100 : discount;

  const res = await fetch(`${BASE_URL}/api/${id}/open-close`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // biar cookie token terkirim
    body: JSON.stringify({
      open_close,
      jumlah,
      harga,
      discount: discountValue,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Gagal memperbarui kategori");
  }

  return res.json();
}





export const fetchParticipant = async () => {
  const res = await fetch(`${BASE_URL}/admin/participants`, { // pastikan endpoint ini benar
    credentials: "include",
  });
  return handleResponse(res, "Failed to fetch templates");
};



export async function getSales() {
  const res = await fetch(`${BASE_URL}/api/sales`);
  if (!res.ok) throw new Error("Gagal mengambil data sales");
  return res.json();
}

export async function createSales(payload) {
  const res = await fetch(`${BASE_URL}/api/input-sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal menambahkan sales");
  }
  return res.json();
}


export async function generateSales() {
  const res = await fetch(`${BASE_URL}/api/generate-sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Gagal generate sales");
  }
  return res.json();
}



export const updateKategori = async (id, data) => { // ✅ Hapus parameter `token` — tidak dibutuhkan
  const res = await fetch(`${BASE_URL}/api/${id}/open-close`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ✅ WAJIB — agar cookie token ikut terkirim
    body: JSON.stringify(data),
  });

  const text = await res.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${text}`);
  }

  if (!res.ok) {
    throw new Error(result.message || "Gagal update kategori");
  }

  return result;
};
