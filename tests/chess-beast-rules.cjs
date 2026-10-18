/**
 * Chess Beast 360 rules assurance: standard chess, Chess960 rook tracks,
 * FEN validation, castling, en passant, promotion and reversible history.
 *
 * Owned synthetic source-contract test. Uses audited embedded engine directly
 * with no browser, network or writes. Inputs are known legal test positions;
 * outputs assertion failures / concise pass counters.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

class ChessBeastRulesQA {
  constructor(){
    this.html=fs.readFileSync(path.resolve(__dirname,'../apps/chess-360/index.html'),'utf8');
    this.worker=fs.readFileSync(path.resolve(__dirname,'../apps/chess-360/chess-ai-worker.js'),'utf8');
    const a=this.html.indexOf('  const FILES ='),b=this.html.indexOf('  /* =========================================================================\n   * 4. UI CONTROLLER',a);
    assert.ok(a>0&&b>a,'ChessEngine extract anchors');
    this.core=this.html.slice(a,b);
    assert.ok(this.worker.includes(this.core),'Worker rules exactly match main game');
    this.ctx={performance:{now:()=>0},currentLang:'en'};
    vm.createContext(this.ctx);
    vm.runInContext(this.core+'\nthis.Engine=ChessEngine;this.square=algebraicToSq;',this.ctx,{timeout:8000});
  }
  engine(fen){const e=new this.ctx.Engine();if(fen)assert.equal(e.loadFen(fen),true,fen);return e;}
  uci(engine,from,to,promo){
    const m=engine.getLegalMoves().find(m=>m.from===this.ctx.square(from)&&m.to===this.ctx.square(to)&&(!promo||m.promotion===promo));
    assert.ok(m,'Expected legal move '+from+to);return m;
  }
  standard(){
    const e=this.engine();
    assert.equal(e.getLegalMoves().length,20,'20 legal opening moves');
    const start=e.toFen();
    e.executeMove(this.uci(e,'e2','e4'));
    assert.equal(e.getLegalMoves().length,20,'20 first black replies');
    e.undoLastMove();
    assert.equal(e.toFen(),start,'restored starting position');
    assert.equal(e.loadFen('8/8/8/8/8/8/8/8 w - - 0 1'),false,'reject empty kings');
    assert.equal(e.loadFen('8/8/8/8/8/8/8/9 w - - 0 1'),false,'reject long rank');
    assert.equal(e.loadFen('8/8/8/8/8/8/8/K6kq w - - 0 1'),false,'reject unknown piece');
    assert.equal(e.loadFen(start),true);
  }
  castle(){
    const e=this.engine('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const start=e.toFen();
    const legal=e.getLegalMoves();
    assert.ok(legal.some(m=>m.flags==='castleK'),'standard short castle');
    assert.ok(legal.some(m=>m.flags==='castleQ'),'standard long castle');
    e.executeMove(this.uci(e,'e1','g1'));
    assert.equal(e.board[this.ctx.square('g1')]?.type,'K');
    assert.equal(e.board[this.ctx.square('f1')]?.type,'R');
    e.undoLastMove();assert.equal(e.toFen(),start,'standard castling reversible');
    // A previously malformed FEN with K right but absent rook must NOT castle.
    e.loadFen('4k3/8/8/8/8/8/8/4K3 w K - 0 1');
    assert.equal(e.getLegalMoves().some(m=>m.flags==='castleK'),false);
  }
  chess960(){
    const e=this.engine('4k3/8/8/8/8/8/8/RK4R1 w AG - 0 1');
    const start=e.toFen();
    const legal=e.getLegalMoves();
    assert.ok(legal.some(m=>m.flags==='castleK'),'Chess960 kingside from b1 to g1');
    assert.ok(legal.some(m=>m.flags==='castleQ'),'Chess960 queenside from b1 to c1');
    e.executeMove(this.uci(e,'b1','g1'));
    assert.equal(e.board[this.ctx.square('g1')]?.type,'K');
    assert.equal(e.board[this.ctx.square('f1')]?.type,'R');
    assert.equal(e.board[this.ctx.square('a1')]?.type,'R');
    e.undoLastMove();
    assert.equal(e.toFen(),start,'Chess960 kingside reversible');
    e.executeMove(e.getLegalMoves().find(m=>m.flags==='castleQ'));
    assert.equal(e.history.at(-1).uci,'b1a1','Chess960 UCI save distinguishes castling from ordinary b1c1');
    assert.equal(e.board[this.ctx.square('c1')]?.type,'K');
    assert.equal(e.board[this.ctx.square('d1')]?.type,'R');
    e.undoLastMove();
    assert.equal(e.toFen(),start,'Chess960 queenside reversible');
    const blocked=this.engine('4k3/8/8/8/8/8/8/RK2B1R1 w AG - 0 1');
    assert.equal(blocked.getLegalMoves().some(m=>m.flags==='castleK'),false,'obstructed 960 castle');
  }
  enPassantAndPromotion(){
    const e=this.engine('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');
    const start=e.toFen();
    const ep=this.uci(e,'e5','d6');
    assert.equal(ep.flags,'ep');
    e.executeMove(ep);
    assert.equal(e.board[this.ctx.square('d5')],null);
    e.undoLastMove();assert.equal(e.toFen(),start,'ep reversible');
    const p=this.engine('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    const prom=this.uci(p,'a7','a8','Q');
    p.executeMove(prom);
    assert.equal(p.board[this.ctx.square('a8')]?.type,'Q');
  }
  run(){this.standard();this.castle();this.chess960();this.enPassantAndPromotion();console.log('CHESS_BEAST_RULES_PASS standard/960/ep/promotion/FEN/undo worker-parity');}
}
new ChessBeastRulesQA().run();
