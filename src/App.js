import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import PlayerForm from './PlayerForm';
import FormationManager from './FormationManager';
import PlayerList from './PlayerList';
import Modal from './Modal'; // Modal 컴포넌트 import

// --- 초기 선수 데이터 (예시) ---
// localStorage에서 데이터를 불러오거나, 없으면 이 초기 데이터를 사용합니다.
const positionMap = {
  '공격수': 'FW',
  '미드필더': 'MF',
  '수비수': 'DF',
  '골키퍼': 'GK',
  '센터백': 'CB',
  '풀백': 'FB',
  '수비형 미드필더': 'CDM',
  '공격형 미드필더': 'CAM',
  '윙어': 'WG',
};

const initialPlayers = [
  {
    id: 1,
    name: '김철수',
    position: positionMap['공격수'],
    stats: { speed: 8, shoot: 9, pass: 7, defense: 5, ballControl: 7, dribbling: 8, fundamentals: 7 },
    overall: 7.25
  },
  {
    id: 2,
    name: '이영희',
    position: positionMap['미드필더'],
    stats: { speed: 7, shoot: 6, pass: 9, defense: 7, ballControl: 8, dribbling: 7, fundamentals: 8 },
    overall: 7.25
  },
  {
    id: 3,
    name: '박지성',
    position: positionMap['수비수'],
    stats: { speed: 6, shoot: 5, pass: 8, defense: 9, ballControl: 7, dribbling: 6, fundamentals: 8 },
    overall: 7.0
  },
  {
    id: 4,
    name: '최민호',
    position: positionMap['공격수'],
    stats: { speed: 9, shoot: 8, pass: 6, defense: 4, ballControl: 6, dribbling: 7, fundamentals: 6 },
    overall: 6.75
  },
  {
    id: 5,
    name: '정수진',
    position: positionMap['미드필더'],
    stats: { speed: 6, shoot: 7, pass: 8, defense: 6, ballControl: 7, dribbling: 7, fundamentals: 7 },
    overall: 6.75
  },
  {
    id: 6,
    name: '김영철',
    position: positionMap['수비수'],
    stats: { speed: 5, shoot: 4, pass: 7, defense: 8, ballControl: 6, dribbling: 5, fundamentals: 7 },
    overall: 6.0
  },
  {
    id: 7,
    name: '안정환',
    position: positionMap['골키퍼'],
    stats: { speed: 4, shoot: 3, pass: 5, defense: 9, ballControl: 5, dribbling: 4, fundamentals: 6 },
    overall: 5.25
  },
  {
    id: 8,
    name: '이운재',
    position: positionMap['골키퍼'],
    stats: { speed: 3, shoot: 2, pass: 4, defense: 10, ballControl: 4, dribbling: 3, fundamentals: 5 },
    overall: 4.75
  },
];

// --- 컴포넌트 ---

function Header() {
  return (
    <header className="app-header">
      <h1>⚽ 조기축구팀 대시보드</h1>
    </header>
  );
}

