/**
 * Chess Beast 360 — self-contained, offline match-report PDF writer.
 * No CDN, remote API, account data, fonts, or third-party library required.
 * All strings stored in the file are plain report text, not executable markup.
 */
(function () {
  'use strict';
  const WIDTH=595, HEIGHT=842;
  function ascii(value) {
    return String(value == null ? '' : value)
      .replace(/[\u2010-\u2015]/g,'-').replace(/[\u2018\u2019]/g,"'")
      .replace(/[\u201c\u201d]/g,'"').replace(/\u00bd/g,'1/2')
      .replace(/[\u0000-\u001f\u007f-\uffff]/g,' ').replace(/\s+/g,' ').trim();
  }
  function quoted(value) {
    return '('+ascii(value).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')+')';
  }
  function safeNumber(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
  function clock(value) {
    const seconds=Math.max(0,Math.ceil(safeNumber(value)));
    return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  }
  function wrap(value,maxChars) {
    const words=ascii(value).split(/\s+/),lines=[];
    let current='';
    words.forEach(word=>{
      if(!word)return;
      if(word.length>maxChars) {
        if(current){lines.push(current);current='';}
        while(word.length>maxChars){lines.push(word.slice(0,maxChars));word=word.slice(maxChars);}
      }
      if(current && (current.length+1+word.length)>maxChars){lines.push(current);current=word;}
      else current+=(current?' ':'')+word;
    });
    if(current)lines.push(current);
    return lines.length?lines:['-'];
  }
  function createPdf(data) {
    const match=data&&typeof data==='object'?data:{};
    const moves=Array.isArray(match.moves)?match.moves:[];
    const pages=[];
    let commands=[],y=0,pageNumber=0;
    const txt=(x,yp,value,size=10,bold=false,color=[0.14,0.2,0.25])=>{
      commands.push(color.join(' ')+' rg BT /'+(bold?'F2':'F1')+' '+size+' Tf 1 0 0 1 '+x.toFixed(2)+' '+yp.toFixed(2)+' Tm '+quoted(value)+' Tj ET');
    };
    const box=(x,yp,w,h,fill)=>{commands.push(fill.join(' ')+' rg '+x+' '+yp+' '+w+' '+h+' re f');};
    const rule=(x1,yp,x2)=>{commands.push('0.8 0.84 0.86 RG 0.6 w '+x1+' '+yp+' m '+x2+' '+yp+' l S');};
    const newPage=()=>{
      if(commands.length)pages.push(commands.join('\n'));
      commands=[];pageNumber++;
      box(0,HEIGHT-102,WIDTH,102,[0.07,0.12,0.16]);
      box(0,HEIGHT-107,WIDTH,5,[0.19,0.73,0.56]);
      txt(38,HEIGHT-50,'CHESS BEAST 360',19,true,[0.93,0.98,0.97]);
      txt(38,HEIGHT-74,'OFFLINE MATCH REPORT',10,true,[0.64,0.87,0.79]);
      txt(483,HEIGHT-74,'PAGE '+pageNumber,9,false,[0.8,0.89,0.85]);
      y=HEIGHT-135;
    };
    const ensure=height=>{if(y-height<57)newPage();};
    const heading=value=>{
      ensure(40);txt(39,y,ascii(value).toUpperCase(),10,true,[0.07,0.41,0.33]);
      y-=12;rule(39,y,556);y-=20;
    };
    const field=(label,value)=>{
      const chunks=wrap(value,73);
      ensure(28+(chunks.length-1)*14);
      txt(39,y,ascii(label),10,true);
      chunks.forEach((s,i)=>txt(176,y-i*14,s,9,false));
      y-=Math.max(24,chunks.length*14+8);
    };
    newPage();
    const result=ascii(match.result||'*');
    box(39,y-54,517,61,[0.91,0.96,0.94]);
    txt(55,y-16,ascii(match.headline||'Match summary'),16,true,[0.06,0.3,0.26]);
    txt(55,y-38,'RESULT  '+result+'    |    '+ascii(match.reason||'Game status recorded'),10,false,[0.17,0.36,0.34]);
    y-=82;
    heading('Players and Match');
    field('White',match.white||'White');
    field('Black',match.black||'Black');
    field('Winner',match.winner||'Unfinished');
    field('Played',match.date||'Local browser');
    field('Game mode',match.mode||'Standard Chess');
    field('AI level',match.level||'N/A');
    field('Variant',match.variant||'Standard');
    field('Opening',match.opening||'Not classified');
    field('White clock',clock(match.whiteTime));
    field('Black clock',clock(match.blackTime));
    field('Moves played',String(moves.length)+' plies / '+String(Math.ceil(moves.length/2))+' turns');
    heading('Final Position');
    for(const line of wrap(match.fen||'-',82)){ensure(17);txt(39,y,line,8,false);y-=16;}
    y-=10;
    heading('Move-by-move History');
    const half=Math.ceil(moves.length/2);
    if(!half){txt(39,y,'No moves recorded.',10);y-=20;}
    const fullMoves=[];
    for(let i=0;i<moves.length;i+=2){
      const white=ascii(typeof moves[i]==='string'?moves[i]:moves[i]?.san);
      const black=ascii(typeof moves[i+1]==='string'?moves[i+1]:moves[i+1]?.san);
      fullMoves.push([String(Math.floor(i/2)+1)+'.',white||'-',black||'']);
    }
    let moveIdx=0;
    while(moveIdx<fullMoves.length){
      ensure(45);
      box(39,y-7,517,23,[0.90,0.94,0.95]);
      txt(51,y+1,'TURN',9,true);txt(132,y+1,'WHITE',9,true);txt(336,y+1,'BLACK',9,true);
      y-=30;
      while(moveIdx<fullMoves.length && y>67){
        const row=fullMoves[moveIdx++];
        if(moveIdx%2===0)box(39,y-7,517,22,[0.96,0.97,0.97]);
        txt(51,y,row[0],9,false);txt(132,y,row[1],10,false);txt(336,y,row[2],10,false);
        y-=23;
      }
      if(moveIdx<fullMoves.length)newPage();
    }
    ensure(55);
    y-=14;rule(39,y,556);y-=18;
    txt(39,y,'Created locally on your device. Works without internet.',9,false,[0.3,0.43,0.43]);
    txt(39,y-15,'Analysis and ELO shown in-app are practice estimates, not certified ratings.',8,false,[0.3,0.43,0.43]);
    pages.push(commands.join('\n'));
    const objects=[null,null,null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'];
    const kids=[];
    for(const stream of pages){
      const pageId=objects.length;
      const contentId=pageId+1;
      objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+WIDTH+' '+HEIGHT+'] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents '+contentId+' 0 R >>');
      objects.push('<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream');
      kids.push(pageId+' 0 R');
    }
    objects[1]='<< /Type /Catalog /Pages 2 0 R >>';
    objects[2]='<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+kids.length+' >>';
    let pdf='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', offsets=[0];
    // The binary marker occupies four bytes in Latin-1. Encode each byte as one code unit.
    for(let i=1;i<objects.length;i++){
      if(!objects[i])continue;
      offsets[i]=pdf.length;
      pdf+=i+' 0 obj\n'+objects[i]+'\nendobj\n';
    }
    const xref=pdf.length;
    pdf+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';
    for(let i=1;i<objects.length;i++){
      pdf+=String(offsets[i]||0).padStart(10,'0')+' 00000 n \n';
    }
    pdf+='trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
    const bytes=new Uint8Array(pdf.length);
    for(let i=0;i<pdf.length;i++)bytes[i]=pdf.charCodeAt(i)&255;
    return bytes;
  }
  function download(data) {
    const file=createPdf(data);
    const blob=new Blob([file],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='Chess_Beast_Match_'+new Date().toISOString().slice(0,10)+'.pdf';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
    return file.length;
  }
  window.ChessBeastReport=Object.freeze({createPdf,download});
})();
