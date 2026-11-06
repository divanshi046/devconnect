/* DevConnect is a static course project. All demo data stays in this browser. */
const STORAGE_KEY = 'devconnect-data-v1';
const THEME_KEY = 'devconnect-theme';
const seedUsers = [
  { id:'jordan', name:'Jordan Davis', handle:'jordandavis', role:'Frontend developer', location:'Austin, TX', bio:'Building thoughtful interfaces and tiny tools for the internet. Currently exploring the sweet spot between design and code.', skills:['JavaScript','React','CSS','Figma'], github:'https://github.com', website:'', followers:128, projects:[{name:'Focus Garden',description:'A tiny focus timer that grows a garden while you work.',icon:'🌱',color:'garden',skills:['JavaScript','CSS']},{name:'Color Club',description:'A collaborative color palette generator for creative teams.',icon:'🎨',color:'color',skills:['React','Design']}], palette:'av-lavender' },
  { id:'maya', name:'Maya Chen', handle:'mayacodes', role:'Full-stack developer', location:'Toronto, CA', bio:'Making tools that make the internet a little more human. Currently looking for a creative coding partner.', skills:['React','TypeScript','Node.js'], github:'https://github.com', followers:820, projects:[{name:'Softspace',description:'A calmer way to plan your week with your team.',icon:'☁️',color:'soft',skills:['TypeScript','React']}], palette:'avatar-coral' },
  { id:'arjun', name:'Arjun Rao', handle:'arjunbuilds', role:'ML engineer', location:'Bengaluru, IN', bio:'Turning interesting datasets into useful things. Always happy to talk about Python, maps, and bad sci-fi.', skills:['Python','Machine Learning','FastAPI'], github:'https://github.com', followers:564, projects:[{name:'Good Forecast',description:'A weather model that explains its own predictions.',icon:'🌦️',color:'forecast',skills:['Python','ML']}], palette:'avatar-green' },
  { id:'sam', name:'Sam Kim', handle:'samkdev', role:'Product designer & developer', location:'Seoul, KR', bio:'Design systems by day, playful web experiments by night. I care about making the web feel welcoming.', skills:['Figma','CSS','Accessibility'], github:'https://github.com', followers:391, projects:[{name:'Tiny Type',description:'A friendly playground for pairing fonts.',icon:'Aa',color:'type',skills:['CSS','Design']}], palette:'avatar-blue' },
  { id:'elena', name:'Elena Petrova', handle:'elenamakes', role:'Indie hacker', location:'Berlin, DE', bio:'Shipping small useful products and learning in public. My current side quest is making open source more approachable.', skills:['Vue','Node.js','Product'], github:'https://github.com', followers:247, projects:[{name:'Patchwork',description:'A place to find your next open source issue.',icon:'🧵',color:'patch',skills:['Vue','Node.js']}], palette:'avatar-yellow' },
  { id:'noah', name:'Noah Williams', handle:'noahcodes', role:'Backend developer', location:'Portland, US', bio:'Building reliable APIs and talking people into adding documentation. Open to weekend hackathons.', skills:['Python','Flask','PostgreSQL'], github:'https://github.com', followers:193, projects:[{name:'MeetMap',description:'Find a quiet cafe between a group of friends.',icon:'📍',color:'map',skills:['Python','Maps']}], palette:'avatar-pink' }
];
const seedData = {
  users: seedUsers,
  currentUser: null,
  accounts: [],
  following: ['maya','arjun','sam'],
  posts: [
    {id:'p1', userId:'maya', kind:'update', time:'12 min ago', text:'Spent the morning making our empty state feel a little less empty. It’s wild how one small illustration can change the whole mood of a screen. Sharing the tiny before & after below ✨', tags:['#buildinpublic','#uidesign'], likedBy:['jordan'], comments:[{userId:'sam',text:'The small details are always the ones people remember!'}]},
    {id:'p2', userId:'arjun', kind:'code', time:'48 min ago', text:'A tiny Python helper for cleaning up those slightly chaotic CSV headers. Future me says thanks.', tags:['#python','#todayilearned'], code:'def clean_headers(columns):\n    return [\n        col.strip().lower().replace(" ", "_")\n        for col in columns\n    ]', likedBy:[], comments:[]},
    {id:'p3', userId:'sam', kind:'project', time:'2 hours ago', text:'Just shipped a small side project I’ve been tinkering with for the last couple of weekends. It started as a tool I wanted for myself, and a few friends asked to try it. Would love some kind feedback!', tags:['#sideproject','#feedbackwanted'], project:{name:'Tiny Type',description:'A friendly little playground for pairing fonts. Pick a mood, find a type duo, and get back to making.',icon:'Aa'}, likedBy:['jordan','maya'], comments:[{userId:'maya',text:'This is lovely. The playful previews are such a nice touch!'}]}
  ],
  messages: {
    maya:[{from:'maya',text:'Hey Jordan! I saw your Color Club post. The shared palette idea is so good.',time:'10:42 AM'},{from:'jordan',text:'Thank you! I’m trying to make it useful for small teams, not just designers.',time:'10:46 AM'},{from:'maya',text:'Would you be up for a quick feedback swap this week?',time:'10:47 AM'}],
    arjun:[{from:'arjun',text:'Your Focus Garden project is such a nice idea. Do you have plans to open source it?',time:'Yesterday'},{from:'jordan',text:'I’m cleaning things up now, actually. I’ll share the repo when it’s ready!',time:'Yesterday'}]
  }
};

