// Canvas drawing primitives and fitCv (HiDPI canvas sizing).

// ================= DRAW HELPERS =================
function R(c,x,y,w,h,f,ns){c.fillStyle=f;c.fillRect(x,y,w,h);if(!ns)c.strokeRect(x,y,w,h);}
function ln(c,a,b,d,e){c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.stroke();}
function poly(c,pts,f,ns){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fillStyle=f;c.fill();if(!ns)c.stroke();}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function circ(c,x,y,r,f,ns){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=f;c.fill();if(!ns)c.stroke();}
function ell(c,x,y,rx,ry,f){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=f;c.fill();}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt)));return '#'+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1);}
function star(c,x,y,s,col){c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=i%2?s*.35:s;c.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}c.closePath();c.fillStyle=col;c.fill();}
function fitCv(cv){const r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);const w=Math.max(1,r.width),h=Math.max(1,r.height);const W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return{c,w,h};}

export { R, ln, poly, rr, circ, ell, shade, star, fitCv };