function TeamDisplay({ teamA, teamB }) {
  const calculateTeamOverall = (team) => {
    return team.reduce((sum, player) => sum + player.overall, 0).toFixed(1);
  };

  return (
    <div className="team-display-container">
      <h2>팀 분배 결과</h2>
      <div className="teams-grid">
        <div className="team-card team-a">
          <h3>A팀 <span className="team-overall-score">({calculateTeamOverall(teamA)})</span></h3>
          <div className="team-players">
            {teamA.length === 0 ? (
              <p className="no-players">선수 없음</p>
            ) : (
              teamA.map(player => (
                <span key={player.id} className="team-player-tag">
                  {player.name}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="team-card team-b">
          <h3>B팀 <span className="team-overall-score">({calculateTeamOverall(teamB)})</span></h3>
          <div className="team-players">
            {teamB.length === 0 ? (
              <p className="no-players">선수 없음</p>
            ) : (
              teamB.map(player => (
                <span key={player.id} className="team-player-tag">
                  {player.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 메인 앱 컴포넌트 ---

function App() {
  // localStorage에서 선수 데이터를 불러오거나, 없으면 initialPlayers 사용
  const [players, setPlayers] = useState(() => {
    const savedPlayers = localStorage.getItem('soccerPlayers');
    if (savedPlayers) {
      // localStorage에서 불러온 데이터에도 positionMap 적용
      return JSON.parse(savedPlayers).map(player => ({
        ...player,
        position: positionMap[player.position] || player.position // 매핑된 값이 없으면 기존 값 유지
      }));
    }
    return initialPlayers;
  });
  const [playerToEdit, setPlayerToEdit] = useState(null); 
  const [showPlayerForm, setShowPlayerForm] = useState(false); // 선수 등록 폼 가시성 상태 추가
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [sortOrder, setSortOrder] = useState('name_asc'); 
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [displayCount, setDisplayCount] = useState(10); // 초기 10명 표시
  const [hasMorePlayers, setHasMorePlayers] = useState(true); // 더 불러올 선수가 있는지 여부

  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]); // 선택된 선수 ID 목록
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 삭제 모달 가시성 상태 추가

  // players 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('soccerPlayers', JSON.stringify(players));
  }, [players]);

  const calculateOverall = (stats) => {
    const { speed, shoot, pass, defense, ballControl, dribbling, fundamentals } = stats;
    const totalStats = speed + shoot + pass + defense + ballControl + dribbling + fundamentals;
    return totalStats / 7; // Now there are 7 stats
  };

  const handleAddPlayer = (playerData) => {
    const newPlayer = {
      id: players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1,
      ...playerData,
      position: positionMap[playerData.position] || playerData.position, // 포지션 약어 적용
      overall: calculateOverall(playerData.stats)
    };
    setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
    setShowPlayerForm(false); // 폼 닫기
  };

  const handleUpdatePlayer = (updatedPlayer) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === updatedPlayer.id 
          ? { 
              ...updatedPlayer, 
              position: positionMap[updatedPlayer.position] || updatedPlayer.position, // 포지션 약어 적용
              overall: calculateOverall(updatedPlayer.stats) 
            } 
          : player
      )
    );
    setPlayerToEdit(null); 
  };

  const handleCancelEdit = () => {
    setPlayerToEdit(null);
    setShowPlayerForm(false); // 폼 닫기
  };

  const handleSelectAllPlayers = () => {
    setSelectedPlayerIds(players.map(player => player.id));
  };

  const handleDeselectAllPlayers = () => {
    setSelectedPlayerIds([]);
  };

  const handleTeamSplit = () => {
    const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));
    if (selectedPlayers.length < 2) {
      alert('최소 2명 이상의 선수가 선택되어야 팀을 나눌 수 있습니다.');
      return;
    }

    const gks = selectedPlayers.filter(p => p.position === 'GK').sort((a, b) => b.overall - a.overall);
    const defenders = selectedPlayers.filter(p => ['DF', 'CB', 'FB'].includes(p.position)).sort((a, b) => b.overall - a.overall);
    const midfielders = selectedPlayers.filter(p => ['MF', 'CDM', 'CAM'].includes(p.position)).sort((a, b) => b.overall - a.overall);
    const forwards = selectedPlayers.filter(p => ['FW', 'WG'].includes(p.position)).sort((a, b) => b.overall - a.overall);
    
    let currentTeamA = [];
    let currentTeamB = [];
    let sumA = 0;
    let sumB = 0;

    if (gks.length > 0) {
      currentTeamA.push(gks[0]);
      sumA += gks[0].overall;
    }
    if (gks.length > 1) {
      currentTeamB.push(gks[1]);
      sumB += gks[1].overall;
    }
    const remainingPlayers = gks.slice(2);

    remainingPlayers.push(...defenders, ...midfielders, ...forwards);
    remainingPlayers.sort((a, b) => b.overall - a.overall);

    remainingPlayers.forEach((player) => {
      if (sumA <= sumB) {
        currentTeamA.push(player);
        sumA += player.overall;
      } else {
        currentTeamB.push(player);
        sumB += player.overall;
      }
    });

    setTeamA(currentTeamA);
    setTeamB(currentTeamB);
  };

  const handleDeleteSelectedPlayers = () => {
    if (selectedPlayerIds.length === 0) {
      alert('삭제할 선수를 선택해주세요.');
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDeletePlayers = () => {
    setPlayers(prevPlayers => prevPlayers.filter(player => !selectedPlayerIds.includes(player.id)));
    setTeamA(prevTeam => prevTeam.filter(player => !selectedPlayerIds.includes(player.id)));
    setTeamB(prevTeam => prevTeam.filter(player => !selectedPlayerIds.includes(player.id)));
    setSelectedPlayerIds([]); // 삭제 후 선택 초기화
    setShowDeleteModal(false);
  };

  const handlePlayerClick = (playerId) => {
    setSelectedPlayerIds(prevSelected => {
      if (prevSelected.includes(playerId)) {
        return prevSelected.filter(id => id !== playerId);
      } else {
        return [...prevSelected, playerId];
      }
    });
  };

  const handleEditSelectedPlayer = () => {
    if (selectedPlayerIds.length !== 1) {
      alert('수정할 선수는 한 명만 선택해주세요.');
      return;
    }
    const playerToEdit = players.find(p => p.id === selectedPlayerIds[0]);
    if (playerToEdit) {
      setPlayerToEdit(playerToEdit);
      setShowPlayerForm(true);
    }
  };

  const loadMorePlayers = () => {
    if (displayCount >= filteredAndSortedPlayers.length) {
      setHasMorePlayers(false);
      return;
    }
    setTimeout(() => {
      setDisplayCount(prevCount => prevCount + 10); // 10명씩 추가 로드
    }, 500); // 로딩 지연 시뮬레이션
  };

  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players.filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortOrder === 'name_asc') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'overall_desc') {
        return b.overall - a.overall;
      } else if (sortOrder === 'overall_asc') {
        return a.overall - b.overall;
      }
      return 0; 
    });

    return filtered;
  }, [players, searchTerm, sortOrder]);

  const playersToDisplay = useMemo(() => {
    return filteredAndSortedPlayers.slice(0, displayCount);
  }, [filteredAndSortedPlayers, displayCount]);

  return (
    <div className="App">
      <Header />
      <main className="main-layout">
        {currentView === 'dashboard' ? (
          <>
            <PlayerList 
              players={playersToDisplay} 
              selectedPlayerIds={selectedPlayerIds}
              onPlayerClick={handlePlayerClick}
              onAddPlayerClick={() => { setPlayerToEdit(null); setShowPlayerForm(true); }}
              onTeamSplitClick={handleTeamSplit} // 팀 분배 로직만 실행
              onGoToFormationClick={() => setCurrentView('formation')} // 포메이션 화면으로 전환
              onDeleteSelectedPlayers={handleDeleteSelectedPlayers} // 선수 삭제 버튼 클릭 핸들러
              onEditSelectedPlayer={handleEditSelectedPlayer} // 선수 수정 버튼 클릭 핸들러
              onSelectAllPlayers={handleSelectAllPlayers} // 전체 선택 핸들러
              onDeselectAllPlayers={handleDeselectAllPlayers} // 전체 취소 핸들러
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
              loadMorePlayers={loadMorePlayers}
              hasMorePlayers={hasMorePlayers}
            />
            <Modal isOpen={showPlayerForm} onClose={() => setShowPlayerForm(false)}>
              <PlayerForm 
                onAddPlayer={handleAddPlayer} 
                onUpdatePlayer={handleUpdatePlayer}
                playerToEdit={playerToEdit}
                onCancelEdit={handleCancelEdit}
              />
            </Modal>
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
              <div className="delete-modal-content">
                <h2>선수 삭제</h2>
                <p>선택된 선수들을 삭제하시겠습니까?</p>
                <div className="delete-player-list">
                  {players.filter(player => selectedPlayerIds.includes(player.id)).map(player => (
                    <div key={player.id} className="delete-player-item">
                      {player.name} ({player.position})
                    </div>
                  ))}
                </div>
                <button onClick={handleConfirmDeletePlayers}>삭제</button>
                <button onClick={() => setShowDeleteModal(false)}>취소</button>
              </div>
            </Modal>
            {(teamA.length > 0 || teamB.length > 0) && (
              <TeamDisplay teamA={teamA} teamB={teamB} />
            )}
          </>
        ) : (
          <FormationManager 
            onBack={() => setCurrentView('dashboard')}
            teamA={teamA}
            teamB={teamB}
          />
        )}
      </main>
    </div>
  );
}

export default App;