let data = loadData();
let currentView = 'feed';
let postKind = 'update';
let exploreTerm = '';
let activeSkill = 'All skills';
let activeConversation = 'maya';
let editingProfile = false;
let openComments = new Set();
let toastTimer;

function loadData(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved && Array.isArray(saved.users) && Array.isArray(saved.posts)) return {...structuredClone(seedData),...saved};
  } catch(error) { console.warn('Could not read saved DevConnect data.', error); }
  return structuredClone(seedData);
}
function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function userById(id){ return data.users.find(user=>user.id===id) || data.users[0]; }
function me(){ return userById(data.currentUser || 'jordan'); }
function esc(value=''){ return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function safeExternalUrl(value=''){try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}}
function initials(name=''){ return name.trim().split(/\s+/).slice(0,2).map(part=>part[0]||'').join('').toUpperCase() || 'DC'; }
function avatar(user, extra=''){ return `<div class="profile-avatar ${esc(user.palette||'av-lavender')} ${extra}">${esc(initials(user.name))}</div>`; }
function setMode(view){
  currentView=view;
  document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  renderView();
  window.scrollTo({top:0,behavior:'smooth'});
}
function enterCommunity(){
  if(!data.currentUser) data.currentUser='jordan';
  saveData(); document.getElementById('landing').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); updateUserChrome(); setMode('feed');
}
function goHome(){document.getElementById('app').classList.add('hidden');document.getElementById('landing').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});}
function updateUserChrome(){
  const user=me(); const mark=initials(user.name);
  document.getElementById('account-button').textContent=mark;
  document.getElementById('sidebar-avatar').textContent=mark;
  document.getElementById('sidebar-avatar').className=`profile-avatar ${esc(user.palette||'av-lavender')} small-avatar`;
  document.getElementById('sidebar-name').textContent=user.name;
  document.getElementById('sidebar-handle').textContent=`@${user.handle}`;
  document.getElementById('connection-count').textContent=data.following.length;
}
function pageHeading(title,subtitle,extra=''){return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${extra}</div>`;}
function projectCard(project){return `<article class="project-card"><div class="project-thumb ${esc(project.color||'')}" aria-hidden="true">${esc(project.icon||'◈')}</div><h3>${esc(project.name)}</h3><p>${esc(project.description)}</p><div class="person-skills">${(project.skills||[]).map(skill=>`<span>${esc(skill)}</span>`).join('')}</div></article>`;}
function renderFeed(){
  const meUser=me();
  const composer=`<section class="composer"><div class="composer-top">${avatar(meUser,'small-avatar')}<textarea id="post-text" placeholder="What are you building, ${esc(meUser.name.split(' ')[0])}?" aria-label="Write a post"></textarea></div><div class="composer-tools"><div class="composer-kind"><button class="kind-button ${postKind==='update'?'selected':''}" data-kind="update"><span>✳</span>Update</button><button class="kind-button ${postKind==='code'?'selected':''}" data-kind="code"><span>⌘</span>Code</button><button class="kind-button ${postKind==='project'?'selected':''}" data-kind="project"><span>◈</span>Project</button></div><button class="button button-primary post-button" data-action="publish">Share post <span>↗</span></button></div></section>`;
  const posts=[...data.posts].reverse().map(post=>{
    const author=userById(post.userId); const liked=(post.likedBy||[]).includes(meUser.id); const comments=post.comments||[];
    let body=post.kind==='code'?`<div class="code-block">${highlightCode(post.code||'')}</div>`:'';
    if(post.kind==='project'&&post.project) body+=`<div class="post-project"><div class="project-thumb">${esc(post.project.icon||'◈')}</div><div><strong>${esc(post.project.name)}</strong><span>${esc(post.project.description)}</span></div></div>`;
    const commentSection=openComments.has(post.id)?`<div class="comments"><div class="comment-list">${comments.map(comment=>`<div class="comment"><strong>${esc(userById(comment.userId).name)}</strong>${esc(comment.text)}</div>`).join('')}</div><form class="comment-form" data-comment-form="${esc(post.id)}"><input name="comment" placeholder="Add a thoughtful comment..." aria-label="Add comment" required><button>Reply</button></form></div>`:'';
    return `<article class="post-card" data-post="${esc(post.id)}"><div class="post-author">${avatar(author)}<div class="author-meta"><div class="author-line"><strong>${esc(author.name)}</strong><span class="verified">✓</span><span class="author-handle">@${esc(author.handle)}</span></div><div class="author-handle">${esc(author.role)}</div></div><span class="post-time">${esc(post.time||'just now')} · · ·</span></div><p class="post-text">${esc(post.text)}</p>${body}<div class="post-tags">${(post.tags||[]).map(tag=>`<span>${esc(tag)}</span>`).join('')}</div><div class="post-actions"><button class="post-action ${liked?'liked':''}" data-action="like" data-id="${esc(post.id)}">${liked?'♥':'♡'} ${liked?'Liked':'Like'} · ${(post.likedBy||[]).length}</button><button class="post-action" data-action="comments" data-id="${esc(post.id)}">▤ ${comments.length} comments</button><button class="post-action" data-action="share" data-id="${esc(post.id)}">↗ Share</button></div>${commentSection}</article>`;
  }).join('');
  return `${pageHeading('Your feed','Good morning, '+esc(meUser.name.split(' ')[0])+'. What’s happening in your world?',`<span class="date-pill">✳ COMMUNITY LIVE</span>`)}${composer}${posts||`<div class="empty-state"><strong>Your feed is quiet.</strong>Follow a few developers in Explore to get the conversation going.</div>`}`;
}
function highlightCode(code){
  const stringToken=/(["'])(?:\\.|(?!\1)[^\\])*?\1/g;
  let output=''; let cursor=0; let match;
  while((match=stringToken.exec(String(code)))){
    output+=highlightKeywords(String(code).slice(cursor,match.index));
    output+=`<span class="str">${esc(match[0])}</span>`;
    cursor=match.index+match[0].length;
  }
  return output+highlightKeywords(String(code).slice(cursor));
}
function highlightKeywords(text){return esc(text).replace(/\b(def|return|const|let|function|class|async|await|for|in|import|from)\b/g,'<span class="kw">$1</span>');}
function renderExplore(){
  const needle=exploreTerm.toLowerCase().trim();
  const users=data.users.filter(user=>user.id!==me().id).filter(user=>activeSkill==='All skills'||user.skills.some(skill=>skill.toLowerCase()===activeSkill.toLowerCase())).filter(user=>!needle||[user.name,user.role,user.bio,...user.skills].join(' ').toLowerCase().includes(needle));
  const skills=['All skills','JavaScript','React','Python','Machine Learning','CSS','Figma'];
  const people=users.map(user=>`<article class="person-card"><div class="person-top">${avatar(user)}<div><h2 class="person-name">${esc(user.name)} <span class="verified">✓</span></h2><div class="person-role">${esc(user.role)} · ${esc(user.location)}</div></div></div><p class="person-bio">${esc(user.bio)}</p><div class="person-skills">${user.skills.map(skill=>`<span>${esc(skill)}</span>`).join('')}</div><div class="person-footer"><span>♧ ${user.followers||0} connections</span><button class="follow-button ${data.following.includes(user.id)?'following':''}" data-action="follow" data-id="${esc(user.id)}">${data.following.includes(user.id)?'✓ Following':'+ Connect'}</button></div></article>`).join('');
  return `${pageHeading('Explore developers','Find people who share your curiosity and your stack.')}
    <div class="explore-controls"><label class="explore-search"><span>⌕</span><input id="explore-search" type="search" placeholder="Search by name, skill, or interest" value="${esc(exploreTerm)}" aria-label="Search developers"></label><select id="role-filter" class="filter-select" aria-label="Filter developers by role"><option value="all">All roles</option><option value="developer">Developers</option><option value="engineer">Engineers</option><option value="designer">Designers</option></select></div>
    <div class="filter-pills">${skills.map(skill=>`<button class="filter-pill ${activeSkill===skill?'active':''}" data-skill="${esc(skill)}">${esc(skill)}</button>`).join('')}</div>
    <div id="people-grid" class="people-grid">${people||`<div class="empty-state" style="grid-column:1/-1"><strong>No developers found yet.</strong>Try a different search or skill filter.</div>`}</div>`;
}
function renderConnections(){
  const connections=data.following.map(userById);
  return `${pageHeading('Your connections','A good network starts with a good conversation.',`<span class="subtle-badge">${connections.length} people</span>`)}<div class="connections-list">${connections.length?connections.map(user=>`<article class="connection-row">${avatar(user)}<div class="connection-info"><strong>${esc(user.name)}</strong><span>${esc(user.role)} · ${esc(user.location)}</span></div><div class="connection-actions"><button class="message-now" data-action="message" data-id="${esc(user.id)}">Message</button><button data-action="unfollow" data-id="${esc(user.id)}">Following ✓</button></div></article>`).join(''):`<div class="empty-state"><strong>Your people are out there.</strong>Explore developers and connect with someone new.</div>`}</div>`;
}
function renderProfile(){
  const user=me();
  const form=editingProfile?`<section class="profile-panel" style="padding:16px;margin-top:12px"><h3 class="section-title" style="margin-top:0">Edit your profile</h3><form id="profile-form" class="profile-edit-grid"><label class="field">Name<input name="name" value="${esc(user.name)}" required minlength="2"></label><label class="field">Role<input name="role" value="${esc(user.role)}" placeholder="Frontend developer"></label><label class="field">Location<input name="location" value="${esc(user.location)}" placeholder="City, Country"></label><label class="field">GitHub URL<input name="github" type="url" value="${esc(user.github||'')}" placeholder="https://github.com/you"></label><label class="field full-field">Short bio<textarea name="bio" maxlength="220">${esc(user.bio)}</textarea></label><label class="field full-field">Skills, separated by commas<input name="skills" value="${esc(user.skills.join(', '))}" placeholder="JavaScript, React, CSS"></label><div class="profile-edit-actions full-field"><button type="button" class="button button-quiet" data-action="cancel-edit">Cancel</button><button class="button button-primary">Save changes</button></div></form></section>`:'';
  const projects=user.projects||[];
  const github=safeExternalUrl(user.github); const website=safeExternalUrl(user.website);
  return `${pageHeading('My profile','A little context helps the right people find you.',`<div style="display:flex;gap:6px"><button class="edit-profile-button" data-action="edit-profile">✎ Edit profile</button><button class="edit-profile-button" data-action="logout">Log out</button></div>`)}<section class="profile-panel"><div class="profile-cover"></div><div class="profile-main"><div class="profile-header">${avatar(user)}<div class="profile-heading"><h2>${esc(user.name)} <span class="verified">✓</span></h2><p>${esc(user.role)} · ${esc(user.location)}</p></div></div><p class="profile-bio">${esc(user.bio)}</p><div class="profile-links">${github?`<a href="${esc(github)}" target="_blank" rel="noreferrer">⌘ GitHub ↗</a>`:''}${website?`<a href="${esc(website)}" target="_blank" rel="noreferrer">↗ Website</a>`:''}</div><div class="profile-tags">${user.skills.map(skill=>`<span>${esc(skill)}</span>`).join('')}</div><div class="profile-stats"><div><strong>${projects.length.toString().padStart(2,'0')}</strong><span>Projects</span></div><div><strong>${data.following.length.toString().padStart(2,'0')}</strong><span>Connections</span></div><div><strong>${user.followers||0}</strong><span>Followers</span></div></div></div></section><h2 class="section-title">Projects <span class="subtle-badge">${projects.length}</span></h2><div class="project-grid">${projects.map(projectCard).join('')||`<div class="empty-state" style="grid-column:1/-1"><strong>No projects added yet.</strong>Update your profile as you start building.</div>`}</div>${form}`;
}
function renderProjects(){
  const projects=me().projects||[];
  return `${pageHeading('Your projects','Little ideas have a way of becoming big things.',`<button class="button button-primary" data-action="add-project">＋ Add project</button>`)}<div class="project-grid">${projects.map(projectCard).join('')||`<div class="empty-state" style="grid-column:1/-1"><strong>Your next project starts here.</strong>Add something you’re building and share it with the community.</div>`}</div>`;
}
function renderMessages(){
  const people=[...new Set([...Object.keys(data.messages||{}),...data.following])].map(userById).filter(user=>user.id!==me().id);
  if(!people.find(user=>user.id===activeConversation)&&people.length) activeConversation=people[0].id;
  const chosen=userById(activeConversation); const conversation=(data.messages[activeConversation]||[]);
  return `${pageHeading('Messages','Good ideas tend to start with a conversation.')}<section class="message-panel"><div class="message-list"><h3>Conversations</h3>${people.map(user=>{const last=(data.messages[user.id]||[]).at(-1);return `<div class="message-person ${user.id===activeConversation?'active':''}" data-action="open-message" data-id="${esc(user.id)}">${avatar(user)}<div><strong>${esc(user.name.split(' ')[0])}</strong><span>${esc(last?last.text:'Say hello')}</span></div></div>`}).join('')||'<p class="author-handle">Connect with a developer to start chatting.</p>'}</div><div class="conversation"><div class="conversation-head">${avatar(chosen)}<div><strong>${esc(chosen.name)}</strong><span class="author-handle"> · ${esc(chosen.role)}</span></div></div><div class="conversation-body" id="conversation-body">${conversation.map(message=>`<div class="chat-bubble ${message.from===me().id?'mine':''}">${esc(message.text)}<div class="chat-time">${esc(message.time||'now')}</div></div>`).join('')||`<div class="empty-state"><strong>Start the conversation.</strong>Send ${esc(chosen.name.split(' ')[0])} a note about what they’re building.</div>`}</div><form id="message-form" class="message-send"><input name="message" placeholder="Write a message..." aria-label="Write a message" required><button aria-label="Send message">↗</button></form></div></section>`;
}
function renderView(){
  const root=document.getElementById('view-root');
  const renderers={feed:renderFeed,explore:renderExplore,connections:renderConnections,profile:renderProfile,projects:renderProjects,messages:renderMessages};
  root.innerHTML=(renderers[currentView]||renderFeed)();
  renderRail();
  if(currentView==='messages'){const box=document.getElementById('conversation-body');if(box)box.scrollTop=box.scrollHeight;}
}
function renderRail(){
  const suggestions=data.users.filter(user=>user.id!==me().id&&!data.following.includes(user.id)).slice(0,3);
  const rail=`<section class="rail-card"><div class="rail-heading"><h3>People to meet</h3><button data-view="explore">See all →</button></div>${suggestions.map(user=>`<div class="suggestion">${avatar(user)}<div class="suggestion-info"><strong>${esc(user.name)}</strong><span>${esc(user.role)}</span></div><button class="follow-button" data-action="follow" data-id="${esc(user.id)}">＋</button></div>`).join('')||'<div class="author-handle">You’re connected with everyone here!</div>'}</section>
    <section class="rail-card"><div class="rail-heading"><h3>Community calendar</h3><button data-action="toast" data-message="More community events coming soon!">View all →</button></div><div class="event-row"><div class="event-date"><span>NOV</span><strong>12</strong></div><div><strong>Build & Tell</strong><span>Online · 6:00 PM UTC</span></div></div><div class="event-row"><div class="event-date"><span>NOV</span><strong>18</strong></div><div><strong>Open Source Hour</strong><span>Online · 4:30 PM UTC</span></div></div></section>
    <section class="rail-card"><div class="rail-heading"><h3>Popular skills</h3><span class="subtle-badge">this week</span></div><div class="skill-cloud">${['JavaScript','React','Python','Figma','Open source','CSS'].map(skill=>`<span>${esc(skill)}</span>`).join('')}</div></section><div class="rail-foot"><a href="#about">About</a><a href="#guidelines">Guidelines</a><a href="#privacy">Privacy</a><br>© 2026 DevConnect · Made for the makers</div>`;
  document.getElementById('right-rail').innerHTML=rail;
}

function openAuth(mode){
  const signup=mode==='signup'; document.getElementById('auth-modal').classList.remove('hidden'); document.getElementById('auth-title').innerHTML=signup?'Make yourself<br>at <span>home.</span>':'Good to see<br>you <span>again.</span>';
  document.getElementById('auth-eyebrow').textContent=signup?'YOUR PEOPLE ARE HERE':'WELCOME BACK'; document.getElementById('auth-subtitle').textContent=signup?'Join a community that makes building feel less like a solo sport.':'Pick up where you left off with your developer community.';
  document.getElementById('name-field').classList.toggle('hidden',!signup); document.querySelector('#auth-form [name="password"]').autocomplete=signup?'new-password':'current-password';
  document.querySelector('#auth-form [name="name"]').required=signup; document.getElementById('auth-submit').innerHTML=signup?'Create my account <span>↗</span>':'Log in <span>↗</span>';
  document.getElementById('auth-switch-copy').textContent=signup?'Already part of the community?':'New around here?'; document.getElementById('auth-switch').textContent=signup?'Log in':'Create an account';
  document.getElementById('auth-modal').dataset.mode=mode;document.getElementById('auth-error').textContent='';document.getElementById('auth-form').reset();
}
function closeAuth(){document.getElementById('auth-modal').classList.add('hidden');}
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2300);}
function publishPost(){
  const field=document.getElementById('post-text'); const text=field?.value.trim(); if(!text){field?.focus();showToast('Write a little something first.');return;}
  const tags=[...text.matchAll(/#[\w]+/g)].map(match=>match[0]); const post={id:`p${Date.now()}`,userId:me().id,kind:postKind,time:'just now',text:text.replace(/\s+/g,' '),tags,likedBy:[],comments:[]};
  if(postKind==='code')post.code=text;
  if(postKind==='project')post.project={name:text.split(/[.!?]/)[0].slice(0,42)||'New project',description:text,icon:'🚀'};
  data.posts.push(post);saveData();postKind='update';renderView();showToast('Your post is live in the community ✨');
}
function toggleFollow(userId,shouldFollow){
  const isFollowing=data.following.includes(userId); const follow=shouldFollow??!isFollowing;
  data.following=data.following.filter(id=>id!==userId);if(follow)data.following.push(userId);saveData();updateUserChrome();renderView();showToast(follow?`You and ${userById(userId).name.split(' ')[0]} are connected.`:'Connection removed.');
}
function selectMessage(userId){activeConversation=userId;if(!data.messages[userId])data.messages[userId]=[];currentView='messages';renderView();document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view==='messages'));}
function randomPalette(){return ['avatar-coral','avatar-green','avatar-blue','avatar-yellow','avatar-pink'][Math.floor(Math.random()*5)];}

document.addEventListener('click',event=>{
  const auth=event.target.closest('[data-auth]');if(auth){openAuth(auth.dataset.auth);return;}
  if(event.target.closest('[data-enter-community]')){enterCommunity();return;}
  if(event.target.closest('[data-close-modal]')){closeAuth();return;}
  if(event.target.closest('[data-home]')){event.preventDefault();goHome();return;}
  const switchAuth=event.target.closest('#auth-switch');if(switchAuth){openAuth(document.getElementById('auth-modal').dataset.mode==='signup'?'login':'signup');return;}
  const nav=event.target.closest('[data-view]');if(nav){setMode(nav.dataset.view);return;}
  const kind=event.target.closest('[data-kind]');if(kind){postKind=kind.dataset.kind;renderView();document.getElementById('post-text')?.focus();return;}
  const pill=event.target.closest('[data-skill]');if(pill){activeSkill=pill.dataset.skill;renderView();return;}
  const action=event.target.closest('[data-action]');if(!action)return;
  const id=action.dataset.id;
  switch(action.dataset.action){
    case 'focus-composer':setMode('feed');setTimeout(()=>document.getElementById('post-text')?.focus(),50);break;
    case 'find-team':postKind='project';setMode('feed');setTimeout(()=>document.getElementById('post-text')?.focus(),50);showToast('Share the project and skills you need.');break;
    case 'publish':publishPost();break;
    case 'like':{const post=data.posts.find(item=>item.id===id);if(post){post.likedBy=post.likedBy||[];post.likedBy=post.likedBy.includes(me().id)?post.likedBy.filter(uid=>uid!==me().id):[...post.likedBy,me().id];saveData();renderView();}break;}
    case 'comments':openComments.has(id)?openComments.delete(id):openComments.add(id);renderView();break;
    case 'share':{const url=`${location.origin}${location.pathname}#post-${id}`;navigator.clipboard?.writeText(url).then(()=>showToast('Post link copied!')).catch(()=>showToast('You can share this post with your community.'));break;}
    case 'follow':toggleFollow(id,true);break;
    case 'unfollow':toggleFollow(id,false);break;
    case 'message':selectMessage(id);break;
    case 'open-message':selectMessage(id);break;
    case 'edit-profile':editingProfile=!editingProfile;renderView();break;
    case 'cancel-edit':editingProfile=false;renderView();break;
    case 'account-menu':setMode('profile');break;
    case 'logout':data.currentUser=null;saveData();goHome();showToast('You’re signed out. See you soon!');break;
    case 'toast':showToast(action.dataset.message||'Coming soon!');break;
    case 'add-project':{const name=prompt('What is your project called?');if(!name?.trim())break;const description=prompt('What does it do?')||'';const skills=prompt('Which skills did you use? (comma separated)','JavaScript, CSS')||'';me().projects=[...(me().projects||[]),{name:name.trim(),description:description.trim()||'A new project I’m building.',icon:'🚀',skills:skills.split(',').map(x=>x.trim()).filter(Boolean)}];saveData();renderView();showToast('Project added to your profile.');break;}
  }
});

