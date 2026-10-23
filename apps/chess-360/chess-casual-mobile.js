/**
 * Chess Beast 360 - mobile-first casual gameplay adapter.
 *
 * Purpose: place simple replay and match actions beside the board without
 * rewriting chess rules, AI scheduling, time travel, clock or saved records.
 * Owner: ChessCasualMobileController owns only a responsive presentation rail,
 * the temporary placement of the existing 3D toggle and its event listeners.
 * Access: index.html loads this module after chess-panel-ui.js.
 * Inputs: existing chess action IDs and rendered move-history DOM.
 * Outputs: accessible buttons which forward clicks to existing handlers.
 * State: media-query mode, UI focus and a disposable MutationObserver only.
 * Failure: absent optional controls leave the original match UI available.
 * Extension boundary: never write chess storage or modify ChessEngine state.
 */
(function(){
  'use strict';

  /**
   * Owns mobile action presentation for one chess page lifetime.
   * The original buttons remain the sole action implementations; this class
   * must never duplicate engine, save, replay or camera business logic.
   */
  class ChessCasualMobileController {
    constructor(doc,win){
      this.doc=doc;
      this.win=win;
      this.body=doc.body;
      this.media=win.matchMedia('(max-width: 767px)');
      this.boardSection=doc.querySelector('.board-section');
      this.player=doc.getElementById('bottomPlayerCard');
      this.threeD=doc.getElementById('btn3DDirect');
      this.threeDParent=this.threeD?.parentNode||null;
      this.threeDNext=this.threeD?.nextSibling||null;
      this.rail=null;
      this.moveLabel=null;
      this.moveNotation=null;
      this.observer=null;
      this.scheduled=false;
      if(!this.boardSection||!this.player)return;
      this.createRail();
      this.simplifyOptionalCopy();
      this.observeMatch();
      this.media.addEventListener?.('change',()=>this.applyLayout());
      this.win.addEventListener('load',()=>{this.applyLayout();this.scheduleStatus();},{once:true});
      this.applyLayout();
      this.scheduleStatus();
    }

    /**
     * Create only proxy buttons: existing original IDs retain all listeners.
     * No cloned buttons or copied chess/game state are introduced.
     */
    createRail(){
      const rail=this.doc.createElement('section');
      rail.id='chessCasualBar';
      rail.className='chess-casual-bar';
      rail.setAttribute('aria-label','Quick chess controls');
      rail.innerHTML=`
        <div class="chess-casual-heading">
          <span id="chessCasualMoveLabel" aria-live="polite">New game</span>
          <span id="chessCasualMoveNotation" aria-live="off"></span>
          <button type="button" id="chessCasualSave" data-chess-forward="btnQuickSaveMatch" aria-label="Save game">Save</button>
        </div>
        <div class="chess-casual-replay" role="group" aria-label="Review moves">
          <button type="button" data-chess-forward="btnStepFirst" aria-label="First move" title="First move">⏮</button>
          <button type="button" data-chess-forward="btnStepPrev" aria-label="Previous move" title="Previous move">◀</button>
          <button type="button" data-chess-forward="btnStepNext" aria-label="Next move" title="Next move">▶</button>
          <button type="button" data-chess-forward="btnStepLast" aria-label="Latest move" title="Latest move">⏭</button>
          <button type="button" id="chessCasualMoves" data-chess-panel="tabPlay" aria-label="Full move history">Moves</button>
        </div>
        <div class="chess-casual-actions" role="group" aria-label="Game actions">
          <button type="button" data-chess-forward="btnUndo" aria-label="Undo last move">↩ <span>Undo</span></button>
          <button type="button" data-chess-forward="btnHint" aria-label="Get a hint">💡 <span>Hint</span></button>
          <button type="button" data-chess-forward="btnFlip" aria-label="Flip board">⇅ <span>Flip</span></button>
          <span class="chess-casual-3d-slot" id="chessCasual3DSlot"></span>
          <button type="button" id="chessCasualMore" data-chess-panel="tabLevels" aria-label="Open game settings">☰ <span>More</span></button>
        </div>`;
      this.player.after(rail);
      this.rail=rail;
      this.moveLabel=rail.querySelector('#chessCasualMoveLabel');
      this.moveNotation=rail.querySelector('#chessCasualMoveNotation');
      rail.addEventListener('click',event=>this.onRailClick(event));
    }

    /**
     * Cosmetic simplification only: conceal optional named AI personality
     * options and verbose tutorial copy, preserving selected AI behavior.
     */
    simplifyOptionalCopy(){
      const personality=this.doc.getElementById('personalityRow')?.closest('.form-group');
      if(personality)personality.style.display='none';
      const historyTitle=this.doc.querySelector('#tabPlay .chess-primary-history .form-label');
      if(historyTitle)historyTitle.textContent='Moves';
      const settingsTitle=this.doc.querySelector('#tabLevels .chess-settings-heading span');
      if(settingsTitle)settingsTitle.textContent='';
    }

    /** Match viewport ownership and return the original 3D button on desktop. */
    applyLayout(){
      if(!this.rail)return;
      const mobile=this.media.matches;
      this.body.classList.toggle('chess-casual-mobile-active',mobile);
      if(mobile){
        const slot=this.doc.getElementById('chessCasual3DSlot');
        if(this.threeD&&slot&&this.threeD.parentNode!==slot)slot.appendChild(this.threeD);
      }else if(this.threeD&&this.threeDParent&&this.threeD.parentNode!==this.threeDParent){
        if(this.threeDNext&&this.threeDNext.parentNode===this.threeDParent)
          this.threeDParent.insertBefore(this.threeD,this.threeDNext);
        else this.threeDParent.appendChild(this.threeD);
      }
      this.scheduleStatus();
    }

    /**
     * All quick actions reuse existing button click handlers. A move-history
     * request intentionally navigates to the secondary panel, while normal
     * previous/next replay never scrolls the board away.
     */
    onRailClick(event){
      const btn=event.target.closest('button');
      if(!btn)return;
      const targetId=btn.dataset.chessForward;
      if(targetId){
        this.doc.getElementById(targetId)?.click();
        this.scheduleStatus();
      }else if(btn.dataset.chessPanel){
        this.openPanel(btn.dataset.chessPanel);
      }
    }

    /** Reveal secondary settings/history only when explicitly requested. */
    openPanel(tabId){
      if(!this.media.matches)return;
      if(this.body.classList.contains('drawer-collapsed'))
        this.doc.getElementById('btnToggleRightDrawer')?.click();
      this.doc.querySelector('.tabs-header [data-tab="'+tabId+'"]')?.click();
      const target=tabId==='tabPlay'
        ?this.doc.querySelector('#tabPlay .chess-primary-history')
        :this.doc.getElementById('rightSidebarDrawer');
      target?.scrollIntoView({block:'start'});
    }

    /**
     * Observe the original rendered history. The adapter reads current and
     * maximum half-move count but never mutates the chess history or scrubber.
     */
    observeMatch(){
      this.observer=new MutationObserver(()=>this.scheduleStatus());
      for(const id of ['movesTableBody','halfMoveCounter']){
        const element=this.doc.getElementById(id);
        if(element)this.observer.observe(element,{
          childList:true,subtree:true,characterData:true
        });
      }
      this.doc.getElementById('moveRewindScrubber')?.addEventListener('input',
        ()=>this.scheduleStatus());
    }

    /** Coalesce repeat renders into one paint and preserve native button focus. */
    scheduleStatus(){
      if(this.scheduled)return;
      this.scheduled=true;
      this.win.requestAnimationFrame(()=>{
        this.scheduled=false;
        this.renderStatus();
      });
    }

    /** Reflect live/review position and disable only impossible proxy steps. */
    renderStatus(){
      if(!this.rail)return;
      const scrubber=this.doc.getElementById('moveRewindScrubber');
      const position=Math.max(0,Number(scrubber?.value)||0);
      const total=Math.max(0,Number(scrubber?.max)||0);
      this.moveLabel.textContent=total?'Move '+position+' / '+total:'New game';
      const active=this.doc.querySelector('#movesTableBody .latest-move');
      this.moveNotation.textContent=active?.firstChild?.textContent?.trim().slice(0,14)||'';
      this.rail.classList.toggle('chess-is-reviewing',total>0&&position<total);
      for(const [action,canGo] of [
        ['btnStepFirst',position>0],['btnStepPrev',position>0],
        ['btnStepNext',position<total],['btnStepLast',position<total]
      ]){
        const button=this.rail.querySelector('[data-chess-forward="'+action+'"]');
        if(button)button.disabled=!canGo;
      }
    }
  }

  window.__chessCasualMobile=new ChessCasualMobileController(document,window);
})();
