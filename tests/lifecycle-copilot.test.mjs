// Pruebas del Lifecycle Copilot: reglas determinísticas, Send Guard y la función (fetch simulado: no usa red, no gasta créditos).
// Ejecutar: node tests/lifecycle-copilot.test.mjs
import handler from "../netlify/functions/lifecycle-copilot.mjs";
import * as R from "../netlify/functions/_lifecycle_rules.mjs";
let pass=0,fail=0; const ok=(c,m,x)=>{c?pass++:(fail++,console.log("FAIL",m,x!==undefined?JSON.stringify(x).slice(0,300):""))};
const ENV=["CUSTOMERIO_SITE_ID","CUSTOMERIO_TRACK_API_KEY","CUSTOMERIO_APP_API_KEY","CUSTOMERIO_SEND_ENABLED","CUSTOMERIO_TEST_ALLOWLIST","CUSTOMERIO_TRANSACTIONAL_MESSAGE_ID","CUSTOMERIO_REGION","ANTHROPIC_API_KEY"];
const clear=()=>ENV.forEach(k=>delete process.env[k]);
const real=globalThis.fetch; let calls=[];
const mock=(impl)=>{calls=[];globalThis.fetch=async(u,o)=>{calls.push({u:String(u),o});return impl(String(u),o)}};
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s});
const post=async(b)=>{const r=await handler(new Request("http://x/lc",{method:"POST",body:JSON.stringify(b)}));return {s:r.status,j:await r.json()}};
const base={company:"Apiux Tech",score:40,lang:"en",crm:{status:"verified",lifecycleStage:"lead",lastContacted:null,contactedNotes:0}};
const good={journey:"Activation",rationale:"Fits ICP but no intent yet.",subject:"A simpler way to manage expenses",body:"Hello,\n\nUseful content {{ evil }} here.\n\nClara Team",confidence:"medium"};
const anth=(o)=>J({content:[{type:"text",text:JSON.stringify(o)}],usage:{input_tokens:800,output_tokens:200}});

