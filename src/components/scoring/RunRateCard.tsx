'use client';

import { memo, useMemo } from 'react';
import Card from '@/components/ui/Card';
import { TrendingUp, Target } from 'lucide-react';

interface RunRateCardProps {
  currentRunRate: number;
  requiredRunRate?: number;
  target?: number;
  currentRuns: number;
  isChase: boolean;
}

function RunRateCard({
  currentRunRate,
  requiredRunRate,
  target,
  currentRuns,
  isChase,
}: RunRateCardProps) {
  const runsNeeded = useMemo(() => {
    if (!target) return 0;
    return Math.max(0, target - currentRuns);
  }, [target, currentRuns]);

  return (
    <Card className="p-4 lg:p-6 bg-gradient-to-br from-orange-500/10 to-gray-800 border-orange-500/20">
      <div className="space-y-3 lg:space-y-4">
        {/* Current Run Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-orange-400" />
            <span className="text-xs lg:text-sm font-semibold text-gray-300">Run Rate</span>
          </div>
          <span className="text-lg lg:text-xl font-bold text-gray-100">
            {currentRunRate.toFixed(2)}
          </span>
        </div>

        {/* Required Run Rate (for chases) */}
        {isChase && target && requiredRunRate !== undefined && (
          <>
            <div className="border-t border-orange-500/30 pt-3 lg:pt-4">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
                  <span className="text-xs lg:text-sm font-semibold text-gray-300">Target</span>
                </div>
                <span className="text-sm lg:text-base font-bold text-gray-100">{target}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs lg:text-sm text-gray-400">Required</span>
                <span className="text-base lg:text-lg font-bold text-red-400">
                  {requiredRunRate.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 lg:mt-2">
                <span className="text-xs lg:text-sm text-gray-400">
                  Need {runsNeeded} runs
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export default memo(RunRateCard);