document.addEventListener('submit',event=>{
  if(event.target.id==='auth-form'){
    event.preventDefault();const form=new FormData(event.target);const mode=document.getElementById('auth-modal').dataset.mode;const email=String(form.get('email')).trim().toLowerCase();const password=String(form.get('password'));const error=document.getElementById('auth-error');
    if(!/^\S+@\S+\.\S+$/.test(email)){error.textContent='Enter a valid email address.';return;}
    if(password.length<8){error.textContent='Use at least 8 characters for your password.';return;}
    if(mode==='signup'){
      const name=String(form.get('name')).trim();if(name.length<2){error.textContent='Please enter your name.';return;}
      if(data.accounts.some(account=>account.email===email)){error.textContent='An account with this email already exists. Try logging in.';return;}
      const id=`u${Date.now()}`;const handle=name.toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,18)||'developer';const user={id,name,handle,role:'Developer',location:'Add your location',bio:'Tell the community what you love building.',skills:['JavaScript','Web development'],github:'',followers:0,projects:[],palette:randomPalette()};
      data.users.push(user);data.accounts.push({email,password,userId:id});data.currentUser=id;data.following=[];saveData();closeAuth();enterCommunity();showToast(`Welcome to DevConnect, ${name.split(' ')[0]}!`);
    }else{
      const account=data.accounts.find(item=>item.email===email&&item.password===password);
      if(!account){error.textContent='That email and password didn’t match. Try again or explore the community.';return;}
      data.currentUser=account.userId;saveData();closeAuth();enterCommunity();showToast(`Welcome back, ${me().name.split(' ')[0]}!`);
    }
  }
  if(event.target.matches('[data-comment-form]')){
    event.preventDefault();const post=data.posts.find(item=>item.id===event.target.dataset.commentForm);const input=event.target.elements.comment;const text=input.value.trim();if(!post||!text)return;post.comments=post.comments||[];post.comments.push({userId:me().id,text});openComments.add(post.id);saveData();renderView();showToast('Comment added.');
  }
  if(event.target.id==='profile-form'){
    event.preventDefault();const fields=new FormData(event.target);const user=me();user.name=String(fields.get('name')).trim();user.handle=user.handle||user.name.toLowerCase().replace(/[^a-z0-9]+/g,'');user.role=String(fields.get('role')).trim();user.location=String(fields.get('location')).trim();user.bio=String(fields.get('bio')).trim();user.github=String(fields.get('github')).trim();user.skills=String(fields.get('skills')).split(',').map(skill=>skill.trim()).filter(Boolean);saveData();editingProfile=false;updateUserChrome();renderView();showToast('Your profile is looking good.');
  }
  if(event.target.id==='message-form'){
    event.preventDefault();const text=String(new FormData(event.target).get('message')).trim();if(!text)return;data.messages[activeConversation]=data.messages[activeConversation]||[];data.messages[activeConversation].push({from:me().id,text,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});saveData();renderView();
  }
});