// ---------- pure rules
const now=Date.parse("2026-10-03T12:00:00Z");
const prof={source:"customerio",found:true,matches:1,unsubscribed:false,emailChannelOn:true,suppressed:false,lastMessageAt:null};
const A=(o={})=>R.evaluateAudience({email:"qa@example.com",profile:prof,lifecycleStage:"lead",crmStatus:"verified",hubspotLastContacted:null,approved:false,now,...o});
const st=(a,id)=>a.checks.find(c=>c.id===id).status;
let a=A(); ok(a.checks.length===8&&a.eligibleBeforeApproval&&!a.eligible&&a.blockedBy.join()==="approval","all pass but approval pending",a);
ok(A({approved:true}).eligible,"eligible once approved");
ok(st(A({email:""}),"email")==="fail","no email fails"); ok(st(A({email:"not-an-email"}),"email")==="fail","bad email fails");
ok(st(A({profile:{...prof,unsubscribed:true}}),"subscription")==="fail","unsubscribed"); ok(st(A({profile:{...prof,emailChannelOn:false}}),"channel")==="fail","channel off");
for(const s of ["customer","evangelist","opportunity"]) ok(st(A({lifecycleStage:s}),"lifecycle")==="fail","stage "+s+" excluded");
ok(st(A({lifecycleStage:null}),"lifecycle")==="unknown","unset stage -> unknown (fail-closed)"); ok(!A({lifecycleStage:null}).eligibleBeforeApproval,"unknown blocks");
ok(st(A({profile:{...prof,lastMessageAt:now-3*86400000}}),"frequency")==="fail","recent CIO message"); ok(st(A({profile:{...prof,lastMessageAt:now-30*86400000}}),"frequency")==="pass","old message ok");
ok(st(A({hubspotLastContacted:new Date(now-2*86400000).toISOString()}),"frequency")==="fail","recent HubSpot contact");
ok(st(A({profile:{...prof,suppressed:true}}),"suppression")==="fail","suppressed"); ok(st(A({profile:{...prof,matches:2}}),"duplicate")==="fail","duplicate");
const un=A({profile:{source:"unavailable"}}); ok(["subscription","channel","frequency","suppression","duplicate"].every(i=>st(un,i)==="unknown")&&!un.eligibleBeforeApproval&&un.dataSource==="unavailable","CIO unavailable -> everything unknown, blocked");
ok(st(A({profile:{source:"customerio",found:false,matches:0}}),"duplicate")==="pass","new contact passes");
const sg=(o={})=>R.evaluateSendGate({audience:A({approved:true}),approved:true,sendEnabled:true,allowlist:["qa@example.com"],email:"QA@example.com",transactionalConfigured:true,credentialsConfigured:true,...o});
ok(sg().length===0,"gate open when everything is satisfied",sg());
ok(sg({sendEnabled:false}).includes("send_disabled"),"flag off blocks"); ok(sg({sendEnabled:undefined}).includes("send_disabled"),"flag undefined blocks"); ok(sg({sendEnabled:"true"}).includes("send_disabled"),"truthy string is not true");
ok(sg({allowlist:[]}).includes("not_allowlisted"),"empty allowlist blocks"); ok(sg({email:"x@real-company.com"}).includes("not_allowlisted"),"non-allowlisted blocks");
ok(sg({approved:false}).includes("not_approved"),"not approved blocks"); ok(sg({audience:A({approved:true,lifecycleStage:"customer"})}).includes("audience_failed"),"failed audience blocks");
ok(sg({audience:R.evaluateAudience({email:"",profile:{source:"simulated",found:false,matches:0},lifecycleStage:"lead",crmStatus:"simulated",approved:true})}).includes("simulated_data"),"simulated audience blocks");
ok(R.fallbackStrategy({stage:"customer",score:10,lang:"en"}).journey==="Expansion","fallback expansion"); ok(R.fallbackStrategy({stage:"lead",contactedNotes:2,score:10}).journey==="Reactivation","fallback reactivation"); ok(R.fallbackStrategy({stage:"lead",score:45}).journey==="Activation","fallback activation"); ok(R.fallbackStrategy({stage:"lead",score:10}).journey==="Education","fallback education");
const sn=R.sanitizeStrategy(good,"en"); ok(sn&&!/\{\{/.test(sn.body)&&sn.journey==="Activation","sanitize strips liquid",sn);
ok(R.sanitizeStrategy({...good,journey:"Hack"},"en")===null,"invalid journey rejected"); ok(R.sanitizeStrategy({journey:"Education"},"en")===null,"incomplete rejected");
ok(!R.textToHtml("a <script>x</script>\n\nb").includes("<script>"),"html escaped");

// ---------- function: status never leaks
clear(); process.env.CUSTOMERIO_APP_API_KEY="app-secret-123"; process.env.CUSTOMERIO_SITE_ID="site-xyz"; process.env.CUSTOMERIO_TRACK_API_KEY="track-secret-456"; process.env.CUSTOMERIO_TEST_ALLOWLIST="qa@example.com";
mock(()=>J({}));
let r=await handler(new Request("http://x/lc")); let t=await r.text();
ok(r.status===200&&!/secret|site-xyz|qa@example/.test(t),"status leaks no secret/id/email",t); const sj=JSON.parse(t);
ok(sj.integration.sendEnabled===false&&sj.integration.allowlistCount===1&&sj.integration.cio==="connected","status: send disabled by default, cio connected");
mock(()=>J({},401)); clear(); process.env.CUSTOMERIO_APP_API_KEY="k"; process.env.CUSTOMERIO_SITE_ID="s"; process.env.CUSTOMERIO_TRACK_API_KEY="t";
r=await handler(new Request("http://x/lc?refresh=1")); ok((await r.json()).integration.cio==="unavailable","status: bad credentials -> unavailable");

// ---------- analyze: unconfigured (nothing real) + simulate
clear(); mock(()=>{throw new Error("no network expected")});
let o=await post({...base,action:"analyze",simulate:true});
ok(o.s===200&&o.j.audience.dataSource==="simulated"&&o.j.llm.status==="unavailable"&&o.j.strategy.source==="rules_fallback"&&o.j.strategy.subject&&o.j.strategy.body,"unconfigured: simulated audience + labeled template fallback",o.j);
ok(!o.j.audience.eligible,"simulated is never 'eligible' (approval pending)");
o=await post({...base,action:"analyze"}); ok(o.j.audience.dataSource==="unavailable"&&!o.j.audience.eligibleBeforeApproval,"unconfigured w/o simulate: unverified, blocked");
o=await post({...base,action:"analyze",company:"Nope"}); ok(o.s===404,"unknown company 404");
o=await post({action:"analyze"}); ok(o.s===404,"missing company"); o=await post({...base,action:"zzz"}); ok(o.s===400,"unknown action 400");

// ---------- analyze: live CIO + Claude
const CIO=(cfg={})=>(u,opt)=>{
  if(u.includes("api.anthropic.com")) return cfg.llm?cfg.llm():anth(good);
  if(u.includes("/v1/customers?email=")) return cfg.lookup?cfg.lookup():J({results:[]});
  if(u.includes("/attributes")) return J({customer:{attributes:cfg.attrs||{}}});
  if(u.includes("/messages")) return J({messages:cfg.msgs||[]});
  if(u.includes("/v1/send/email")) return cfg.send?cfg.send(opt):J({delivery_id:"d-1"});
  return J({});
};
const live=()=>{clear();Object.assign(process.env,{CUSTOMERIO_APP_API_KEY:"app-k",CUSTOMERIO_TEST_ALLOWLIST:"qa@example.com",ANTHROPIC_API_KEY:"sk-ant"});};
live(); mock(CIO());
o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"});
ok(o.j.audience.dataSource==="customerio"&&o.j.audience.eligibleBeforeApproval&&o.j.llm.status==="ok"&&o.j.strategy.source==="claude"&&!/\{\{/.test(o.j.strategy.body),"live: new contact eligible, Claude ok, liquid stripped",o.j);
const cl=calls.find(c=>c.u.includes("anthropic")); const sentToClaude=cl.o.body; ok(!/eligib|suppress|unsubscrib|qa@example/i.test(JSON.parse(sentToClaude).messages[0].content),"Claude never receives eligibility or the recipient email");
ok(o.j.llm.estimatedCostUsd>0,"cost estimate present");
live(); mock(CIO({lookup:()=>J({results:[{id:"u1",cio_id:"abc"}]}),attrs:{unsubscribed:"true"}}));
o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"}); ok(o.j.audience.checks.find(c=>c.id==="subscription").status==="fail"&&!o.j.audience.eligibleBeforeApproval,"live: unsubscribed blocks");
live(); mock(CIO({lookup:()=>J({results:[{id:"u1",cio_id:"a"},{id:"u2",cio_id:"b"}]})}));
o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"}); ok(o.j.audience.checks.find(c=>c.id==="duplicate").status==="fail","live: duplicates block");
live(); mock(CIO({lookup:()=>J({results:[{id:"u1",cio_id:"a"}]}),msgs:[{created:Math.floor(Date.now()/1000)-86400,metrics:{}}]}));
o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"}); ok(o.j.audience.checks.find(c=>c.id==="frequency").status==="fail","live: contacted yesterday blocks");
live(); mock(CIO({lookup:()=>J({results:[{id:"u1",cio_id:"a"}]}),msgs:[{created:1,metrics:{bounced:123}}]}));
o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"}); ok(o.j.audience.checks.find(c=>c.id==="suppression").status==="fail","live: bounce => suppressed");
live(); mock(CIO({lookup:()=>J({},500)}));
o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"}); ok(o.s===200&&o.j.audience.dataSource==="unavailable"&&!o.j.audience.eligibleBeforeApproval&&o.j.cio.reason==="http_500","live: CIO 500 -> unverified, fail-closed, reason surfaced",o.j.cio);
// LLM failure + hostile LLM
live(); mock(CIO({llm:()=>J({},529)})); o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"});
ok(o.j.llm.status==="error"&&o.j.strategy.source==="rules_fallback"&&o.j.audience.eligibleBeforeApproval,"LLM down: labeled fallback; eligibility unaffected",o.j.llm);
live(); mock(CIO({llm:()=>anth({...good,eligible:true,send:true,suppressed:false,audience:{eligible:true}})})); o=await post({...base,action:"analyze",recipientEmail:"qa@example.com",crm:{...base.crm,lifecycleStage:"customer"}});
ok(!o.j.audience.eligibleBeforeApproval&&!("eligible" in o.j.strategy)&&!("send" in o.j.strategy),"Claude cannot override: customer stays blocked, extra fields dropped",o.j);
live(); mock(CIO({llm:()=>anth({...good,journey:"Hack"})})); o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"}); ok(o.j.strategy.source==="rules_fallback","invalid journey from LLM -> fallback");
live(); mock(CIO({llm:()=>new Response("not json",{status:200})})); o=await post({...base,action:"analyze",recipientEmail:"qa@example.com"}); ok(o.s===200&&o.j.llm.status==="error","LLM garbage -> no crash");
live(); mock(CIO()); o=await post({...base,action:"analyze",recipientEmail:"qa@example.com",lang:"en"}); ok(JSON.parse(calls.find(c=>c.u.includes("anthropic")).o.body).system.includes("natural English"),"English instruction sent");
live(); mock(CIO()); o=await post({...base,action:"draft"}); ok(o.j.strategy&&!o.j.audience,"draft action returns only strategy");

// ---------- send_test
const send=(extra={})=>post({...base,action:"send_test",recipientEmail:"qa@example.com",subject:"Hi",body:"Hello\n\nbody",approved:true,...extra});
const sendEnv=(o={})=>{live();Object.assign(process.env,{CUSTOMERIO_SEND_ENABLED:"true",CUSTOMERIO_TRANSACTIONAL_MESSAGE_ID:"7",...o});};
// default (flag unset) => impossible, and /send/email never called
live(); process.env.CUSTOMERIO_TRANSACTIONAL_MESSAGE_ID="7"; mock(CIO()); o=await send();
ok(o.j.sent===false&&o.j.blocked.includes("send_disabled")&&!calls.some(c=>c.u.includes("/v1/send/email")),"SEND_ENABLED unset: blocked, no send call",o.j);
for(const v of ["false","1","yes","TRUE ","True"]){ if(v.trim().toLowerCase()==="true") continue; live(); Object.assign(process.env,{CUSTOMERIO_SEND_ENABLED:v,CUSTOMERIO_TRANSACTIONAL_MESSAGE_ID:"7"}); mock(CIO()); o=await send(); ok(o.j.sent===false&&!calls.some(c=>c.u.includes("/send/email")),"flag='"+v+"' cannot send"); }
sendEnv(); mock(CIO()); o=await send();
ok(o.s===200&&o.j.sent===true&&o.j.mode==="test","all conditions met: test send happens",o.j);
const sc=calls.find(c=>c.u.includes("/v1/send/email")); const sb=JSON.parse(sc.o.body);
ok(sb.to==="qa@example.com"&&sb.send_to_unsubscribed===false&&sb.queue_draft===false&&sb.transactional_message_id===7&&sb.subject.startsWith("[TEST]")&&sc.o.headers.authorization==="Bearer app-k","send payload: allowlisted recipient, [TEST], never to unsubscribed",sb);
sendEnv(); mock(CIO()); o=await send({recipientEmail:"someone@real-company.com"}); ok(o.j.sent===false&&o.j.blocked.includes("not_allowlisted")&&!calls.some(c=>c.u.includes("/send/email")),"non-allowlisted blocked");
sendEnv({CUSTOMERIO_TEST_ALLOWLIST:""}); mock(CIO()); o=await send(); ok(o.j.blocked.includes("not_allowlisted"),"empty allowlist blocks everything");
sendEnv(); mock(CIO()); o=await send({approved:false}); ok(o.j.blocked.includes("not_approved")&&!calls.some(c=>c.u.includes("/send/email")),"not approved blocked");
sendEnv(); mock(CIO()); o=await send({approved:"true"}); ok(o.j.blocked.includes("not_approved"),"approved must be boolean true");
sendEnv(); mock(CIO({lookup:()=>J({results:[{id:"u",cio_id:"a"}]}),attrs:{unsubscribed:true}})); o=await send(); ok(o.j.sent===false&&o.j.blocked.includes("audience_failed"),"unsubscribed recipient blocked server-side");
sendEnv(); mock(CIO()); o=await send({crm:{...base.crm,lifecycleStage:"customer"}}); ok(o.j.blocked.includes("audience_failed"),"wrong lifecycle blocked server-side");
sendEnv(); mock(CIO({lookup:()=>J({},500)})); o=await send(); ok(o.j.sent===false&&o.j.blocked.includes("audience_unverified"),"cannot verify audience -> no send");
sendEnv(); mock(CIO()); o=await send({simulate:true}); ok(o.j.sent===true&&true,"simulate flag is ignored for send (live lookup used)"); 
sendEnv(); delete process.env.CUSTOMERIO_APP_API_KEY; mock(CIO()); o=await send({simulate:true}); ok(o.j.sent===false&&o.j.blocked.includes("cio_not_configured")&&o.j.blocked.includes("simulated_data")===false,"no creds: blocked (simulation can never send)",o.j);
sendEnv({CUSTOMERIO_TRANSACTIONAL_MESSAGE_ID:""}); mock(CIO()); o=await send(); ok(o.j.blocked.includes("no_template"),"missing template id blocks");
sendEnv(); mock(CIO({send:()=>J({meta:{error:"boom"}},500)})); o=await send(); ok(o.s===502&&o.j.error.code==="CIO_SEND_FAILED","CIO send failure surfaced, not faked",o.j);
o=await send({subject:"",body:""}); ok(o.s===400,"empty draft rejected");
sendEnv(); mock(CIO()); o=await send({body:"x {{ customer.email }} {% y %}"}); const b2=JSON.parse(calls.find(c=>c.u.includes("/send/email")).o.body); ok(!/\{\{|\{%/.test(b2.body+b2.body_plain),"liquid stripped from sent body");
// rate limit (10/h per instance): we've sent a few already; push to the cap
sendEnv(); mock(CIO()); let blockedRate=false; for(let i=0;i<12;i++){ const x=await send(); if(x.j.blocked&&x.j.blocked.includes("rate_limited")) blockedRate=true; } ok(blockedRate,"rate limit engages");
globalThis.fetch=real; clear();
console.log(`LIFECYCLE tests: ${pass} passed, ${fail} failed`);
