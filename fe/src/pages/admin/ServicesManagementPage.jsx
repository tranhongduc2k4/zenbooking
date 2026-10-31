import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  DollarSign, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  CheckCircle2,
  FileText
} from 'lucide-react';
import dentalServiceApi from '../../services/dentalServiceApi';

const ServicesManagementPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Nha khoa tổng quát',
    price: '',
    estimatedDurationMinutes: 30,
    icon: '🦷',
    description: '',
    isActive: true,
  });

  const categories = [
    'Tất cả',
    'Nha khoa tổng quát',
    'Nha khoa thẩm mỹ',
    'Tiểu phẫu',
    'Chỉnh nha',
    'Cấy ghép chuyên sâu'
  ];

  const fetchServices = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await dentalServiceApi.getAllServicesForAdmin();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách dịch vụ:', err);
      // Fallback nếu API admin bị giới hạn quyền
      try {
        const publicData = await dentalServiceApi.getActiveServices();
        setServices(Array.isArray(publicData) ? publicData : []);
      } catch (e) {
        setErrorMessage('Không thể tải danh sách dịch vụ từ máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const showToast = (message, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 4000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setSelectedServiceId(null);
    setFormData({
      name: '',
      code: '',
      category: 'Nha khoa tổng quát',
      price: '',
      estimatedDurationMinutes: 30,
      icon: '🦷',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setModalMode('EDIT');
    setSelectedServiceId(service.id);
    setFormData({
      name: service.name || '',
      code: service.code || '',
      category: service.category || 'Nha khoa tổng quát',
      price: service.price !== undefined ? service.price : '',
      estimatedDurationMinutes: service.estimatedDurationMinutes || 30,
      icon: service.icon || '🦷',
      description: service.description || '',
      isActive: service.isActive !== undefined ? service.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên dịch vụ!', true);
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase() || undefined,
      price: Number(formData.price) || 0,
      estimatedDurationMinutes: Number(formData.estimatedDurationMinutes) || 30,
    };

    try {
      if (modalMode === 'CREATE') {
        await dentalServiceApi.createService(payload);
        showToast('Thêm mới dịch vụ nha khoa thành công!');
      } else {
        await dentalServiceApi.updateService(selectedServiceId, payload);
        showToast('Cập nhật thông tin dịch vụ thành công!');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu dịch vụ!';
      showToast(msg, true);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await dentalServiceApi.toggleServiceStatus(id);
      showToast('Đã thay đổi trạng thái dịch vụ!');
      fetchServices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể thay đổi trạng thái dịch vụ!';
      showToast(msg, true);
    }
  };

  const handleDelete = async (service) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.name}" không?`)) {
      try {
        await dentalServiceApi.deleteService(service.id);
        showToast(`Đã xóa dịch vụ "${service.name}" thành công!`);
        fetchServices();
      } catch (err) {
        const msg = err.response?.data?.message || 'Không thể xóa dịch vụ này!';
        showToast(msg, true);
      }
    }
  };

  // Lọc danh sách
  const filteredServices = services.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      categoryFilter === 'ALL' || categoryFilter === 'Tất cả' || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const formatPrice = (price) => {
    if (price === 0 || price === '0') return 'Miễn phí';
    return Number(price || 0).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-red-600 text-white shadow-xl flex items-center gap-3 animate-slide-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Hệ thống Quản lý Bảng giá & Dịch vụ Nha khoa
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Danh Mục Dịch Vụ Điều Trị
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập danh mục dịch vụ nha khoa, cập nhật đơn giá niêm yết và thời lượng khám ước tính.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchServices}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm dịch vụ mới
          </button>
        </div>
      </div>

      {/* 4 Thẻ thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng số dịch vụ
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {services.length}
            </span>
            <span className="text-xs text-slate-500">dịch vụ y tế</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Đang hoạt động
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {services.filter((s) => s.isActive).length}
            </span>
            <span className="text-xs text-slate-500">cho phép đặt lịch</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tạm ngừng phục vụ
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {services.filter((s) => !s.isActive).length}
            </span>
            <span className="text-xs text-slate-500">đang bảo trì</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Chuyên khoa điều trị
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {new Set(services.map((s) => s.category)).size}
            </span>
            <span className="text-xs text-slate-500">nhóm dịch vụ</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
        {/* Table Filter Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên dịch vụ, mã, nhóm..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>

          {/* Categories Tab Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
            {categories.map((cat) => {
              const isSelected = categoryFilter === cat || (cat === 'Tất cả' && categoryFilter === 'ALL');
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat === 'Tất cả' ? 'ALL' : cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Dịch vụ nha khoa</th>
                <th className="py-3.5 px-4">Mã dịch vụ</th>
                <th className="py-3.5 px-4">Nhóm chuyên khoa</th>
                <th className="py-3.5 px-4">Đơn giá niêm yết</th>
                <th className="py-3.5 px-4">Thời lượng</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Đang tải danh sách dịch vụ nha khoa...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy dịch vụ nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Dịch vụ */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
                          {service.icon || '🦷'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </div>
                          {service.description && (
                            <div className="text-[11px] text-slate-400 max-w-sm truncate mt-0.5">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Mã */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                        {service.code}
                      </span>
                    </td>

                    {/* Chuyên khoa */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {service.category || 'Nha khoa tổng quát'}
                    </td>

                    {/* Đơn giá */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                        {formatPrice(service.price)}
                      </span>
                    </td>

                    {/* Thời lượng */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{service.estimatedDurationMinutes || 30} phút</span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(service.id)}
                        title="Bấm để bật/tắt hiển thị dịch vụ"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          service.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {service.isActive ? 'Đang phục vụ' : 'Tạm ngưng'}
                      </button>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          title="Chỉnh sửa dịch vụ"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          title="Xóa dịch vụ"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Hiển thị {filteredServices.length} trên tổng số {services.length} dịch vụ</span>
          <span className="text-[11px] text-blue-600">Đơn vị tiền tệ: VNĐ</span>
        </div>
      </div>

      {/* Modal Thêm Mới / Chỉnh Sửa Dịch Vụ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                  {formData.icon || '🦷'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {modalMode === 'CREATE' ? 'Thêm Dịch Vụ Nha Khoa Mới' : 'Cập Nhật Dịch Vụ Điều Trị'}
                  </h3>
                  <p className="text-xs text-slate-500">Điền thông tin và bảng giá niêm yết</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tên dịch vụ */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tên dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: Cấy ghép Implant Thụy Sĩ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Biểu tượng Icon */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Biểu tượng Emoji
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleFormChange}
                    placeholder="🩺, ✨, 💎, 🦷"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mã dịch vụ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mã code (Viết hoa, không dấu)
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: IMPLANT_SWISS"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Chuyên khoa */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Chuyên khoa danh mục
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="Nha khoa tổng quát">Nha khoa tổng quát</option>
                    <option value="Nha khoa thẩm mỹ">Nha khoa thẩm mỹ</option>
                    <option value="Tiểu phẫu">Tiểu phẫu</option>
                    <option value="Chỉnh nha">Chỉnh nha</option>
                    <option value="Cấy ghép chuyên sâu">Cấy ghép chuyên sâu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Đơn giá */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Đơn giá (VNĐ, 0 = Miễn phí) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="10000"
                    required
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: 1500000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Thời lượng */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Thời lượng ước tính (Phút)
                  </label>
                  <input
                    type="number"
                    name="estimatedDurationMinutes"
                    min="10"
                    step="5"
                    required
                    value={formData.estimatedDurationMinutes}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: 30"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mô tả dịch vụ & quy trình điều trị
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Mô tả kỹ thuật, công nghệ và lợi ích mang lại cho bệnh nhân..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Trạng thái hoạt động */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Kích hoạt dịch vụ này ngay (hiển thị trên trang đặt lịch bệnh nhân)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:scale-105 active:scale-95"
                >
                  {modalMode === 'CREATE' ? 'Tạo dịch vụ' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagementPage;
