'use client';

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

export default function CurrentBattersCard({
  striker,
  nonStriker,
  strikerId,
  nonStrikerId,
}: CurrentBattersCardProps) {
  if (!striker && !nonStriker) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-green-700" />
        <h3 className="text-sm font-semibold text-gray-900">Current Batters</h3>
      </div>
      
      <div className="space-y-3">
        {/* Striker */}
        {striker && (
          <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border-2 border-green-400 shadow-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                  ⚡
                </span>
                <p className="text-sm font-semibold text-gray-900 truncate">{striker.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-medium">
                  {striker.runs}
                  {!striker.isOut && <span className="text-green-600">*</span>}
                </span>
                <span>({striker.balls})</span>
                <span>4s: {striker.fours}</span>
                <span>6s: {striker.sixes}</span>
                <span className="font-semibold text-gray-900">
                  SR: {striker.strikeRate.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Non-Striker */}
        {nonStriker && (
          <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  ⚪
                </span>
                <p className="text-sm font-semibold text-gray-900 truncate">{nonStriker.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-medium">
                  {nonStriker.runs}
                  {!nonStriker.isOut && <span className="text-green-600">*</span>}
                </span>
                <span>({nonStriker.balls})</span>
                <span>4s: {nonStriker.fours}</span>
                <span>6s: {nonStriker.sixes}</span>
                <span className="font-semibold text-gray-900">
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




