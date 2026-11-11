'use strict';

// A single clock controls chapters, drawings, particles, and playback controls.
// The visuals are explanatory reconstructions, not captured model executions.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const defaultPlaybackSpeed = 1.5;
  const paper = '<span class="paper-glyph"><i></i><i></i><i></i></span>';
  const arrow = '<span class="flow-chevron" aria-hidden="true">→</span>';
  const matrix = (className = '') => `<div class="weight-matrix ${className}" aria-hidden="true">${Array.from({length: 49}, (_, i) => `<i style="--i:${i};--shade:${[.18,.48,.28,.72,.36,.6,.24][(i * 3 + Math.floor(i / 7)) % 7]}"></i>`).join('')}</div>`;
  const trace = (success, compact = false) => `<div class="trace-card ${success ? 'trace-success' : 'trace-failure'} ${compact ? 'compact' : ''}"><div class="trace-head"><span class="trace-dot"></span>${success ? 'SUCCESSFUL TRAJECTORY' : 'FAILED TRAJECTORY'}<b>${success ? '✓' : '×'}</b></div><div class="trace-action"><span>01</span>take butter knife</div>${success ? '<div class="trace-action decisive"><span>02</span>clean at sink <b>prerequisite</b></div>' : '<div class="trace-action missing"><span>02</span>cleaning skipped <b>missing</b></div>'}<div class="trace-action"><span>03</span>place on dining table</div><div class="trace-result">${success ? 'Required final state reached.' : 'Object placed, but still unclean.'}</div></div>`;
  const skill = (small = false) => `<div class="skill-document ${small ? 'small-document' : ''}"><div class="document-top">${paper}<span>LOCAL SKILL</span><span class="document-id">Lₜ</span></div><h4>State before destination.</h4><p>Complete the required state change <mark>before</mark> placing an object.</p><div class="document-tags"><span>prerequisite</span><span>action order</span></div></div>`;
  const globalBook = () => `<div class="global-book"><div class="book-edge"></div><span class="book-label">GLOBAL</span><span class="book-letter">G</span><span class="book-rule"><i></i>State prerequisites</span><span class="book-rule"><i></i>Attribute checks</span><span class="book-rule"><i></i>Avoid repeated actions</span><span class="book-bottom">REUSABLE PROCEDURES</span></div>`;
  const phases = [
    {label:'Collect', title:'One task. Eight ways to try.', description:'The current policy acts with Global guidance. Successful and failed trajectories become the evidence for learning.', duration:5200},
    {label:'Extract', title:'The difference becomes a skill.', description:'An external analyzer compares an eligible success–failure pair and extracts a shared Local skill. This action-order example is illustrative.', duration:6800},
    {label:'Internalize', title:'A skill becomes a learning signal.', description:'Score the same response with and without Local. Token-level differences supervise OPD alongside RL; all eligible Locals can contribute.', duration:6800},
    {label:'Select', title:'Keep the skills that move the model.', description:'Strength measures absolute response shifts on held-out trajectories. Scores are cached at generation before the policy update. Values here illustrate ranking.', duration:6200},
    {label:'Consolidate', title:'Local experience. Lasting guidance.', description:'Every ten steps, merge the top 50% of eligible candidates with the existing Global. Rules below are illustrative.', duration:6200},
    {label:'Repeat', title:'Both evolve. The next round begins.', description:'The updated policy and its updated Global jointly guide new interactions, creating fresh experience for both learning paths.', duration:5600}
  ];
  function flowScene(index) {
    const layouts = [
      `<div class="collection-scene"><div class="agent-pod"><div class="agent-emblem">θ</div><h4>Current policy</h4><span>Qwen3-4B</span><div class="global-chip">+ Global guidance</div></div><div class="branch-stream"><svg viewBox="0 0 170 240" aria-hidden="true"><path d="M0 120H60Q85 120 85 95V35H170M60 120H170M60 120Q85 120 85 145V205H170"/></svg><i class="stream-particle p1"></i><i class="stream-particle p2"></i><i class="stream-particle p3"></i></div><div class="rollout-deck">${Array.from({length:8},(_,i)=>`<div class="rollout-sheet ${i===0?'good':i===1?'bad':''}" style="--i:${i}"><div><span>τ${'₁₂₃₄₅₆₇₈'[i]}</span><b>${i===0?'✓':i===1?'×':'···'}</b></div><i></i><i></i><i></i><span>${i===0?'success':i===1?'failure':'held-out'}</span></div>`).join('')}<p>8 ON-POLICY TRAJECTORIES / TASK</p></div></div>`,
      `<div class="extraction-scene"><div class="trace-pair">${trace(true)}${trace(false)}</div><div class="analyzer-bridge"><div class="analyzer-orbit"><i></i><span>✦</span></div><span>COMPARE</span><small>external analyzer</small></div><div class="extracted-skill">${skill()}<div class="source-pills"><span>τ₁ success</span><span>τ₂ failure</span><span>↳ shared Local</span></div></div></div>`,
      `<div class="internalization-scene"><div class="opd-context"><div class="context-capsule">C + Global <span>+ Local</span></div><h4>Same sampled response.</h4><div class="response-tokens"><span>clean</span><span>knife</span><span>at</span><span>sink</span></div><div class="probability-view"><div class="probability-label"><span>Without Local</span><span>With Local</span></div>${[0,1,2,3].map((_,i)=>`<div class="probability-pair" style="--i:${i}"><span>${['clean','knife','at','sink'][i]}</span><div><i class="prob-base" style="--bar:${[28,48,39,34][i]}%"></i><i class="prob-guided" style="--bar:${[72,56,47,65][i]}%"></i></div><b>Δ</b></div>`).join('')}</div><span class="micro-note">Illustrative response scores · no measured probabilities</span></div><div class="distill-bridge"><div class="delta-orb">Δ<span>log p</span></div><i></i><span>OPD + RL</span></div><div class="model-update">${matrix()}<h4>Model parameters</h4><div class="theta-transition">θ<sub>t</sub><span>→</span>θ<sub>t+1</sub></div><span class="micro-note">Learn from all eligible Locals</span></div></div>`,
      `<div class="selection-scene"><div class="selection-explanation"><span class="mini-eyebrow">HELD-OUT RESPONSES</span><div class="heldout-stack">${['τ₃','τ₄','τ₅','τ₆','τ₇','τ₈'].map((v,i)=>`<span style="--i:${i}">${v}</span>`).join('')}</div><div class="strength-formula">Strength(L)<br><span>= mean |Δ log p|</span></div><p>Rank by response-shift magnitude.</p><span class="micro-note">Framework’s illustrative candidate scores</span></div><div class="rank-stage"><div class="rank-label"><span>RECENT LOCAL CANDIDATES</span><span>TOP 50%</span></div><div class="rank-window">${[{id:'L₂',score:'.82',from:1,to:0,keep:true},{id:'L₁',score:'.67',from:0,to:1,keep:true},{id:'L₅',score:'.43',from:3,to:2,keep:false},{id:'L₃',score:'.28',from:2,to:3,keep:false}].map((v,i)=>`<div class="rank-card ${v.keep?'retained':'discarded'}" style="--from:${v.from};--to:${v.to};--i:${i}">${paper}<strong>${v.id}</strong><div class="rank-meter"><i style="--bar:${Number(v.score)*100}%"></i></div><span>${v.score}</span><b>${v.keep?'KEEP':'PASS'}</b></div>`).join('')}<div class="selection-bracket"></div></div><p>Generation-time scores → window-end selection</p></div></div>`,
      `<div class="consolidation-scene"><div class="local-fan">${['Check task prerequisites','Verify required fields','Avoid redundant actions'].map((s,i)=>`<div class="flying-local" style="--i:${i}">${paper}<span>LOCAL ${i+1}</span><h4>${s}</h4><i></i><i></i></div>`).join('')}<span class="fan-caption">SELECTED EXPERIENCE</span></div><div class="merge-bridge"><span class="merge-plus">+</span><div class="prior-memory">G<sub>k</sub><small>existing guidance</small></div><span class="merge-arrow">→</span></div><div class="new-global">${globalBook()}<div class="global-version">G<sub>k</sub> → G<sub>k+1</sub><span>consolidate · generalize · resolve conflicts</span></div></div></div>`,
      `<div class="coevolution-scene"><svg class="duet-orbit" viewBox="0 0 900 300" aria-hidden="true"><defs><linearGradient id="duet-gradient"><stop stop-color="#3e82c7"/><stop offset="1" stop-color="#9470c6"/></linearGradient></defs><path class="orbit-base" d="M450 150C270 -70 70 30 110 165S330 300 450 150S790 -25 790 145S620 300 450 150"/><path class="orbit-flow" d="M450 150C270 -70 70 30 110 165S330 300 450 150S790 -25 790 145S620 300 450 150"/></svg><div class="duet-model">${matrix('mini-matrix')}<span>UPDATED MODEL</span><h4>Learned behavior</h4></div><div class="duet-heart"><span>↻</span><small>NEXT<br>INTERACTION</small></div><div class="duet-skills"><div class="mini-book">G<sub>k+1</sub><i></i><i></i><i></i></div><span>UPDATED GLOBAL</span><h4>Reusable guidance</h4></div><div class="new-experience"><span></span>New trajectories. New skills. New feedback.<span></span></div></div>`
    ];
    return `<div class="film-scene flow-scene scene-${index}" data-scene-index="${index}">${layouts[index]}</div>`;
  }

  class FilmPlayer {
    constructor(root, chapters, renderer, label) {
      this.root=root; this.chapters=chapters; this.renderer=renderer; this.elapsed=0; this.index=-1; this.speed=defaultPlaybackSpeed;
      this.total=chapters.reduce((s,c)=>s+c.duration,0); this.userPaused=reduceMotion.matches; this.visible=false; this.raf=0; this.last=0; this.animations=[];
      root.classList.add('film-player');
      root.innerHTML=`<div class="film-topbar"><span><i></i>${label}</span><span class="film-loop-label">CONTINUOUS LOOP <b>∞</b></span></div><div class="film-chapter-heading"><span class="film-chapter-number">01</span><div><span class="film-kicker">${label}</span><h3></h3></div></div><div class="film-stage"></div><p class="film-description"></p><div class="film-chapters" role="tablist" aria-label="${label} chapters">${chapters.map((chapter,i)=>`<button role="tab" id="${root.id||'flow'}-chapter-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" aria-controls="${root.id||'flow'}-stage" data-chapter="${i}"><span>${String(i+1).padStart(2,'0')}</span> ${chapter.label}<i></i></button>`).join('')}</div><div class="film-controls"><button class="film-toggle" aria-label="Pause ${label}">Ⅱ</button><button class="film-restart" aria-label="Restart ${label}">↺</button><span class="film-time">00:00</span><input class="film-scrubber" aria-label="${label} timeline" type="range" min="0" max="1000" step="1" value="0"><label class="film-speed-label"><span class="sr-only">Playback speed</span><select class="film-speed" aria-label="${label} playback speed"><option value=".75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5" selected>1.5×</option></select></label><span class="film-total"></span></div>`;
      this.stage=root.querySelector('.film-stage'); this.stage.id=`${root.id||'flow'}-stage`; this.stage.setAttribute('role','tabpanel');
      this.heading=root.querySelector('.film-chapter-heading h3'); this.description=root.querySelector('.film-description'); this.tabs=[...root.querySelectorAll('[data-chapter]')];
      this.scrub=root.querySelector('.film-scrubber'); this.toggle=root.querySelector('.film-toggle');
      root.querySelector('.film-total').textContent=this.format(this.total);
      this.toggle.addEventListener('click',()=>{this.userPaused=!this.userPaused;this.sync();});
      root.querySelector('.film-restart').addEventListener('click',()=>{this.elapsed=0;this.index=-1;this.userPaused=false;this.draw();this.sync();});
      root.querySelector('.film-speed').addEventListener('change',event=>{this.speed=Number(event.target.value);});
      this.scrub.addEventListener('input',()=>{this.elapsed=Math.min(this.total-1,Number(this.scrub.value)/1000*this.total);this.userPaused=true;this.draw();this.sync();});
      this.tabs.forEach((tab,i)=>tab.addEventListener('click',()=>{this.elapsed=this.chapters.slice(0,i).reduce((s,c)=>s+c.duration,0);this.userPaused=reduceMotion.matches;this.draw();this.sync();}));
      root.querySelector('.film-chapters').addEventListener('keydown',event=>{const i=this.tabs.indexOf(event.target);if(i<0)return;let next;if(event.key==='ArrowRight')next=(i+1)%this.tabs.length;else if(event.key==='ArrowLeft')next=(i+this.tabs.length-1)%this.tabs.length;else return;event.preventDefault();this.tabs[next].click();this.tabs[next].focus();});
      this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.sync();},{threshold:.06});this.observer.observe(root);
      this.resizeObserver=new ResizeObserver(()=>this.positionCursor());this.resizeObserver.observe(this.stage);
      document.addEventListener('visibilitychange',()=>this.sync());
      reduceMotion.addEventListener('change',()=>{this.userPaused=reduceMotion.matches;this.draw();this.sync();});
      this.draw();this.sync();
    }
    format(ms){const seconds=Math.floor(ms/1000);return `00:${String(seconds).padStart(2,'0')}`;}
    positionCursor(){
      const shop=this.stage.querySelector('.shopping-window');
      if(!shop)return;
      const frame=shop.getBoundingClientRect();
      shop.querySelectorAll('.option-group b').forEach((option,i)=>{
        const box=option.getBoundingClientRect();
        shop.style.setProperty(`--option-x-${i}`,`${box.left-frame.left+box.width*.65}px`);
        shop.style.setProperty(`--option-y-${i}`,`${box.top-frame.top+box.height*.5}px`);
      });
    }
    updateKitchen(local){
      const room=this.kitchen;
      if(!room)return;
      const phase=Number(room.dataset.kitchenPhase);
      const time=reduceMotion.matches?5000:local;
      const state=phase===0?'unclean':phase===1?(time<1420?'moving':time<3400?'washing':'clean'):phase===2?'clean':time<1420?'placing':'placed';
      if(room.dataset.objectState===state)return;
      room.dataset.objectState=state;
      const labels={unclean:'Unclean',moving:'Moving to sink',washing:'Washing',clean:'Clean',placing:'Moving to table',placed:'Clean · placed'};
      room.querySelector('.room-state-value').textContent=labels[state];
      room.querySelector('.object-state').textContent=`state: ${state==='moving'?'unclean':state==='placing'?'clean':state}`;
      room.querySelector('.object-name').textContent=['clean','placing','placed'].includes(state)?'clean knife':'butter knife';
    }
    sync(){
      const playing=this.visible&&!this.userPaused&&!document.hidden;
      this.root.classList.toggle('film-playing',playing);this.toggle.textContent=playing?'Ⅱ':'▶';
      this.toggle.setAttribute('aria-label',`${playing?'Pause':'Play'} animation`);
      cancelAnimationFrame(this.raf);this.last=0;
      if(playing)this.raf=requestAnimationFrame(time=>this.tick(time));
    }
    tick(time){
      if(this.last)this.elapsed=(this.elapsed+Math.min(100,time-this.last)*this.speed)%this.total;
      this.last=time;this.draw();this.raf=requestAnimationFrame(t=>this.tick(t));
    }
    draw(){
      let start=0,index=0;
      while(index<this.chapters.length-1&&this.elapsed>=start+this.chapters[index].duration){start+=this.chapters[index].duration;index++;}
      const local=this.elapsed-start;
      if(index!==this.index){
        this.index=index;this.stage.innerHTML=this.renderer(index);this.stage.setAttribute('aria-labelledby',this.tabs[index].id);
        this.heading.textContent=this.chapters[index].title;this.description.textContent=this.chapters[index].description;
        this.root.querySelector('.film-chapter-number').textContent=String(index+1).padStart(2,'0');
        this.tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
        this.positionCursor();this.kitchen=this.stage.querySelector('.room-scene');
        void this.stage.offsetWidth;
        this.animations=this.stage.getAnimations({subtree:true});this.animations.forEach(animation=>animation.pause());
      }
      this.animations.forEach(animation=>{animation.currentTime=reduceMotion.matches?this.chapters[index].duration:local;});
      this.updateKitchen(local);
      this.tabs.forEach((tab,i)=>tab.style.setProperty('--chapter-progress',`${i<index?100:i===index?local/this.chapters[i].duration*100:0}%`));
      this.scrub.value=String(Math.round(this.elapsed/this.total*1000));this.scrub.style.setProperty('--progress',`${this.elapsed/this.total*100}%`);
      this.root.querySelector('.film-time').textContent=this.format(this.elapsed);
      this.root.dataset.phase=String(index);this.root.dataset.playhead=String(Math.floor(local));
    }
    pause(){this.userPaused=true;this.sync();}
    replace(chapters,renderer){this.chapters=chapters;this.renderer=renderer;this.elapsed=0;this.index=-1;this.total=chapters.reduce((s,c)=>s+c.duration,0);this.root.querySelector('.film-total').textContent=this.format(this.total);this.tabs.forEach((tab,i)=>{tab.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span> ${chapters[i].label}<i></i>`;});this.userPaused=reduceMotion.matches;this.draw();this.sync();}
  }
  const flowRoot=document.querySelector('.loop-player');flowRoot.id='flow-film';
  const flow=new FilmPlayer(flowRoot,phases,flowScene,'MODEL–SKILL CO-EVOLUTION');

  const kitchen = phase => `<div class="room-scene room-phase-${phase}" data-kitchen-phase="${phase}">
    <div class="room-state-strip"><span>OBJECT STATE</span><strong class="room-state-value">${phase<2?'Unclean':'Clean'}</strong></div>
    <div class="room-perspective">
      <div class="room-wall"><div class="room-window"><i></i><i></i></div><div class="wall-shelf"><i></i><i></i><i></i></div></div>
      <div class="room-floor"></div>
      <div class="room-counter"><div class="counter-top"></div><div class="cabinet-door"></div><span>COUNTER</span></div>
      <div class="room-basin"><div class="basin-top"><i></i></div><div class="faucet"></div><div class="water-drops">${Array.from({length:7},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div><span>SINK</span></div>
      <div class="room-table"><div class="table-top"><div class="table-plate"></div></div><i></i><i></i><span>DINING TABLE</span></div>
      <div class="knife-rig">
        <div class="butter-knife"><i></i><span></span><b>✧</b></div>
        <div class="object-tracker"><i></i><span><span class="object-name">${phase<2?'butter knife':'clean knife'}</span><b class="object-state">state: ${phase<2?'unclean':'clean'}</b></span></div>
      </div>
    </div>
    <div class="room-stage-label">${['01 · LOCATE THE OBJECT','02 · SATISFY THE PREREQUISITE','03 · VERIFY THE STATE CHANGE','04 · COMPLETE THE TASK'][phase]}</div>
  </div>`;
  const sampleData={
    clean:{label:'ALFWORLD · ACTION ORDER',task:'Clean the butter knife and place it on the dining table.',rule:'Change the object’s state before moving it to its final destination.',source:'Appendix F: learned Global completes the recorded Clean task in 7 actions; without Global, the task reaches the 30-action limit. The four scenes are an explanatory reconstruction.',labels:['Locate','Clean','Verify','Place'],titles:['Find the object. Understand the goal.','First, satisfy the prerequisite.','Verify what changed.','Only then, complete the task.'],commands:['locate the butter knife','clean butter knife at sink','verify object state is clean','place clean knife on dining table']},
    fields:{label:'WEBSHOP · ATTRIBUTE CHECKS',task:'Turn recurring missing attributes into a reusable shopping procedure.',rule:'Select every required attribute explicitly. Avoid repeated clicks on the same option.',source:'Appendix G records separate omissions in L0006 (fit type), L0021 (round shape), and L0034 (youth). This synthesized interface is illustrative; these are not one shopping task.',labels:['Read','Inspect','Select','Verify'],titles:['The goal contains more than a product name.','Find the missing requirements.','Make each required choice explicit.','Verify the complete set before proceeding.'],commands:['read all required attributes','inspect missing product options','select each required field','verify selections before checkout']},
    synthesis:{label:'GLOBAL · HIERARCHICAL SYNTHESIS',task:'Turn selected Local experience from steps 11–20 into persistent Global guidance.',rule:'Combine shared procedures while keeping applicability conditions and source identifiers.',source:'Appendix G: 37 selected Locals → 14 first-layer summaries → 8 second-layer summaries → 5 updated Global rules, combined with 5 prior rules. Deployed at step 21, reused at step 31.',labels:['Gather','Summarize','Compress','Merge'],titles:['Start with traceable local experience.','Group the shared procedures.','Compress again, preserve the conditions.','Write the next chapter of Global.'],commands:['gather 37 selected Local skills','summarize four batches into 14 summaries','compress two batches into 8 summaries','merge with prior Global into 5 rules']}
  };
  function productScene(phase){return `<div class="shopping-window shop-phase-${phase}"><div class="shop-chrome"><i></i><i></i><i></i><span>webshop / product options</span></div><div class="shop-search"><span>⌕</span> Match every requested attribute <b>↵</b></div><div class="requirements-note"><span>REQUIREMENTS FROM THREE LOCAL SOURCES</span><p><mark>fit type</mark><mark>round shape</mark><mark>youth</mark></p></div><div class="product-options">${['Fit type','Shape','Audience'].map((label,i)=>`<div class="option-group" style="--i:${i}"><span>${label}<small>${['L0006','L0021','L0034'][i]}</small></span><div><i>${['Unspecified','Other','Adult'][i]}</i><b>${['Required fit','Round','Youth'][i]}<em>✓</em></b></div></div>`).join('')}</div><div class="checkout-strip"><span>${phase===3?'All required fields verified':'Check required options'}</span><b>${phase===3?'✓ Ready':'Continue →'}</b></div><svg class="demo-cursor" viewBox="0 0 24 28" aria-hidden="true"><path d="M2 1V23L8 17L13 27L18 24L13 15H23Z" fill="#395da6" stroke="white" stroke-width="2"/></svg></div>`;}
  function synthesisScene(phase){const counts=[37,14,8,5];return `<div class="memory-workshop memory-phase-${phase}"><div class="memory-topline"><span>WINDOW 11–20</span><span>PROVENANCE PRESERVED</span></div><div class="memory-particles">${Array.from({length:37},(_,i)=>`<span style="--i:${i};--x:${(i%6)*48}px;--y:${Math.floor(i/6)*28}px;--target-x:${(i%5)*44}px;--target-y:${Math.floor(i%14/5)*43}px">${i<3?['L0006','L0021','L0034'][i]:'Local'}</span>`).join('')}</div><div class="memory-count"><strong>${counts[phase]}</strong><span>${['selected Local skills','first-layer summaries','second-layer summaries','updated Global rules'][phase]}</span></div><div class="memory-stage-track">${counts.map((n,i)=>`<span class="${i===phase?'active':''}">${n}<small>${['LOCAL','LAYER 1','LAYER 2','GLOBAL'][i]}</small></span>${i<3?arrow:''}`).join('')}</div><div class="memory-inheritance">${paper}<span>Existing Global: 5 rules</span><b>${phase===3?'G4 preserved verbatim':'source IDs + conditions'}</b></div></div>`;}
  function exampleScene(key,phase){const data=sampleData[key];return `<div class="film-scene showcase-scene"><div class="showcase-visual">${key==='clean'?kitchen(phase):key==='fields'?productScene(phase):synthesisScene(phase)}</div><div class="showcase-notebook"><span class="notebook-label">THE SKILL NOTEBOOK</span><div class="notebook-task"><span>GOAL</span><p>${data.task}</p></div><div class="notebook-rule"><span>${paper} REUSABLE GUIDANCE</span><h4>${data.rule}</h4></div><div class="action-script"><span>NEXT ACTION</span><div class="script-tokens">${data.commands[phase].split(' ').map((word,i)=>`<span style="--i:${i}">${word}</span>`).join('')}<i></i></div></div><div class="notebook-status"><i></i>${['Observe','Apply skill','Check feedback','Carry experience forward'][phase]}</div></div></div>`;}
  function exampleChapters(key){return sampleData[key].labels.map((label,i)=>({label,title:sampleData[key].titles[i],description:sampleData[key].source,duration:5000}));}
  const exampleRoot=document.querySelector('.example-player');
  let selectedExample='clean';
  const examples=new FilmPlayer(exampleRoot,exampleChapters('clean'),i=>exampleScene('clean',i),'SKILLS IN ACTION');
  document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{
    selectedExample=button.dataset.example;
    document.querySelectorAll('[data-example]').forEach(tab=>{const selected=tab===button;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    exampleRoot.setAttribute('aria-labelledby',button.id);
    examples.replace(exampleChapters(selectedExample),i=>exampleScene(selectedExample,i));
  }));
  window.SkillDuetMotion={pauseAll:()=>{flow.pause();examples.pause();}};
})();
