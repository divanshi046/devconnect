/* Interactive extras for the static DevConnect course project. */
let feedTrendChart=null;
function requestForTeam(teamId,userId=me().id){
  return (data.teamRequests||[]).find(request=>request.teamId===teamId&&request.userId===userId);
}

function renderTeamRequest(request){
  const applicant=userById(request.userId);
  return `<div class="team-request-row"><div class="team-request-person">${avatar(applicant,'small-avatar')}<div><strong>${esc(applicant.name)}</strong><span>${esc(applicant.role)} · ${skillMatchScore(me(),applicant)}% skill match</span></div></div><div class="team-request-actions"><button class="team-accept" data-feature-action="team-response" data-request-id="${esc(request.id)}" data-status="accepted">Accept</button><button class="team-decline" data-feature-action="team-response" data-request-id="${esc(request.id)}" data-status="declined">Decline</button></div></div>`;
}

function renderTeamsFeature(){
  const teams=[...(data.teams||[])];
  const cards=teams.map(team=>{
    const owner=userById(team.ownerId);
    const ownerIsMe=team.ownerId===me().id;
    const myRequest=requestForTeam(team.id);
    const pending=(data.teamRequests||[]).filter(request=>request.teamId===team.id&&request.status==='pending');
    const requestButton=ownerIsMe
      ? `<div class="team-owner-note">You’re hosting this opening</div>`
      : myRequest?.status==='pending'
        ? `<button class="team-requested" disabled>Request sent · Pending</button>`
        : myRequest?.status==='accepted'
          ? `<button class="team-requested accepted" disabled>✓ Request accepted</button>`
          : `<button class="button button-primary team-join" data-feature-action="request-team" data-team-id="${esc(team.id)}">Request to join <span>↗</span></button>`;
    const requestsHtml=ownerIsMe&&pending.length
      ? `<div class="team-requests"><h3>Join requests <span>${pending.length}</span></h3>${pending.map(renderTeamRequest).join('')}</div>`
      : ownerIsMe?`<div class="team-requests team-requests-empty">No requests yet. Share the opening to meet collaborators.</div>`:'';
    return `<article class="team-card"><div class="team-card-head"><div class="team-owner">${avatar(owner,'small-avatar')}<div><strong>${esc(owner.name)}</strong><span>Hosting · ${esc(team.createdAt||'Recently')}</span></div></div><span class="team-open-badge">OPEN</span></div><h2>${esc(team.title)}</h2><p class="team-description">${esc(team.description)}</p><div class="team-meta"><span>⌘ Looking for ${esc(team.lookingFor||team.skillsNeeded.length)} teammates</span><span class="match-pill">${matchNeededSkills(me(),team.skillsNeeded)}% skills match</span></div><div class="team-skills-label">SKILLS NEEDED</div><div class="team-skill-list">${team.skillsNeeded.map(skill=>`<span>${esc(skill)}</span>`).join('')}</div><div class="team-card-footer">${requestButton}</div>${requestsHtml}</article>`;
  }).join('');
  const form=`<details class="team-create-panel"><summary><span>＋</span><div><strong>Post a team opening</strong><small>Tell developers what you’re building and who you need.</small></div><b>＋</b></summary><form id="team-form"><label class="field">Project or team name<input name="title" placeholder="e.g. Climate hackathon crew" required minlength="3"></label><label class="field">What are you building?<textarea name="description" placeholder="Share the idea, goal, and timeline..." required minlength="12"></textarea></label><div class="team-form-row"><label class="field">Skills needed<input name="skills" placeholder="React, Python, UI design" required></label><label class="field team-size-field">People needed<input name="lookingFor" type="number" min="1" max="12" value="2" required></label></div><button class="button button-primary">Post opening <span>↗</span></button></form></details>`;
  return `${pageHeading('Hackathon team finder','Find a small team, bring your skills, and ship something together.',`<span class="date-pill">${(data.teams||[]).length} OPEN PROJECTS</span>`)}<div class="team-intro"><div class="team-intro-mark">⌘</div><p>Meet collaborators who want to make the same kind of thing. Request to join an opening, or post your own idea and accept the right teammates.</p></div>${form}<div class="team-board-heading"><h2>Open team calls</h2><span>Sorted by newest</span></div><div class="team-list">${cards||`<div class="empty-state"><strong>No open team calls yet.</strong>Post a team opening to invite collaborators.</div>`}</div>`;
}

