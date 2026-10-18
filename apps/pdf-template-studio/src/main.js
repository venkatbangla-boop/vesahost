/**
 * Isolated PDF Studio pilot controller. Owns one pdfme designer and local
 * template/PDF downloads only. No VESA business engines or cloud data.
 */
import { BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';
import { text } from '@pdfme/schemas';
import './studio.css';
class PdfStudio {
  constructor(doc) {
    this.doc=doc;
    this.status=doc.getElementById('status');
    this.template={basePdf:BLANK_PDF,schemas:[[
      {name:'title',type:'text',position:{x:20,y:20},width:165,height:15,content:'VESA Sample Report'},
      {name:'style',type:'text',position:{x:20,y:48},width:165,height:12,content:'Demo Garment Style'}
    ]]};
    this.plugins={text};
  }
  /** Make one local object URL for downloaded user-owned files. */
  download(data,type,name){
    const url=URL.createObjectURL(new Blob([data],{type}));
    const link=this.doc.createElement('a');link.href=url;link.download=name;
    this.doc.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  /** Import a template only after parsing and minimal shape validation. */
  async open(file){
    if(!file||file.size>2_000_000)throw new Error('Choose a template under 2 MB.');
    const data=JSON.parse(await file.text());
    if(!Array.isArray(data.schemas)||!data.basePdf||data.schemas.length>25)throw new Error('Invalid PDF template.');
    this.designer.updateTemplate(data);
    this.status.textContent='Template opened locally.';
  }
  /** Create the local designer; downloaded files do not leave this browser. */
  mount(){
    this.designer=new Designer({domContainer:this.doc.getElementById('designer'),template:this.template,plugins:this.plugins});
    this.doc.getElementById('save').addEventListener('click',()=>{
      this.download(JSON.stringify(this.designer.getTemplate(),null,2),'application/json','vesa-pdf-template.json');
    });
    this.doc.getElementById('pdf').addEventListener('click',async()=>{
      try{
        this.status.textContent='Preparing local PDF…';
        const template=this.designer.getTemplate();
        const input=Object.fromEntries(template.schemas.flat().map(schema=>[schema.name,schema.content||'Sample']));
        const bytes=await generate({template,inputs:[input],plugins:this.plugins});
        this.download(bytes,'application/pdf','vesa-sample-report.pdf');
        this.status.textContent='PDF downloaded.';
      }catch(e){this.status.textContent='PDF export failed. Check template fields.';}
    });
    this.doc.getElementById('open').addEventListener('change',async event=>{
      try{await this.open(event.target.files?.[0]);}
      catch(e){this.status.textContent=e.message;}
    });
    this.status.textContent='Local PDF designer ready.';
  }
}
new PdfStudio(document).mount();