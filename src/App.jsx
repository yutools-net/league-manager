import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Users, Upload, Download, Play, ChevronsRight, RotateCcw, X, Settings, ListChecks, Shuffle, AlertCircle, Table, CalendarDays, UserCheck, UserX, Trophy, Info, Crown, Loader2, Handshake, ChevronDown } from 'lucide-react'; 
import Header from './Header'; 
import Footer from './Footer';
import './site-header.css';

const STORAGE_KEY = "swissLeagueMultiBlockAppData_v6_with_draws";
const MIN_PRACTICAL_BLOCK_SIZE = 3;
const DEFAULT_PLAYER_NAME_PREFIX = "参加者";

const UsageGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-8 border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 focus:outline-none"
      >
        <span className="flex items-center">
          <ListChecks size={22} className="mr-2 text-indigo-500" />
          このツールの使い方ガイド
        </span>
        <ChevronDown className={`transform transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} size={24} />
      </button>
      
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 text-gray-700 animate-fadeIn text-left">
          <div>
            <h4 className="font-semibold text-md text-indigo-700 mb-1">ステップ1：大会設定</h4>
            <p className="text-sm pl-4 border-l-2 border-indigo-100">大会名、参加人数、1ブロックあたりの希望人数、総当たり戦の有無などを設定し、「ブロック構成を計算」ボタンを押します。</p>
          </div>
          <div>
            <h4 className="font-semibold text-md text-green-700 mb-1">ステップ2：参加者登録</h4>
            <p className="text-sm pl-4 border-l-2 border-green-100">参加者名を一人ずつ手動で登録するか、CSVファイルを使って一括で名前を更新します。人数が確定したら「プレイヤーを割り当てて開始」ボタンを押します。</p>
          </div>
          <div>
            <h4 className="font-semibold text-md text-purple-700 mb-1">ステップ3：対戦と結果入力</h4>
            <p className="text-sm pl-4 border-l-2 border-purple-100">ブロックと初戦の対戦カードが自動で生成されます。各試合の勝者、または「引き分け」ボタンを押して結果を記録してください。</p>
          </div>
          <div>
            <h4 className="font-semibold text-md text-blue-700 mb-1">ステップ4：次のラウンドへ</h4>
            <p className="text-sm pl-4 border-l-2 border-blue-100">ラウンド内の全試合の結果を入力すると、「次のラウンドへ」ボタンが有効になります。これを最終ラウンドまで繰り返します。</p>
          </div>
           <div>
            <h4 className="font-semibold text-md text-yellow-700 mb-1">ステップ5：最終結果</h4>
            <p className="text-sm pl-4 border-l-2 border-yellow-100">全ラウンドが終了すると、ブロックごとの最終順位が表示されます。結果はCSVファイルとしてダウンロードも可能です。</p>
          </div>
        </div>
      )}
    </div>
  );
};

const getDefaultBlockState = () => ({
    id: '',
    name: '',
    targetSize: 0,
    players: [], 
    pairings: [], 
    currentRound: 1,
    resultsRecordedThisRound: {},
    isComplete: false,
    byePlayerThisRound: null,
    matchHistory: [], 
});

const getDefaultAppState = () => ({
  step: 1,
  tournamentName: "マイリーグ",
  totalPlayersInput: 0,
  preferredBlockSizeInput: 5,
  totalRoundsPerBlock: 3,
  allowDraws: false, 
  configuredBlocks: [],
  allRegisteredPlayers: [],
  playerNameInput: "",
  activeBlockId: null,
  showModal: false,
  modalMessage: "",
  isDataLoaded: false,
  isRoundRobinMode: false,
  showEditResultModal: false,
  editingMatchInfo: null,
  playerAssignmentOrder: 'random',
  isImportingCSV: false, 
});

const EditResultModal = ({ matchInfo, onUpdateResult, onClose, allowDraws }) => {
  if (!matchInfo) return null;
  const p1Name = matchInfo.p1Name || 'プレイヤー1';
  const p2Name = matchInfo.p2Name || 'プレイヤー2';
  const p1Id = matchInfo.p1Id;
  const p2Id = matchInfo.p2Id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeInBasic">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 ease-out scale-100 animate-slideUp">
        <h3 className="text-lg font-semibold mb-4 text-center">結果を編集</h3>
        <p className="text-center mb-1 text-gray-700">対戦:</p>
        <p className="text-center mb-4 font-medium text-indigo-700">{p1Name} vs {p2Name}</p>
        <div className="space-y-3">
          <button
            onClick={() => onUpdateResult(p1Id, false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg shadow transition-colors"
          >
            {p1Name} 勝ち
          </button>
          <button
            onClick={() => onUpdateResult(p2Id, false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg shadow transition-colors"
          >
            {p2Name} 勝ち
          </button>
          {allowDraws && (
            <button
              onClick={() => onUpdateResult(null, true)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-lg shadow transition-colors"
            >
              引き分け
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2.5 rounded-lg shadow transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [appState, setAppState] = useState(getDefaultAppState());

  const recalculateBlockStats = (block) => {
    if (!block || !Array.isArray(block.players) || !Array.isArray(block.matchHistory)) { 
      console.error("recalculateBlockStats: Invalid block data (players or matchHistory is not an array)", block);
      return { ...block, players: block.players || [], matchHistory: block.matchHistory || [] }; 
    }
    const updatedPlayers = block.players.map(player => ({
      ...player,
      wins: 0,
      draws: 0,
      gamesPlayed: 0,
      opponents: [],
    }));

    block.matchHistory.forEach(match => {
      const p1 = updatedPlayers.find(p => p.id === match.p1Id);
      const p2 = updatedPlayers.find(p => p.id === match.p2Id);
      if (p1 && p2) {
        p1.gamesPlayed += 1;
        p2.gamesPlayed += 1;
        if (!p1.opponents.includes(p2.id)) p1.opponents.push(p2.id);
        if (!p2.opponents.includes(p1.id)) p2.opponents.push(p1.id);

        if (match.isDraw) {
          if (p1) p1.draws = (p1.draws || 0) + 1;
          if (p2) p2.draws = (p2.draws || 0) + 1;
        } else if (match.winnerId) {
          const winner = updatedPlayers.find(p => p.id === match.winnerId);
          if (winner) winner.wins += 1;
        }
      }
    });
    return { ...block, players: updatedPlayers };
  };

 const updateState = useCallback((newStateOrUpdater, callback) => {
    setAppState(prevState => {
      const nextState = typeof newStateOrUpdater === 'function'
        ? newStateOrUpdater(prevState)
        : { ...prevState, ...newStateOrUpdater };
      return nextState;
    }, callback);
  }, []);


  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const initialAppState = { ...getDefaultAppState(), ...parsedData, isImportingCSV: false, isDataLoaded: true };
        initialAppState.configuredBlocks = Array.isArray(initialAppState.configuredBlocks) ? initialAppState.configuredBlocks : [];
        initialAppState.allRegisteredPlayers = Array.isArray(initialAppState.allRegisteredPlayers) ? initialAppState.allRegisteredPlayers : [];
        initialAppState.configuredBlocks.forEach(b => {
            if (!Array.isArray(b.players)) b.players = [];
            if (!Array.isArray(b.matchHistory)) b.matchHistory = [];
            if (!Array.isArray(b.pairings)) b.pairings = [];
        });
        if (typeof initialAppState.allowDraws === 'undefined') {
            initialAppState.allowDraws = false;
        }
        initialAppState.configuredBlocks = initialAppState.configuredBlocks.map(block => {
            const updatedPlayers = (block.players || []).map(p => ({ ...p, draws: p.draws || 0 }));
            const updatedMatchHistory = (block.matchHistory || []).map(m => ({ ...m, isDraw: m.isDraw || false }));
            return { ...block, players: updatedPlayers, matchHistory: updatedMatchHistory };
        });

        updateState(initialAppState);
      } else {
        updateState({ ...getDefaultAppState(), isDataLoaded: true, isImportingCSV: false });
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      updateState({ ...getDefaultAppState(), isDataLoaded: true, isImportingCSV: false, showModal: true, modalMessage: "データの読み込みに失敗しました。" });
    }
  }, [updateState]);

  useEffect(() => {
    if (appState.isDataLoaded) { 
      try {
        const { playerNameInput, showModal, modalMessage, isDataLoaded, isImportingCSV, ...savableState } = appState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savableState));
      } catch (error) {
        console.warn("Failed to save data to localStorage:", error); 
      }
    }
  }, [appState]); 

  useEffect(() => {
    if (appState.step === 4 && Array.isArray(appState.configuredBlocks) && appState.configuredBlocks.length > 0 && !appState.activeBlockId) {
      updateState({ activeBlockId: appState.configuredBlocks[0].id });
    }
  }, [appState.step, appState.configuredBlocks, appState.activeBlockId, updateState]);

  const closeModal = () => updateState({ showModal: false, modalMessage: "" });

  const generateDefaultPlayers = (count) => {
    if (count <= 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-default-${i}`,
      name: `${DEFAULT_PLAYER_NAME_PREFIX} ${i + 1}`
    }));
  };

  const handleUpdateResult = (newWinnerId, isDraw = false) => {
    const { editingMatchInfo } = appState;
    if (!editingMatchInfo) return;
    updateState(prevState => {
      const { blockId, pairingId: pairingIdFromHistory, round: matchRound } = editingMatchInfo;
      const blockIndex = prevState.configuredBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevState;
      let updatedBlock = JSON.parse(JSON.stringify(prevState.configuredBlocks[blockIndex]));
      if(!Array.isArray(updatedBlock.matchHistory)) updatedBlock.matchHistory = []; 
      if(!Array.isArray(updatedBlock.pairings)) updatedBlock.pairings = []; 
      const matchInHistoryIndex = updatedBlock.matchHistory.findIndex(m => m.pairingId === pairingIdFromHistory && m.round === matchRound);
      if (matchInHistoryIndex !== -1) {
        updatedBlock.matchHistory[matchInHistoryIndex].winnerId = isDraw ? null : newWinnerId;
        updatedBlock.matchHistory[matchInHistoryIndex].isDraw = isDraw;
      }
      updatedBlock = recalculateBlockStats(updatedBlock); 
      if (updatedBlock.currentRound === matchRound) {
        const pairingInCurrentListIndex = updatedBlock.pairings.findIndex(p => p.id === pairingIdFromHistory);
        if (pairingInCurrentListIndex !== -1) {
          updatedBlock.pairings[pairingInCurrentListIndex].winnerId = isDraw ? null : newWinnerId;
          updatedBlock.pairings[pairingInCurrentListIndex].isDraw = isDraw;
          updatedBlock.pairings[pairingInCurrentListIndex].reported = true;
        }
      }
      const newConfiguredBlocks = [...prevState.configuredBlocks];
      newConfiguredBlocks[blockIndex] = updatedBlock;
      return { ...prevState, configuredBlocks: newConfiguredBlocks, showEditResultModal: false, editingMatchInfo: null };
    });
  };

  const calculateBlockConfiguration = () => {
    const { totalPlayersInput, preferredBlockSizeInput } = appState;
    if (totalPlayersInput <= 0 || preferredBlockSizeInput <= 0) {
      updateState({ modalMessage: "総参加人数と希望ブロック人数は1以上で入力してください。", showModal: true }); return;
    }
    if (totalPlayersInput < MIN_PRACTICAL_BLOCK_SIZE && totalPlayersInput > 0) { 
        updateState({ modalMessage: `総参加人数が少なすぎます。各ブロック最低${MIN_PRACTICAL_BLOCK_SIZE}人は必要です。`, showModal: true }); return;
    }
    if (totalPlayersInput === 0) { 
        updateState({ configuredBlocks: [], allRegisteredPlayers: [], step: 2 });
        return;
    }
    let playersToAllocate = totalPlayersInput;
    const calculatedBlockCounts = {};
    if (playersToAllocate >= preferredBlockSizeInput && preferredBlockSizeInput >= MIN_PRACTICAL_BLOCK_SIZE) {
        const numPreferredBlocks = Math.floor(playersToAllocate / preferredBlockSizeInput);
        if (numPreferredBlocks > 0) {
            calculatedBlockCounts[preferredBlockSizeInput] = numPreferredBlocks;
            playersToAllocate -= numPreferredBlocks * preferredBlockSizeInput;
        }
    }
    if (playersToAllocate > 0) {
        if (playersToAllocate >= MIN_PRACTICAL_BLOCK_SIZE) {
            calculatedBlockCounts[playersToAllocate] = (calculatedBlockCounts[playersToAllocate] || 0) + 1;
        } else { 
            const preferredKeys = Object.keys(calculatedBlockCounts).map(Number).filter(k => k >= MIN_PRACTICAL_BLOCK_SIZE).sort((a,b) => a-b);
            if (preferredKeys.length > 0 && calculatedBlockCounts[preferredKeys[0]] > 0 ) {
                const keyToAdjust = preferredKeys[0];
                calculatedBlockCounts[keyToAdjust]--;
                if (calculatedBlockCounts[keyToAdjust] === 0) delete calculatedBlockCounts[keyToAdjust];
                playersToAllocate += keyToAdjust; 
                const size1 = Math.ceil(playersToAllocate / 2);
                const size2 = Math.floor(playersToAllocate / 2);
                if (size1 >= MIN_PRACTICAL_BLOCK_SIZE && size2 >= MIN_PRACTICAL_BLOCK_SIZE) {
                    calculatedBlockCounts[size1] = (calculatedBlockCounts[size1] || 0) + 1;
                    if (size1 !== size2) calculatedBlockCounts[size2] = (calculatedBlockCounts[size2] || 0) + 1;
                } else { 
                    calculatedBlockCounts[playersToAllocate] = (calculatedBlockCounts[playersToAllocate] || 0) + 1;
                }
            } else { 
                 if (totalPlayersInput >= MIN_PRACTICAL_BLOCK_SIZE) { 
                    Object.keys(calculatedBlockCounts).forEach(key => delete calculatedBlockCounts[key]);
                    calculatedBlockCounts[totalPlayersInput] = 1;
                 } 
            }
        }
    }
    const newConfiguredBlocks = [];
    let blockLetterCode = 'A'.charCodeAt(0);
    Object.keys(calculatedBlockCounts).sort((a,b) => Number(b) - Number(a)).forEach(sizeStr => {
        const size = Number(sizeStr);
        if (size === 0) return;
        const count = calculatedBlockCounts[sizeStr];
        for (let i = 0; i < count; i++) {
            newConfiguredBlocks.push({
                ...getDefaultBlockState(),
                id: `block-${String.fromCharCode(blockLetterCode)}-${Date.now()}-${i}`,
                name: `${String.fromCharCode(blockLetterCode)}ブロック`,
                targetSize: size,
            });
            blockLetterCode++;
        }
    });
    const totalPlayersInBlocks = newConfiguredBlocks.reduce((sum, block) => sum + block.targetSize, 0);
    if (totalPlayersInBlocks !== totalPlayersInput && newConfiguredBlocks.length > 0) { 
        updateState({ modalMessage: `ブロック構成エラー: 計算後の合計人数(${totalPlayersInBlocks})が入力した総人数(${totalPlayersInput})と一致しません。`, showModal: true }); return;
    }
     if (newConfiguredBlocks.length === 0 && totalPlayersInput >= MIN_PRACTICAL_BLOCK_SIZE) { 
        updateState({ modalMessage: `ブロック構成エラー: 有効なブロックを作成できませんでした。`, showModal: true }); return;
    }
    const defaultPlayers = generateDefaultPlayers(totalPlayersInput);
    updateState({ configuredBlocks: newConfiguredBlocks, allRegisteredPlayers: defaultPlayers, step: 2 });
  };

  const handleAddPlayer = () => {
    const { playerNameInput, allRegisteredPlayers, totalPlayersInput } = appState;
    if (allRegisteredPlayers.length >= totalPlayersInput && totalPlayersInput > 0) { 
        updateState({ modalMessage: "登録上限人数に達しています。", showModal: true }); return;
    }
    if (totalPlayersInput === 0) {
        updateState({ modalMessage: "まず総参加予定人数を設定してください。", showModal: true }); return;
    }
    if (playerNameInput.trim()) {
      const newPlayer = { id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: playerNameInput.trim() };
      updateState(prevState => ({
          ...prevState,
          allRegisteredPlayers: [...prevState.allRegisteredPlayers, newPlayer],
          playerNameInput: ""
      }));
    }
  };

  const handleRemoveRegisteredPlayer = (playerId) => {
    updateState(prevState => ({
      ...prevState,
      allRegisteredPlayers: prevState.allRegisteredPlayers.filter(p => p.id !== playerId)
    }));
  };

  const handleImportCSVPlayers = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    updateState({ isImportingCSV: true });
    const reader = new FileReader();
    reader.onload = (event) => {
      let newAllRegisteredPlayers = [];
      let importMessage = "";
      try {
        const fileContent = event.target.result;
        const lines = fileContent.split(/[\r\n]+/).filter(line => line.trim() !== '');
        if (lines.length === 0) {
          importMessage = "CSVファイルに有効なプレイヤー名が含まれていません。";
          newAllRegisteredPlayers = appState.allRegisteredPlayers;
        } else {
          const currentRegisteredPlayers = appState.allRegisteredPlayers;
          const totalPlayersSetting = appState.totalPlayersInput;
          let updatedCount = 0;
          newAllRegisteredPlayers = currentRegisteredPlayers.map((player, index) => {
            if (lines[index] && lines[index].trim() && index < totalPlayersSetting) {
              if (player.name !== lines[index].trim()) updatedCount++;
              return { ...player, name: lines[index].trim() };
            }
            return player;
          });
          importMessage = `${updatedCount}人のプレイヤー名がCSVの内容で更新されました。`;
          if (lines.length > currentRegisteredPlayers.length && currentRegisteredPlayers.length < totalPlayersSetting) {
             importMessage += ` (CSVの行数が現在の登録枠より多いですが、既存の${currentRegisteredPlayers.length}人分の名前のみ更新対象となります)`;
          } else if (lines.length < currentRegisteredPlayers.length) {
             importMessage += ` (CSVの行数が現在の登録枠より少ないため、CSVの行数分(${lines.length}人)までが更新対象となります)`;
          }
        }
        updateState(prevState => ({
          ...prevState,
          allRegisteredPlayers: newAllRegisteredPlayers,
          modalMessage: importMessage,
          showModal: true,
        }));
      } catch (error) {
        console.error("CSV Error:", error);
        updateState(prevState => ({ ...prevState, modalMessage: "CSVファイルの処理中にエラーが発生しました。", showModal: true }));
      } finally {
        updateState(prevState => ({ ...prevState, isImportingCSV: false }));
      }
    };
    reader.onerror = () => {
      updateState(prevState => ({ ...prevState, modalMessage: "CSVファイルの読み込みに失敗しました。", showModal: true, isImportingCSV: false }));
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = null;
  };

  const assignPlayersToBlocks = () => {
    const { allRegisteredPlayers, configuredBlocks, totalPlayersInput, playerAssignmentOrder, isRoundRobinMode, totalRoundsPerBlock } = appState;
    if (!Array.isArray(allRegisteredPlayers) || allRegisteredPlayers.length === 0) {
        updateState({ modalMessage: "割り当てるプレイヤーがいません。参加者を登録してください。", showModal: true});
        return;
    }
    if (allRegisteredPlayers.length !== totalPlayersInput) {
      updateState({ modalMessage: `登録プレイヤー数(${allRegisteredPlayers.length})が設定した総人数(${totalPlayersInput})と一致しません。CSV等で修正するか、設定を見直してください。`, showModal: true });
    }
    if (!Array.isArray(configuredBlocks) || configuredBlocks.length === 0) {
        updateState({ modalMessage: "ブロック構成がありません。まず設定画面でブロック構成を計算してください。", showModal: true});
        return;
    }
    let playerPool = [...allRegisteredPlayers];
    if (playerAssignmentOrder === 'random') playerPool.sort(() => Math.random() - 0.5);
    const updatedBlocks = configuredBlocks.map(block => {
      const playersForThisBlock = playerPool.splice(0, block.targetSize);
      let actualTotalRoundsForBlock = totalRoundsPerBlock;
      if (isRoundRobinMode) {
          let M = playersForThisBlock.length;
          if (M <= 1) actualTotalRoundsForBlock = 0;
          else actualTotalRoundsForBlock = (M % 2 !== 0) ? M : M - 1;
      }
      return {
        ...getDefaultBlockState(), id: block.id, name: block.name, targetSize: block.targetSize,
        players: playersForThisBlock.map(p => ({ ...p, wins: 0, draws: 0, gamesPlayed: 0, opponents: [], hasByeThisRound: false })),
        _actualTotalRounds: actualTotalRoundsForBlock,
      };
    });
    updateState({ configuredBlocks: updatedBlocks, activeBlockId: updatedBlocks.length > 0 ? updatedBlocks[0].id : null, step: 4 });
  };
  
  const generateBlockPairings = useCallback((blockId) => {
    updateState(prevState => {
        const blockIndex = prevState.configuredBlocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) {
            console.error(`generateBlockPairings: Block with id ${blockId} not found.`);
            return prevState;
        }
        const currentBlock = JSON.parse(JSON.stringify(prevState.configuredBlocks[blockIndex]));
        if (!currentBlock || !Array.isArray(currentBlock.players)) {
            console.warn(`generateBlockPairings: Block ${blockId} has invalid player list. Skipping.`);
            const updatedBlocks = [...prevState.configuredBlocks];
            if(updatedBlocks[blockIndex]) { 
                updatedBlocks[blockIndex].pairings = [];
                updatedBlocks[blockIndex].byePlayerThisRound = null;
            }
            return { ...prevState, configuredBlocks: updatedBlocks };
        }
        if (currentBlock.players.length === 0) {
            console.info(`generateBlockPairings: Block ${blockId} has no players. No pairings to generate.`);
            const updatedBlocks = [...prevState.configuredBlocks];
            if(updatedBlocks[blockIndex]) {
                updatedBlocks[blockIndex].pairings = [];
                updatedBlocks[blockIndex].byePlayerThisRound = null;
                if (currentBlock.players.length <= 1 && (currentBlock._actualTotalRounds === 0 || currentBlock.currentRound >= (currentBlock._actualTotalRounds !== undefined ? currentBlock._actualTotalRounds : prevState.totalRoundsPerBlock))) {
                    updatedBlocks[blockIndex].isComplete = true;
                }
            }
            return { ...prevState, configuredBlocks: updatedBlocks };
        }
        currentBlock.players = currentBlock.players.map(p => ({...p, hasByeThisRound: false}));
        currentBlock.byePlayerThisRound = null;
        let newPairings = [];
        if (prevState.isRoundRobinMode) {
            let playersForScheduling = [...currentBlock.players];
            const originalPlayerCount = playersForScheduling.length;
            if (originalPlayerCount > 1) {
                if (originalPlayerCount % 2 !== 0) playersForScheduling.push({ id: "dummy-bye-player", name: "不戦勝ダミー" });
                const numSchedulingItems = playersForScheduling.length;
                const roundsInRobin = numSchedulingItems - 1;
                if (currentBlock.currentRound <= roundsInRobin) {
                    let tempList = playersForScheduling.slice();
                    const fixedPlayer = tempList.shift();
                    const rotatingPlayers = tempList;
                    for (let r = 0; r < (currentBlock.currentRound - 1); r++) {
                        if (rotatingPlayers.length > 0) rotatingPlayers.unshift(rotatingPlayers.pop());
                    }
                    const roundScheduledPlayers = [fixedPlayer, ...rotatingPlayers];
                    for (let i = 0; i < numSchedulingItems / 2; i++) {
                        const p1 = roundScheduledPlayers[i];
                        const p2 = roundScheduledPlayers[numSchedulingItems - 1 - i];
                        if (p1.id === "dummy-bye-player") currentBlock.byePlayerThisRound = { id: p2.id, name: p2.name };
                        else if (p2.id === "dummy-bye-player") currentBlock.byePlayerThisRound = { id: p1.id, name: p1.name };
                        else newPairings.push({ id: `pairing-rr-${currentBlock.id}-${currentBlock.currentRound}-${p1.id.slice(-4)}-${p2.id.slice(-4)}-${Math.random().toString(16).slice(2,6)}`, p1: { id: p1.id, name: p1.name }, p2: { id: p2.id, name: p2.name }, winnerId: null, isDraw: false, reported: false });
                    }
                }
            }
        } else { 
            let playersToPair = [...currentBlock.players];
            playersToPair.sort((a, b) => b.wins - a.wins || a.gamesPlayed - b.gamesPlayed || a.id.localeCompare(b.id));
            if (playersToPair.length % 2 !== 0 && playersToPair.length > 0) {
                const byePlayer = playersToPair.pop();
                if (byePlayer) currentBlock.byePlayerThisRound = {id: byePlayer.id, name: byePlayer.name};
            }
            const tempPlayersToPair = [...playersToPair];
            while (tempPlayersToPair.length >= 2) {
                const p1 = tempPlayersToPair.shift();
                if (!p1) continue;
                let p2 = null, p2FoundIndex = -1;
                for (let i = 0; i < tempPlayersToPair.length; i++) {
                    if (!p1.opponents.includes(tempPlayersToPair[i].id)) { p2 = tempPlayersToPair[i]; p2FoundIndex = i; break; }
                }
                if (!p2 && tempPlayersToPair.length > 0) { p2 = tempPlayersToPair[0]; p2FoundIndex = 0; }
                if (p2) {
                    tempPlayersToPair.splice(p2FoundIndex, 1);
                    newPairings.push({ id: `pairing-std-${currentBlock.id}-${currentBlock.currentRound}-${p1.id.slice(-4)}-${p2.id.slice(-4)}-${Math.random().toString(16).slice(2,6)}`, p1: {id: p1.id, name: p1.name}, p2: {id: p2.id, name: p2.name}, winnerId: null, isDraw: false, reported: false });
                } else if (p1 && tempPlayersToPair.length === 0 && !currentBlock.byePlayerThisRound) {
                    currentBlock.byePlayerThisRound = {id: p1.id, name: p1.name};
                }
            }
            if (tempPlayersToPair.length > 0 && !currentBlock.byePlayerThisRound) { 
                currentBlock.byePlayerThisRound = {id: tempPlayersToPair[0].id, name: tempPlayersToPair[0].name};
            }
        }
        currentBlock.pairings = newPairings;
        currentBlock.resultsRecordedThisRound = {};
        const updatedBlocks = [...prevState.configuredBlocks];
        updatedBlocks[blockIndex] = currentBlock;
        return { ...prevState, configuredBlocks: updatedBlocks };
    });
  }, [updateState]); 
  
  useEffect(() => {
    if (appState.step === 4 && Array.isArray(appState.configuredBlocks)) {
      appState.configuredBlocks.forEach(block => {
        if (block && 
            Array.isArray(block.players) && block.players.length > 0 &&
            Array.isArray(block.pairings) &&
            block.currentRound === 1 &&
            block.pairings.length === 0 &&
            !block.isComplete) {
          generateBlockPairings(block.id);
        }
      });
    }
  }, [appState.step, appState.configuredBlocks, generateBlockPairings]);

  const recordBlockResult = (blockId, pairingId, winnerId, isDraw = false) => {
    updateState(prevState => {
        const blockIndex = prevState.configuredBlocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return prevState;
        const currentBlock = JSON.parse(JSON.stringify(prevState.configuredBlocks[blockIndex]));
        if(!Array.isArray(currentBlock.pairings)) currentBlock.pairings = [];
        const pairingIndex = currentBlock.pairings.findIndex(p => p.id === pairingId);
        if (pairingIndex === -1 || currentBlock.pairings[pairingIndex].reported) return prevState;
        
        const pairing = currentBlock.pairings[pairingIndex];
        pairing.winnerId = isDraw ? null : winnerId;
        pairing.isDraw = isDraw;
        pairing.reported = true;

        currentBlock.resultsRecordedThisRound = currentBlock.resultsRecordedThisRound || {};
        currentBlock.resultsRecordedThisRound[pairingId] = true;
        
        if (!Array.isArray(currentBlock.matchHistory)) currentBlock.matchHistory = [];
        currentBlock.matchHistory.push({ 
            p1Id: pairing.p1.id, 
            p2Id: pairing.p2.id, 
            winnerId: pairing.winnerId,
            isDraw: pairing.isDraw,
            round: currentBlock.currentRound, 
            pairingId: pairingId 
        });
        
        const blockWithRecalculatedStats = recalculateBlockStats(currentBlock);
        const updatedBlocks = [...prevState.configuredBlocks];
        updatedBlocks[blockIndex] = blockWithRecalculatedStats;
        return { ...prevState, configuredBlocks: updatedBlocks };
    });
  };

  const allResultsForBlockRoundRecorded = (blockId) => {
    const block = appState.configuredBlocks.find(b => b.id === blockId);
    if (!block || !Array.isArray(block.players)) return false; 
    if (block.players.length === 0) return true; 
    if (!Array.isArray(block.pairings) || block.pairings.length === 0) { 
        return !!block.byePlayerThisRound || block.players.length <= 1;
    }
    return block.pairings.every(p => block.resultsRecordedThisRound && block.resultsRecordedThisRound[p.id]); 
  };

  const nextBlockRound = (blockId) => {
    const blockIndex = appState.configuredBlocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;
    const currentBlock = appState.configuredBlocks[blockIndex];
    if (!currentBlock) return; 
    const actualTotalRoundsForThisBlock = currentBlock._actualTotalRounds !== undefined ? currentBlock._actualTotalRounds : appState.totalRoundsPerBlock;
    if (!allResultsForBlockRoundRecorded(blockId)) { 
        updateState({ modalMessage: `${currentBlock.name} のすべての対戦結果を記録してください。`, showModal: true }); return;
    }
    if (currentBlock.currentRound < actualTotalRoundsForThisBlock) {
        updateState(prevState => {
            const newBlocks = [...prevState.configuredBlocks];
            const blockToUpdate = JSON.parse(JSON.stringify(newBlocks[blockIndex])); 
            blockToUpdate.currentRound += 1;
            blockToUpdate.pairings = []; 
            blockToUpdate.resultsRecordedThisRound = {};
            blockToUpdate.byePlayerThisRound = null; 
            newBlocks[blockIndex] = blockToUpdate;
            return { ...prevState, configuredBlocks: newBlocks };
        }, () => generateBlockPairings(blockId)); 
    } else {
        updateState(prevState => {
            const newBlocks = [...prevState.configuredBlocks];
            const blockToUpdate = JSON.parse(JSON.stringify(newBlocks[blockIndex]));
            blockToUpdate.isComplete = true;
            newBlocks[blockIndex] = blockToUpdate;
            const allComplete = newBlocks.every(b => b.isComplete);
            const nextStep = allComplete ? 5 : prevState.step;
            let message = `${currentBlock.name} の全${actualTotalRoundsForThisBlock}ラウンドが終了しました。`;
            if (allComplete) message = "すべてのブロックの全ラウンドが終了しました！最終結果を確認してください。";
            return { ...prevState, configuredBlocks: newBlocks, step: nextStep, modalMessage: message, showModal: true };
        });
    }
  };
  
  const handleExportAllDataCSV = () => {
    let csvContent = "ブロック名,順位,プレイヤーID,プレイヤー名,勝利数,引き分け数,試合数,対戦相手IDリスト,順位決定理由\n";
    if (!Array.isArray(appState.configuredBlocks)) return; 
    appState.configuredBlocks.forEach(block => {
        if (!block || !Array.isArray(block.players) || !Array.isArray(block.matchHistory)) return; 
        const sortedPlayers = sortPlayersForRanking(block.players, block.matchHistory); 
        sortedPlayers.forEach((player) => { 
            const opponentsStr = Array.isArray(player.opponents) ? player.opponents.join(';') : ""; 
            const reasonStr = player.rankReason || "";
            csvContent += `${block.name},${player.rank},${player.id},"${player.name.replace(/"/g, '""')}",${player.wins},${player.draws || 0},${player.gamesPlayed},"${opponentsStr}","${reasonStr}"\n`;
        });
    });
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appState.tournamentName}_all_blocks_results_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetTournament = () => {
    if (window.confirm("本当にトーナメント全体をリセットしますか？")) {
      localStorage.removeItem(STORAGE_KEY);
      setAppState({...getDefaultAppState(), isDataLoaded: true, isImportingCSV: false}); 
    } else {
        closeModal();
    }
  };

  const BlockResultsTable = ({ players, matchHistory, onCellClick }) => {
    if (!Array.isArray(players) || players.length === 0) return null; 
    if (!Array.isArray(matchHistory)) matchHistory = []; 
    const getMatchInfo = (player1Id, player2Id) => {
      if (player1Id === player2Id) return { symbol: '-', round: null, pairingId: null };
      for (const match of matchHistory) { 
        if ((match.p1Id === player1Id && match.p2Id === player2Id) || (match.p1Id === player2Id && match.p2Id === player1Id)) {
          let symbol = '';
          if (match.isDraw) {
            symbol = '△';
          } else if (match.winnerId) {
            symbol = match.winnerId === player1Id ? '○' : '●';
          }
          return { symbol, round: match.round, pairingId: match.pairingId, p1IdFromMatch: match.p1Id, p2IdFromMatch: match.p2Id, currentWinnerId: match.winnerId, isDrawFromMatch: match.isDraw };
        }
      }
      return { symbol: '', round: null, pairingId: null };
    };
    return (
      <div className="overflow-x-auto mt-6 bg-white p-3 sm:p-4 rounded-lg shadow">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <Table size={18} className="mr-2 text-indigo-600"/>
          対戦結果クロス表 (セルクリックで結果を編集)
        </h4>
        <table className="min-w-full border-collapse border border-gray-300 text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-1 text-left sticky left-0 bg-gray-100 z-10 min-w-[70px] sm:min-w-[100px]"></th>
              {players.map(p => ( 
                <th key={p.id} className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-1 font-medium truncate max-w-[60px] sm:max-w-[90px]" title={p.name}>{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map(rowPlayer => (
              <tr key={rowPlayer.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-1 font-medium text-left sticky left-0 bg-gray-50 hover:bg-gray-100 z-10 truncate max-w-[70px] sm:min-w-[100px]" title={rowPlayer.name}>{rowPlayer.name}</td>
                {players.map(colPlayer => {
                  const matchInfo = getMatchInfo(rowPlayer.id, colPlayer.id);
                  return (
                    <td key={colPlayer.id}
                        className={`border border-gray-300 px-1 py-1 sm:px-2 sm:py-1 text-center h-8 sm:h-10 ${matchInfo.pairingId ? 'cursor-pointer hover:bg-yellow-100 transition-colors' : ''}`}
                        onClick={() => { if (matchInfo.pairingId && onCellClick) onCellClick(matchInfo); }}>
                      {matchInfo.symbol}
                      {matchInfo.round && <span className="text-gray-500 text-xs ml-1">(R{matchInfo.round})</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getRankingReason = (player, comparedPlayer, matchHistory) => {
    if (!comparedPlayer || !Array.isArray(matchHistory)) return null; 
    const directMatch = matchHistory.find(
      (match) =>
        !match.isDraw &&
        ((match.p1Id === player.id && match.p2Id === comparedPlayer.id) ||
        (match.p1Id === comparedPlayer.id && match.p2Id === player.id))
    );
    if (directMatch && directMatch.winnerId === player.id) {
      return `vs ${comparedPlayer.name} 直接対決勝利`;
    }
    return null;
  };

  const sortPlayersForRanking = (players, matchHistory) => {
    if (!Array.isArray(players) || players.length === 0) return []; 
    if (!Array.isArray(matchHistory)) matchHistory = []; 
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      const aWonAgainstB = matchHistory.some(m => !m.isDraw && ((m.p1Id === a.id && m.p2Id === b.id && m.winnerId === a.id) || (m.p1Id === b.id && m.p2Id === a.id && m.winnerId === a.id)));
      const bWonAgainstA = matchHistory.some(m => !m.isDraw && ((m.p1Id === a.id && m.p2Id === b.id && m.winnerId === b.id) || (m.p1Id === b.id && m.p2Id === a.id && m.winnerId === b.id)));
      if (aWonAgainstB && !bWonAgainstA) return -1;
      if (bWonAgainstA && !aWonAgainstB) return 1;
      if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
      return a.name.localeCompare(b.name, 'ja');
    });
    return sortedPlayers.map((player, index, arr) => {
      let reason = null;
      if (index > 0) {
          const prevPlayer = arr[index - 1];
          if (player.wins === prevPlayer.wins) {
              const directWinReason = getRankingReason(player, prevPlayer, matchHistory);
              if (directWinReason) {
              }
          }
      }
      if (index < arr.length -1) {
        const nextPlayer = arr[index+1];
        if(player.wins === nextPlayer.wins) {
            const directWinReason = getRankingReason(player, nextPlayer, matchHistory);
            if(directWinReason) reason = directWinReason;
        }
      }
      return { ...player, rankReason: reason, rank: index + 1 };
    });
  };

  const renderStep1_Setup = () => (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-center text-indigo-700 flex items-center justify-center"><Settings size={32} className="mr-3"/>大会初期設定</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="tournamentName" className="block text-sm font-medium text-gray-700 mb-1">大会名</label>
          <input id="tournamentName" className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" type="text" value={appState.tournamentName} onChange={e => updateState({ tournamentName: e.target.value })} placeholder="例: 春季大会" />
        </div>
        <div>
          <label htmlFor="totalPlayersInput" className="block text-sm font-medium text-gray-700 mb-1">総参加予定人数 <span className="text-red-500">*</span></label>
          <input id="totalPlayersInput" className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" type="number" value={appState.totalPlayersInput || ''} onChange={e => updateState({ totalPlayersInput: parseInt(e.target.value, 10) || 0 })} placeholder="例: 30" min="0"/>
        </div>
        <div>
          <label htmlFor="preferredBlockSizeInput" className="block text-sm font-medium text-gray-700 mb-1">1ブロックあたりの希望人数 <span className="text-red-500">*</span></label>
          <input id="preferredBlockSizeInput" className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" type="number" value={appState.preferredBlockSizeInput || ''} onChange={e => updateState({ preferredBlockSizeInput: parseInt(e.target.value, 10) || 0 })} placeholder="例: 5" min="1"/>
          <p className="text-xs text-gray-500 mt-1">各ブロック最低 {MIN_PRACTICAL_BLOCK_SIZE} 人になるよう調整されます。</p>
        </div>
        <div className="flex items-center mt-4">
          <input id="isRoundRobinMode" name="isRoundRobinMode" type="checkbox" checked={appState.isRoundRobinMode} onChange={e => updateState({ isRoundRobinMode: e.target.checked })} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
          <label htmlFor="isRoundRobinMode" className="ml-2 block text-sm font-medium text-gray-900">総当たり戦を行う</label>
        </div>
        <div>
          <label htmlFor="totalRoundsPerBlock" className="block text-sm font-medium text-gray-700 mb-1">各ブロックの総ラウンド数 <span className="text-red-500">*</span></label>
          <input id="totalRoundsPerBlock" className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" type="number" value={appState.totalRoundsPerBlock || ''} onChange={e => updateState({ totalRoundsPerBlock: parseInt(e.target.value, 10) || 0 })} placeholder="例: 3" min="1"/>
        </div>
        <div className="flex items-center mt-4">
          <input id="allowDraws" name="allowDraws" type="checkbox" checked={appState.allowDraws} onChange={e => updateState({ allowDraws: e.target.checked })} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
          <label htmlFor="allowDraws" className="ml-2 block text-sm font-medium text-gray-900">引き分けを許可する</label>
        </div>
      </div>
      <button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center" onClick={calculateBlockConfiguration}>
        <ListChecks size={20} className="mr-2" /> ブロック構成を計算して次へ
      </button>
    </div>
  );

  const renderStep2_BlockConfigAndPlayerReg = () => (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-green-700 flex items-center"><Users size={32} className="mr-3"/>参加者登録</h2>
            <button onClick={() => updateState({ step: 1, configuredBlocks: [], allRegisteredPlayers: [] })} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
            <ArrowLeft size={16} className="mr-1"/> 設定に戻る
            </button>
        </div>
        <div className="p-4 bg-indigo-50 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">ブロック構成案:</h3>
            {Array.isArray(appState.configuredBlocks) && appState.configuredBlocks.length > 0 ? ( 
                <ul className="list-disc list-inside space-y-1 text-indigo-700">
                {appState.configuredBlocks.map(block => (<li key={block.id}>{block.name}: {block.targetSize}人</li>))}
                </ul>
            ) : <p className="text-gray-600">ブロック構成がまだ計算されていません。(総参加人数が0の場合もこちら)</p>}
             <p className="text-sm font-medium text-indigo-600 mt-2">合計: {appState.totalPlayersInput} 人</p>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 pt-4 border-t mt-6">プレイヤーリスト ({Array.isArray(appState.allRegisteredPlayers) ? appState.allRegisteredPlayers.length : 0} / {appState.totalPlayersInput} 人)</h3>
        <p className="text-sm text-gray-600 -mt-4 mb-3">初期名は「{DEFAULT_PLAYER_NAME_PREFIX} X」です。CSVで名前を一括変更できます。</p>
        <div className="flex flex-col sm:flex-row gap-3">
            <input className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500" value={appState.playerNameInput} onChange={(e) => updateState({ playerNameInput: e.target.value })} placeholder="新しいプレイヤー名を追加 (手動)" onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}/>
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleAddPlayer} 
                disabled={(Array.isArray(appState.allRegisteredPlayers) && appState.allRegisteredPlayers.length >= appState.totalPlayersInput && appState.totalPlayersInput > 0) || !appState.playerNameInput.trim() || appState.totalPlayersInput === 0}>
            <Plus size={20} className="mr-2" /> 追加
            </button>
        </div>
        <div className="mt-2">
            <label htmlFor="csvImportPlayers" className="block text-sm font-medium text-gray-700 mb-1">CSVで名前を一括更新 (1行1名)</label>
            <div className="flex items-center gap-2">
                <input 
                    id="csvImportPlayers" 
                    type="file" 
                    accept=".csv" 
                    onChange={handleImportCSVPlayers} 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                    disabled={appState.isImportingCSV || appState.totalPlayersInput === 0}
                />
                {appState.isImportingCSV && <Loader2 className="animate-spin text-green-600" size={20} />}
            </div>
            <p className="text-xs text-gray-500 mt-1">CSVの行順に既存のプレイヤー名が更新されます（最大{appState.totalPlayersInput}人まで）。UTF-8形式のCSVを推奨します。</p>
        </div>
        {Array.isArray(appState.allRegisteredPlayers) && appState.allRegisteredPlayers.length > 0 && ( 
            <div className="mt-4 max-h-60 overflow-y-auto pr-2 space-y-2">
            {appState.allRegisteredPlayers.map((p, index) => (
                <div key={p.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md shadow-sm hover:shadow-md">
                <span className="text-gray-700"><span className="font-mono text-xs mr-2 text-gray-400">[{index+1}]</span>{p.name}</span>
                <button onClick={() => handleRemoveRegisteredPlayer(p.id)} className="text-red-500 hover:text-red-700"><X size={18} /></button>
                </div>
            ))}
            </div>
        )}
        <div className="my-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ブロックへのプレイヤー割り当て順序:</label>
          <div className="flex items-center space-x-4">
            <div>
              <input type="radio" id="assignOrderRandom" name="playerAssignmentOrder" value="random" checked={appState.playerAssignmentOrder === 'random'} onChange={(e) => updateState({ playerAssignmentOrder: e.target.value })} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
              <label htmlFor="assignOrderRandom" className="ml-2 text-sm text-gray-700">ランダムに割り当て</label>
            </div>
            <div>
              <input type="radio" id="assignOrderRegistration" name="playerAssignmentOrder" value="registration" checked={appState.playerAssignmentOrder === 'registration'} onChange={(e) => updateState({ playerAssignmentOrder: e.target.value })} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
              <label htmlFor="assignOrderRegistration" className="ml-2 text-sm text-gray-700">登録順に割り当て</label>
            </div>
          </div>
        </div>
        {Array.isArray(appState.allRegisteredPlayers) && appState.allRegisteredPlayers.length === appState.totalPlayersInput && appState.totalPlayersInput > 0 ? ( 
             <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center" onClick={assignPlayersToBlocks}>
                <Shuffle size={20} className="mr-2" /> プレイヤーをブロックに割り当てて開始
            </button>
        ) : appState.totalPlayersInput > 0 && (
             <p className="text-center text-red-500 mt-4 font-medium">
                <AlertCircle size={16} className="inline mr-1 mb-0.5" />
                あと {appState.totalPlayersInput - (Array.isArray(appState.allRegisteredPlayers) ? appState.allRegisteredPlayers.length : 0)} 人登録するか、総参加人数を設定画面で修正してください。
             </p>
         )}
    </div>
  );

  const renderStep4_Tournament = () => {
    const activeBlockOrOverview = appState.activeBlockId;
    let activeBlock = null;
    if (activeBlockOrOverview && activeBlockOrOverview !== "all_blocks_overview" && Array.isArray(appState.configuredBlocks)) {
        activeBlock = appState.configuredBlocks.find(b => b.id === activeBlockOrOverview);
    }
    if (!appState.isDataLoaded) return <div className="p-8 text-center text-gray-700">読み込み中...</div>;
    if (!Array.isArray(appState.configuredBlocks) || appState.configuredBlocks.length === 0) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center animate-fadeIn">
                <p className="text-xl text-gray-700 mb-4">ブロックが設定されていません。</p>
                <button onClick={() => { updateState({step: 1, configuredBlocks: [], allRegisteredPlayers: [], activeBlockId: null})}} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md">設定に戻る</button>
            </div>
        );
    }
    if (activeBlockOrOverview && activeBlockOrOverview !== "all_blocks_overview" && !activeBlock) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle size={24} className="mx-auto mb-2" />
                エラー: 表示するブロック情報({activeBlockOrOverview})が見つかりません。
                <button onClick={() => { if(Array.isArray(appState.configuredBlocks) && appState.configuredBlocks.length > 0) updateState({ activeBlockId: appState.configuredBlocks[0].id })}} className="mt-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">最初のブロックを再選択</button>
            </div>
        );
    }
    if (!activeBlockOrOverview && Array.isArray(appState.configuredBlocks) && appState.configuredBlocks.length > 0) {
        return <div className="p-8 text-center text-gray-600">表示対象を選択してください...</div>;
    }


    return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 truncate">{appState.tournamentName}</h2>
            <button onClick={() => { if(window.confirm("参加者登録画面に戻りますか？現在のブロックの進行状況はリセットされ、ブロックへの再割り当てが必要です。")){ updateState({ step: 2, activeBlockId: null });} }} className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 flex items-center whitespace-nowrap">
                <ArrowLeft size={16} className="mr-1"/> 登録へ戻る
            </button>
        </div>
        <div className="flex border-b border-gray-200 overflow-x-auto pb-px -mx-1">
            {Array.isArray(appState.configuredBlocks) && appState.configuredBlocks.map(block => ( 
            <button key={block.id} onClick={() => updateState({ activeBlockId: block.id })}
                className={`px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap mx-1 rounded-t-md transition-all ${activeBlockOrOverview === block.id ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                {block.name} {block.isComplete ? "(済)" : `(R${block.currentRound})`}
            </button>
            ))}
            {Array.isArray(appState.configuredBlocks) && appState.configuredBlocks.length > 0 && ( 
                <button key="all_blocks_overview_tab" onClick={() => updateState({ activeBlockId: "all_blocks_overview" })}
                    className={`px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap mx-1 rounded-t-md transition-all ${activeBlockOrOverview === "all_blocks_overview" ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                    全ブロック一覧
                </button>
            )}
        </div>

        {activeBlockOrOverview === "all_blocks_overview" ? (
            <div className="mt-4 space-y-8 animate-fadeIn">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">全ブロック 対戦結果一覧 (編集不可)</h3>
                {Array.isArray(appState.configuredBlocks) && appState.configuredBlocks.map(block => ( 
                    <div key={block.id} className="bg-slate-50 p-3 sm:p-4 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold text-slate-700 mb-2">{block.name}</h4>
                        {Array.isArray(block.players) && block.players.length > 0 ? ( 
                            <BlockResultsTable players={block.players} matchHistory={block.matchHistory || []} />
                        ) : <p className="text-sm text-gray-500">プレイヤー未登録</p>}
                    </div>
                ))}
            </div>
        ) : activeBlock ? ( 
            <div className="mt-4 animate-fadeIn">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">{activeBlock.name} - 第 {activeBlock.currentRound} ラウンド</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    総ラウンド数: {(activeBlock._actualTotalRounds !== undefined ? activeBlock._actualTotalRounds : appState.totalRoundsPerBlock) === 0 && Array.isArray(activeBlock.players) && activeBlock.players.length <=1 ? 'N/A' : (activeBlock._actualTotalRounds !== undefined ? activeBlock._actualTotalRounds : appState.totalRoundsPerBlock)}
                    {appState.isRoundRobinMode && Array.isArray(activeBlock.players) && activeBlock.players.length > 1 && " (総当たり)"}
                    {appState.allowDraws && " (引き分けあり)"}
                </p>
                {!activeBlock.isComplete && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow">
                        <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center"><CalendarDays size={20} className="mr-2"/>第 {activeBlock.currentRound} ラウンド 対戦予定</h4>
                        {Array.isArray(activeBlock.pairings) && activeBlock.pairings.length === 0 && !activeBlock.byePlayerThisRound && Array.isArray(activeBlock.players) && activeBlock.players.length > 1 && ( 
                             <button onClick={() => {generateBlockPairings(activeBlock.id)}} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow flex items-center justify-center text-sm">
                                <Play size={16} className="mr-2"/> 対戦カードを生成
                            </button>
                        )}
                        {Array.isArray(activeBlock.pairings) && activeBlock.pairings.length === 0 && !activeBlock.byePlayerThisRound && Array.isArray(activeBlock.players) && activeBlock.players.length <= 1 && activeBlock.players.length > 0 && ( 
                            <p className="text-sm text-gray-600"><UserCheck size={16} className="inline mr-1.5 text-green-500" />プレイヤー1名のため対戦なし</p>
                        )}
                         {Array.isArray(activeBlock.pairings) && activeBlock.pairings.length === 0 && !activeBlock.byePlayerThisRound && (!Array.isArray(activeBlock.players) || activeBlock.players.length === 0) && ( 
                            <p className="text-sm text-gray-600">プレイヤーがいません</p>
                        )}
                        {Array.isArray(activeBlock.pairings) && activeBlock.pairings.map((pair, index) => ( 
                            <div key={pair.id || `scheduled-${index}`} className="py-2 border-b border-blue-100 last:border-b-0 flex items-center">
                                <Users size={16} className="inline mr-2 text-blue-500"/>
                                <span className="font-medium text-gray-700">{pair.p1.name}</span> <span className="text-gray-500 mx-1.5 text-sm">vs</span> <span className="font-medium text-gray-700">{pair.p2.name}</span>
                            </div>
                        ))}
                        {activeBlock.byePlayerThisRound && (
                            <div className="mt-2 pt-2 border-t border-blue-100 flex items-center">
                                <UserX size={16} className="inline mr-1.5 text-orange-500" />
                                <span className="text-sm text-orange-700">空き: <strong>{activeBlock.byePlayerThisRound.name}</strong></span>
                            </div>
                        )}
                    </div>
                )}
                {activeBlock.isComplete ? (
                    <div role="alert" className="text-green-700 font-semibold text-lg p-4 bg-green-50 rounded-md shadow"><ListChecks className="inline mr-2" />このブロックの全ラウンドが終了しました。</div>
                ) : (
                    <>
                        {Array.isArray(activeBlock.pairings) && activeBlock.pairings.map(pair => ( 
                            <div key={pair.id} className={`p-3 my-2 rounded-lg shadow-md ${pair.reported ? 'bg-gray-100 opacity-80' : 'bg-yellow-50'} border border-gray-200 hover:shadow-lg`}>
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
                                <span className="text-md sm:text-lg font-medium text-gray-700 text-center sm:text-left">
                                <span className={`${!pair.isDraw && pair.winnerId === pair.p1.id ? 'text-green-600 font-bold' : 'text-gray-800'}`}>{pair.p1.name}</span> 
                                <span className="text-gray-500 mx-1.5 text-sm">vs</span> 
                                <span className={`${!pair.isDraw && pair.winnerId === pair.p2.id ? 'text-green-600 font-bold' : 'text-gray-800'}`}>{pair.p2.name}</span>
                                {pair.isDraw && <span className="ml-2 text-yellow-600 font-semibold">(△ 引き分け)</span>}
                                </span>
                                {pair.reported && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full shadow-sm">記録済</span>}
                            </div>
                            {!pair.reported && (
                                <div className="flex flex-col sm:flex-row gap-2 justify-end mt-1">
                                <button className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1.5 rounded-md shadow" onClick={() => recordBlockResult(activeBlock.id, pair.id, pair.p1.id, false)}>{pair.p1.name} 勝ち</button>
                                <button className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1.5 rounded-md shadow" onClick={() => recordBlockResult(activeBlock.id, pair.id, pair.p2.id, false)}>{pair.p2.name} 勝ち</button>
                                {appState.allowDraws && (
                                    <button className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1.5 rounded-md shadow flex items-center justify-center" onClick={() => recordBlockResult(activeBlock.id, pair.id, null, true)}>
                                        <Handshake size={14} className="mr-1.5"/> 引き分け
                                    </button>
                                )}
                                </div>
                            )}
                            </div>
                        ))}
                        {!activeBlock.isComplete && Array.isArray(activeBlock.players) && (activeBlock.pairings.length > 0 || (activeBlock.players.length > 0 && activeBlock.byePlayerThisRound)) && ( 
                            <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed" 
                                onClick={() => nextBlockRound(activeBlock.id)} disabled={!allResultsForBlockRoundRecorded(activeBlock.id)}>
                                {activeBlock.name}: {activeBlock.currentRound < (activeBlock._actualTotalRounds !== undefined ? activeBlock._actualTotalRounds : appState.totalRoundsPerBlock) ? `次のラウンドへ (R${activeBlock.currentRound + 1})` : "このブロックを終了"} <ChevronsRight size={20} className="ml-2" />
                            </button>
                        )}
                    </>
                )}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 flex items-center">
                        <ListChecks size={20} className="mr-2 text-purple-600"/>{activeBlock.name} 現在の順位
                    </h4>
                    {Array.isArray(activeBlock.players) && activeBlock.players.length > 0 ? (
                        <ol className={`space-y-1.5 text-left max-w-lg mx-auto mb-4 ${activeBlock.isComplete ? '' : 'space-y-1'}`}>
                        {sortPlayersForRanking(activeBlock.players, activeBlock.matchHistory || []).map((p) => (
                            <li key={p.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-md shadow-sm text-gray-700 transition-all hover:scale-[1.02] 
                                ${activeBlock.isComplete && p.rank === 1 ? 'bg-yellow-100 border-yellow-400 border-2 transform scale-[1.03]' : 
                                 activeBlock.isComplete ? 'bg-white border' : 'bg-gray-50 hover:bg-gray-100 text-sm p-2'}`}>
                                <div className="flex items-center mb-1 sm:mb-0">
                                  <span className={`font-bold mr-2 ${activeBlock.isComplete && p.rank === 1 ? 'text-yellow-600 text-lg' : activeBlock.isComplete ? 'text-gray-700 text-lg' : 'text-gray-700 font-medium'}`}>
                                    {activeBlock.isComplete && p.rank === 1 && <Crown size={22} className="inline-block mr-1.5 mb-1 text-amber-500" />}
                                    {p.rank}.
                                  </span>
                                  <span className={`truncate pr-2 ${activeBlock.isComplete && p.rank === 1 ? 'font-semibold text-md' : activeBlock.isComplete ? 'font-medium text-md' : 'font-medium'}`}>{p.name}</span>
                                </div>
                                <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                                    <span className={`whitespace-nowrap ${activeBlock.isComplete ? 'text-sm font-semibold' : 'text-sm'}`}>{p.wins}勝 {p.draws > 0 ? `${p.draws}分 ` : ''}/ {p.gamesPlayed}試合</span>
                                    {p.rankReason && (
                                      <span className="text-xs text-blue-600 mt-0.5 flex items-center">
                                        <Info size={12} className="mr-1 opacity-80"/> {p.rankReason}
                                      </span>
                                    )}
                                </div>
                            </li>
                        ))}
                        </ol>
                    ) : <p className="text-sm text-gray-500">プレイヤーがいません。</p>}
                </div>
                <BlockResultsTable
                    players={activeBlock.players || []} 
                    matchHistory={activeBlock.matchHistory || []} 
                    onCellClick={(matchToEdit) => {
                        if (!Array.isArray(activeBlock.players)) return; 
                        const p1 = activeBlock.players.find(p => p.id === matchToEdit.p1IdFromMatch);
                        const p2 = activeBlock.players.find(p => p.id === matchToEdit.p2IdFromMatch);
                        if (p1 && p2) {
                            updateState({ showEditResultModal: true, editingMatchInfo: {
                                blockId: activeBlock.id, pairingId: matchToEdit.pairingId, round: matchToEdit.round,
                                p1Id: p1.id, p1Name: p1.name, p2Id: p2.id, p2Name: p2.name, 
                                currentWinnerId: matchToEdit.currentWinnerId, 
                                isDraw: matchToEdit.isDrawFromMatch
                            }});
                        }
                    }}
                />
            </div>
        ) : <div className="p-8 text-center text-gray-600">表示するブロック情報がありません。</div>}
    </div>
    );
  };

  const renderStep5_FinalResults = () => (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl space-y-6 text-center animate-fadeIn">
      <h2 className="text-3xl font-bold text-green-700 flex items-center justify-center">
        <Trophy size={36} className="mr-1 text-yellow-500"/>
        <Crown size={38} className="mr-3 text-amber-500 transform -rotate-12"/>
        トーナメント終了！
      </h2>
      <p className="text-xl text-gray-700 mb-6">{appState.tournamentName} - 最終結果</p>
      <div className="space-y-8">
        {Array.isArray(appState.configuredBlocks) && appState.configuredBlocks.map(block => { 
          const rankedPlayers = sortPlayersForRanking(block.players || [], block.matchHistory || []); 
          return (
            <div key={block.id} className="p-4 border border-gray-200 rounded-lg bg-slate-50 shadow-lg">
              <h3 className="text-2xl font-semibold text-slate-800 mb-3">{block.name}</h3>
              <ol className="space-y-1.5 text-left max-w-lg mx-auto mb-4">
                {rankedPlayers.map((p) => ( 
                  <li key={p.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-md shadow-sm text-gray-700 transition-all hover:scale-[1.02] ${p.rank === 1 ? 'bg-yellow-100 border-yellow-400 border-2 transform scale-[1.03]' : 'bg-white border'}`}>
                    <div className="flex items-center mb-1 sm:mb-0">
                      <span className={`font-bold text-lg mr-2 ${p.rank === 1 ? 'text-yellow-600' : 'text-gray-700'}`}>
                        {p.rank === 1 && <Crown size={22} className="inline-block mr-1.5 mb-1 text-amber-500" />}
                        {p.rank}.
                      </span>
                      <span className={`font-medium text-md truncate pr-2 ${p.rank === 1 ? 'font-semibold' : ''}`}>{p.name}</span>
                    </div>
                    <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                        <span className="text-sm whitespace-nowrap font-semibold">{p.wins}勝 {p.draws > 0 ? `${p.draws}分 ` : ''}/ {p.gamesPlayed}試合</span>
                        {p.rankReason && (
                          <span className="text-xs text-blue-600 mt-0.5 flex items-center">
                            <Info size={12} className="mr-1 opacity-80"/> {p.rankReason}
                          </span>
                        )}
                    </div>
                  </li>
                ))}
              </ol>
              <BlockResultsTable players={block.players || []} matchHistory={block.matchHistory || []} />
            </div>
          );
        })}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center justify-center" onClick={handleExportAllDataCSV}>
          <Download size={20} className="mr-2" /> 全ブロック結果をCSVエクスポート
        </button>
        <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center justify-center" onClick={resetTournament}>
          <RotateCcw size={20} className="mr-2" /> 新しいトーナメントを開始
        </button>
      </div>
    </div>
  );

  const Modal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeInBasic">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 ease-out scale-100 animate-slideUp">
        <p className="text-gray-800 mb-5 text-center text-sm sm:text-base whitespace-pre-wrap">{message}</p>
        <button onClick={onClose} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow">閉じる</button>
      </div>
    </div>
  );

  if (!appState.isDataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-600 flex flex-col items-center justify-center p-4 text-white">
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } } .animate-spin-custom { animation: spin 1s linear infinite; }
          @keyframes fadeInBasic { from { opacity: 0; } to { opacity: 1; } } .animate-fadeInBasic { animation: fadeInBasic 0.3s ease-out forwards; }
          @keyframes slideUp { from { opacity:0.8; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } } .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
          @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>
        <div className="animate-spin-custom rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-400 mb-4"></div>
        <p className="text-lg">大会データを準備中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <style>{`
          /* このstyleタグはTailwind CSSが有効なら不要かもしれませんが、念のため残します */
          @keyframes fadeInBasic { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeInBasic { animation: fadeInBasic 0.3s ease-out forwards; }
          @keyframes slideUp { from { opacity:0.8; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
          .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
          @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      <Header />

      {/* flex-growでフッターを最下部に押し出す */}
      <main className="w-full max-w-3xl mx-auto flex-grow p-2 sm:p-4 flex flex-col">
        <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">マルチブロックリーグ戦マネージャー</h1>
        </div>

        <UsageGuide />
        
        <div className="bg-gray-50 p-0.5 sm:p-1 rounded-xl shadow-inner mt-4">
            {appState.step === 1 && renderStep1_Setup()}
            {appState.step === 2 && renderStep2_BlockConfigAndPlayerReg()}
            {appState.step === 4 && renderStep4_Tournament()}
            {appState.step === 5 && renderStep5_FinalResults()}
        </div>
        {appState.step > 1 && appState.step < 5 && (
             <button onClick={resetTournament} className="w-full mt-6 bg-red-500 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center justify-center">
                <RotateCcw size={20} className="mr-2" /> トーナメントをリセット
            </button>
        )}
      </main>

      <Footer />

      {appState.showModal && <Modal message={appState.modalMessage} onClose={closeModal} />}
      {appState.showEditResultModal && (
        <EditResultModal
          matchInfo={appState.editingMatchInfo}
          onUpdateResult={handleUpdateResult}
          onClose={() => updateState({ showEditResultModal: false, editingMatchInfo: null })}
          allowDraws={appState.allowDraws}
        />
      )}
    </div>
  );
}