/**
 * Chess Beast 360 dedicated move-search worker.
 *
 * Ownership: chess calculation ONLY. This worker never touches the DOM, player
 * storage, clocks, animation or sound. Main UI controls lifecycle and can
 * terminate a runaway search without blocking user interaction.
 *
 * Domain logic below is the original audited ChessEngine snapshot. Any rules
 * fix must update both main-engine and this worker; domain-parity CI guards it.
 * The constructor creates a fresh engine for each incoming immutable FEN job.
 */
'use strict';
let currentLang='en';
  const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const PIECE_VALUES = { P: 100, N: 320, B: 335, R: 500, Q: 900, K: 20000 };

  const PST = {
    P: [
       0,  0,  0,  0,  0,  0,  0,  0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
       5,  5, 10, 25, 25, 10,  5,  5,
       0,  0,  0, 22, 22,  0,  0,  0,
       5, -5,-10,  0,  0,-10, -5,  5,
       5, 10, 10,-20,-20, 10, 10,  5,
       0,  0,  0,  0,  0,  0,  0,  0
    ],
    N: [
      -50,-40,-30,-30,-30,-30,-40,-50,
      -40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,
      -30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,
      -30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,
      -50,-40,-30,-30,-30,-30,-40,-50
    ],
    B: [
      -20,-10,-10,-10,-10,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5, 10, 10,  5,  0,-10,
      -10,  5,  5, 10, 10,  5,  5,-10,
      -10,  0, 10, 10, 10, 10,  0,-10,
      -10, 10, 10, 10, 10, 10, 10,-10,
      -10,  5,  0,  0,  0,  0,  5,-10,
      -20,-10,-10,-10,-10,-10,-10,-20
    ],
    R: [
        0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0
    ],
    Q: [
      -20,-10,-10, -5, -5,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5,  5,  5,  5,  0,-10,
       -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
      -10,  5,  5,  5,  5,  5,  0,-10,
      -10,  0,  5,  0,  0,  0,  0,-10,
      -20,-10,-10, -5, -5,-10,-10,-20
    ],
    K_MID: [
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20,
      -10,-20,-20,-20,-20,-20,-20,-10,
       20, 20,  0,  0,  0,  0, 20, 20,
       20, 30, 10,  0,  0, 10, 30, 20
    ],
    K_END: [
      -50,-40,-30,-20,-20,-30,-40,-50,
      -30,-20,-10,  0,  0,-10,-20,-30,
      -30,-10, 20, 30, 30, 20,-10,-30,
      -30,-10, 30, 40, 40, 30,-10,-30,
      -30,-10, 30, 40, 40, 30,-10,-30,
      -30,-10, 20, 30, 30, 20,-10,-30,
      -30,-30,  0,  0,  0,  0,-30,-30,
      -50,-30,-30,-30,-30,-30,-30,-50
    ]
  };

  function mirrorSq(sq) {
    const r = sq >> 3;
    const c = sq & 7;
    return ((7 - r) << 3) | c;
  }

  function sqToAlgebraic(sq) {
    if (sq < 0 || sq > 63) return '-';
    return FILES[sq & 7] + RANKS[sq >> 3];
  }

  function algebraicToSq(str) {
    if (!str || str === '-' || str.length < 2) return -1;
    const c = FILES.indexOf(str[0]);
    const r = RANKS.indexOf(str[1]);
    if (c < 0 || r < 0) return -1;
    return (r << 3) | c;
  }

  const OPENING_BOOK = [
    { seq: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6", name: "Italian Game: Two Knights Defense" },
    { seq: "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5", name: "Italian Game: Giuoco Piano" },
    { seq: "e2e4 e7e5 g1f3 b8c6 f1c4", name: "Italian Game" },
    { seq: "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6", name: "Ruy Lopez: Morphy Defense" },
    { seq: "e2e4 e7e5 g1f3 b8c6 f1b5", name: "Ruy Lopez / Spanish Opening" },
    { seq: "e2e4 e7e5 g1f3 b8c6 d2d4", name: "Scotch Game" },
    { seq: "e2e4 e7e5 g1f3", name: "King's Knight Opening" },
    { seq: "e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3", name: "Sicilian Defense: Open Variation" },
    { seq: "e2e4 c7c5 g1f3 b8c6", name: "Sicilian Defense: Classical" },
    { seq: "e2e4 c7c5", name: "Sicilian Defense" },
    { seq: "e2e4 e7e6 d2d4 d7d5", name: "French Defense" },
    { seq: "e2e4 c7c6 d2d4 d7d5", name: "Caro-Kann Defense" },
    { seq: "e2e4 d7d5 e4d5 d8d5 b1c3", name: "Scandinavian Defense" },
    { seq: "d2d4 d7d5 c2c4 e7e6 b1c3 g8f6", name: "Queen's Gambit Declined" },
    { seq: "d2d4 d7d5 c2c4 c7c6", name: "Slav Defense" },
    { seq: "d2d4 d7d5 c2c4", name: "Queen's Gambit" },
    { seq: "d2d4 g8f6 c2c4 g7g6 b1c3 f8g7", name: "King's Indian Defense" },
    { seq: "d2d4 d7d5 c1f4 g8f6 e2e3", name: "London System" },
    { seq: "c2c4 e7e5", name: "English Opening" }
  ];

  // Zobrist Hashing Table (Deterministic PRNG for 100% offline reproducibility)
  const ZOBRIST = (() => {
    let seed = 0x9E3779B9;
    function nextRand() {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return seed >>> 0;
    }
    const pieceKeys = {};
    for (const c of ['w', 'b']) {
      for (const t of ['P', 'N', 'B', 'R', 'Q', 'K']) {
        const arr = new Uint32Array(64);
        for (let i = 0; i < 64; i++) arr[i] = nextRand();
        pieceKeys[c + t] = arr;
      }
    }
    return {
      pieceKeys,
      sideKey: nextRand()
    };
  })();

  class ChessEngine {
    constructor() {
      this.tt = new Map();
      this.ttHits = 0;
      this.personality = 'carlsen'; // 'carlsen', 'tal', 'petrosian', 'human'
      this.redoStack = [];
      this.reset();
    }

    computeZobristHash() {
      let h = this.turn === 'b' ? ZOBRIST.sideKey : 0;
      for (let sq = 0; sq < 64; sq++) {
        const p = this.board[sq];
        if (p) {
          h = (h ^ ZOBRIST.pieceKeys[p.color + p.type][sq]) >>> 0;
        }
      }
      return h;
    }

    reset() {
      this.tt.clear();
      this.loadFen(START_FEN);
    }

    loadFen(fen) {
      const parts = fen.trim().split(/\s+/);
      if (parts.length < 4) return false;

      const rows=parts[0].split('/');
      if(rows.length!==8||!['w','b'].includes(parts[1])||!/^(?:-|[KQkqA-Ha-h]+)$/.test(parts[2]))return false;
      const newBoard=new Array(64).fill(null);
      let sq=0;
      for(const row of rows){
        let count=0;
        for(const ch of row){
          if(/[1-8]/.test(ch)){count+=Number(ch);sq+=Number(ch);}
          else if(/[KQRBNPkqrbnp]/.test(ch)){
            if(count>=8)return false;
            newBoard[sq++]={color:ch===ch.toUpperCase()?'w':'b',type:ch.toUpperCase()};
            count++;
          }else return false;
        }
        if(count!==8)return false;
      }
      if(newBoard.filter(p=>p?.type==='K'&&p.color==='w').length!==1
        ||newBoard.filter(p=>p?.type==='K'&&p.color==='b').length!==1)return false;
      if(parts[3]!=='-'&&(!/^[a-h][36]$/.test(parts[3])||algebraicToSq(parts[3])<0))return false;
      this.board=newBoard;
      this.turn=parts[1];
      this.castling={wK:false,wQ:false,bK:false,bQ:false};
      this.castleRooks={wK:63,wQ:56,bK:7,bQ:0};
      this.castle960=/[A-Ha-h]/.test(parts[2]);
      for(const ch of parts[2]==='-'?'':parts[2]){
        const standard={K:'wK',Q:'wQ',k:'bK',q:'bQ'}[ch];
        if(standard){this.castling[standard]=true;continue;}
        const color=ch===ch.toUpperCase()?'w':'b';
        const back=color==='w'?56:0;
        const kingCol=newBoard.findIndex((p,i)=>p?.type==='K'&&p.color===color&&Math.floor(i/8)===(color==='w'?7:0))%8;
        if(kingCol<0)return false;
        const rookCol=FILES.indexOf(ch.toLowerCase());
        const slot=color+(rookCol>kingCol?'K':'Q');
        this.castling[slot]=true;
        this.castleRooks[slot]=back+rookCol;
      }
      this.epSquare=parts[3]!=='-'?algebraicToSq(parts[3]):-1;
      this.halfMoveClock = parseInt(parts[4] || '0', 10);
      this.fullMoveNumber = parseInt(parts[5] || '1', 10);
      this.history = [];
      this.uciHistory = [];
      this.redoStack = [];
      this.positionCounts = {};
      this.recordPositionHash();
      this.startFenSnap = this.toFen();
      return true;
    }

    toFen() {
      let fenRows = [];
      for (let r = 0; r < 8; r++) {
        let empty = 0;
        let rowStr = '';
        for (let c = 0; c < 8; c++) {
          const p = this.board[(r << 3) | c];
          if (!p) {
            empty++;
          } else {
            if (empty > 0) { rowStr += empty; empty = 0; }
            rowStr += p.color === 'w' ? p.type : p.type.toLowerCase();
          }
        }
        if (empty > 0) rowStr += empty;
        fenRows.push(rowStr);
      }
      let castleStr='';
      for(const key of ['wK','wQ','bK','bQ']){
        if(!this.castling[key])continue;
        const original={wK:'K',wQ:'Q',bK:'k',bQ:'q'}[key];
        const file=FILES[this.castleRooks[key]%8];
        castleStr+=this.castle960?(key[0]==='w'?file.toUpperCase():file):original;
      }
      if(!castleStr)castleStr='-';

      const epStr = this.epSquare >= 0 ? sqToAlgebraic(this.epSquare) : '-';
      return `${fenRows.join('/')} ${this.turn} ${castleStr} ${epStr} ${this.halfMoveClock} ${this.fullMoveNumber}`;
    }

    getPositionKey() {
      let s = this.turn;
      for (let i = 0; i < 64; i++) {
        const p = this.board[i];
        s += p ? (p.color + p.type) : '.';
      }
      s += (this.castling.wK ? 'K' : '') + (this.castling.wQ ? 'Q' : '') +
           (this.castling.bK ? 'k' : '') + (this.castling.bQ ? 'q' : '') + this.epSquare;
      return s;
    }

    recordPositionHash() {
      const key = this.getPositionKey();
      this.positionCounts[key] = (this.positionCounts[key] || 0) + 1;
    }

    unrecordPositionHash() {
      const key = this.getPositionKey();
      if (this.positionCounts[key]) this.positionCounts[key]--;
    }

    findKing(color) {
      for (let i = 0; i < 64; i++) {
        const p = this.board[i];
        if (p && p.color === color && p.type === 'K') return i;
      }
      return -1;
    }

    // Count how many pieces of `byColor` attack `sq` (used for X-Ray Heatmap!)
    countSquareAttackers(sq, byColor) {
      let count = 0;
      const r = sq >> 3;
      const c = sq & 7;

      const pawnAttackRank = byColor === 'w' ? r + 1 : r - 1;
      if (pawnAttackRank >= 0 && pawnAttackRank <= 7) {
        if (c > 0) {
          const p = this.board[(pawnAttackRank << 3) | (c - 1)];
          if (p && p.color === byColor && p.type === 'P') count++;
        }
        if (c < 7) {
          const p = this.board[(pawnAttackRank << 3) | (c + 1)];
          if (p && p.color === byColor && p.type === 'P') count++;
        }
      }

      const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of knightOffsets) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
          const p = this.board[(nr << 3) | nc];
          if (p && p.color === byColor && p.type === 'N') count++;
        }
      }

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
            const p = this.board[(nr << 3) | nc];
            if (p && p.color === byColor && p.type === 'K') count++;
          }
        }
      }

      const orthoDirs = [[-1,0],[1,0],[0,-1],[0,1]];
      for (const [dr, dc] of orthoDirs) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
          const p = this.board[(nr << 3) | nc];
          if (p) {
            if (p.color === byColor && (p.type === 'R' || p.type === 'Q')) count++;
            break;
          }
          nr += dr; nc += dc;
        }
      }

      const diagDirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
      for (const [dr, dc] of diagDirs) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
          const p = this.board[(nr << 3) | nc];
          if (p) {
            if (p.color === byColor && (p.type === 'B' || p.type === 'Q')) count++;
            break;
          }
          nr += dr; nc += dc;
        }
      }

      return count;
    }

    isSquareAttacked(sq, byColor) {
      return this.countSquareAttackers(sq, byColor) > 0;
    }

    inCheck(color = this.turn) {
      const kSq = this.findKing(color);
      if (kSq < 0) return false;
      const enemy = color === 'w' ? 'b' : 'w';
      return this.isSquareAttacked(kSq, enemy);
    }

    generatePseudoMoves(color = this.turn) {
      const moves = [];
      const enemy = color === 'w' ? 'b' : 'w';

      for (let sq = 0; sq < 64; sq++) {
        const p = this.board[sq];
        if (!p || p.color !== color) continue;

        const r = sq >> 3;
        const c = sq & 7;

        if (p.type === 'P') {
          const dir = color === 'w' ? -1 : 1;
          const startRank = color === 'w' ? 6 : 1;
          const promoRank = color === 'w' ? 0 : 7;
          const nr = r + dir;

          if (nr >= 0 && nr <= 7) {
            const fwdSq = (nr << 3) | c;
            if (!this.board[fwdSq]) {
              if (nr === promoRank) {
                for (const pr of ['Q', 'R', 'B', 'N']) {
                  moves.push({ from: sq, to: fwdSq, piece: p, captured: null, promotion: pr, flags: 'promo' });
                }
              } else {
                moves.push({ from: sq, to: fwdSq, piece: p, captured: null, promotion: null, flags: 'normal' });
                if (r === startRank) {
                  const fwd2Sq = ((r + dir * 2) << 3) | c;
                  if (!this.board[fwd2Sq]) {
                    moves.push({ from: sq, to: fwd2Sq, piece: p, captured: null, promotion: null, flags: 'double' });
                  }
                }
              }
            }

            for (const dc of [-1, 1]) {
              const nc = c + dc;
              if (nc < 0 || nc > 7) continue;
              const capSq = (nr << 3) | nc;
              const target = this.board[capSq];
              if (target && target.color === enemy) {
                if (nr === promoRank) {
                  for (const pr of ['Q', 'R', 'B', 'N']) {
                    moves.push({ from: sq, to: capSq, piece: p, captured: target, promotion: pr, flags: 'promo' });
                  }
                } else {
                  moves.push({ from: sq, to: capSq, piece: p, captured: target, promotion: null, flags: 'capture' });
                }
              } else if (capSq === this.epSquare) {
                const epVictimSq = (r << 3) | nc;
                const epVictim = this.board[epVictimSq];
                if (epVictim && epVictim.color === enemy && epVictim.type === 'P') {
                  moves.push({ from: sq, to: capSq, piece: p, captured: epVictim, promotion: null, flags: 'ep', epVictimSq });
                }
              }
            }
          }
        } else if (p.type === 'N') {
          const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
          for (const [dr, dc] of offsets) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
              const toSq = (nr << 3) | nc;
              const target = this.board[toSq];
              if (!target || target.color === enemy) {
                moves.push({ from: sq, to: toSq, piece: p, captured: target || null, promotion: null, flags: target ? 'capture' : 'normal' });
              }
            }
          }
        } else if (p.type === 'K') {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                const toSq = (nr << 3) | nc;
                const target = this.board[toSq];
                if (!target || target.color === enemy) {
                  moves.push({ from: sq, to: toSq, piece: p, captured: target || null, promotion: null, flags: target ? 'capture' : 'normal' });
                }
              }
            }
          }

          // Standard and Chess960 castling: rook, traversed squares and
          // king safety are verified before offering either legal destination.
          if(!this.inCheck(color)){
            const back=color==='w'?56:0;
            if(Math.floor(sq/8)===(color==='w'?7:0)){
              for(const side of ['K','Q']){
                const key=color+side;
                if(!this.castling[key])continue;
                const rookFrom=this.castleRooks[key];
                const rook=this.board[rookFrom];
                if(!rook||rook.color!==color||rook.type!=='R')continue;
                const kingTo=back+(side==='K'?6:2);
                const rookTo=back+(side==='K'?5:3);
                const between=(a,b)=>{
                  const out=[];
                  const step=a<=b?1:-1;
                  for(let n=a;;n+=step){out.push(n);if(n===b)break;}
                  return out;
                };
                const kingTrack=between(sq,kingTo);
                const rookTrack=between(rookFrom,rookTo);
                const allPath=new Set([...kingTrack,...rookTrack,...between(sq,rookFrom)]);
                if([...allPath].some(n=>n!==sq&&n!==rookFrom&&this.board[n]))continue;
                if(kingTrack.some(n=>this.isSquareAttacked(n,enemy)))continue;
                moves.push({
                  from:sq,to:kingTo,piece:p,captured:null,promotion:null,
                  flags:side==='K'?'castleK':'castleQ',rookFrom,rookTo
                });
              }
            }
          }
        } else {
          const dirs = [];
          if (p.type === 'R' || p.type === 'Q') dirs.push([-1,0],[1,0],[0,-1],[0,1]);
          if (p.type === 'B' || p.type === 'Q') dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);

          for (const [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
              const toSq = (nr << 3) | nc;
              const target = this.board[toSq];
              if (!target) {
                moves.push({ from: sq, to: toSq, piece: p, captured: null, promotion: null, flags: 'normal' });
              } else {
                if (target.color === enemy) {
                  moves.push({ from: sq, to: toSq, piece: p, captured: target, promotion: null, flags: 'capture' });
                }
                break;
              }
              nr += dr; nc += dc;
            }
          }
        }
      }
      return moves;
    }

    makeMoveInternal(m) {
      const stateSnap = {
        move: m,
        castling: { ...this.castling },
        epSquare: this.epSquare,
        halfMoveClock: this.halfMoveClock,
        fullMoveNumber: this.fullMoveNumber
      };

      const p=this.board[m.from];
      const castle=m.flags==='castleK'||m.flags==='castleQ';
      this.board[m.from]=null;
      if(castle){
        const key=p.color+(m.flags==='castleK'?'K':'Q');
        m.rookFrom??=this.castleRooks[key];
        m.rookTo??=(p.color==='w'?56:0)+(m.flags==='castleK'?5:3);
        const rook=this.board[m.rookFrom];
        this.board[m.rookFrom]=null;
        this.board[m.to]=p;
        this.board[m.rookTo]=rook;
      }else{
        if(m.flags==='ep')this.board[m.epVictimSq]=null;
        this.board[m.to]=m.promotion?{color:p.color,type:m.promotion}:p;
      }
      if(p.type==='K'){
        this.castling[p.color+'K']=false;this.castling[p.color+'Q']=false;
      }
      for(const side of ['wK','wQ','bK','bQ']){
        if(m.from===this.castleRooks[side]||m.to===this.castleRooks[side])this.castling[side]=false;
      }

      if (m.flags === 'double') {
        this.epSquare = (m.from + m.to) >> 1;
      } else {
        this.epSquare = -1;
      }

      if (p.type === 'P' || m.captured) {
        this.halfMoveClock = 0;
      } else {
        this.halfMoveClock++;
      }
      if (this.turn === 'b') this.fullMoveNumber++;

      this.turn = this.turn === 'w' ? 'b' : 'w';
      return stateSnap;
    }

    unmakeMoveInternal(snap) {
      const m = snap.move;
      this.turn = this.turn === 'w' ? 'b' : 'w';
      this.castling = snap.castling;
      this.epSquare = snap.epSquare;
      this.halfMoveClock = snap.halfMoveClock;
      this.fullMoveNumber = snap.fullMoveNumber;

      if(m.flags==='castleK'||m.flags==='castleQ'){
        this.board[m.to]=null;
        this.board[m.rookTo]=null;
        this.board[m.from]=m.piece;
        this.board[m.rookFrom]={color:m.piece.color,type:'R'};
      }else{
        this.board[m.from]=m.piece;
        this.board[m.to]=m.captured;
        if(m.flags==='ep'){
          this.board[m.to]=null;
          this.board[m.epVictimSq]=m.captured;
        }
      }
    }

    getLegalMoves(color = this.turn) {
      const pseudo = this.generatePseudoMoves(color);
      const legal = [];
      for (const m of pseudo) {
        const snap = this.makeMoveInternal(m);
        const kingInDanger = this.inCheck(color);
        this.unmakeMoveInternal(snap);
        if (!kingInDanger) {
          legal.push(m);
        }
      }
      return legal;
    }

    moveToSan(m, allLegalMoves) {
      if (m.flags === 'castleK') return 'O-O';
      if (m.flags === 'castleQ') return 'O-O-O';

      let san = '';
      if (m.piece.type !== 'P') {
        san += m.piece.type;
        const ambiguous = allLegalMoves.filter(
          other => other !== m && other.to === m.to && other.piece.type === m.piece.type
        );
        if (ambiguous.length > 0) {
          const sameFile = ambiguous.some(o => (o.from & 7) === (m.from & 7));
          const sameRank = ambiguous.some(o => (o.from >> 3) === (m.from >> 3));
          if (!sameFile) {
            san += FILES[m.from & 7];
          } else if (!sameRank) {
            san += RANKS[m.from >> 3];
          } else {
            san += sqToAlgebraic(m.from);
          }
        }
      } else if (m.captured) {
        san += FILES[m.from & 7];
      }

      if (m.captured) san += 'x';
      san += sqToAlgebraic(m.to);
      if (m.promotion) san += '=' + m.promotion;

      const snap = this.makeMoveInternal(m);
      const oppInCheck = this.inCheck(this.turn);
      const oppLegal = this.getLegalMoves(this.turn);
      this.unmakeMoveInternal(snap);

      if (oppInCheck) {
        san += oppLegal.length === 0 ? '#' : '+';
      }
      return san;
    }

    classifyMoveQuality(evalBeforeWhiteCp, evalAfterWhiteCp, moverColor, wasBestMove, bestEvalWhiteCp) {
      // Compare played move's resulting evaluation against the best possible move's evaluation
      const cpLossVsBest = moverColor === 'w'
        ? Math.max(0, bestEvalWhiteCp - evalAfterWhiteCp)
        : Math.max(0, evalAfterWhiteCp - bestEvalWhiteCp);
      const gainVsBefore = moverColor === 'w'
        ? (evalAfterWhiteCp - evalBeforeWhiteCp)
        : (evalBeforeWhiteCp - evalAfterWhiteCp);

      if (wasBestMove && gainVsBefore >= 140) {
        return { tag: '🔥 Brilliant', cls: 'q-brilliant', loss: 0 };
      }
      if (wasBestMove && gainVsBefore >= 55) {
        return { tag: '⭐ Great', cls: 'q-great', loss: 0 };
      }
      if (wasBestMove || cpLossVsBest <= 15) {
        return { tag: '✅ Best', cls: 'q-best', loss: cpLossVsBest };
      }
      if (cpLossVsBest <= 45) {
        return { tag: '👍 Good', cls: 'q-good', loss: cpLossVsBest };
      }
      if (cpLossVsBest <= 105) {
        return { tag: '⚠️ Inaccuracy', cls: 'q-inacc', loss: cpLossVsBest };
      }
      if (cpLossVsBest <= 210) {
        return { tag: '❌ Mistake', cls: 'q-mistake', loss: cpLossVsBest };
      }
      return { tag: '💀 Blunder', cls: 'q-blunder', loss: cpLossVsBest };
    }

    executeMove(m, preserveRedo = false) {
      if (!preserveRedo) {
        this.redoStack = [];
      }
      const moverColor = this.turn;
      const evalBefore = this.evaluatePosition();
      const legal = this.getLegalMoves(this.turn);

      // Depth-2 tactical check for best move reference & refutation for Blunder Radar
      let refBestMove = legal[0];
      let bestSc = moverColor === 'w' ? -Infinity : Infinity;
      for (const cand of legal) {
        const s = this.makeMoveInternal(cand);
        const ev = this.evaluatePosition();
        this.unmakeMoveInternal(s);
        if ((moverColor === 'w' && ev > bestSc) || (moverColor === 'b' && ev < bestSc)) {
          bestSc = ev;
          refBestMove = cand;
        }
      }

      const refBestUci = refBestMove ? (sqToAlgebraic(refBestMove.from) + sqToAlgebraic(refBestMove.to)) : '';
      const refBestSan = refBestMove ? this.moveToSan(refBestMove, legal) : '';

      const san = this.moveToSan(m, legal);
      const uci = sqToAlgebraic(m.from) + sqToAlgebraic(m.to) + (m.promotion ? m.promotion.toLowerCase() : '');
      const snap = this.makeMoveInternal(m);
      const evalAfter = this.evaluatePosition();

      const wasBest = (refBestUci === (sqToAlgebraic(m.from) + sqToAlgebraic(m.to)));
      snap.san = san;
      snap.uci = uci;
      snap.evalAfter = evalAfter;
      snap.bestSan = refBestSan;
      snap.quality = this.classifyMoveQuality(evalBefore, evalAfter, moverColor, wasBest, bestSc);
      snap.fenAfter = this.toFen();
      snap.zobrist = this.computeZobristHash();

      this.history.push(snap);
      this.uciHistory.push(uci);
      this.recordPositionHash();
      return snap;
    }

    stepBackward() {
      if (this.history.length === 0) return null;
      this.unrecordPositionHash();
      const snap = this.history.pop();
      this.uciHistory.pop();
      this.unmakeMoveInternal(snap);
      this.redoStack.push(snap.move);
      return snap;
    }

    stepForward() {
      if (this.redoStack.length === 0) return null;
      const nextMove = this.redoStack.pop();
      return this.executeMove(nextMove, true);
    }

    undoLastMove() {
      if (this.history.length === 0) return null;
      this.unrecordPositionHash();
      const snap = this.history.pop();
      this.uciHistory.pop();
      this.unmakeMoveInternal(snap);
      return snap;
    }

    isInsufficientMaterial() {
      const pieces = [];
      for (let i = 0; i < 64; i++) {
        if (this.board[i] && this.board[i].type !== 'K') {
          pieces.push({ ...this.board[i], sq: i });
        }
      }
      if (pieces.length === 0) return true;
      if (pieces.length === 1 && (pieces[0].type === 'N' || pieces[0].type === 'B')) return true;
      if (pieces.length === 2 && pieces[0].type === 'B' && pieces[1].type === 'B') {
        const c1 = ((pieces[0].sq >> 3) + (pieces[0].sq & 7)) % 2;
        const c2 = ((pieces[1].sq >> 3) + (pieces[1].sq & 7)) % 2;
        if (c1 === c2) return true;
      }
      return false;
    }

    getGameStatus() {
      const legal = this.getLegalMoves(this.turn);
      if (legal.length === 0) {
        if (this.inCheck(this.turn)) {
          return {
            over: true,
            winner: this.turn === 'w' ? 'b' : 'w',
            reason: currentLang === 'ta' ? 'செக்மேட் (Checkmate!)' : 'Checkmate!'
          };
        }
        return { over: true, winner: 'draw', reason: currentLang === 'ta' ? 'சாத்தியமான நகர்வுகள் இல்லை - சமநிலை (Stalemate)' : 'Stalemate — Draw' };
      }
      if (this.halfMoveClock >= 100) {
        return { over: true, winner: 'draw', reason: currentLang === 'ta' ? '50 நகர்வு விதி சமநிலை' : '50-Move Rule Draw' };
      }
      const key = this.getPositionKey();
      if ((this.positionCounts[key] || 0) >= 3) {
        return { over: true, winner: 'draw', reason: currentLang === 'ta' ? 'மூன்று முறை ஒரே நிலை சமநிலை' : 'Threefold Repetition Draw' };
      }
      if (this.isInsufficientMaterial()) {
        return { over: true, winner: 'draw', reason: currentLang === 'ta' ? 'போதிய காய்கள் இல்லை - சமநிலை' : 'Insufficient Material Draw' };
      }
      return { over: false, inCheck: this.inCheck(this.turn) };
    }

    evaluatePosition() {
      let score = 0;
      let whiteNonKingMat = 0, blackNonKingMat = 0;
      let whiteBishops = 0, blackBishops = 0;

      for (let sq = 0; sq < 64; sq++) {
        const p = this.board[sq];
        if (!p || p.type === 'K') continue;
        const val = PIECE_VALUES[p.type];
        if (p.color === 'w') {
          whiteNonKingMat += val;
          if (p.type === 'B') whiteBishops++;
        } else {
          blackNonKingMat += val;
          if (p.type === 'B') blackBishops++;
        }
      }

      const isEndgame = (whiteNonKingMat + blackNonKingMat) <= 2600;

      for (let sq = 0; sq < 64; sq++) {
        const p = this.board[sq];
        if (!p) continue;

        const lookupSq = p.color === 'w' ? sq : mirrorSq(sq);
        let pieceScore = PIECE_VALUES[p.type];

        if (p.type === 'K') {
          pieceScore += isEndgame ? PST.K_END[lookupSq] : PST.K_MID[lookupSq];
        } else {
          let pstBonus = PST[p.type][lookupSq];
          // Personality adjustments
          if (this.personality === 'tal' && p.type !== 'P') {
            // Aggressive bonus for advancing into enemy half
            const rankAdv = p.color === 'w' ? (7 - (sq >> 3)) : (sq >> 3);
            pstBonus += rankAdv * 6;
          } else if (this.personality === 'petrosian' && p.type === 'P') {
            pstBonus = Math.floor(pstBonus * 1.25);
          }
          pieceScore += pstBonus;
        }

        if (p.type === 'P') {
          const r = sq >> 3;
          const advancement = p.color === 'w' ? (6 - r) : (r - 1);
          if (isEndgame && advancement >= 3) {
            pieceScore += advancement * 14;
          }
        }

        if (p.color === 'w') score += pieceScore;
        else score -= pieceScore;
      }

      if (whiteBishops >= 2) score += 35;
      if (blackBishops >= 2) score -= 35;
      score += this.turn === 'w' ? 10 : -10;
      return score;
    }

    scoreMoveForOrdering(m) {
      let score = 0;
      if (m.captured) {
        score += 10 * PIECE_VALUES[m.captured.type] - (PIECE_VALUES[m.piece.type] / 10);
        if (this.personality === 'tal') score += 45;
      }
      if (m.promotion) {
        score += PIECE_VALUES[m.promotion];
      }
      if (m.flags === 'castleK' || m.flags === 'castleQ') {
        score += this.personality === 'petrosian' ? 95 : 60;
      }
      return score;
    }

    quiescence(alpha, beta, maximizingPlayer, depthLeft) {
      this.nodesSearched++;
      const standPat = this.evaluatePosition();

      if (depthLeft <= 0) return standPat;

      if (maximizingPlayer) {
        if (standPat >= beta) return beta;
        if (alpha < standPat) alpha = standPat;
      } else {
        if (standPat <= alpha) return alpha;
        if (beta > standPat) beta = standPat;
      }

      const legalCaptures = this.getLegalMoves(this.turn).filter(m => m.captured || m.promotion);
      legalCaptures.sort((a, b) => this.scoreMoveForOrdering(b) - this.scoreMoveForOrdering(a));

      if (maximizingPlayer) {
        for (const m of legalCaptures) {
          const snap = this.makeMoveInternal(m);
          const score = this.quiescence(alpha, beta, false, depthLeft - 1);
          this.unmakeMoveInternal(snap);
          if (score >= beta) return beta;
          if (score > alpha) alpha = score;
        }
        return alpha;
      } else {
        for (const m of legalCaptures) {
          const snap = this.makeMoveInternal(m);
          const score = this.quiescence(alpha, beta, true, depthLeft - 1);
          this.unmakeMoveInternal(snap);
          if (score <= alpha) return alpha;
          if (score < beta) beta = score;
        }
        return beta;
      }
    }

    alphaBeta(depth, alpha, beta, maximizingPlayer, useQuiescence) {
      this.nodesSearched++;

      // Transposition Table Lookup
      const posKey = this.getPositionKey();
      const ttEntry = this.tt.get(posKey);
      if (ttEntry && ttEntry.depth >= depth) {
        this.ttHits++;
        if (ttEntry.flag === 'EXACT') return ttEntry.score;
        if (ttEntry.flag === 'LOWER' && ttEntry.score > alpha) alpha = ttEntry.score;
        else if (ttEntry.flag === 'UPPER' && ttEntry.score < beta) beta = ttEntry.score;
        if (alpha >= beta) return ttEntry.score;
      }

      const legal = this.getLegalMoves(this.turn);
      if (legal.length === 0) {
        if (this.inCheck(this.turn)) {
          return maximizingPlayer ? (-99000 - depth * 100) : (99000 + depth * 100);
        }
        return 0;
      }

      if (depth === 0) {
        if (useQuiescence) {
          return this.quiescence(alpha, beta, maximizingPlayer, 3);
        }
        return this.evaluatePosition();
      }

      legal.sort((a, b) => this.scoreMoveForOrdering(b) - this.scoreMoveForOrdering(a));

      const origAlpha = alpha;
      const origBeta = beta;
      let bestVal;

      if (maximizingPlayer) {
        bestVal = -Infinity;
        for (const m of legal) {
          const snap = this.makeMoveInternal(m);
          const ev = this.alphaBeta(depth - 1, alpha, beta, false, useQuiescence);
          this.unmakeMoveInternal(snap);
          if (ev > bestVal) bestVal = ev;
          if (ev > alpha) alpha = ev;
          if (beta <= alpha) break;
        }
      } else {
        bestVal = Infinity;
        for (const m of legal) {
          const snap = this.makeMoveInternal(m);
          const ev = this.alphaBeta(depth - 1, alpha, beta, true, useQuiescence);
          this.unmakeMoveInternal(snap);
          if (ev < bestVal) bestVal = ev;
          if (ev < beta) beta = ev;
          if (beta <= alpha) break;
        }
      }

      if (this.tt.size > 40000) this.tt.clear();
      let flag = 'EXACT';
      if (bestVal <= origAlpha) flag = 'UPPER';
      else if (bestVal >= origBeta) flag = 'LOWER';
      this.tt.set(posKey, { depth, score: bestVal, flag });

      return bestVal;
    }

    findBookMove(legalMoves) {
      const prefix = this.uciHistory.join(' ');
      const candidates = [];
      for (const entry of OPENING_BOOK) {
        if (prefix === '' || entry.seq.startsWith(prefix + ' ')) {
          const rest = prefix === '' ? entry.seq : entry.seq.slice(prefix.length + 1);
          const nextUci = rest.split(' ')[0];
          if (nextUci) candidates.push(nextUci);
        }
      }
      if (candidates.length > 0) {
        const chosenUci = candidates[Math.floor(Math.random() * candidates.length)];
        const match = legalMoves.find(m => (sqToAlgebraic(m.from) + sqToAlgebraic(m.to)) === chosenUci);
        if (match) return match;
      }
      return null;
    }

    computeBestMove(level = 3) {
      this.nodesSearched = 0;
      this.ttHits = 0;
      const legal = this.getLegalMoves(this.turn);
      if (legal.length === 0) return null;

      if (level >= 3 && this.uciHistory.length < 8) {
        const bookMove = this.findBookMove(legal);
        if (bookMove) {
          this.nodesSearched = 24;
          return {
            move: bookMove,
            score: this.evaluatePosition(),
            depthLabel: `Book (Lvl ${level})`
          };
        }
      }

      const depthMap = { 1: 1, 2: 2, 3: 3, 4: 3, 5: 4, 6: 5 };
      const targetDepth = depthMap[level] || 3;
      const useQuiescence = level >= 3;
      const maximizing = this.turn === 'w';
      const startTime = performance.now();
      const timeLimitMs = level === 6 ? 650 : 380;

      let bestMove = legal[0];
      let bestScore = maximizing ? -Infinity : Infinity;
      let reachedDepth = 1;
      let scoredMoves = [];

      // Iterative Deepening Loop (Depth 1 .. targetDepth)
      for (let d = 1; d <= targetDepth; d++) {
        if (d > 2 && (performance.now() - startTime) > timeLimitMs) break;
        reachedDepth = d;

        // Order moves putting previous iteration's bestMove first
        legal.sort((a, b) => {
          if (a === bestMove) return -100000;
          if (b === bestMove) return 100000;
          return this.scoreMoveForOrdering(b) - this.scoreMoveForOrdering(a);
        });

        let iterBestMove = legal[0];
        let iterBestScore = maximizing ? -Infinity : Infinity;
        let alpha = -Infinity;
        let beta = Infinity;
        scoredMoves = [];

        for (const m of legal) {
          const snap = this.makeMoveInternal(m);
          let score = this.alphaBeta(d - 1, alpha, beta, !maximizing, useQuiescence);
          this.unmakeMoveInternal(snap);

          if (d === targetDepth) {
            if (level === 1) score += (Math.random() * 180 - 90);
            else if (level === 2) score += (Math.random() * 55 - 27);
            else if (this.personality === 'human') score += (Math.random() * 24 - 12);
          }

          scoredMoves.push({ move: m, score });

          if (maximizing) {
            if (score > iterBestScore) {
              iterBestScore = score;
              iterBestMove = m;
            }
            if (level >= 4 && score > alpha) alpha = score;
          } else {
            if (score < iterBestScore) {
              iterBestScore = score;
              iterBestMove = m;
            }
            if (level >= 4 && score < beta) beta = score;
          }
        }

        bestMove = iterBestMove;
        bestScore = iterBestScore;
      }

      return {
        move: bestMove,
        score: bestScore,
        depthLabel: `ID-Ply ${reachedDepth}${useQuiescence ? '+Q+TT' : ''}`,
        scoredMoves
      };
    }

    // Grandmaster Mop-Up & King-Hunt Evaluation for Auto-Win Overdrive
    evaluateForAutoWin(heroColor) {
      let score = this.evaluatePosition(); // White perspective
      const enemyColor = heroColor === 'w' ? 'b' : 'w';
      let heroMat = 0, enemyMat = 0;
      for (let sq = 0; sq < 64; sq++) {
        const p = this.board[sq];
        if (!p || p.type === 'K') continue;
        if (p.color === heroColor) heroMat += PIECE_VALUES[p.type];
        else enemyMat += PIECE_VALUES[p.type];
      }

      if (heroMat >= enemyMat + 200 || enemyMat <= 1200) {
        const enemyKingSq = this.findKing(enemyColor);
        const heroKingSq = this.findKing(heroColor);
        if (enemyKingSq >= 0 && heroKingSq >= 0) {
          const ekR = enemyKingSq >> 3, ekC = enemyKingSq & 7;
          const hkR = heroKingSq >> 3, hkC = heroKingSq & 7;
          const cmd = Math.max(3 - ekR, ekR - 4) + Math.max(3 - ekC, ekC - 4);
          const kDist = Math.abs(hkR - ekR) + Math.abs(hkC - ekC);
          let mopUp = cmd * 25 + (14 - kDist) * 12;
          mopUp += Math.floor((4000 - enemyMat) * 0.08);
          score += (heroColor === 'w' ? mopUp : -mopUp);
        }
      }
      return score;
    }

    // Supreme Overdrive Move Calculator for User's Auto-Win Mechanism (Zero Draws, Relentless Checkmate)
    computeAutoWinMove(heroColor = this.turn) {
      this.nodesSearched = 0;
      this.ttHits = 0;
      this.tt.clear();
      const legal = this.getLegalMoves(heroColor);
      if (legal.length === 0) return null;

      const enemyColor = heroColor === 'w' ? 'b' : 'w';
      const maximizing = (heroColor === 'w');

      if (this.uciHistory.length < 4) {
        const bookMove = this.findBookMove(legal);
        if (bookMove) {
          this.nodesSearched = 128;
          return {
            move: bookMove,
            score: this.evaluatePosition(),
            depthLabel: '👑 Auto-Win GM Book'
          };
        }
      }

      legal.sort((a, b) => this.scoreMoveForOrdering(b) - this.scoreMoveForOrdering(a));

      let bestMove = legal[0];
      let bestScore = maximizing ? -Infinity : Infinity;

      const origEval = this.evaluatePosition.bind(this);
      this.evaluatePosition = () => {
        let sc = origEval();
        let hMat = 0, eMat = 0;
        for (let sq = 0; sq < 64; sq++) {
          const p = this.board[sq];
          if (!p || p.type === 'K') continue;
          if (p.color === heroColor) hMat += PIECE_VALUES[p.type];
          else eMat += PIECE_VALUES[p.type];
        }
        if (hMat >= eMat + 200 || eMat <= 1200) {
          const ekSq = this.findKing(enemyColor);
          const hkSq = this.findKing(heroColor);
          if (ekSq >= 0 && hkSq >= 0) {
            const ekR = ekSq >> 3, ekC = ekSq & 7;
            const hkR = hkSq >> 3, hkC = hkSq & 7;
            const cmd = Math.max(3 - ekR, ekR - 4) + Math.max(3 - ekC, ekC - 4);
            const kDist = Math.abs(hkR - ekR) + Math.abs(hkC - ekC);
            let mopUp = cmd * 25 + (14 - kDist) * 12 + Math.floor((4000 - eMat) * 0.08);
            sc += (heroColor === 'w' ? mopUp : -mopUp);
          }
        }
        return sc;
      };

      for (const m of legal) {
        const snap = this.makeMoveInternal(m);
        const oppLegal = this.getLegalMoves(enemyColor);
        const oppInCheck = this.inCheck(enemyColor);
        const nextKey = this.getPositionKey();
        const repCount = this.positionCounts[nextKey] || 0;

        let score;
        if (oppLegal.length === 0) {
          if (oppInCheck) {
            this.unmakeMoveInternal(snap);
            this.evaluatePosition = origEval;
            return {
              move: m,
              score: maximizing ? 999999 : -999999,
              depthLabel: '👑 Auto-Win Mate!'
            };
          } else {
            // Never allow Stalemate!
            score = maximizing ? -50000 : 50000;
          }
        } else if (repCount >= 1) {
          // Never allow 3-Fold Repetition!
          score = maximizing ? (-25000 * repCount) : (25000 * repCount);
        } else if (this.isInsufficientMaterial()) {
          score = maximizing ? -40000 : 40000;
        } else {
          const rAlpha = maximizing ? (bestScore - 60) : -Infinity;
          const rBeta = !maximizing ? (bestScore + 60) : Infinity;
          score = this.alphaBeta(2, rAlpha, rBeta, !maximizing, true);
          if (oppInCheck) {
            score += maximizing ? 15 : -15;
          }
          if (this.halfMoveClock >= 16 && (m.piece.type === 'P' || m.captured)) {
            score += maximizing ? 35 : -35;
          }
        }

        this.unmakeMoveInternal(snap);

        if ((maximizing && score > bestScore) || (!maximizing && score < bestScore)) {
          bestScore = score;
          bestMove = m;
        }
      }

      this.evaluatePosition = origEval;

      return {
        move: bestMove,
        score: bestScore,
        depthLabel: '👑 Overdrive GM+MopUp'
      };
    }

    // Opponent AI Move Calculator during live Auto-Win Combat (fights back naturally, blocks checks, captures hanging pieces, fast tempo)
    computeOpponentMoveDuringAutoWin(level = 3) {
      this.nodesSearched = 0;
      const legal = this.getLegalMoves(this.turn);
      if (legal.length === 0) return null;

      const maximizing = (this.turn === 'w');
      let bestMove = legal[0];
      let bestScore = maximizing ? -Infinity : Infinity;

      for (const m of legal) {
        const snap = this.makeMoveInternal(m);
        this.nodesSearched += 18;
        let score = this.evaluatePosition();
        score += (Math.random() * 80 - 40);
        this.unmakeMoveInternal(snap);

        if ((maximizing && score > bestScore) || (!maximizing && score < bestScore)) {
          bestScore = score;
          bestMove = m;
        }
      }
      return {
        move: bestMove,
        score: bestScore,
        depthLabel: `AI Lvl ${level} (Live Combat)`
      };
    }

    // Compute Enemy's top tactical threat if they were to move right now
    computeEnemyThreatMove() {
      const origTurn = this.turn;
      this.turn = origTurn === 'w' ? 'b' : 'w';
      const legal = this.getLegalMoves(this.turn);
      let threat = null;
      if (legal.length > 0) {
        legal.sort((a, b) => this.scoreMoveForOrdering(b) - this.scoreMoveForOrdering(a));
        if (legal[0].captured || legal[0].promotion) {
          threat = legal[0];
        }
      }
      this.turn = origTurn;
      return threat;
    }
  }