function notificationIcon(type){
  return type==='team'?'⌘':type==='follow'?'♡':type==='github'?'⌁':'✳';
}
function renderNotificationPopover(){
  const popover=document.getElementById('notification-popover');
  if(!popover)return;
  const notifications=(data.notifications||[]).slice(0,8);
  popover.innerHTML=`<div class="notification-head"><div><strong>Notifications</strong><span>Requests, follows, and updates</span></div><button data-feature-action="mark-notifications-read">Mark all read</button></div><div class="notification-list">${notifications.map(item=>`<article class="notification-item ${item.read?'':'unread'}"><span class="notification-icon ${esc(item.type||'update')}">${notificationIcon(item.type)}</span><div><p>${esc(item.text)}</p><time>${esc(item.createdAt||'Recently')}</time>${(item.requestId&&data.teamRequests.some(request=>request.id===item.requestId&&request.status==='pending'&&data.teams.some(team=>team.id===request.teamId&&team.ownerId===me().id))?`<div class="notification-shortcuts"><button data-feature-action="team-shortcut" data-request-id="${esc(item.requestId)}" data-status="accepted">Accept</button><button data-feature-action="team-shortcut" data-request-id="${esc(item.requestId)}" data-status="declined">Decline</button></div>`:'')}</div></article>`).join('')||`<div class="notification-empty">You’re all caught up. Keep building good things.</div>`}</div>`;
}
function toggleNotifications(){
  const popover=document.getElementById('notification-popover');
  const button=document.getElementById('notification-button');
  if(!popover||!button)return;
  const opening=popover.classList.contains('hidden');
  renderNotificationPopover();
  popover.classList.toggle('hidden',!opening);
  button.setAttribute('aria-expanded',String(opening));
}
function markNotificationsRead(){
  (data.notifications||[]).forEach(item=>item.read=true);
  saveData();updateUserChrome();renderNotificationPopover();
}

