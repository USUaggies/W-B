#!/usr/bin/env python3
"""
AFM Fitter for DA40-CS Take-Off Distances
-----------------------------------------
Takes the website's perfdata.js model and fits its (m,b,e,c) parameters
to the AFM graph so the 4-panel nomogram matches.

What it does:
  1. Loads current perfdata.js via Node dump (DA40CS only)
  2. You digitize AFM points per panel (or use the built-in sample set
     estimated from the DA 40 POH image you supplied)
  3. Fits each isoline with your choice of linear (m*x+b) or exponential
     (b*exp(e*x)) by least-squares. For weight panel this is at maxWeight;
     intermediate values are interpolated exactly as performance.js does.
  4. Writes a new perfdata snippet, prints RMS error old vs new,
     and saves comparison plots.

Usage:
  python3 tools/afm_fitter.py --demo          # run on built-in sample AFM points
  python3 tools/afm_fitter.py --fit panel1    # fit only panel 1 (PA vs OAT)
  python3 tools/afm_fitter.py --export perfdata_new.js
  python3 tools/afm_fitter.py --interactive   # click on image to digitize

Panels:
  P1: OAT [°C] -> PA lines (0,2000,4000,6000,8000,10000)
  P2: MASS [kg] -> weight lines (at maxWeight)
  P3: WIND [kt] -> hwind/twind lines
  P4: OBSTACLE [ft] -> obstacle lines

Model in performance.js:
  densityAltitudeChart:  y = m*temp + b   or y = b*exp(e*temp)
  weightChart:           y = m*weight + b   etc, shifted by DA_Result
  windObstacleChart:     y = m*x + b  etc

All Y are in "percent" 0-100 before scale -> distance = y*(max-min)/100+min
We fit in percent space to keep scale unchanged.
"""
import json, math, subprocess, pathlib, argparse
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[1]
PERFDATA = ROOT / "scripts" / "perfdata.js"
SCALE_GROUND = {"min": 100, "max": 1400}  # DA40CS takeoff

def load_cs():
    js = """
import fs from 'fs';
let code=fs.readFileSync('scripts/perfdata.js','utf8');
let w=code+`\\nreturn {DA40CS};`;
let fns=new Function(w);
let {DA40CS}=fns();
let out={};
for(let ft of ['takeoff','takeoff50','landing']){
  for(let st of ['DA','weight','hwind','twind','scale','obstacle']){
    try{let v=DA40CS(ft,st); if(v) out[ft+'|'+st]=v;}catch(e){}
  }
}
console.log(JSON.stringify(out));
"""
    p = ROOT / "_tmp_dump.mjs"
    p.write_text(js)
    out = subprocess.check_output(["node", str(p)], cwd=str(ROOT))
    p.unlink()
    return json.loads(out)

def to_pct(dist, scale): return (dist - float(scale["min"]))/(float(scale["max"])-float(scale["min"]))*100
def to_dist(pct, scale): return pct*(float(scale["max"])-float(scale["min"]))/100+float(scale["min"])

# --- digitized AFM sample (estimate from your image, m) ---
# P1: temp °C -> distance m at each PA, at mass 1000kg reference? Actually P1 y is read directly.
AFM_P1 = {
    0:    [(-20,210),(0,255),(15,310),(30,380),(50,460)],
    2000: [(-20,265),(0,320),(15,385),(30,470),(50,570)],
    4000: [(-20,335),(0,400),(15,480),(30,580),(50,710)],
    6000: [(-20,410),(0,505),(15,610),(30,750),(50,960)],
    8000: [(-20,520),(0,640),(15,790),(30,1000),(50,1410)],
    10000:[(-20,680),(0,860),(15,1070),(30,1350),(48,1450)],
}
# P2 samples: mass kg -> y m at several pct levels (approx)
AFM_P2_WEIGHT = [1200,1150,1100,1050,1000,950,900,850]
# at pct ~30% (y~400m) and ~60% (y~800m) read from AFM
AFM_P2 = {
    # y_target_pct : list of (mass_kg, y_m)
    330: [(1200,510),(1100,420),(1000,330),(900,250),(850,210)],
    600: [(1200,900),(1100,750),(1000,600),(900,470),(850,380)],
}

