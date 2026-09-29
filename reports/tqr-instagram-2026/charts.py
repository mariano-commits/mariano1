import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt, matplotlib.dates as md
from datetime import datetime, timedelta, date
from data import POSTS
from captions import CAPS
from daily import REACH
BLUE="#2a78d6"; ORANGE="#eb6834"; INK="#0b0b0b"; INK2="#52514e"; GRID="#e4e3df"; GRAY="#9b9a95"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":9,"axes.edgecolor":GRID,"axes.labelcolor":INK2,
 "xtick.color":INK2,"ytick.color":INK2,"axes.spines.top":False,"axes.spines.right":False,"axes.grid":True,
 "grid.color":GRID,"grid.linewidth":0.6,"axes.axisbelow":True,"axes.titlecolor":INK,"axes.titlesize":10,"axes.titleweight":"bold","axes.titlelocation":"left"})
def post_dt(p): return datetime.fromisoformat(p[0])-timedelta(hours=3)

# 1 daily reach
fig,ax=plt.subplots(figsize=(7.2,2.8),dpi=200)
d=[x for x,_ in REACH]; v=[y for _,y in REACH]
ax.fill_between(d,v,color=BLUE,alpha=.15,lw=0); ax.plot(d,v,color=BLUE,lw=1.4,label="Alcance diario de la cuenta")
for p in POSTS:
    ax.axvline(post_dt(p).date(),color=ORANGE,lw=.8,alpha=.7)
ax.plot([],[],color=ORANGE,lw=.8,label="Publicación en feed")
for a,b,t in [(date(2026,3,10),date(2026,5,9),"10 mar – 9 may\n~1.885/día"),(date(2026,8,5),date(2026,8,16),"5–16 ago\n~2.595/día"),(date(2026,5,28),date(2026,9,28),"")]:
    pass
ax.annotate("10 mar – 9 may: prom. 1.885/día",xy=(date(2026,4,10),4300),ha="center",color=INK2,fontsize=8)
ax.annotate("5–16 ago: prom. 2.595/día",xy=(date(2026,8,10),6150),ha="center",color=INK2,fontsize=8)
ax.annotate("Sin publicaciones desde 27 may",xy=(date(2026,7,5),900),ha="center",color=INK2,fontsize=8)
ax.set_ylim(0,6800); ax.xaxis.set_major_formatter(md.DateFormatter("%b")); ax.set_title("Alcance diario de la cuenta vs. publicaciones (ene–sep 2026)")
ax.legend(frameon=False,loc="upper left",fontsize=8); fig.tight_layout(); fig.savefig("c1_daily.png"); plt.close()

# 2 reach per post
fig,ax=plt.subplots(figsize=(7.2,2.8),dpi=200)
for t,c,l in [("REEL",BLUE,"Reel"),("CAROUSEL",ORANGE,"Carrusel")]:
    xs=[post_dt(p) for p in POSTS if p[1]==t]; ys=[p[2] for p in POSTS if p[1]==t]
    ax.scatter(xs,ys,s=34,color=c,edgecolor="white",linewidth=1.5,label=l,zorder=3)
for p in POSTS:
    if p[15].startswith(("15.000","TQR no es","Esto no es")): ax.annotate(p[15][:22],(post_dt(p),p[2]),xytext=(6,4),textcoords="offset points",fontsize=7.5,color=INK2)
ax.axvline(datetime(2026,3,5),color=GRAY,lw=.8,ls="--"); ax.text(datetime(2026,3,7),600,"Prom. antes: 351\nPromedio desde 5 mar: 182",fontsize=7.5,color=INK2)
ax.set_ylabel("Alcance del post"); ax.xaxis.set_major_formatter(md.DateFormatter("%d %b")); ax.set_ylim(0,720)
ax.set_title("Alcance por publicación (2026)"); ax.legend(frameon=False,fontsize=8,loc="upper right"); fig.tight_layout(); fig.savefig("c2_posts.png"); plt.close()

# 3 formats small multiples
import statistics as st
R=[p for p in POSTS if p[1]=="REEL"]; C=[p for p in POSTS if p[1]=="CAROUSEL"]
er=lambda g: st.mean((p[4]+p[5]+p[6]+p[7])/p[2]*100 for p in g)
metrics=[("Alcance mediano",st.median(p[2] for p in R),st.median(p[2] for p in C),"{:.0f}"),
         ("Alcance promedio",st.mean(p[2] for p in R),st.mean(p[2] for p in C),"{:.0f}"),
         ("ER promedio / alcance (%)",er(R),er(C),"{:.1f}%")]
fig,axs=plt.subplots(1,3,figsize=(7.2,2.3),dpi=200)
for ax,(t,a,b,f) in zip(axs,metrics):
    bars=ax.bar(["Reel\n(n=10)","Carrusel\n(n=11)"],[a,b],color=[BLUE,ORANGE],width=.55)
    for bb,val in zip(bars,[a,b]): ax.text(bb.get_x()+bb.get_width()/2,val,f.format(val),ha="center",va="bottom",fontsize=8.5,color=INK)
    ax.set_title(t,fontsize=9); ax.set_ylim(0,max(a,b)*1.25); ax.grid(axis="x",visible=False)
fig.tight_layout(); fig.savefig("c3_formats.png"); plt.close()

# 4 skip rate vs ER (reels)
fig,ax=plt.subplots(figsize=(7.2,2.6),dpi=200)
for p in R:
    e=(p[4]+p[5]+p[6]+p[7])/p[2]*100
    ax.scatter(p[11]*100,e,s=36,color=BLUE,edgecolor="white",linewidth=1.5,zorder=3)
    ax.annotate(p[15][:24],(p[11]*100,e),xytext=(5,-10) if p[15].startswith("Cierre") else (5,3),textcoords="offset points",fontsize=7,color=INK2)
ax.set_xlabel("Skip rate (% que abandona en <3 s)"); ax.set_ylabel("ER sobre alcance (%)")
ax.set_title("Reels: retención inicial vs. engagement"); ax.set_xlim(30,97); fig.tight_layout(); fig.savefig("c4_skip.png"); plt.close()

# 5 audience age
ages=["13-17","18-24","25-34","35-44","45-54","55-64","65+"]
F=[3,21,76,95,117,42,6]; M=[1,20,111,150,180,68,23]; U=[3,14,18,17,26,3,3]
tot=[f+m+u for f,m,u in zip(F,M,U)]; T=sum(tot)
fig,ax=plt.subplots(figsize=(7.2,2.3),dpi=200)
bars=ax.bar(ages,[t/T*100 for t in tot],color=BLUE,width=.6)
for b_,t in zip(bars,tot): ax.text(b_.get_x()+b_.get_width()/2,t/T*100,f"{t/T*100:.0f}%",ha="center",va="bottom",fontsize=8)
ax.set_ylabel("% seguidores"); ax.set_title(f"Seguidores por edad (n={T})"); ax.grid(axis="x",visible=False); ax.set_ylim(0,40)
fig.tight_layout(); fig.savefig("c5_age.png"); plt.close()
print("charts ok", T)
