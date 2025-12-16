import React, { useState, useRef, MouseEvent, useMemo, useEffect } from 'react';

interface InteractiveStaffProps {
    onNoteSelect: (note: { name: string; key: string } | null) => void;
    selectedNoteName: string | null;
}

type Accidental = 'sharp' | 'flat' | null;

interface SelectedNote {
    name: string; // e.g. "C#4"
    baseName: string; // e.g. "C4"
    key: string; // The full key from the data, e.g. "C#4/Db4"
    y: number;
    accidental: Accidental;
}

// Increased spacing for better usability and larger hitboxes
const LINE_HEIGHT = 14;
const STAFF_WIDTH = 500;
const NOTE_HEAD_RX = 9;
const NOTE_HEAD_RY = 7;
const STAFF_TOP_MARGIN = 45; // Increased margin to make space for controls
const STAFF_BOTTOM_MARGIN = 30;
const CLEF_AREA_WIDTH = 70;

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const MIDDLE_C_Y = STAFF_TOP_MARGIN + LINE_HEIGHT * 9;

/**
 * Programmatically determines the note based on Y-coordinate.
 * This is more robust than a hardcoded map.
 */
const getNoteFromY = (y: number) => {
    const snappedY = Math.round((y - STAFF_TOP_MARGIN) / (LINE_HEIGHT / 2)) * (LINE_HEIGHT / 2) + STAFF_TOP_MARGIN;
    const stepsFromC4 = Math.round((MIDDLE_C_Y - snappedY) / (LINE_HEIGHT / 2));
    const noteIndex = ((stepsFromC4 % 7) + 7) % 7;
    const octave = 4 + Math.floor(stepsFromC4 / 7);
    const name = `${NOTE_NAMES[noteIndex]}${octave}`;
    return { name, y: snappedY };
};

