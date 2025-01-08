import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layouts/MainLayout';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useCredits } from '../hooks/useCredits';
import { useSupabase } from '../hooks/useSupabase';

export function CreditsSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { credits, refresh } = useCredits();
  const { supabase } = useSupabase();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !supabase) {
      navigate('/credits');
      return;
    }

    const updateCredits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        // Stripe Payment Links의 경우 100 크레딧으로 고정
        const credits = 100;
        
        // Add credits using RPC
        const { error: creditsError } = await supabase.rpc('add_credits', {
          user_id: user.id,
          amount: credits,
          description: '크레딧 구매'
        });

        if (creditsError) throw creditsError;

        // Refresh credits display
        await refresh();
        setIsChecking(false);
      } catch (err: any) {
        console.error('Failed to update credits:', err);
        setError(err.message);
        setIsChecking(false);
      }
    };

    updateCredits();

    // Redirect after 30 seconds
    const timer = setTimeout(() => {
      navigate('/my-credits');
    }, 30000);

    return () => clearTimeout(timer);
  }, [sessionId, navigate, refresh, supabase]);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#25262b] rounded-xl p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            결제가 완료되었습니다
          </h1>
          
          {error ? (
            <p className="text-red-400 mb-6">
              크레딧 추가 중 오류가 발생했습니다
            </p>
          ) : (
            <p className="text-gray-400 mb-6">
              {isChecking ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  크레딧 추가 중...
                </span>
              ) : (
                '크레딧이 계정에 추가되었습니다'
              )}
            </p>
          )}

          <button
            onClick={() => navigate('/my-credits')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 
              text-white font-medium rounded-lg transition-colors"
          >
            내 크레딧 확인하기
          </button>
        </div>
      </div>
    </MainLayout>
  );
}