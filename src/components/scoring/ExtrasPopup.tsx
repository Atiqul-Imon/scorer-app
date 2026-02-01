'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

interface ExtrasPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (runs: number) => void;
  type: 'wide' | 'no_ball';
}

export default function ExtrasPopup({ isOpen, onClose, onConfirm, type }: ExtrasPopupProps) {
  const [selectedRuns, setSelectedRuns] = useState(1);

  const handleConfirm = () => {
    onConfirm(selectedRuns);
    setSelectedRuns(1);
  };

  const typeLabel = type === 'wide' ? 'Wide' : 'No Ball';
  const defaultRuns = type === 'wide' ? 1 : 1;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900 flex items-center justify-between mb-4"
                >
                  {typeLabel} - Additional Runs?
                  <button
                    type="button"
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Did the {typeLabel.toLowerCase()} result in additional runs? (e.g., wide 4, no-ball 6)
                  </p>

                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((runs) => (
                      <Button
                        key={runs}
                        variant={selectedRuns === runs ? 'primary' : 'outline'}
                        size="lg"
                        onClick={() => setSelectedRuns(runs)}
                        className="h-12 text-lg font-bold"
                      >
                        {runs}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" size="lg" fullWidth onClick={onClose}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="lg" fullWidth onClick={handleConfirm}>
                      Confirm ({defaultRuns + selectedRuns} runs)
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