const getYFromNote = (noteName: string): number | null => {
    const match = noteName.match(/([A-G])([#b]?)(\d+)/);
    if (!match) return null;

    const baseNote = match[1];
    const octave = parseInt(match[3], 10);

    const baseNoteIndex = NOTE_NAMES.indexOf(baseNote);
    if (baseNoteIndex === -1) return null;

    const octaveDiff = octave - 4;
    const stepsFromC4 = octaveDiff * 7 + baseNoteIndex;

    const snappedY = MIDDLE_C_Y - stepsFromC4 * (LINE_HEIGHT / 2);
    return snappedY;
};


const Note: React.FC<{ x: number; y: number; isHover?: boolean; isSelected?: boolean }> = ({ x, y, isHover = false, isSelected = false }) => {
    const noteHeadFill = isSelected ? '#FFD700' : isHover ? 'rgba(255, 199, 44, 0.5)' : '#FFC72C';
    const noteHeadStroke = isSelected ? '#FFFFFF' : isHover ? 'transparent' : '#FFFFFF';
    const stemColor = isSelected ? '#FFD700' : isHover ? 'rgba(255, 199, 44, 0.5)' : '#FFC72C';

    const stemDirection = y <= MIDDLE_C_Y ? 'down' : 'up';
    const stemLength = LINE_HEIGHT * 3.5;

    let stemX = 0;
    let stemY1 = 0;
    let stemY2 = 0;

    if (stemDirection === 'up') {
        stemX = x + NOTE_HEAD_RX;
        stemY1 = y;
        stemY2 = y - stemLength;
    } else { // 'down'
        stemX = x - NOTE_HEAD_RX;
        stemY1 = y;
        stemY2 = y + stemLength;
    }
    
    const glowFilterId = 'note-glow-filter';

    return (
        <g>
            {isSelected && (
                <defs>
                    <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"></feGaussianBlur>
                        <feMerge>
                            <feMergeNode in="coloredBlur"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                    </filter>
                </defs>
            )}
            <g style={isSelected ? { filter: `url(#${glowFilterId})` } : {}}>
                <ellipse cx={x} cy={y} rx={NOTE_HEAD_RX} ry={NOTE_HEAD_RY} fill={noteHeadFill} stroke={noteHeadStroke} strokeWidth="1.5" />
                <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2} stroke={stemColor} strokeWidth="2" />
            </g>
        </g>
    );
};


const InteractiveStaff: React.FC<InteractiveStaffProps> = ({ onNoteSelect, selectedNoteName }) => {
    const [hoverNote, setHoverNote] = useState<{ x: number; y: number; note: any } | null>(null);
    const [selectedNote, setSelectedNote] = useState<SelectedNote | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const noteX = useMemo(() => CLEF_AREA_WIDTH + (STAFF_WIDTH - CLEF_AREA_WIDTH) / 2, []);

    // Effect to update the staff when a note is selected from outside (e.g., search)
    useEffect(() => {
        if (selectedNoteName === (selectedNote?.name ?? null)) {
            // No change needed, prevent loops
            return;
        }

        if (selectedNoteName) {
            const match = selectedNoteName.match(/([A-G])([#b]?)(\d+)/);
            if (match) {
                const baseNote = match[1];
                const accidentalSymbol = match[2];
                const octave = match[3];
                const baseName = `${baseNote}${octave}`;
                
                const y = getYFromNote(baseName);
                if (y !== null) {
                    const newSelection: SelectedNote = {
                        name: selectedNoteName,
                        baseName: baseName,
                        key: selectedNoteName, // This will be updated from parent, but good default
                        y: y,
                        accidental: accidentalSymbol === '#' ? 'sharp' : accidentalSymbol === 'b' ? 'flat' : null,
                    };
                    setSelectedNote(newSelection);
                }
            }
        } else {
            setSelectedNote(null);
        }
    }, [selectedNoteName, selectedNote]);


    const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;

        const ctm = svg.getScreenCTM();
        if (ctm) {
            const svgP = pt.matrixTransform(ctm.inverse());
            const y = svgP.y;

            // Prevent hover detection in the control area above the staff
            if (y < STAFF_TOP_MARGIN) {
                setHoverNote(null);
                return;
            }

            const noteInfo = getNoteFromY(y);
            if (noteInfo) {
                setHoverNote({ x: noteX, y: noteInfo.y, note: noteInfo });
            } else {
                setHoverNote(null);
            }
        }
    };

    const handleMouseLeave = () => {
        setHoverNote(null);
    };

    const handleClick = () => {
        if (hoverNote) {
            if (selectedNote && selectedNote.y === hoverNote.y && selectedNote.accidental === null) {
                 // Clicking same note again without accidental change does nothing
                return; 
            }
            const noteInfo = hoverNote.note;
            const newSelection: SelectedNote = {
                name: noteInfo.name,
                baseName: noteInfo.name,
                key: noteInfo.name,
                y: hoverNote.y,
                accidental: null,
            };
            setSelectedNote(newSelection);
            onNoteSelect({ name: newSelection.name, key: newSelection.key });
        }
    };

    const handleAccidentalClick = (e: MouseEvent, acc: 'sharp' | 'flat') => {
        e.stopPropagation();
        if (!selectedNote) return;

        const newAccidental = acc === selectedNote.accidental ? null : acc;
        
        let newName = selectedNote.baseName;
        if (newAccidental === 'sharp') {
            newName = `${selectedNote.baseName.charAt(0)}#${selectedNote.baseName.slice(1)}`;
        } else if (newAccidental === 'flat') {
            newName = `${selectedNote.baseName.charAt(0)}b${selectedNote.baseName.slice(1)}`;
        }

        const newSelection: SelectedNote = {
            ...selectedNote,
            name: newName,
            accidental: newAccidental,
        };
        // The key for sharps/flats will be resolved by the parent based on the new name
        newSelection.key = newName;

        setSelectedNote(newSelection);
        onNoteSelect({ name: newSelection.name, key: newSelection.key });
    };
    
    const renderLedgerLines = (noteY: number) => {
        const lines = [];
        const ledgerLineX1 = noteX - 15;
        const ledgerLineX2 = noteX + 15;

        const TREBLE_STAFF_TOP_LINE_Y = STAFF_TOP_MARGIN + 4 * LINE_HEIGHT;
        const BASS_STAFF_BOTTOM_LINE_Y = STAFF_TOP_MARGIN + 14 * LINE_HEIGHT;
        
        // Ledger lines above treble staff (for notes like A5, C6, etc.)
        if (noteY <= TREBLE_STAFF_TOP_LINE_Y - LINE_HEIGHT) {
            for (let y = TREBLE_STAFF_TOP_LINE_Y - LINE_HEIGHT; y >= noteY; y -= LINE_HEIGHT) {
                lines.push(<line key={`ledger-t-${y}`} x1={ledgerLineX1} y1={y} x2={ledgerLineX2} y2={y} stroke="#a0aec0" strokeWidth="1.5" />);
            }
        }
        
        // Ledger line for Middle C
        if (noteY === MIDDLE_C_Y) {
             lines.push(<line key="ledger-c4" x1={ledgerLineX1} y1={noteY} x2={ledgerLineX2} y2={noteY} stroke="#a0aec0" strokeWidth="1.5" />);
        }

        // Ledger lines below bass staff (for notes like B2, G2, etc.)
        if (noteY >= BASS_STAFF_BOTTOM_LINE_Y + LINE_HEIGHT) {
             for (let y = BASS_STAFF_BOTTOM_LINE_Y + LINE_HEIGHT; y <= noteY; y += LINE_HEIGHT) {
                lines.push(<line key={`ledger-b-${y}`} x1={ledgerLineX1} y1={y} x2={ledgerLineX2} y2={y} stroke="#a0aec0" strokeWidth="1.5" />);
            }
        }
        return lines;
    };

    const height = STAFF_TOP_MARGIN + STAFF_BOTTOM_MARGIN + 17 * LINE_HEIGHT;

    return (
        <div className="flex justify-center cursor-pointer bg-maroon-darkest rounded-lg p-2">
            <svg
                ref={svgRef}
                width="100%"
                viewBox={`0 0 ${STAFF_WIDTH} ${height}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {/* Staff Lines */}
                {[...Array(5)].map((_, i) => ( <line key={`t-line-${i}`} x1={CLEF_AREA_WIDTH} y1={STAFF_TOP_MARGIN + (i + 4) * LINE_HEIGHT} x2={STAFF_WIDTH - 15} y2={STAFF_TOP_MARGIN + (i + 4) * LINE_HEIGHT} stroke="#a0aec0" strokeWidth="1.5" /> ))}
                {[...Array(5)].map((_, i) => ( <line key={`b-line-${i}`} x1={CLEF_AREA_WIDTH} y1={STAFF_TOP_MARGIN + (i + 10) * LINE_HEIGHT} x2={STAFF_WIDTH - 15} y2={STAFF_TOP_MARGIN + (i + 10) * LINE_HEIGHT} stroke="#a0aec0" strokeWidth="1.5" /> ))}

                {/* Clefs */}
                <text
                    x={CLEF_AREA_WIDTH / 2}
                    y={STAFF_TOP_MARGIN + 6 * LINE_HEIGHT}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="24"
                    fontFamily="serif"
                    fontWeight="bold"
                    fontStyle="italic"
                    fill="#a0aec0"
                    className="select-none"
                >
                    Treble
                </text>
                <text
                    x={CLEF_AREA_WIDTH / 2}
                    y={STAFF_TOP_MARGIN + 12 * LINE_HEIGHT}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="24"
                    fontFamily="serif"
                    fontWeight="bold"
                    fontStyle="italic"
                    fill="#a0aec0"
                    className="select-none"
                >
                    Bass
                </text>
                
                {/* Bar line after clef */}
                <line x1={CLEF_AREA_WIDTH} y1={STAFF_TOP_MARGIN + 4 * LINE_HEIGHT} x2={CLEF_AREA_WIDTH} y2={STAFF_TOP_MARGIN + 14 * LINE_HEIGHT} stroke="#a0aec0" strokeWidth="1.5" />


                {/* Selected Note and Controls */}
                 {selectedNote && (
                    <g>
                        {renderLedgerLines(selectedNote.y)}
                        <Note x={noteX} y={selectedNote.y} isSelected />
                        
                        {selectedNote.accidental === 'sharp' && <text x={noteX - 25} y={selectedNote.y + 6} fontSize="28" fill="#FFFFFF" className="pointer-events-none">♯</text>}
                        {selectedNote.accidental === 'flat' && <text x={noteX - 25} y={selectedNote.y + 7} fontSize="28" fill="#FFFFFF" className="pointer-events-none">♭</text>}
                       
                    </g>
                )}

                {/* Clickable accidental controls are now at the top */}
                {selectedNote && (
                    <>
                        <g 
                            transform={`translate(${noteX - 40}, 5)`}
                            className="cursor-pointer group" 
                            onClick={(e) => handleAccidentalClick(e, 'flat')}
                        >
                            <rect 
                                width="35" 
                                height="35" 
                                fill={selectedNote.accidental === 'flat' ? 'rgba(255, 199, 44, 0.3)' : 'transparent'} 
                                rx="4"
                                className="group-hover:fill-[rgba(255,255,255,0.1)] transition-colors"
                            />
                            <text 
                                x="17.5" y="27" 
                                fontSize="28" 
                                fill={selectedNote.accidental === 'flat' ? '#FFD700' : '#FFFFFF'} 
                                textAnchor="middle" 
                                className="pointer-events-none"
                            >
                                ♭
                            </text>
                        </g>
                        <g 
                            transform={`translate(${noteX + 5}, 5)`}
                            className="cursor-pointer group" 
                            onClick={(e) => handleAccidentalClick(e, 'sharp')}
                        >
                            <rect 
                                width="35" 
                                height="35" 
                                fill={selectedNote.accidental === 'sharp' ? 'rgba(255, 199, 44, 0.3)' : 'transparent'} 
                                rx="4"
                                className="group-hover:fill-[rgba(255,255,255,0.1)] transition-colors"
                            />
                            <text 
                                x="17.5" y="24" 
                                fontSize="28" 
                                fill={selectedNote.accidental === 'sharp' ? '#FFD700' : '#FFFFFF'} 
                                textAnchor="middle" 
                                className="pointer-events-none"
                            >
                                ♯
                            </text>
                        </g>
                    </>
                )}


                {/* Hover Note */}
                {hoverNote && (!selectedNote || selectedNote.y !== hoverNote.y) && (
                    <>
                        {renderLedgerLines(hoverNote.y)}
                        <Note x={hoverNote.x} y={hoverNote.y} isHover />
                    </>
                )}
            </svg>
        </div>
    );
};

export default InteractiveStaff;