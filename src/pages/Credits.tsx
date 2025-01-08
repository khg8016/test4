import { useState } from 'react';
import { MainLayout } from '../components/layouts/MainLayout';
import { Coins, CreditCard, Info, Minus, Plus } from 'lucide-react';
import { stripe } from '../lib/stripe';

export function Credits() {
  const [credits, setCredits] = useState(100);

  const handleIncrement = () => {
    setCredits(prev => Math.min(prev + 100, 10000));
  };

  const handleDecrement = () => {
    setCredits(prev => Math.max(prev - 100, 100));
  };

  const handlePurchase = async () => {
    try {
      await stripe.redirectToCheckout(credits);
    } catch (err: any) {
      console.error('Purchase error:', err);
      alert('결제 중 오류가 발생했습니다.');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#25262b] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">크레딧 구매</h1>
              <p className="text-gray-400 text-sm">
                크레딧을 구매하여 AI 캐릭터와 대화하세요
              </p>
            </div>
          </div>

          <div className="bg-[#2c2d32] rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">1 메시지 = 1 크레딧</span>
            </div>
            <p className="text-sm text-gray-400">
              구매한 크레딧은 환불이 불가능하며, 구매 후 즉시 계정에 적용됩니다.
            </p>
          </div>

          <div className="bg-[#2c2d32] rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">구매할 크레딧</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrement}
                  className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold text-white min-w-[80px] text-center">
                  {credits}
                </span>
                <button
                  onClick={handleIncrement}
                  className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">결제 금액</span>
              <span className="text-white font-medium">
                ${Math.ceil(credits / 100)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            className="w-full flex items-center justify-center gap-2 px-6 py-3
              bg-blue-600 hover:bg-blue-700
              text-white font-medium rounded-lg transition-colors"
          >
            <CreditCard className="h-5 w-5" />
            {credits} 크레딧 구매하기
          </button>
        </div>
      </div>
    </MainLayout>
  );
}