function renderSkillBadge(skill,user){
  const level=user.skillLevels?.[skill]||'Beginner';
  return `<span class="skill-level-badge level-${esc(level.toLowerCase())}"><b>${esc(skill)}</b><small>${esc(level)}</small></span>`;
}
function renderAchievementList(user){
  return achievementBadges(user).map(achievement=>`<div class="achievement-badge ${achievement.earned?'earned':'locked'}"><span>${achievement.icon}</span><div><strong>${esc(achievement.title)}</strong><small>${esc(achievement.detail)}</small></div><b>${achievement.earned?'Earned':'Locked'}</b></div>`).join('');
}
function githubNumber(value){return new Intl.NumberFormat().format(Number(value)||0);}
function renderGithubSnapshot(user){
  const root=document.getElementById('github-stats');
  if(!root)return;
  const stats=user.githubStats;
  if(!user.githubUsername){
    root.innerHTML=`<div class="github-empty"><span>⌁</span><p>Connect a GitHub username to show public repos, stars, languages, and contribution activity.</p></div>`;
    return;
  }
  if(!stats){
    root.innerHTML=`<div class="github-empty"><span class="github-spinner">◌</span><p>Fetching public GitHub data for <strong>@${esc(user.githubUsername)}</strong>…</p></div>`;
    return;
  }
  const languages=(stats.languages||[]).slice(0,4);
  const days=(stats.contributionDays||[]).slice(-84);
  root.innerHTML=`<div class="github-summary"><div><strong>${githubNumber(stats.repoCount)}</strong><span>public repos</span></div><div><strong>${githubNumber(stats.stars)}</strong><span>stars earned</span></div><div><strong>${githubNumber(stats.contributionTotal)}</strong><span>contributions · 12 mo</span></div></div><div class="github-languages"><strong>Top languages</strong><div>${languages.map(item=>`<span>${esc(item.name)} <b>${item.count}</b></span>`).join('')||'<span>No language data yet</span>'}</div></div><div class="github-calendar-head"><strong>Contribution activity</strong><span>last 12 weeks</span></div><div class="contribution-grid" aria-label="Recent GitHub contributions">${days.map(day=>`<span class="contribution-cell level-${Math.min(4,Number(day.level)||0)}" title="${esc(day.date)} · ${githubNumber(day.count)} contributions"></span>`).join('')}</div><div class="github-foot">Synced ${esc(stats.fetchedLabel||'just now')} · <a href="https://github.com/${esc(user.githubUsername)}" target="_blank" rel="noreferrer">Open GitHub ↗</a></div>${(stats.contributionUnavailable?`<p class="github-note">Contribution calendar is temporarily unavailable; repo stats are current.</p>`:'')}`;
}
async function syncGitHubProfile(username,quiet=false){
  const user=me();
  const cleaned=String(username||'').trim().replace(/^@/,'');
  const root=document.getElementById('github-stats');
  if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(cleaned)){
    if(!quiet)showToast('Enter a valid GitHub username.');
    return;
  }
  githubLoadKey=cleaned.toLowerCase();
  user.githubUsername=cleaned;
  user.github=safeExternalUrl('https://github.com/'+cleaned);
  user.githubStats=null;
  if(root)root.innerHTML=`<div class="github-empty"><span class="github-spinner">◌</span><p>Loading public GitHub stats…</p></div>`;
  saveData();
  try{
    const apiHeaders={Accept:'application/vnd.github+json'};
    const base='https://api.github.com/users/'+encodeURIComponent(cleaned);
    const [profileResponse,reposResponse,contributionsResponse]=await Promise.all([
      fetch(base,{headers:apiHeaders}),
      fetch(base+'/repos?per_page=100&sort=updated',{headers:apiHeaders}),
      fetch('https://github-contributions-api.jogruber.de/v4/'+encodeURIComponent(cleaned)+'?y=last',{cache:'no-store'}).catch(()=>null)
    ]);
    if(!profileResponse.ok)throw new Error(profileResponse.status===404?'That GitHub username was not found.':'GitHub could not load this profile right now.');
    if(!reposResponse.ok)throw new Error('GitHub repository data is temporarily unavailable.');
    const [profile,repositories]=await Promise.all([profileResponse.json(),reposResponse.json()]);
    const allRepositories=[...repositories];
    const repoPages=Math.min(10,Math.ceil((Number(profile.public_repos)||repositories.length)/100));
    if(repoPages>1){
      const extraPages=await Promise.all(Array.from({length:repoPages-1},(_,index)=>fetch(base+'/repos?per_page=100&page='+(index+2)+'&sort=updated',{headers:apiHeaders}).then(response=>response.ok?response.json():[]).catch(()=>[])));
      extraPages.forEach(page=>allRepositories.push(...page));
    }
    let contributionData=null;
    if(contributionsResponse?.ok)contributionData=await contributionsResponse.json().catch(()=>null);
    const languageCounts={};
    allRepositories.forEach(repo=>{if(repo.language)languageCounts[repo.language]=(languageCounts[repo.language]||0)+1;});
    const contributionTotal=contributionData?.total?.lastYear??Object.values(contributionData?.total||{}).reduce((total,count)=>total+Number(count||0),0);
    user.githubStats={
      name:profile.name||profile.login,
      repoCount:Number(profile.public_repos)||repositories.length,
      stars:allRepositories.reduce((total,repo)=>total+(Number(repo.stargazers_count)||0),0),
      languages:Object.entries(languageCounts).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count),
      contributionTotal,contributionDays:Array.isArray(contributionData?.contributions)?contributionData.contributions:[],
      contributionUnavailable:!contributionData,fetchedAt:Date.now(),fetchedLabel:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
    };
    saveData();
    if(!quiet)addNotification({type:'github',actorId:user.id,text:'GitHub profile synced for @'+cleaned+'.',read:true});
    renderGithubSnapshot(user);
    const completeness=document.querySelector('.profile-completeness');
    if(completeness){
      const percent=profileCompleteness(user);
      completeness.querySelector('.completeness-heading span').textContent=percent+'% complete';
      completeness.querySelector('.completeness-heading>b').textContent=percent+'%';
      completeness.querySelector('.completeness-track span').style.width=percent+'%';
    }
    if(!quiet)showToast('GitHub profile synced.');
  }catch(error){
    if(root)root.innerHTML=`<div class="github-error">${esc(error.message||'Could not load GitHub data. Try again in a moment.')}<button type="button" data-feature-action="retry-github">Retry</button></div>`;
    if(!quiet)showToast(error.message||'Could not load GitHub data.');
  }
}
function enhanceProfilePage(){
  const root=document.getElementById('view-root');
  const profile=root?.querySelector('.profile-panel');
  if(!profile)return;
  const user=me();
  const skillTags=root.querySelector('.profile-tags');
  if(skillTags)skillTags.innerHTML=(user.skills||[]).map(skill=>renderSkillBadge(skill,user)).join('');
  const main=profile.querySelector('.profile-main');
  if(main){
    const percent=profileCompleteness(user);
    main.insertAdjacentHTML('beforeend',`<section class="profile-completeness"><div class="completeness-heading"><div><strong>Profile completeness</strong><span>${percent}% complete</span></div><b>${percent}%</b></div><div class="completeness-track"><span style="width:${percent}%"></span></div><small>Keep your profile fresh so good collaborators can find you.</small></section><section class="profile-achievements"><div class="profile-section-heading"><h3>Skill levels & achievements</h3><span>Keep building</span></div><div class="achievement-list">${renderAchievementList(user)}</div></section><section class="github-panel"><div class="profile-section-heading"><div><h3>GitHub at a glance</h3><span>Public profile stats, refreshed from GitHub</span></div><span class="github-live-dot">LIVE</span></div><form id="github-sync-form" class="github-sync-form"><label class="field">GitHub username<div class="github-input-row"><span>@</span><input name="githubUsername" value="${esc(user.githubUsername||'')}" placeholder="octocat" autocomplete="off" required></div></label><button class="button button-primary">Fetch stats <span>↗</span></button></form><div id="github-stats"></div></section>`);
  }
  renderGithubSnapshot(user);
  const expired=!user.githubStats||Date.now()-(user.githubStats.fetchedAt||0)>60*60*1000;
  if(user.githubUsername&&expired&&githubLoadKey!==user.githubUsername.toLowerCase())syncGitHubProfile(user.githubUsername,true);
}

