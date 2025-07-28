import React, { useState, useEffect } from 'react';

const positions = [
  '공격수', '미드필더', '수비수', '골키퍼',
  '윙어', '수비형 미드필더', '공격형 미드필더', '풀백', '센터백',
];

function PlayerForm({ onAddPlayer, onUpdatePlayer, playerToEdit, onCancelEdit }) {
  const [id, setId] = useState(null);
  const [name, setName] = useState('');
  const [position, setPosition] = useState(positions[0]);
  const [stats, setStats] = useState({ speed: 5, shoot: 5, pass: 5, defense: 5, ballControl: 5, dribbling: 5, fundamentals: 5 });

  // playerToEdit이 변경될 때 폼 데이터를 업데이트
  useEffect(() => {
    if (playerToEdit) {
      setId(playerToEdit.id);
      setName(playerToEdit.name);
      setPosition(playerToEdit.position);
      setStats(playerToEdit.stats);
    } else {
      // 새 선수 추가 모드일 때 폼 초기화
      setId(null);
      setName('');
      setPosition(positions[0]);
      setStats({ speed: 5, shoot: 5, pass: 5, defense: 5, ballControl: 5, dribbling: 5, fundamentals: 5 });
    }
  }, [playerToEdit]);

  const handleStatChange = (statName, value) => {
    setStats(prevStats => ({
      ...prevStats,
      [statName]: parseInt(value, 10)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      alert('선수 이름을 입력해주세요!');
      return;
    }

    const playerData = { name, position, stats };

    if (id) {
      // 수정 모드
      onUpdatePlayer({ id, ...playerData });
    } else {
      // 추가 모드
      onAddPlayer(playerData);
    }
    // 폼 초기화 및 수정 취소
    onCancelEdit();
  };

  return (
    <div className="player-form-content">
      <h2>{playerToEdit ? '선수 정보 수정' : '새로운 선수 등록'}</h2>
      <form onSubmit={handleSubmit} className="player-form">
        <div className="form-group">
          <label>이름</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="선수 이름" />
        </div>
        <div className="form-group">
          <label>포지션</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)}>
            {positions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="stats-sliders">
          {Object.keys(stats).map(statName => (
            <div key={statName} className="stat-group">
              <label>{statName.charAt(0).toUpperCase() + statName.slice(1)}: {stats[statName]}</label>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={stats[statName]} 
                onChange={(e) => handleStatChange(statName, e.target.value)} 
              />
            </div>
          ))}
        </div>
        <button type="submit" className="submit-btn">{playerToEdit ? '수정 완료' : '등록하기'}</button>
        {playerToEdit && (
          <button type="button" className="cancel-btn" onClick={onCancelEdit}>취소</button>
        )}
      </form>
    </div>
  );
}

export default PlayerForm;