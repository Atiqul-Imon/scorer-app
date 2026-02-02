'use client';

import Card from '@/components/ui/Card';
import { TrendingUp, Target } from 'lucide-react';

interface RunRateCardProps {
  currentRunRate: number;
  requiredRunRate?: number;
  target?: number;
  currentRuns: number;
  isChase: boolean;
}

export default function RunRateCard({
  currentRunRate,
  requiredRunRate,
  target,
  currentRuns,
  isChase,
}: RunRateCardProps) {
  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
      <div className="space-y-3">
        {/* Current Run Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-700" />
            <span className="text-xs font-semibold text-gray-700">Run Rate</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {currentRunRate.toFixed(2)}
          </span>
        </div>

        {/* Required Run Rate (for chases) */}
        {isChase && target && requiredRunRate !== undefined && (
          <>
            <div className="border-t border-orange-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-semibold text-gray-700">Target</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{target}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Required</span>
                <span className="text-base font-bold text-red-600">
                  {requiredRunRate.toFixed(2)}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-gray-600">
                  Need {Math.max(0, target - currentRuns)} runs
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}