function enhanceExploreMatches(){
  const root=document.getElementById('view-root');
  if(!root)return;
  root.querySelectorAll('.person-card').forEach(card=>{
    const label=card.querySelector('.person-name')?.childNodes[0]?.textContent?.trim();
    const person=data.users.find(user=>user.name===label);
    if(!person)return;
    const skillRow=card.querySelector('.person-skills');
    if(skillRow)skillRow.innerHTML=(person.skills||[]).map(skill=>renderSkillBadge(skill,person)).join('');
    const score=skillMatchScore(me(),person);
    const footer=card.querySelector('.person-footer');
    if(footer&&!card.querySelector('.match-pill'))footer.insertAdjacentHTML('beforebegin',`<div class="explore-match"><span>${score}% skill match</span><div><i style="width:${score}%"></i></div></div>`);
  });
}

function enhanceFeedView(){
  const root=document.getElementById('view-root');
  const composer=root?.querySelector('.composer');
  if(!root||!composer||root.querySelector('.feed-mobile-widgets'))return;
  const featured=weeklyDeveloper();
  const counts={};
  data.users.forEach(user=>(user.skills||[]).forEach(skill=>{counts[skill]=(counts[skill]||0)+1;}));
  (data.teams||[]).forEach(team=>(team.skillsNeeded||[]).forEach(skill=>{counts[skill]=(counts[skill]||0)+1;}));
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,4);
  composer.insertAdjacentHTML('afterend',`<div class="feed-mobile-widgets"><section class="feed-spotlight-card"><div class="feed-widget-title">Developer of the Week <span>✳</span></div><div class="spotlight-person">${avatar(featured)}<div><strong>${esc(featured.name)}</strong><span>${esc(featured.role)}</span></div></div><button class="follow-button ${data.following.includes(featured.id)?'following':''}" data-action="follow" data-id="${esc(featured.id)}">${data.following.includes(featured.id)?'✓ Following':'+ Connect'}</button></section><section class="feed-trending-card"><div class="feed-widget-title">Trending skills <span>THIS WEEK</span></div><div class="feed-chart-wrap"><canvas id="feed-trending-chart" role="img" aria-label="Trending developer skills"></canvas></div><div class="feed-trend-fallback">${top.map(([skill,count])=>`<span>${esc(skill)} · ${count}</span>`).join('')}</div></section></div>`);
  const canvas=root.querySelector('#feed-trending-chart');
  const fallback=root.querySelector('.feed-trend-fallback');
  if(typeof Chart==='undefined'||!canvas)return;
  if(feedTrendChart)feedTrendChart.destroy();
  const light=document.body.classList.contains('light-theme');
  feedTrendChart=new Chart(canvas.getContext('2d'),{type:'bar',data:{labels:top.map(([skill])=>skill),datasets:[{data:top.map(([,count])=>count),backgroundColor:['#b77978','#cf9990','#d8afa0','#789d87'],borderRadius:6,maxBarThickness:16}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:true}},scales:{x:{display:false,grid:{display:false},ticks:{display:false}},y:{grid:{display:false},ticks:{color:light?'#756561':'#c4bdb8',font:{family:'DM Sans',size:9}}}}}});
  if(fallback)fallback.innerHTML='';
}

