import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';

const useQuery = () => {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
};

const CheckoutResult: React.FC = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const [message, setMessage] = useState<string>('Đang xác minh thanh toán...');
    const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');
    const [resolvedOrderId, setResolvedOrderId] = useState<string>('');

    useEffect(() => {
        const handleResult = async () => {
            try {
                // Common params
                const orderId = query.get('orderId');
                const statusParam = query.get('status');

                // Gateway-specific params
                const momoResultCode = query.get('resultCode');
                const momoTransId = query.get('orderId') || query.get('transId');

                const zaloReturnCode = query.get('status');
                const zaloTransId = query.get('app_trans_id');

                const vnpResponseCode = query.get('vnp_ResponseCode');
                const vnpTxnRef = query.get('vnp_TxnRef');

                // Determine transactionId and initial status from gateway
                let transactionId: string | null = null;
                let isSuccess: boolean | null = null;
                console.log(vnpResponseCode, vnpTxnRef);
                console.log(zaloReturnCode, zaloTransId);
                console.log(momoResultCode, momoTransId);
                console.log(statusParam);
                if (vnpResponseCode || vnpTxnRef) {
                    transactionId = vnpTxnRef;
                    isSuccess = vnpResponseCode === '00';
                } else if (zaloReturnCode || zaloTransId) {
                    transactionId = zaloTransId;
                    isSuccess = zaloReturnCode === '1' || statusParam === 'success';
                } else if (momoResultCode || momoTransId) {
                    transactionId = momoTransId;
                    isSuccess = momoResultCode === '0' || statusParam === 'success';
                } else {
                    // Fallback: use provided status
                    isSuccess = statusParam === 'success';
                }
                console.log(transactionId, isSuccess);

                // Set initial UI state based on gateway response immediately
                setResolvedOrderId(orderId || '');
                if (isSuccess === true) {
                    setStatus('success');
                    setMessage('Thanh toán thành công.');
                } else if (isSuccess === false) {
                    setStatus('failed');
                    setMessage('Thanh toán thất bại hoặc đã hủy.');
                } else {
                    setStatus('pending');
                    setMessage('Đang xác minh thanh toán...');
                }

                // If we have a transactionId, verify with backend (non-blocking, and do not downgrade success to failed if still pending)
                if (transactionId) {
                    try {
                        const result = await customerService.getPaymentStatus(transactionId);
                        if (!orderId && result.orderId) {
                            setResolvedOrderId(String(result.orderId));
                        }
                        if (result.status === 'success') {
                            setStatus('success');
                            setMessage('Thanh toán thành công.');
                        } else if (result.status === 'failed') {
                            // Only mark failed if we did not already detect success from gateway
                            if (isSuccess !== true) {
                                setStatus('failed');
                                setMessage('Thanh toán thất bại.');
                            }
                        }
                    } catch (e) {
                        // Ignore verification errors; keep current status
                    }
                }
            } catch (error) {
                setStatus('failed');
                setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán.');
            }
        };

        handleResult();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-96 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow p-8 text-center space-y-4 w-full max-w-md">
                {status === 'pending' ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                ) : (
                    <div className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>✓</div>
                )}
                <p className="text-gray-800 font-medium">{message}</p>
                <div className="pt-2">
                    <button
                        onClick={() => navigate(resolvedOrderId ? `/orders/${resolvedOrderId}` : '/orders')}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700"
                    >
                        Tới chi tiết đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutResult;

