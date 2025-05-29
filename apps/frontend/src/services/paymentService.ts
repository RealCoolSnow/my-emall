import api, { handleApiResponse } from '../lib/api';

export interface ProcessPaymentRequest {
  orderId: string;
  paymentMethod: 'alipay' | 'wechat' | 'credit_card' | 'bank_card';
  amount: number;
  mockResult?: 'success' | 'failed';
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  failureReason?: string;
  processedAt: string;
  createdAt: string;
}

export interface RefundRequest {
  orderId: string;
  amount: number;
  reason?: string;
}

class PaymentService {
  /**
   * 处理支付
   */
  async processPayment(data: ProcessPaymentRequest): Promise<{
    order: any;
    payment: PaymentRecord;
    message: string;
  }> {
    const response = await api.post('/payments/process', data);
    return handleApiResponse(response);
  }

  /**
   * 获取订单的支付记录
   */
  async getOrderPayments(orderId: string): Promise<PaymentRecord[]> {
    const response = await api.get(`/payments/order/${orderId}`);
    return handleApiResponse<PaymentRecord[]>(response);
  }

  /**
   * 申请退款
   */
  async requestRefund(data: RefundRequest): Promise<PaymentRecord> {
    const response = await api.post('/payments/refund', data);
    return handleApiResponse<PaymentRecord>(response);
  }

  /**
   * 模拟支付成功
   */
  async mockPaymentSuccess(orderId: string, paymentMethod: string, amount: number) {
    return this.processPayment({
      orderId,
      paymentMethod: paymentMethod as any,
      amount,
      mockResult: 'success',
    });
  }

  /**
   * 模拟支付失败
   */
  async mockPaymentFailure(orderId: string, paymentMethod: string, amount: number) {
    return this.processPayment({
      orderId,
      paymentMethod: paymentMethod as any,
      amount,
      mockResult: 'failed',
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