function weeklyDeveloper(){
  return data.users.filter(user=>user.id!==me().id).sort((a,b)=>(b.followers||0)-(a.followers||0))[0]||me();
}
function enhanceRightRail(){
  const rail=document.getElementById('right-rail');
  if(!rail)return;
  const cards=rail.querySelectorAll('.rail-card');
  if(cards[0]&&!rail.querySelector('.spotlight-card')){
    const featured=weeklyDeveloper();
    cards[0].insertAdjacentHTML('afterend',`<section class="rail-card spotlight-card"><div class="rail-heading"><h3>Developer of the Week</h3><span class="spotlight-spark">✳</span></div><div class="spotlight-person">${avatar(featured)}<div><strong>${esc(featured.name)}</strong><span>${esc(featured.role)}</span></div></div><p>Making the community a little brighter with thoughtful work and generous ideas.</p><button class="follow-button ${data.following.includes(featured.id)?'following':''}" data-action="follow" data-id="${esc(featured.id)}">${data.following.includes(featured.id)?'✓ Following':'+ Connect'}</button></section>`);
  }
  const skillsCard=[...rail.querySelectorAll('.rail-card')].find(card=>card.querySelector('.rail-heading h3')?.textContent.includes('Popular skills'));
  if(!skillsCard)return;
  const counts={};
  data.users.forEach(user=>(user.skills||[]).forEach(skill=>{counts[skill]=(counts[skill]||0)+1;}));
  (data.teams||[]).forEach(team=>(team.skillsNeeded||[]).forEach(skill=>{counts[skill]=(counts[skill]||0)+1;}));
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  skillsCard.querySelector('.skill-cloud')?.remove();
  let canvas=skillsCard.querySelector('#trending-skills-chart');
  if(!canvas){
    skillsCard.insertAdjacentHTML('beforeend','<div class="chart-wrap"><canvas id="trending-skills-chart" role="img" aria-label="Bar chart of trending skills in the community"></canvas></div><div id="trending-skill-fallback" class="trending-skill-fallback"></div>');
    canvas=skillsCard.querySelector('#trending-skills-chart');
  }
  const fallback=skillsCard.querySelector('#trending-skill-fallback');
  if(typeof Chart==='undefined'||!canvas){
    if(fallback)fallback.innerHTML=top.map(([skill,count])=>`<span>${esc(skill)} <b>${count}</b></span>`).join('');
    return;
  }
  if(githubChart)githubChart.destroy();
  const light=document.body.classList.contains('light-theme');
  const ctx=canvas.getContext('2d');
  githubChart=new Chart(ctx,{type:'bar',data:{labels:top.map(([skill])=>skill),datasets:[{data:top.map(([,count])=>count),backgroundColor:['#b77978','#cf9990','#d8afa0','#829884','#b99a81'],borderRadius:7,maxBarThickness:20}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:true}},scales:{x:{display:false,grid:{display:false},ticks:{display:false}},y:{grid:{display:false},ticks:{color:light?'#756561':'#c4bdb8',font:{family:'DM Sans',size:10}}}}}});
  if(fallback)fallback.innerHTML='';
}

