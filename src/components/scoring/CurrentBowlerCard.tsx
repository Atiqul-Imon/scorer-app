'use client';

import Card from '@/components/ui/Card';
import { Target } from 'lucide-react';

interface Bowler {
  id: string;
  name: string;
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
  economy: number;
}

interface CurrentBowlerCardProps {
  bowler: Bowler | null;
  bowlerId: string;
}

export default function CurrentBowlerCard({ bowler, bowlerId }: CurrentBowlerCardProps) {
  if (!bowler) {
    return null;
  }

  const formatOvers = (overs: number, balls: number) => {
    const totalBalls = overs * 6 + (balls || 0);
    const fullOvers = Math.floor(totalBalls / 6);
    const remainingBalls = totalBalls % 6;
    return `${fullOvers}.${remainingBalls}`;
  };

  return (
    <Card className="p-4 lg:p-6 bg-gradient-to-br from-blue-500/10 to-gray-800 border-blue-500/20">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Target className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
        <h3 className="text-sm lg:text-base font-semibold text-gray-100">Current Bowler</h3>
      </div>
      
      <div className="p-3 lg:p-4 bg-gray-800 rounded-lg border border-blue-500/30">
        <p className="text-sm lg:text-base font-semibold text-gray-100 mb-2 lg:mb-3">{bowler.name}</p>
        <div className="flex items-center gap-4 text-xs lg:text-sm text-gray-300">
          <span className="font-medium text-gray-100">
            {formatOvers(bowler.overs, bowler.balls)}-{bowler.runs}-{bowler.wickets}
          </span>
          <span className="font-semibold text-gray-200">
            Economy: {bowler.economy.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
}