document.addEventListener('input',event=>{
  if(event.target.id==='explore-search'){exploreTerm=event.target.value;const caret=event.target.selectionStart;renderView();const input=document.getElementById('explore-search');input.focus();input.setSelectionRange(caret,caret);}
  if(event.target.id==='global-search'){
    exploreTerm=event.target.value;
    if(!document.getElementById('app').classList.contains('hidden')){currentView='explore';document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view==='explore'));renderView();const input=document.getElementById('explore-search');if(input){input.focus();input.setSelectionRange(exploreTerm.length,exploreTerm.length);}}
  }
});
document.addEventListener('change',event=>{
  if(event.target.id==='role-filter'){
    const role=event.target.value;document.querySelectorAll('.person-card').forEach(card=>{const text=card.querySelector('.person-role')?.textContent.toLowerCase()||'';card.classList.toggle('hidden',role!=='all'&&!text.includes(role));});
  }
});
document.querySelector('.theme-toggle').addEventListener('click',()=>{
  const isLight=document.body.classList.toggle('light-theme');
  document.body.classList.toggle('dark-theme',!isLight);
  localStorage.setItem(THEME_KEY,isLight?'light':'dark');
  document.querySelector('.theme-toggle').textContent=isLight?'☾':'☼';
  document.querySelector('.theme-toggle').setAttribute('aria-label',`Switch to ${isLight?'dark':'light'} theme`);
});
document.getElementById('account-button').addEventListener('click',()=>{if(document.getElementById('app').classList.contains('hidden'))return;setMode('profile');});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(document.getElementById('app').classList.contains('hidden'))enterCommunity();currentView='explore';renderView();document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view==='explore'));document.getElementById('explore-search')?.focus();}if(event.key==='Escape')closeAuth();});

const savedTheme=localStorage.getItem(THEME_KEY);
const isLightTheme=savedTheme!=='dark';
document.body.classList.toggle('light-theme',isLightTheme);
document.body.classList.toggle('dark-theme',!isLightTheme);
document.querySelector('.theme-toggle').textContent=isLightTheme?'☾':'☼';
// A saved session goes straight to the community; first-time visitors see the landing page.
if(data.currentUser&&data.users.some(user=>user.id===data.currentUser))enterCommunity();
