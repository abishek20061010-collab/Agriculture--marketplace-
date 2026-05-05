import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

/* CROP */
export const getAllCrops        = () => api.get("/crop/all");
export const getFarmerCrops     = (id) => api.get(`/crop/farmer/${id}`);
export const addCrop            = (data) => api.post("/crop/add", data);
export const updateCropPrice    = (id, price) => api.put(`/crop/${id}/price`, { price });
export const deleteCrop         = (id) => api.delete(`/crop/${id}`);

/* FARMER */
export const getAllFarmers      = () => api.get("/farmer/all");
export const addFarmer          = (data) => api.post("/farmer/add", data);
export const getFarmerDetails   = () => api.get("/farmer/details");

/* BUYER */
export const getAllBuyers       = () => api.get("/buyer/all");
export const addBuyer           = (data) => api.post("/buyer/add", data);

/* ORDERS */
export const getBuyerOrders     = (id) => api.get(`/orders/buyer/${id}`);
export const getFarmerOrders    = (id) => api.get(`/orders/farmer/${id}`);
export const getAllOrders       = () => api.get("/orders/all");
export const placeOrder         = (data) => api.post("/orders/place", data);
export const updateOrderStatus  = (id, status) => api.put(`/orders/${id}/status`, { status });

/* PAYMENT */
export const getPendingPayments = (id) => api.get(`/payment/pending/${id}`);
export const makePayment        = (data) => api.post("/payment/make", data);
export const getPaymentHistory  = (id) => api.get(`/payment/history/${id}`);

/* TRANSPORT */
export const getDeliveryTracking    = (id) => api.get(`/transport/buyer/${id}`);
export const getUnassignedTransport = () => api.get("/transport/unassigned");
export const assignTransport        = (data) => api.post("/transport/assign", data);
export const getAllTransport        = () => api.get("/transport/all");
export const shipTransport        = (id) => api.put(`/transport/${id}/ship`);
export const updateTransportStatus  = (id, status) => api.put(`/transport/${id}/status`, { status });

/* WAREHOUSE */
export const getAllWarehouses   = () => api.get("/warehouse/all");
export const addWarehouse       = (data) => api.post("/warehouse/add", data);
export const getFarmerWarehouse = (id) => api.get(`/warehouse/farmer/${id}`);
export const getWarehouseStats  = () => api.get("/warehouse/stats");
export const getWarehouseAnalytics = () => api.get("/warehouse/analytics");
export const getWarehouseAllocations = () => api.get("/warehouse/allocations");
export const updateWarehouseLocation = (id, location) => api.put(`/warehouse/${id}/location`, { location });
export const updateWarehouseAllocation = (data) => api.put("/warehouse/allocation", data);
export const createWarehouseAllocation = (data) => api.post("/warehouse/allocation", data);

/* REVENUE */
export const getFarmerRevenue   = (id) => api.get(`/revenue/farmer/${id}`);
export const getRevenuePerCrop  = (id) => api.get(`/revenue/per-crop/${id}`);

/* STATS */
export const getFarmerStats     = (id) => api.get(`/stats/farmer/${id}`);
export const getBuyerStats      = (id) => api.get(`/stats/buyer/${id}`);
