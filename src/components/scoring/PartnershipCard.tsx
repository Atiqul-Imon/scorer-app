'use client';

import Card from '@/components/ui/Card';
import { Users } from 'lucide-react';

interface PartnershipCardProps {
  runs: number;
  balls: number;
}

export default function PartnershipCard({ runs, balls }: PartnershipCardProps) {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-purple-700" />
        <h3 className="text-sm font-semibold text-gray-900">Partnership</h3>
      </div>
      
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900 mb-1">
          {runs} <span className="text-lg text-gray-600">runs</span>
        </p>
        <p className="text-xs text-gray-600">
          {balls} balls ({overs}.{remainingBalls} overs)
        </p>
      </div>
    </Card>
  );
}

