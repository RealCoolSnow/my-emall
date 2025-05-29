import { useState, useEffect } from 'react';
import { Coupon } from 'coupons/types';
import couponService from '../services/couponService';

export interface CouponsState {
  availableCoupons: Coupon[];
  selectedCoupons: Coupon[];
  loading: boolean;
  error: string | null;
}

export const useCoupons = () => {
  const [state, setState] = useState<CouponsState>({
    availableCoupons: [],
    selectedCoupons: [],
    loading: false,
    error: null,
  });

  // 加载可用优惠券
  const loadAvailableCoupons = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const coupons = await couponService.getAvailableCoupons();
      setState(prev => ({
        ...prev,
        availableCoupons: coupons,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '加载优惠券失败',
        loading: false,
      }));
    }
  };

  // 添加优惠券
  const addCoupon = async (code: string, orderData: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const validation = await couponService.validateCoupon(code, orderData);
      if (validation.isValid && validation.coupon) {
        const isAlreadySelected = state.selectedCoupons.some(
          coupon => coupon.id === validation.coupon!.id
        );
        
        if (!isAlreadySelected) {
          setState(prev => ({
            ...prev,
            selectedCoupons: [...prev.selectedCoupons, validation.coupon!],
            loading: false,
          }));
          return { success: true };
        } else {
          setState(prev => ({
            ...prev,
            error: '该优惠券已经添加',
            loading: false,
          }));
          return { success: false, error: '该优惠券已经添加' };
        }
      } else {
        setState(prev => ({
          ...prev,
          error: validation.error || '优惠券无效',
          loading: false,
        }));
        return { success: false, error: validation.error || '优惠券无效' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '验证优惠券失败';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // 移除优惠券
  const removeCoupon = (couponId: string) => {
    setState(prev => ({
      ...prev,
      selectedCoupons: prev.selectedCoupons.filter(coupon => coupon.id !== couponId),
    }));
  };

  // 清空选中的优惠券
  const clearSelectedCoupons = () => {
    setState(prev => ({
      ...prev,
      selectedCoupons: [],
    }));
  };

  // 计算优惠券折扣
  const calculateDiscount = async (orderData: any) => {
    if (state.selectedCoupons.length === 0) {
      return { discount: 0, finalAmount: orderData.subtotal };
    }

    try {
      const result = await couponService.applyCoupons({
        ...orderData,
        couponCodes: state.selectedCoupons.map(coupon => coupon.code),
      });
      return result;
    } catch (error) {
      console.error('Calculate discount failed:', error);
      return { discount: 0, finalAmount: orderData.subtotal };
    }
  };

  // 初始化时加载可用优惠券
  useEffect(() => {
    loadAvailableCoupons();
  }, []);

  return {
    ...state,
    loadAvailableCoupons,
    addCoupon,
    removeCoupon,
    clearSelectedCoupons,
    calculateDiscount,
  };
};
