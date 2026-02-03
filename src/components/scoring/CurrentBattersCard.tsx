'use client';

import { memo } from 'react';
import Card from '@/components/ui/Card';
import { User } from 'lucide-react';

interface Batter {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
}

interface CurrentBattersCardProps {
  striker: Batter | null;
  nonStriker: Batter | null;
  strikerId: string;
  nonStrikerId: string;
}

function CurrentBattersCard({
  striker,
  nonStriker,
  strikerId,
  nonStrikerId,
}: CurrentBattersCardProps) {
  if (!striker && !nonStriker) {
    return null;
  }

  return (
    <Card className="p-4 lg:p-6 bg-gradient-to-br from-green-500/10 to-gray-800 border-green-500/20">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <User className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
        <h3 className="text-sm lg:text-base font-semibold text-gray-100">Current Batters</h3>
      </div>
      
      <div className="space-y-3">
        {/* Striker */}
        {striker && (
          <div className="flex items-center justify-between p-2.5 lg:p-3 bg-gray-800 rounded-lg border-2 border-green-500/50 shadow-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 lg:mb-1.5">
                <span className="text-xs lg:text-sm font-bold text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded border border-green-500/30">
                  ⚡
                </span>
                <p className="text-sm lg:text-base font-semibold text-gray-100 truncate">{striker.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-300 flex-wrap">
                <span className="font-medium">
                  {striker.runs}
                  {!striker.isOut && <span className="text-green-400">*</span>}
                </span>
                <span>({striker.balls})</span>
                <span>4s: {striker.fours}</span>
                <span>6s: {striker.sixes}</span>
                <span className="font-semibold text-gray-100">
                  SR: {striker.strikeRate.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Non-Striker */}
        {nonStriker && (
          <div className="flex items-center justify-between p-2.5 lg:p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 lg:mb-1.5">
                <span className="text-xs lg:text-sm font-bold text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600">
                  ⚪
                </span>
                <p className="text-sm lg:text-base font-semibold text-gray-100 truncate">{nonStriker.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-300 flex-wrap">
                <span className="font-medium">
                  {nonStriker.runs}
                  {!nonStriker.isOut && <span className="text-green-400">*</span>}
                </span>
                <span>({nonStriker.balls})</span>
                <span>4s: {nonStriker.fours}</span>
                <span>6s: {nonStriker.sixes}</span>
                <span className="font-semibold text-gray-100">
                  SR: {nonStriker.strikeRate.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default memo(CurrentBattersCard);




