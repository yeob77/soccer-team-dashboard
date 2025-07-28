import React, { useState, useEffect, useRef } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import './FormationManager.css';

function FormationManager({ onBack, teamA, teamB }) {
  const [fieldPlayersA, setFieldPlayersA] = useState({}); // { playerId: { x, y } }
  const [fieldPlayersB, setFieldPlayersB] = useState({}); // { playerId: { x, y } }
  const [formationName, setFormationName] = useState('');
  const [savedFormations, setSavedFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState('');
  const [drawingTool, setDrawingTool] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  // 필드에 배치된 선수들의 위치를 로컬 스토리지에 저장하고 불러오기
  useEffect(() => {
    const savedFieldPlayersA = localStorage.getItem('fieldPlayersA');
    const savedFieldPlayersB = localStorage.getItem('fieldPlayersB');
    if (savedFieldPlayersA) {
      setFieldPlayersA(JSON.parse(savedFieldPlayersA));
    }
    if (savedFieldPlayersB) {
      setFieldPlayersB(JSON.parse(savedFieldPlayersB));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fieldPlayersA', JSON.stringify(fieldPlayersA));
  }, [fieldPlayersA]);

  useEffect(() => {
    localStorage.setItem('fieldPlayersB', JSON.stringify(fieldPlayersB));
  }, [fieldPlayersB]);

  useEffect(() => {
    const formations = JSON.parse(localStorage.getItem('savedFormations') || '{}');
    setSavedFormations(Object.keys(formations));
  }, []);

  const handleSaveFormation = () => {
    if (!formationName) {
      alert('포메이션 이름을 입력해주세요.');
      return;
    }
    const formations = JSON.parse(localStorage.getItem('savedFormations') || '{}');
    formations[formationName] = { fieldPlayersA, fieldPlayersB, drawings };
    localStorage.setItem('savedFormations', JSON.stringify(formations));
    setSavedFormations(Object.keys(formations));
    alert(`'${formationName}' 포메이션이 저장되었습니다.`);
  };

  const handleLoadFormation = () => {
    if (!selectedFormation) return;
    const formations = JSON.parse(localStorage.getItem('savedFormations') || '{}');
    const formation = formations[selectedFormation];
    if (formation) {
      setFieldPlayersA(formation.fieldPlayersA || {});
      setFieldPlayersB(formation.fieldPlayersB || {});
      setDrawings(formation.drawings ? formation.drawings.map(d => ({ ...d, color: d.color || '#ff0000' })) : []);
      alert(`'${selectedFormation}' 포메이션을 불러왔습니다.`);
    }
  };

  const handleDeleteFormation = () => {
    if (!selectedFormation) return;
    if (window.confirm(`'${selectedFormation}' 포메이션을 정말 삭제하시겠습니까?`)) {
      const formations = JSON.parse(localStorage.getItem('savedFormations') || '{}');
      delete formations[selectedFormation];
      localStorage.setItem('savedFormations', JSON.stringify(formations));
      setSavedFormations(Object.keys(formations));
      setSelectedFormation('');
      alert(`'${selectedFormation}' 포메이션이 삭제되었습니다.`);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const wrapper = document.querySelector('.soccer-field-wrapper');
      if (wrapper) {
        canvas.width = wrapper.clientWidth; // 각 필드에 맞게 조정
        canvas.height = wrapper.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); // eslint-disable-next-line no-unused-vars
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawings.forEach(drawing => {
      ctx.beginPath();
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth || 2;

      // Calculate the offset based on which field the drawing belongs to
      const fieldOffset = drawing.fieldIndex === 0 ? 0 : canvas.width / 2;

      if (drawing.tool === 'freeform') {
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        drawing.points.forEach(p => ctx.lineTo(p.x, p.y));
      } else if (drawing.tool === 'line') {
        ctx.moveTo(drawing.start.x, drawing.start.y);
        ctx.lineTo(drawing.end.x, drawing.end.y);
      } else if (drawing.tool === 'arrow') {
        const { start, end } = drawing;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.lineTo(end.x - 10 * Math.cos(angle - Math.PI / 6), end.y - 10 * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - 10 * Math.cos(angle + Math.PI / 6), end.y - 10 * Math.sin(angle + Math.PI / 6));
      }
      ctx.stroke();
    });
  }, [drawings]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    const fieldIndex = Math.floor(offsetX / (canvas.width / 2)); // A팀 필드(0) 또는 B팀 필드(1)
    const relativeX = offsetX % (canvas.width / 2);
    startPos.current = { x: relativeX, y: offsetY, fieldIndex };
    if (drawingTool === 'freeform') {
      setDrawings(prev => [...prev, { tool: 'freeform', points: [startPos.current] }]);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const fieldIndex = Math.floor(offsetX / (canvas.width / 2));
    const relativeX = offsetX % (canvas.width / 2);
    if (drawingTool === 'freeform') {
      setDrawings(prev => {
        const lastDrawing = prev[prev.length - 1];
        lastDrawing.points.push({ x: relativeX, y: offsetY, fieldIndex });
        return [...prev.slice(0, -1), lastDrawing];
      });
    }
  };

  const handleMouseUp = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing.current) return;
    isDrawing.current = false;
    const { offsetX, offsetY } = e.nativeEvent;
    const fieldIndex = Math.floor(offsetX / (canvas.width / 2));
    const relativeX = offsetX % (canvas.width / 2);
    if (drawingTool === 'line' || drawingTool === 'arrow') {
      setDrawings(prev => [...prev, { tool: drawingTool, start: startPos.current, end: { x: relativeX, y: offsetY, fieldIndex } }]);
    }
  };

  const handleClearCanvas = () => {
    setDrawings([]);
  };

  const handleExportImage = () => {
    const fieldWrapper = document.querySelector('.soccer-field-wrapper');
    const tacticCanvas = canvasRef.current;

    if (!fieldWrapper || !tacticCanvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = fieldWrapper.offsetWidth;
    exportCanvas.height = fieldWrapper.offsetHeight;
    const ctx = exportCanvas.getContext('2d');

    // 1. 필드 배경 그리기
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, exportCanvas.width / 2, exportCanvas.height); // A팀 필드
    ctx.fillRect(exportCanvas.width / 2, 0, exportCanvas.width / 2, exportCanvas.height); // B팀 필드

    // 2. 필드 위의 선수들 그리기 (원형)
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    Object.keys(fieldPlayersA).forEach(playerId => {
      const player = teamA.find(p => p.id === parseInt(playerId));
      if (player) {
        const { x, y } = fieldPlayersA[playerId];
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 20, 0, 2 * Math.PI, false); // 반지름 20으로 조정
        ctx.fillStyle = '#007bff'; // A팀 색상
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fillText(player.name, x + 20, y + 20);
      }
    });

    Object.keys(fieldPlayersB).forEach(playerId => {
      const player = teamB.find(p => p.id === parseInt(playerId));
      if (player) {
        const { x, y } = fieldPlayersB[playerId];
        ctx.beginPath();
        ctx.arc(x + exportCanvas.width / 2 + 20, y + 20, 20, 0, 2 * Math.PI, false); // 반지름 20으로 조정
        ctx.fillStyle = '#dc3545'; // B팀 색상
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fillText(player.name, x + exportCanvas.width / 2 + 20, y + 20);
      }
    });

    // 3. 전술 보드 내용(그림) 겹쳐 그리기
    drawings.forEach(drawing => {
      ctx.beginPath();
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth || 2;
      const offsetX = drawing.fieldIndex === 0 ? 0 : exportCanvas.width / 2;

      if (drawing.tool === 'freeform') {
        ctx.moveTo(drawing.points[0].x + offsetX, drawing.points[0].y);
        drawing.points.forEach(p => ctx.lineTo(p.x + offsetX, p.y));
      } else if (drawing.tool === 'line') {
        ctx.moveTo(drawing.start.x + offsetX, drawing.start.y);
        ctx.lineTo(drawing.end.x + offsetX, drawing.end.y);
      } else if (drawing.tool === 'arrow') {
        const { start, end } = drawing;
        ctx.moveTo(start.x + offsetX, start.y);
        ctx.lineTo(end.x + offsetX, end.y);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.lineTo(end.x + offsetX - 10 * Math.cos(angle - Math.PI / 6), end.y - 10 * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x + offsetX, end.y);
        ctx.lineTo(end.x + offsetX - 10 * Math.cos(angle + Math.PI / 6), end.y - 10 * Math.sin(angle + Math.PI / 6));
      }
      ctx.stroke();
    });

    // 4. 이미지 다운로드 링크 생성
    const link = document.createElement('a');
    link.download = 'formation.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over) return;

    const playerId = active.id.split('-')[2];
    const team = active.data.current.team;
    const isFromField = active.data.current.fromField;

    // 필드 -> 선수 목록으로 이동 (선수 제거)
    if (over.id === 'player-pool') {
      if (team === 'A') {
        setFieldPlayersA(prev => {
          const newPlayers = { ...prev };
          delete newPlayers[playerId];
          return newPlayers;
        });
      } else {
        setFieldPlayersB(prev => {
          const newPlayers = { ...prev };
          delete newPlayers[playerId];
          return newPlayers;
        });
      }
      return;
    }

    // 선수 목록 -> 필드로 이동 또는 필드 내 이동
    const targetField = over.id.includes('field-A') ? 'A' : over.id.includes('field-B') ? 'B' : null;

    if (team === targetField) {
      const fieldRect = document.getElementById(`field-${team}`).getBoundingClientRect();
      const dropX = event.delta.x + (isFromField ? active.data.current.initialPosition.x : (event.activatorEvent.clientX - fieldRect.left));
      const dropY = event.delta.y + (isFromField ? active.data.current.initialPosition.y : (event.activatorEvent.clientY - fieldRect.top));

      if (team === 'A') {
        setFieldPlayersA(prev => ({ ...prev, [playerId]: { x: dropX, y: dropY } }));
      } else {
        setFieldPlayersB(prev => ({ ...prev, [playerId]: { x: dropX, y: dropY } }));
      }
    }
  };

  const handleRemovePlayer = (playerId, team) => {
    if (team === 'A') {
      setFieldPlayersA(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[playerId];
        return newPlayers;
      });
    } else {
      setFieldPlayersB(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[playerId];
        return newPlayers;
      });
    }
  };

  function DraggablePlayer({ player, team, onField, position, className }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: `draggable-${team}-${player.id}`,
      data: { player, team, fromField: onField, initialPosition: position },
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      position: onField ? 'absolute' : 'relative',
      left: onField ? position.x : undefined,
      top: onField ? position.y : undefined,
      zIndex: 10, // 드래그 중인 아이템이 위에 오도록
    } : {
      position: onField ? 'absolute' : 'relative',
      left: onField ? position.x : undefined,
      top: onField ? position.y : undefined,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={className || `player-tag player-in-pool team-${team}`}
        onDoubleClick={() => onField && handleRemovePlayer(player.id, team)} // 필드 위에서 더블클릭 시 제거
      >
        {player.name}
      </div>
    );
  }

  function DroppableField({ id, children, team }) {
    const { setNodeRef } = useDroppable({ id });
    return (
      <div id={id} ref={setNodeRef} className={`soccer-field ${team}-field`}>
        {children}
      </div>
    );
  }

  return (
    <div className="formation-manager-container">
      <header className="game-header">
        <button className="back-button" onClick={onBack}>← 대시보드로</button>
        <h1>포메이션 관리</h1>
        <div className="formation-controls">
          <input 
            type="text" 
            placeholder="포메이션 이름" 
            value={formationName} 
            onChange={(e) => setFormationName(e.target.value)} 
          />
          <button onClick={handleSaveFormation}>저장</button>
          <select value={selectedFormation} onChange={(e) => setSelectedFormation(e.target.value)}>
            <option value="">포메이션 선택...</option>
            {savedFormations.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <button onClick={handleLoadFormation} disabled={!selectedFormation}>불러오기</button>
          <button onClick={handleDeleteFormation} disabled={!selectedFormation}>삭제</button>
        </div>
        <div className="tactic-board-controls">
          <button onClick={() => setDrawingTool(null)} className={drawingTool === null ? 'active' : ''}>선수 이동</button>
          <button onClick={() => setDrawingTool('line')} className={drawingTool === 'line' ? 'active' : ''}>선</button>
          <button onClick={() => setDrawingTool('arrow')} className={drawingTool === 'arrow' ? 'active' : ''}>화살표</button>
          <button onClick={() => setDrawingTool('freeform')} className={drawingTool === 'freeform' ? 'active' : ''}>자유 곡선</button>
          <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
          <button onClick={handleClearCanvas}>전체 삭제</button>
          <button onClick={handleExportImage}>이미지로 저장</button>
        </div>
      </header>

      <DndContext onDragEnd={handleDragEnd}>
        <main className="formation-main">
          <div className="player-pool" ref={useDroppable({ id: 'player-pool' }).setNodeRef}>
            <h3>선수 목록</h3>
            <div className="player-pool-teams">
              <div className="player-pool-team">
                <h4>A팀 선수</h4>
                <div className="player-pool-list">
                  {teamA.filter(p => !fieldPlayersA[p.id]).map(player => (
                    <DraggablePlayer key={player.id} player={player} team="A" onField={false} />
                  ))}
                </div>
              </div>
              <div className="player-pool-team">
                <h4>B팀 선수</h4>
                <div className="player-pool-list">
                  {teamB.filter(p => !fieldPlayersB[p.id]).map(player => (
                    <DraggablePlayer key={player.id} player={player} team="B" onField={false} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="soccer-field-wrapper">
            <canvas
              ref={canvasRef}
              className={`tactic-canvas ${drawingTool ? 'drawing' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp} // 필드를 벗어나도 그리기 종료
            />
            <DroppableField id="field-A" team="team-a">
              <h3>A팀 필드</h3>
              {Object.keys(fieldPlayersA).map(playerId => {
                const player = teamA.find(p => p.id === parseInt(playerId));
                if (!player) return null;
                return (
                  <DraggablePlayer 
                    key={player.id} 
                    player={player} 
                    team="A" 
                    onField={true} 
                    position={fieldPlayersA[playerId]} 
                    className={`player-on-field team-A`}
                  />
                );
              })}
            </DroppableField>
            <DroppableField id="field-B" team="team-b">
              <h3>B팀 필드</h3>
              {Object.keys(fieldPlayersB).map(playerId => {
                const player = teamB.find(p => p.id === parseInt(playerId));
                if (!player) return null;
                return (
                  <DraggablePlayer 
                    key={player.id} 
                    player={player} 
                    team="B" 
                    onField={true} 
                    position={fieldPlayersB[playerId]} 
                    className={`player-on-field team-B`}
                  />
                );
              })}
            </DroppableField>
          </div>
        </main>
      </DndContext>
    </div>
  );
}

export default FormationManager;