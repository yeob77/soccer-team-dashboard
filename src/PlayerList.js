import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

function PlayerList({ players, selectedPlayerIds, onPlayerClick, searchTerm, onSearchChange, sortOrder, onSortChange, onAddPlayerClick, onTeamSplitClick, onGoToFormationClick, onDeleteSelectedPlayers, onEditSelectedPlayer, loadMorePlayers, hasMorePlayers, onSelectAllPlayers, onDeselectAllPlayers }) {
  return (
    <div className="player-list-container">
      <h2>선수 명단</h2>
      <div className="controls-bar">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="선수 이름 검색..." 
            value={searchTerm} 
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="sort-options">
          <label>정렬:</label>
          <select value={sortOrder} onChange={(e) => onSortChange(e.target.value)}>
            <option value="name_asc">이름순</option>
            <option value="overall_desc">높은 점수순</option>
            <option value="overall_asc">낮은 점수순</option>
          </select>
        </div>
        <button className="add-player-btn" onClick={onAddPlayerClick}>새로운 선수 등록</button>
      </div>
      <div className="attendance-controls">
        <button className="attendance-btn select-all" onClick={onSelectAllPlayers}>전체 선택</button>
        <button className="attendance-btn deselect-all" onClick={onDeselectAllPlayers}>전체 취소</button>
        <button 
          className="attendance-btn split-team-btn"
          onClick={onTeamSplitClick}
          disabled={selectedPlayerIds.length < 2}
        >
          팀 자동 분배
        </button>
        <button 
          className="attendance-btn delete-selected-btn"
          onClick={onDeleteSelectedPlayers}
          disabled={selectedPlayerIds.length === 0}
        >
          선수 삭제
        </button>
        <button 
          className="attendance-btn"
          onClick={onEditSelectedPlayer}
          disabled={selectedPlayerIds.length !== 1}
        >
          선수 수정
        </button>
        <button className="attendance-btn formation-btn" onClick={onGoToFormationClick}>포메이션 관리</button>
      </div>
      <InfiniteScroll
        dataLength={players.length}
        next={loadMorePlayers}
        hasMore={hasMorePlayers}
        loader={<h4>로딩 중...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>모든 선수를 불러왔습니다.</b>
          </p>
        }
      >
        <div className="player-cards">
          {players.length === 0 ? (
            <p>등록된 선수가 없습니다.</p>
          ) : (
            players.map(player => (
              <div 
                key={player.id} 
                className={`player-card ${selectedPlayerIds.includes(player.id) ? 'selected' : ''}`}
                onClick={() => onPlayerClick(player.id)}
              >
                <div className="player-info-line">
                  <span className="player-name">{player.name}</span>
                  <span className="player-pos-overall">({player.position}) - {player.overall.toFixed(1)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default PlayerList;