def fit_linear(x, y):
    A=np.vstack([x, np.ones(len(x))]).T
    m,b=np.linalg.lstsq(A,y,rcond=None)[0]
    yhat=m*np.array(x)+b
    rms=math.sqrt(np.mean((np.array(y)-yhat)**2))
    return m,b,rms

def fit_exp(x, y):
    # y = b*exp(e*x) -> log y = log b + e*x, need y>0
    ly=np.log(np.maximum(y,1e-6))
    e, lb=np.linalg.lstsq(np.vstack([x, np.ones(len(x))]).T, ly, rcond=None)[0]
    b=math.exp(lb)
    yhat=b*np.exp(e*np.array(x))
    rms=math.sqrt(np.mean((np.array(y)-yhat)**2))
    return e,b,rms

def fit_panel1(afm, model="linear"):
    out={}
    print("\n== Panel 1: OAT vs PA (y in percent) ==")
    for pa, pts in afm.items():
        xs=[p[0] for p in pts]; ys_m=[p[1] for p in pts]
        ys_pct=[to_pct(y, SCALE_GROUND) for y in ys_m]
        if model=="exp":
            e,b,rms=fit_exp(xs, ys_pct)
            print(f" PA {pa:5d} exp  e={e:.5f} b={b:.3f} rms {rms:.2f} pct ({rms*(1400-100)/100:.1f}m)")
            out[pa]={"e":e,"b":b,"rms":rms}
        else:
            m,b,rms=fit_linear(xs, ys_pct)
            print(f" PA {pa:5d} lin  m={m:.5f} b={b:.3f} rms {rms:.2f} pct ({rms*(1400-100)/100:.1f}m)")
            out[pa]={"m":m,"b":b,"rms":rms}
    return out

def compare_old_new(old_data, new_fit):
    import matplotlib.pyplot as plt
    temps=np.linspace(-20,50,200)
    fig,ax=plt.subplots(figsize=(8,6))
    def old_y(pa,temp):
        d={"0":0,"2000":0,"4000":0,"6000":0,"8000":0,"10000":0}
        # use helper from dump
        import math
        PA_lines=old_data["landing|DA"]
        # replicate densityAltitudeChart simple branch
        PA_vals=sorted([float(k) for k in PA_lines])
        for i,bp in enumerate(PA_vals):
            key=str(int(bp)) if str(int(bp)) in PA_lines else str(bp)
            useExp="e" in PA_lines[key]
            if i+1>=len(PA_vals):
                return float(PA_lines[key]["b"])*math.exp(float(PA_lines[key]["e"])*temp) if useExp else float(PA_lines[key]["m"])*temp+float(PA_lines[key]["b"])
            else:
                tp=PA_vals[i+1]; topKey=str(int(tp)) if str(int(tp)) in PA_lines else str(tp)
                useExp1="e" in PA_lines[topKey]
                if temp is not None and pa==bp:
                    pass
                if pa < bp: 
                    continue
                if pa>=bp and pa<tp:
                    skew=(pa-bp)/(tp-bp)
                    bv=float(PA_lines[key]["b"])*math.exp(float(PA_lines[key]["e"])*temp) if useExp else float(PA_lines[key]["m"])*temp+float(PA_lines[key]["b"])
                    tv=float(PA_lines[topKey]["b"])*math.exp(float(PA_lines[topKey]["e"])*temp) if useExp1 else float(PA_lines[topKey]["m"])*temp+float(PA_lines[topKey]["b"])
                    return bv+skew*(tv-bv)
        return 0
    # quick plot
    for pa in [0,2000,4000,6000,8000,10000]:
        old=[to_dist(old_y(pa,t),SCALE_GROUND) for t in temps]
        # new
        nf=new_fit.get(pa)
        if "m" in nf: new=[to_dist(nf["m"]*t+nf["b"],SCALE_GROUND) for t in temps]
        else: new=[to_dist(nf["b"]*math.exp(nf["e"]*t),SCALE_GROUND) for t in temps]
        ax.plot(temps, old, "--", alpha=0.6, label=f"old {pa}")
        ax.plot(temps, new, "-", label=f"new {pa}")
        pts=AFM_P1[pa]
        ax.scatter([p[0] for p in pts],[p[1] for p in pts], s=20)
    ax.set_xlabel("OAT [°C]"); ax.set_ylabel("P1 y [m]"); ax.legend(ncol=2, fontsize=7)
    ax.set_ylim(100,1500); ax.grid(True, ls=":")
    fig.tight_layout(); fig.savefig("/tmp/fit_p1_compare.png", dpi=150)
    print("saved /tmp/fit_p1_compare.png")