function setTeamRequestStatus(request,status){
  request.status=status;
  request.respondedAt=Date.now();
  const team=(data.teams||[]).find(item=>item.id===request.teamId);
  const applicant=userById(request.userId);
  addNotification({type:'team',actorId:applicant.id,text:'You '+(status==='accepted'?'accepted ':'declined ')+applicant.name+' for '+(team?.title||'your team')+'.',read:true});
  updateUserChrome();
  renderView();
  renderNotificationPopover();
  showToast(status==='accepted'?'Teammate accepted.': 'Request declined.');
}
function handleTeamRequest(teamId){
  const team=(data.teams||[]).find(item=>item.id===teamId);
  if(!team)return;
  if(team.ownerId===me().id){showToast('You’re already hosting this team call.');return;}
  const existing=requestForTeam(teamId,me().id);
  if(existing&&existing.status==='pending'){showToast('Your request is already pending.');return;}
  if(existing){existing.status='pending';existing.createdAt='just now';}
  else data.teamRequests.push({id:'request-'+Date.now(),teamId,userId:me().id,status:'pending',createdAt:'just now'});
  addNotification({type:'team',actorId:team.ownerId,text:'Your request to join '+team.title+' was sent.',read:false,teamId});
  renderView();showToast('Your request is on its way.');
}
function handleTeamForm(event){
  event.preventDefault();
  const form=new FormData(event.target);
  const title=String(form.get('title')||'').trim();
  const description=String(form.get('description')||'').trim();
  const skillsNeeded=String(form.get('skills')||'').split(',').map(skill=>skill.trim()).filter(Boolean);
  if(title.length<3||description.length<12||!skillsNeeded.length){showToast('Add a name, a short idea, and at least one skill.');return;}
  data.teams.unshift({id:'team-'+Date.now(),ownerId:me().id,title,description,skillsNeeded,lookingFor:Math.max(1,Math.min(12,Number(form.get('lookingFor'))||2)),createdAt:'just now'});
  saveData();renderView();showToast('Team opening posted. Bring the right people together.');
}

document.addEventListener('click',event=>{
  const action=event.target.closest('[data-feature-action]');
  if(action){
    switch(action.dataset.featureAction){
      case 'notifications-toggle':
        event.preventDefault();event.stopImmediatePropagation();toggleNotifications();return;
      case 'mark-notifications-read':
        event.preventDefault();event.stopImmediatePropagation();markNotificationsRead();return;
      case 'request-team':
        event.preventDefault();event.stopImmediatePropagation();handleTeamRequest(action.dataset.teamId);return;
      case 'team-response':
      case 'team-shortcut':{
        event.preventDefault();event.stopImmediatePropagation();
        const request=(data.teamRequests||[]).find(item=>item.id===action.dataset.requestId);
        if(request&&request.status==='pending'&&data.teams.some(team=>team.id===request.teamId&&team.ownerId===me().id))setTeamRequestStatus(request,action.dataset.status);
        return;
      }
      case 'retry-github':
        event.preventDefault();event.stopImmediatePropagation();syncGitHubProfile(me().githubUsername);return;
    }
  }
  const popover=document.getElementById('notification-popover');
  if(popover&&!popover.classList.contains('hidden')&&!event.target.closest('.notification-wrap')){
    popover.classList.add('hidden');document.getElementById('notification-button')?.setAttribute('aria-expanded','false');
  }
});
document.addEventListener('submit',event=>{
  if(event.target.id==='team-form'){event.stopImmediatePropagation();handleTeamForm(event);}
  if(event.target.id==='github-sync-form'){
    event.preventDefault();event.stopImmediatePropagation();
    syncGitHubProfile(new FormData(event.target).get('githubUsername'));
  }
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    const popover=document.getElementById('notification-popover');
    if(popover&&!popover.classList.contains('hidden')){popover.classList.add('hidden');document.getElementById('notification-button')?.setAttribute('aria-expanded','false');}
  }
});