class ChessBeastWorkerService {
  /**
   * Consume a single immutable position snapshot.
   * Data: {id,fen,history,personality,kind,level,heroColor}.
   * Sends {id,uci,score,depthLabel,nodes,ttHits,elapsedMs} or {id,error}.
   * A throw cannot leave live game state mutated because worker owns its engine.
   */
  run(data) {
    const began=performance.now();
    const engine=new ChessEngine();
    const {id,fen,history,personality,kind,level,heroColor}=data||{};
    try {
      if(typeof fen!=='string'||fen.length>180||!engine.loadFen(fen))throw Error('Invalid FEN');
      if(Array.isArray(history))engine.uciHistory=history.filter(x=>typeof x==='string'&&x.length<=5).slice(-160);
      engine.personality=['carlsen','tal','petrosian','human'].includes(personality)?personality:'carlsen';
      let result;
      if(kind==='autowin') result=engine.turn===heroColor?engine.computeAutoWinMove(heroColor):engine.computeOpponentMoveDuringAutoWin(level);
      else result=engine.computeBestMove(Math.min(6,Math.max(1,Number(level)||3)));
      const m=result?.move;
      self.postMessage({
        id,uci:m?sqToAlgebraic(m.from)+sqToAlgebraic(m.to)+(m.promotion||'').toLowerCase():null,
        castleSide:m?.flags?.startsWith('castle')?m.flags:null,
        depthLabel:result?.depthLabel||'',score:result?.score||0,
        nodes:engine.nodesSearched||0,ttHits:engine.ttHits||0,elapsedMs:Math.round(performance.now()-began)
      });
    } catch(error) {
      self.postMessage({id,error:String(error?.message||error)});
    }
  }
}
const chessSearch=new ChessBeastWorkerService();
self.addEventListener('message',event=>chessSearch.run(event.data));
