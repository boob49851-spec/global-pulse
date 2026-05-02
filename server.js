require('dotenv').config()
const express=require("express")
const cors=require("cors")
const Parser=require("rss-parser")
const axios=require('axios')
const http=require('http')
const WebSocket=require('ws')
const app=express()
const server=http.createServer(app)
const wss=new WebSocket.Server({noServer:true})
const PORT=process.env.PORT||3000
const GNEWS_KEY=process.env.GNEWS_API_KEY||"8f0a8e4c4a7be6265898d40f8c7e54d3"
let connectedClients=[]
wss.on('connection',(ws)=>{
connectedClients.push(ws)
console.log(`[WebSocket] عميل جديد - العملاء: ${connectedClients.length}`)
ws.on('close',()=>{
connectedClients=connectedClients.filter(c=>c!==ws)
console.log(`[WebSocket] قطع اتصال - المتبقون: ${connectedClients.length}`)
})
ws.on('error',(err)=>{
console.error('[WebSocket] خطأ:',err.message)
})
})
function broadcastNews(articles){
const message=JSON.stringify({type:'news-update',data:articles})
connectedClients.forEach(client=>{
if(client.readyState===WebSocket.OPEN){
client.send(message)
}
})
}
app.use(cors({
origin:'*',
methods:['GET','POST','OPTIONS'],
allowedHeaders:['Content-Type','Authorization']
}))
app.use(express.json())
app.use(express.static(__dirname))
const parser=new Parser()
const rssSources=[
"https://www.defensenews.com/arc/outboundfeeds/rss/",
"https://www.militarytimes.com/arc/outboundfeeds/rss/",
"https://feeds.feedburner.com/warisboring",
"https://www.thedrive.com/the-war-zone/rss.xml",
"https://www.reuters.com/world/rss",
"https://feeds.bbci.co.uk/news/world/rss.xml",
"https://www.aljazeera.com/xml/rss/all.xml",
"https://www.understandingwar.org/rss.xml",
"https://asiatimes.com/feed/",
"https://news.google.com/rss/search?q=military+OR+war+OR+conflict&hl=en-US&gl=US&ceid=US:en",
"https://news.google.com/rss/search?q=geopolitics+OR+sanctions+OR+border+tension&hl=en-US&gl=US&ceid=US:en",
"https://news.google.com/rss/search?q=china+taiwan+OR+russia+ukraine+OR+iran+israel&hl=en-US&gl=US&ceid=US:en",
"https://news.yahoo.com/rss/world",
"https://news.yahoo.com/rss/military"
]
function analyzeThreat(text){
text=text.toLowerCase()
let score=0
const critical=["invasion","missile","airstrike","ballistic","nuclear","war declared"]
const high=["troops","military buildup","combat","clashes","bombing"]
const elevated=["sanctions","tension","border","drill","exercise"]
critical.forEach(k=>{if(text.includes(k))score+=3})
high.forEach(k=>{if(text.includes(k))score+=2})
elevated.forEach(k=>{if(text.includes(k))score+=1})
if(score>=6)return"CRITICAL"
if(score>=4)return"HIGH"
if(score>=2)return"ELEVATED"
return"LOW"
}
const postCache={}
const latestKnownIds={
'ynetalerts':59786,'fireisrael7777':436575,'orelabramov':3248,'orelabramov1':4347,
'lelotsenzura':91021,'israelcenzura':521643,'newsonlineils':81641,'NeWSnOw247':125225,
'Mivzakeybitachon2225':231840,'hotnews1':457758,'mdaisrael':23368,'Realtimesecurity1':102563,
'raknetooooo':83339,'rakhadashot':49740,'ramreports':206638,'merkaz':281596,'US2020US':41226,
'Intellinews':83400,'israel_yamin':94723,'kolisrael':213034,'GLOBAL_Telegram_MOKED':353720,
'AviationNewsIL':9655,'NewsArmy':54375,'inon_yttach':7453,'flashnewsssss':160674,
'News_cabinet_news':209948,'News_il_h':102118,'ziv710':42537,'newslivelverified':208082,
'koahadasotbatelegram':163408,'israelhayomofficial':71537,'NTD_Hebrew':19933,'secrets_news1':23505,
'IL_News2':1152327,'firstreportsnews':45573,'AANewsil':30072,'BackYardOfficial_tg':42170,
'israel_9':135811,'mignewscom':219072,'stranacoil':93841,'idfofficial':17925,'RocketAlert1':20282,
'presstv':186613,'OSINTdefender':18690,'Middle_East_Spectator':31336,'IranIntl_En':4718,
'alertisrael':4896,'QudsNen':220101,'timesofisraelpersian':10502,'farsnaEn':5524,
'FotrosResistancee':21180,'Alsaa_plus_EN':25266,'WarfareAnalysis':206723,'rnintel':59632,
'GeoPWatch':31623,'thecradlemedia':58051,'hamaswinner':13641,'TasnimNewsEN':54861,
'abualiexpress':120866,'dropsitenews':269,'France24_en':16545,'SaberinFa':68965,
'defapress_ir':56933,'sepah':63647,'wamnews_en':32034,'gulfnewsUAE':73227,'Alibk3':20003,
'aljazeeraglobal':132930,'bintjbeilnews':173182,'rybar':79684,'intelslava':86868,
'ClashReport':80314,'DDGeopolitics':182577,'militarywave':23520,'militarysummary':28036,
'southfronteng':60033,'AMK_Mapping':28941,'conflictshots':3945,'MilitaryNewsEN':36619,
'vestyisrael':170025,'NEWSruIsrael':109600,'JewishBreakingNewsTelegram':17377,'IsraeliDefence':41458,
'Israel_Hamas_2023':38097,'YEMEN_NEWS_21':206687,'SmiiLee_15':20812,'SmiiLee_13':20812,'ourwarstoday':44379
}
const channelList=[
'ynetalerts','fireisrael7777','orelabramov','orelabramov1','lelotsenzura','israelcenzura','newsonlineils','NeWSnOw247','Mivzakeybitachon2225','hotnews1','mdaisrael','Realtimesecurity1','raknetooooo','rakhadashot','ramreports','merkaz','US2020US','Intellinews','israel_yamin','kolisrael','GLOBAL_Telegram_MOKED','AviationNewsIL','NewsArmy','inon_yttach','flashnewsssss','News_cabinet_news','News_il_h','ziv710','newslivelverified','koahadasotbatelegram','israelhayomofficial','NTD_Hebrew','secrets_news1','IL_News2','firstreportsnews','AANewsil','BackYardOfficial_tg','israel_9','mignewscom','stranacoil','idfofficial','RocketAlert1','presstv','OSINTdefender','Middle_East_Spectator','IranIntl_En','alertisrael','QudsNen','timesofisraelpersian','farsnaEn','FotrosResistancee','Alsaa_plus_EN','WarfareAnalysis','rnintel','GeoPWatch','thecradlemedia','hamaswinner','TasnimNewsEN','abualiexpress','dropsitenews','France24_en','SaberinFa','defapress_ir','sepah','wamnews_en','gulfnewsUAE','Alibk3','aljazeeraglobal','bintjbeilnews','rybar','intelslava','ClashReport','DDGeopolitics','militarywave','militarysummary','southfronteng','AMK_Mapping','conflictshots','MilitaryNewsEN','vestyisrael','NEWSruIsrael','JewishBreakingNewsTelegram','IsraeliDefence','Israel_Hamas_2023','YEMEN_NEWS_21','SmiiLee_15','SmiiLee_13','ourwarstoday'
]
async function fetchPost(channel,postId){
const cacheKey=`${channel}/${postId}`
if(postCache[cacheKey]!==undefined)return postCache[cacheKey]
try{
await new Promise(resolve=>setTimeout(resolve,Math.random()*2000+1000))
const res=await axios.get(`https://t.me/${channel}/${postId}?embed=1&mode=tme`,{
headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'},
timeout:15000
})
const html=res.data
const textMatch=html.match(/<div class="tgme_widget_message_text[^>]*>(.*?)<\/div>/s)
if(!textMatch){postCache[cacheKey]=null;return null}
let text=textMatch[1]
.replace(/<br\s*\/?>/gi,' ')
.replace(/<[^>]+>/g,'')
.replace(/&amp;/g,'&')
.replace(/&lt;/g,'<')
.replace(/&gt;/g,'>')
.replace(/&quot;/g,'"')
.replace(/&#39;/g,"'")
.replace(/&#036;/g,'$')
.replace(/\s+/g,' ')
.trim()
const dateMatch=html.match(/<time[^>]*datetime="([^"]+)"/)
const date=dateMatch?dateMatch[1]:new Date().toISOString()
if(!text){postCache[cacheKey]=null;return null}
const result={text,date}
postCache[cacheKey]=result
console.log(`✓ Telegram: ${channel}/${postId}`)
return result
}catch(e){
console.log(`✗ Telegram: ${channel}/${postId} - ${e.message}`)
postCache[cacheKey]=null
return null
}
}
async function findLatestPostId(channel){
const knownId=latestKnownIds[channel]||1000
let searchId=knownId
const JUMP_SIZES=[1000,500,100,50,20]
for(const jump of JUMP_SIZES){
let foundHigher=false
for(let i=0;i<3;i++){
const testId=searchId+jump
const result=await fetchPost(channel,testId)
if(result){
searchId=testId
foundHigher=true
latestKnownIds[channel]=searchId
}else{break}
}
if(!foundHigher)break
}
let latest=searchId
for(let i=1;i<=20;i++){
const result=await fetchPost(channel,searchId+i)
if(result){
latest=searchId+i
latestKnownIds[channel]=latest
}else{break}
}
return latest
}
async function fetchTelegramNews(){
const telegramArticles=[]
const channelResults=await Promise.allSettled(
channelList.map(async(channel)=>{
try{
const latestId=await findLatestPostId(channel)
const ids=[latestId,latestId-1,latestId-2].filter(id=>id>0)
const results=await Promise.allSettled(ids.map(id=>fetchPost(channel,id)))
const posts=[]
results.forEach((r,i)=>{
if(r.status==='fulfilled'&&r.value){
posts.push({
title:r.value.text.substring(0,150),
description:r.value.text.substring(0,200),
content:r.value.text,
url:`https://t.me/${channel}/${ids[i]}`,
source:{name:`Telegram - ${channel}`},
publishedAt:r.value.date||new Date().toISOString(),
image:null,
gnewsCategory:'world'
})
}
})
return posts
}catch(err){
console.error(`[Telegram] خطأ في ${channel}:`,err.message)
return[]
}
})
)
for(const result of channelResults){
if(result.status==='fulfilled'){
telegramArticles.push(...result.value)
}
}
console.log(`[Telegram] جلب ${telegramArticles.length} منشور`)
return telegramArticles
}
app.get("/api/news",async(req,res)=>{
let articles=[]
try{
const telegramNews=await fetchTelegramNews()
articles=[...telegramNews]
}catch(e){
console.error('[Telegram] خطأ عام:',e.message)
}
for(const url of rssSources){
try{
const feed=await parser.parseURL(url)
feed.items.slice(0,40).forEach(item=>{
const threat=analyzeThreat(item.title+" "+(item.contentSnippet||""))
articles.push({
title:item.title,
summary:item.contentSnippet||"",
description:item.contentSnippet||"",
url:item.link,
source:{name:feed.title||"RSS"},
threat:threat,
publishedAt:item.pubDate||new Date().toISOString(),
gnewsCategory:'world'
})
})
}catch(e){
console.error('[RSS] خطأ:',url,e.message)
}
}
try{
const queries=[
"military OR war OR conflict OR invasion OR missile",
"geopolitics OR sanctions OR border tension",
"navy OR air force OR army OR defense",
"china taiwan OR russia ukraine OR iran israel",
"nato OR middle east OR south china sea",
"oil crisis OR trade war OR military buildup"
]
for(const q of queries){
try{
const gnewsRes=await axios.get(`https://gnews.io/api/v4/search`,{
params:{
q:q,
lang:'en',
max:20,
apikey:GNEWS_KEY
},
timeout:10000
})
const data=gnewsRes.data
if(data.articles){
data.articles.forEach(a=>{
const threat=analyzeThreat(a.title+" "+(a.description||""))
articles.push({
title:a.title,
summary:a.description||"",
description:a.description||"",
url:a.url,
source:{name:a.source?.name||"GNews"},
threat:threat,
publishedAt:a.publishedAt||new Date().toISOString(),
gnewsCategory:'world'
})
})
}
}catch(e){
console.error('[GNews] خطأ في query:',q,e.message)
}
}
}catch(e){
console.error('[GNews] خطأ عام:',e.message)
}
const seen=new Set()
articles=articles.filter(a=>{
if(!a.title)return false
if(seen.has(a.title))return false
seen.add(a.title)
return true
})
articles.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt))
broadcastNews(articles)
res.json(articles)
})
app.get('/health',(req,res)=>{
res.json({status:'ok',clients:connectedClients.length,time:new Date().toISOString()})
})
app.get('*',(req,res)=>{
res.sendFile(__dirname+'/index.html')
})
server.on('upgrade',(request,socket,head)=>{
wss.handleUpgrade(request,socket,head,(ws)=>{
wss.emit('connection',ws,request)
})
})
setInterval(async()=>{
try{
const freshTg=await fetchTelegramNews()
if(freshTg.length>0){
broadcastNews(freshTg)
}
}catch(e){
console.error('[Interval] خطأ:',e.message)
}
},60000)
server.listen(PORT,()=>{
console.log(`[Server] يعمل على المنفذ ${PORT}`)
console.log(`[WebSocket] جاهز`)
})