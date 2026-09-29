from data import POSTS
from datetime import datetime, timedelta
import statistics as st
rows=[]
for p in POSTS:
    d=datetime.fromisoformat(p[0])-timedelta(hours=3)
    er=(p[4]+p[5]+p[6]+p[7])/p[2]*100
    rows.append(dict(dt=d,type=p[1],reach=p[2],views=p[3],likes=p[4],com=p[5],saves=p[6],sh=p[7],eng=p[4]+p[5]+p[6]+p[7],er=er,watch=p[10],skip=p[11],tema=p[12],cta=p[13],chars=p[14],t=p[15]))
def s(g,l):
    print(l,"n=",len(g),"reach avg",round(st.mean(r['reach'] for r in g)),"med",st.median(r['reach'] for r in g),
          "ER avg",round(st.mean(r['er'] for r in g),2),"eng tot",sum(r['eng'] for r in g),"saves",sum(r['saves'] for r in g),"sh",sum(r['sh'] for r in g))
s(rows,"ALL")
for t in ["REEL","CAROUSEL"]: s([r for r in rows if r['type']==t],t)
for m in range(1,6): 
    g=[r for r in rows if r['dt'].month==m]; s(g,f"mes{m}")
s([r for r in rows if r['dt']<datetime(2026,3,5)],"Ene-3mar")
s([r for r in rows if r['dt']>=datetime(2026,3,5)],"desde 5mar")
s([r for r in rows if 'Palabra' in r['cta'] or r['cta']=='Comentá'],"CTA comentario")
s([r for r in rows if r['cta'] in('Sin CTA','Suave (pregunta)')],"sin CTA/suave")
s([r for r in rows if r['cta'] in('Escribinos','Consultanos','Conocé','Demo','Te mostramos')],"CTA DM")
s([r for r in rows if r['chars']<=200],"cap<=200")
s([r for r in rows if r['chars']>200 and r['chars']<=350],"200-350")
s([r for r in rows if r['chars']>350],"cap>350")
s([r for r in rows if 'Evento real' in r['tema']],"evento real")
s([r for r in rows if 'Evento real' not in r['tema']],"no evento real")
for b,f in [("mañana 9-13",lambda h:h<14),("tarde 18-20",lambda h:18<=h<=20)]:
    s([r for r in rows if f(r['dt'].hour)],b)
wd={}
for r in rows: wd.setdefault(r['dt'].strftime('%a'),[]).append(r)
for k,g in wd.items(): s(g,"dia "+k)
print("hours",[ (r['dt'].strftime('%m-%d %a %H:%M'),r['type'],r['reach']) for r in rows])
reels=[r for r in rows if r['type']=='REEL']
print("skip vs er", [(r['t'][:20],r['skip'],round(r['watch']/1000,1),round(r['er'],1),r['reach']) for r in sorted(reels,key=lambda r:r['skip'])])
print("sorted ER",[(r['t'][:25],r['type'],round(r['er'],1),r['reach']) for r in sorted(rows,key=lambda r:-r['er'])])
print("views/reach reel",round(sum(r['views'] for r in reels)/sum(r['reach'] for r in reels),2))
top2=[r for r in rows if r['t'].startswith(('TQR no es','15.000'))]
print("top2 share of saves", sum(r['saves'] for r in top2), sum(r['saves'] for r in rows), "eng", sum(r['eng'] for r in top2), sum(r['eng'] for r in rows))
