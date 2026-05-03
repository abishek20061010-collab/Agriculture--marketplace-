import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useApi } from '../api/useApi';
import { getPendingPayments, getPaymentHistory, makePayment } from '../api/axiosClient';
import EmptyState from './EmptyState';

// Helper to dynamically load script
const loadConfetti = () => {
  return new Promise((resolve) => {
    if (window.confetti) {
      resolve(window.confetti);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => resolve(window.confetti);
    document.head.appendChild(script);
  });
};

const PaymentCard = ({ order, onSuccess }) => {
  const [paymentId, setPaymentId] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    if (!paymentId || !/^\d+$/.test(paymentId)) {
      toast.error('Please enter a valid Payment ID (numbers only)');
      return;
    }
    setConfirming(true);
  };

  const executePayment = async () => {
    setLoading(true);
    try {
      await makePayment({
        PaymentID: parseInt(paymentId),
        OrderID: order.OrderID,
        Amount: Number(order.TotalAmount)
      });
      
      // Success flow
      const confetti = await loadConfetti();
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ["#1a6b3c", "#4CAF50", "#F4A300"],
        zIndex: 9999
      });
      
      onSuccess(order.OrderID);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || err.message || 'Payment failed');
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-amber-400 p-4 mb-4 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
      {/* LEFT: Order details */}
      <div className="flex-1">
        <h3 className="font-bold text-[#1a2e1a] text-lg mb-2">Order #{order.OrderID}</h3>
        <p className="text-gray-700 text-sm mb-1 font-medium">
          <span className="text-xl mr-1">🌾</span> {order.CropName} <span className="text-gray-400 font-normal px-1">|</span> {order.Quantity} kg × ₹{order.PricePerKg}
        </p>
        <p className="text-gray-500 text-xs mt-3 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">
          📅 Ordered on: {new Date(order.OrderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* RIGHT: Amount + Pay button */}
      <div className="md:w-1/3 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
        <p className="text-[24px] font-bold text-[#F4A300] mb-3 leading-none">₹ {order.TotalAmount}</p>
        
        {!confirming ? (
          <div className="w-full flex flex-col gap-2">
            <input 
              type="number"
              placeholder="Enter Payment ID (e.g., 601)"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F4A300] focus:ring-1 focus:ring-[#F4A300] transition-colors"
            />
            <button 
              onClick={handlePay}
              className="w-full bg-[#F4A300] hover:bg-[#c47f00] text-[#1a2e1a] font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              💳 Pay Now
            </button>
          </div>
        ) : (
          <div className="w-full bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800 font-medium mb-3 text-center leading-relaxed">
              Confirm payment of ₹{order.TotalAmount} for Order #{order.OrderID}?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={executePayment}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-2 py-2 rounded transition-colors disabled:opacity-70 flex justify-center shadow-sm"
              >
                {loading ? '⏳...' : 'Confirm'}
              </button>
              <button 
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs px-2 py-2 rounded transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentTab = ({ buyerId }) => {
  const { data: pendingData, loading: loadingPending, refetch: refetchPending } = useApi(() => getPendingPayments(buyerId), [buyerId]);
  const { data: historyData, loading: loadingHistory, refetch: refetchHistory } = useApi(() => getPaymentHistory(buyerId), [buyerId]);
  
  const [successOverlay, setSuccessOverlay] = useState(null);

  const handlePaymentSuccess = (orderId) => {
    setSuccessOverlay(orderId);
    setTimeout(() => {
      setSuccessOverlay(null);
      refetchPending();
      refetchHistory();
    }, 2000);
  };

  const pendingOrders = pendingData || [];
  const history = historyData || [];

  const totalPaid = history.filter(p => p.Status === 'SUCCESS').reduce((sum, p) => sum + Number(p.Amount), 0);

  if (loadingPending && loadingHistory) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-xl w-full"></div>;
  }

  return (
    <div className="relative">
      {/* SUCCESS OVERLAY */}
      {successOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-green-100 transform scale-110 transition-transform">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-green-700 mb-1">Payment Successful!</h2>
            <p className="text-gray-600 font-medium text-lg">Order #{successOverlay} is PAID</p>
          </div>
        </div>
      )}

      {/* SECTION 1: PENDING PAYMENTS */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
          <span>⏳</span> Pending Payments
          <span className="bg-amber-100 text-amber-800 text-xs py-0.5 px-2 rounded-full font-semibold">{pendingOrders.length}</span>
        </h2>
        
        {pendingOrders.length > 0 ? (
          <div>
            {pendingOrders.map(order => (
              <PaymentCard key={order.OrderID} order={order} onSuccess={handlePaymentSuccess} />
            ))}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center text-center justify-center h-32">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-bold text-green-800">All orders are paid!</p>
            <p className="text-sm text-green-600 mt-1">You have no pending payments at the moment.</p>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200 w-full mb-8"></div>

      {/* SECTION 2: PAYMENT HISTORY */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-[#1a2e1a] flex items-center gap-2">
            <span>📜</span> Payment History
          </h2>
          <p className="text-sm font-bold text-[#1a2e1a]">
            Total paid: <span className="text-agri-green ml-1">₹ {totalPaid.toFixed(2)}</span>
          </p>
        </div>

        {history.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-semibold whitespace-nowrap">Payment ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Crop</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                    <th className="p-4 font-semibold text-right whitespace-nowrap">Amount</th>
                    <th className="p-4 font-semibold text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((payment, idx) => {
                    const dateStr = new Date(payment.PaymentDate).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    });
                    
                    return (
                      <tr key={idx} className="hover:bg-agri-pale transition-colors">
                        <td className="p-4 text-sm font-medium text-gray-900">#{payment.PaymentID}</td>
                        <td className="p-4 text-sm text-gray-600">#{payment.OrderID}</td>
                        <td className="p-4 text-sm font-medium text-agri-dark">{payment.CropName}</td>
                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{dateStr}</td>
                        <td className="p-4 text-sm font-semibold text-agri-darkgold text-right whitespace-nowrap">₹ {Number(payment.Amount).toFixed(2)}</td>
                        <td className="p-4 text-center whitespace-nowrap">
                          {payment.Status === 'SUCCESS' ? (
                            <span className="bg-green-100 text-green-800 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                              SUCCESS
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                              {payment.Status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState 
            icon="💳" 
            title="No payments yet" 
            subtitle="Pay for your placed orders to see history" 
          />
        )}
      </div>
    </div>
  );
};

export default PaymentTab;