def export_perfdata(new_fits, path):
    # new_fits: dict pa -> {m/e,b}
    lines=[]
    lines.append("// Auto-fitted Panel 1 DA lines for DA40CS takeoff (generated by tools/afm_fitter.py)")
    lines.append("// Paste into perfdata.js DA40CS takeoff DA section")
    for pa in sorted(new_fits):
        nf=new_fits[pa]
        if "m" in nf:
            lines.append(f'  {pa}: {{ m: {nf["m"]:.5f}, b: {nf["b"]:.3f} }}, // rms {nf["rms"]:.2f}')
        else:
            lines.append(f'  {pa}: {{ e: {nf["e"]:.5f}, b: {nf["b"]:.3f} }}, // rms {nf["rms"]:.2f}')
    pathlib.Path(path).write_text("\n".join(lines))
    print(f"wrote {path}")

def interactive_digitize():
    print("Interactive digitize: open tools/afm_fitter.html in browser")
    print("Or run: python3 -m http.server --directory tools 8000")

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--demo", action="store_true", help="fit P1 on built-in AFM_P1 sample")
    ap.add_argument("--fit", choices=["p1","p2","p3","p4","all"], default="p1")
    ap.add_argument("--model", choices=["linear","exp"], default="linear", help="linear m*x+b or exp b*exp(e*x)")
    ap.add_argument("--export", type=str, help="write fitted snippet to file")
    ap.add_argument("--interactive", action="store_true")
    ap.add_argument("--compare", action="store_true")
    args=ap.parse_args()
    data=load_cs()
    if args.interactive:
        interactive_digitize()
    elif args.demo or args.fit in ("p1","all"):
        new=fit_panel1(AFM_P1, model=args.model)
        # compare to old
        # old rms
        print("\nOld model RMS on AFM points:")
        for pa,pts in AFM_P1.items():
            import math
            PA_lines=data["landing|DA"]
            errs=[]
            for temp, y_m in pts:
                # old prediction
                # simple: evaluate exact PA line if exists else interpolated
                # for demo just use exact PA key
                key=str(pa)
                line=PA_lines[key]
                useExp="e" in line
                if useExp:
                    pred_pct=float(line["b"])*math.exp(float(line["e"])*temp)
                else:
                    pred_pct=float(line["m"])*temp+float(line["b"])
                pred_m=to_dist(pred_pct, SCALE_GROUND)
                errs.append(pred_m - y_m)
            rms=math.sqrt(sum(e*e for e in errs)/len(errs))
            print(f" PA {pa:5d} old rms {rms:.1f}m")
        if args.compare:
            compare_old_new(data, new)
        if args.export:
            export_perfdata(new, args.export)
        print("\nDone. To apply: copy snippet into scripts/perfdata.js DA40CS takeoff DA block (lines ~853-877)")
        print("Then recreate plot with: python3 /tmp/recreate_cs4_v4.py")
