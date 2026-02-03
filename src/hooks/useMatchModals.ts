import { useState, useCallback } from 'react';

export interface MatchModalsState {
  showWicketPopup: boolean;
  showInningsBreak: boolean;
  showMatchEnd: boolean;
  showBowlerChange: boolean;
  showExtrasPopup: boolean;
  showManualScore: boolean;
  showPlayerManagement: boolean;
  showChangePlayers: boolean;
  showEditSetup: boolean;
  showSettingsMenu: boolean;
}

export interface MatchModalsActions {
  openWicketPopup: () => void;
  closeWicketPopup: () => void;
  openInningsBreak: () => void;
  closeInningsBreak: () => void;
  openMatchEnd: () => void;
  closeMatchEnd: () => void;
  openBowlerChange: () => void;
  closeBowlerChange: () => void;
  openExtrasPopup: () => void;
  closeExtrasPopup: () => void;
  openManualScore: () => void;
  closeManualScore: () => void;
  openPlayerManagement: () => void;
  closePlayerManagement: () => void;
  openChangePlayers: () => void;
  closeChangePlayers: () => void;
  openEditSetup: () => void;
  closeEditSetup: () => void;
  toggleSettingsMenu: () => void;
  closeSettingsMenu: () => void;
  closeAllModals: () => void;
}

export function useMatchModals() {
  const [showWicketPopup, setShowWicketPopup] = useState(false);
  const [showInningsBreak, setShowInningsBreak] = useState(false);
  const [showMatchEnd, setShowMatchEnd] = useState(false);
  const [showBowlerChange, setShowBowlerChange] = useState(false);
  const [showExtrasPopup, setShowExtrasPopup] = useState(false);
  const [showManualScore, setShowManualScore] = useState(false);
  const [showPlayerManagement, setShowPlayerManagement] = useState(false);
  const [showChangePlayers, setShowChangePlayers] = useState(false);
  const [showEditSetup, setShowEditSetup] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const openWicketPopup = useCallback(() => setShowWicketPopup(true), []);
  const closeWicketPopup = useCallback(() => setShowWicketPopup(false), []);
  const openInningsBreak = useCallback(() => setShowInningsBreak(true), []);
  const closeInningsBreak = useCallback(() => setShowInningsBreak(false), []);
  const openMatchEnd = useCallback(() => setShowMatchEnd(true), []);
  const closeMatchEnd = useCallback(() => setShowMatchEnd(false), []);
  const openBowlerChange = useCallback(() => setShowBowlerChange(true), []);
  const closeBowlerChange = useCallback(() => setShowBowlerChange(false), []);
  const openExtrasPopup = useCallback(() => setShowExtrasPopup(true), []);
  const closeExtrasPopup = useCallback(() => setShowExtrasPopup(false), []);
  const openManualScore = useCallback(() => setShowManualScore(true), []);
  const closeManualScore = useCallback(() => setShowManualScore(false), []);
  const openPlayerManagement = useCallback(() => setShowPlayerManagement(true), []);
  const closePlayerManagement = useCallback(() => setShowPlayerManagement(false), []);
  const openChangePlayers = useCallback(() => setShowChangePlayers(true), []);
  const closeChangePlayers = useCallback(() => setShowChangePlayers(false), []);
  const openEditSetup = useCallback(() => setShowEditSetup(true), []);
  const closeEditSetup = useCallback(() => setShowEditSetup(false), []);
  const toggleSettingsMenu = useCallback(() => setShowSettingsMenu(prev => !prev), []);
  const closeSettingsMenu = useCallback(() => setShowSettingsMenu(false), []);
  const closeAllModals = useCallback(() => {
    setShowWicketPopup(false);
    setShowInningsBreak(false);
    setShowMatchEnd(false);
    setShowBowlerChange(false);
    setShowExtrasPopup(false);
    setShowManualScore(false);
    setShowPlayerManagement(false);
    setShowChangePlayers(false);
    setShowEditSetup(false);
    setShowSettingsMenu(false);
  }, []);

  return {
    // State
    showWicketPopup,
    showInningsBreak,
    showMatchEnd,
    showBowlerChange,
    showExtrasPopup,
    showManualScore,
    showPlayerManagement,
    showChangePlayers,
    showEditSetup,
    showSettingsMenu,
    // Actions
    openWicketPopup,
    closeWicketPopup,
    openInningsBreak,
    closeInningsBreak,
    openMatchEnd,
    closeMatchEnd,
    openBowlerChange,
    closeBowlerChange,
    openExtrasPopup,
    closeExtrasPopup,
    openManualScore,
    closeManualScore,
    openPlayerManagement,
    closePlayerManagement,
    openChangePlayers,
    closeChangePlayers,
    openEditSetup,
    closeEditSetup,
    toggleSettingsMenu,
    closeSettingsMenu,
    closeAllModals,
  };
}

