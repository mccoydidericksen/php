function fileUploadBehavior(t, e) {
    eventCancel(t);
    var i = t.dataTransfer.files;
	var filecount = i.length;
    e = getObject(e);
    var o = e.id + "_original",
        n = document.createElement("div");
    if (n.style.display = "none", n.innerHTML = getText(e), n.setAttribute("id", o), e.parentNode.appendChild(n), setText(e, "Preparing to Upload " + filecount + " Files..."), void 0 != e.getAttribute("_max")) {
        var r = Math.round(e.getAttribute("_max"));
        if (filecount > r) {
            var s = "You can only upload " + r + "files at a time.";
            return void 0 != e.getAttribute("_maxmsg") && (s = e.getAttribute("_maxmsg")), alert(s), void 0
        }
    }
    if (void 0 != e.getAttribute("_min")) {
        var d = Math.round(e.getAttribute("_min"));
        if (d > filecount) {
            var s = "You must upload at least " + r + "files at a time.";
            return void 0 != e.getAttribute("_minmsg") && (minmsg = e.getAttribute("_minmsg")), alert(minmsg), void 0
        }
    }
    var l = 0;
    e.setAttribute("_uploadcount", 0), e.setAttribute("_uploadedcount", 0);
    for (c = 0; c < filecount; c++) {
		var u=i[c];
        if (void 0 != e.getAttribute("_mask_type")) {
            var v = e.getAttribute("_mask_type"),
                h = new RegExp(v, "i");
            if (0 == h.test(u.type)) {
                var p = u.name + " is an invalid filetype";
                return void 0 != e.getAttribute("_mask_typemsg") && (p = e.getAttribute("_mask_typemsg")), alert(p), void 0
            }
        }
        if (void 0 != e.getAttribute("_mask_name")) {
            var v = e.getAttribute("_mask_name"),
                h = new RegExp(v, "i");
            if (0 == h.test(u.name)) {
                var p = u.name + " is an invalid filename";
                return void 0 != e.getAttribute("_mask_namemsg") && (p = e.getAttribute("_mask_namemsg")), alert(p), void 0
            }
        }
        if (void 0 != e.getAttribute("_maxsize")) {
            var _ = Math.round(e.getAttribute("_maxsize"));
            if (u.size > _) {
                var p = u.name + " is too big";
                return void 0 != e.getAttribute("_maxsizemsg") && (p = e.getAttribute("_maxsizemsg")), alert(p), void 0
            }
        }
        if (void 0 != e.getAttribute("_minsize")) {
            var _ = Math.round(e.getAttribute("_minsize"));
            if (u.size < _) {
                var p = u.name + " is too small";
                return void 0 != e.getAttribute("_minsizemsg") && (p = e.getAttribute("_minsizemsg")), alert(p), void 0
            }
        }
        var g = c + 1;
        l += 1, fileUploadPost(u, e, g, filecount)
    }
    e.setAttribute("_uploadcount", l)
}

function fileUploadPost(t, e, i, a) {
    var o = new XMLHttpRequest;
    e = getObject(e);
    var n = i + "-" + a + "_" + (new Date).getTime(),
        r = "upload" + n,
        s = document.createElement("div");
    s.style.height = "10px", s.style.width = "2px", s.style.backgroundColor = "#f1a538", s.style.border = "1px solid #d5762b", s.style.marginBottom = "1px", s.setAttribute("id", r), e.appendChild(s);
    //add a title so we can tell what file is uploading
	s.setAttribute('title',t.name);
	//determine where to post to
	var url = e.getAttribute("data-action") || e.getAttribute("data-url");
    if (void 0 == url || !url.length) {
        url = location.href;
        var l = url.split("?");
        url = l[0]
    }
    for (var u = new FormData, c = "file", v = "", h = "", p = 0; p < e.attributes.length; p++) {
        var _ = e.attributes.item(p).nodeName,
            g = e.attributes.item(p).value;
        "_fileupload" == _ ? c = g : "_path" == _ ? v = g : "_id" == _ ? h = g : /^\_(fileupload|behavior|action|min|fields|filter|id|minmsg|max|maxmsg|path)$/.test(_) || /^(class|style)$/.test(_) || u.append(_, g)
    }
    if (v.length && u.append(c + "_path", v), h.length) {
        u.append(c + "_remove", "1"), u.append("_action", "edit"), u.append("_id", h);
        var f = c + "," + c + "_width," + c + "_height";
        void 0 != e.getAttribute("_fields") && (f = e.getAttribute("_fields")), u.append("_fields", f)
    } else u.append("_action", "add");
    u.append(c, t), m = e.getAttribute("_onprogress"), void 0 != m && m.length ? o.upload.addEventListener("progress", m, !1) : o.upload.addEventListener("progress", function (t) {
        fileUploadProgress(t, e, r)
    }, !1);
    var m = e.getAttribute("_onstart");
    return void 0 != m && m.length ? o.upload.addEventListener("loadstart", m, !1) : o.upload.addEventListener("loadstart", function (t) {
        fileUploadStart(t, e, r, i, a)
    }, !1), o.upload.addEventListener("load", function (t) {
        fileUploadSuccess(t, e, r, i, a)
    }, !1), m = e.getAttribute("_onerror"), void 0 != m && m.length ? o.upload.addEventListener("error", m, !1) : o.upload.addEventListener("error", function (t) {
        fileUploadError(t, e, r, i, a)
    }, !1), m = e.getAttribute("_onabort"), void 0 != m && m.length ? o.upload.addEventListener("abort", m, !1) : o.upload.addEventListener("abort", function (t) {
        fileUploadAbort(t, e, r, i, a)
    }, !1), o.open("POST", url, !0), o.send(u), o.responseText
}

function fileUploadStart() {}

function fileUploadSuccess(evt, div, uploadId, fn, ft) {
    div = getObject(div);
    var uploaded = Math.round(div.getAttribute("_uploadedcount"));
    uploaded += 1, div.setAttribute("_uploadedcount", uploaded);
    var upload = Math.round(div.getAttribute("_uploadcount"));
    //check for data-finished and call it
	if (void 0 != div.getAttribute("data-finished")) {
        var evalstr = div.getAttribute("data-finished");
        evalstr.length && eval(evalstr);
    }
    if (void 0 != div.getAttribute("_onsuccess")) {
        var evalstr = div.getAttribute("_onsuccess");
        evalstr.length && eval(evalstr)
    }
    if (upload == uploaded && (div = getObject(div), setText(div, getText(div.id + "_original")), void 0 != div.getAttribute("_onfinish"))) {
        var evalstr = div.getAttribute("_onfinish");
        evalstr.length && eval(evalstr)
    }
}

function fileUploadFinish(t) {
    setText(t, "Drag to Upload")
}

function fileUploadError(t, e, i) {
    console.log("Upload Error: " + i)
}

function fileUploadAbort() {}

function fileUploadProgress(t,e,r) {
	o = getObject(r);
	if(undefined == o){return;}
    var a = Math.round(t.loaded / t.total * 100);
    o.style.width = a + "px";
}

function eventCancel(t) {
    t.stopPropagation(), t.preventDefault()
}
var SignaturePad = function (t) {
    "use strict";
    var e = function (e, i) {
        var a = this,
            o = i || {};
        if (this.velocityFilterWeight = o.velocityFilterWeight || .7, this.minWidth = o.minWidth || .5, this.maxWidth = o.maxWidth || 2.5, this.dotSize = o.dotSize || function () {
            return (this.minWidth + this.maxWidth) / 2
        }, this.penColor = o.penColor || "black", this.backgroundColor = o.backgroundColor || "rgba(0,0,0,0)", this._canvas = e, this._ctx = e.getContext("2d"), this.clear(), this._mouseButtonDown = !1, e.addEventListener("mousedown", function (t) {
            if (1 === t.which) {
                a._mouseButtonDown = !0, a._reset();
                var e = a._createPoint(t);
                a._addPoint(e)
            }
        }), e.addEventListener("mousemove", function (t) {
            if (a._mouseButtonDown) {
                var e = a._createPoint(t);
                a._addPoint(e)
            }
        }), t.addEventListener("mouseup", function (t) {
            if (1 === t.which && a._mouseButtonDown) {
                a._mouseButtonDown = !1;
                var e = a.points.length > 2,
                    i = a.points[0],
                    o = a._ctx,
                    n = "function" == typeof a.dotSize ? a.dotSize.call(a) : a.dotSize;
                !e && i && (o.beginPath(), a._drawPoint(i.x, i.y, n), o.closePath(), o.fill()), a.saveSignature()
            }
        }), void 0 != a._canvas.id) {
            let ctx=this._ctx;
            /* check for clear button */
            let cbid = a._canvas.id.replace("_canvas", "_clear");
            let cbobj = getObject(cbid);
            if(undefined != cbobj){
                cbobj.ctx=ctx;
                cbobj.a=a;
                cbobj.addEventListener("click", function () {
                    this.a.clear();
                });
            }
            /* check for input field */
            let ifid = a._canvas.id.replace("_canvas", "_input");
            let ifobj = getObject(ifid);
            if(undefined != ifobj){
                ifobj.ctx=ctx;
                ifobj.a=a;
                ifobj.addEventListener("input", function () {
                    let fontid = this.a._canvas.id.replace("_canvas", "_font");
                    let fontobj=document.querySelector('#'+fontid);
                    let fontname=fontobj.options[fontobj.selectedIndex].value;
                    this.a.clear();
                    let w=this.a._canvas.width;
                    let h=this.a._canvas.height;
                    let px=parseInt(h/2)+5;
                    this.ctx.font = px+'px '+fontname;
                    this.ctx.textAlign = 'start';
                    this.ctx.clearRect(0, 0, w, h);
                    let x=15;
                    let y=parseInt(h/2)+10;
                    let m=w-10;
                    this.ctx.fillText(this.value, x, y, m);
                    this.a.saveSignature();
                });
            }
            /* check for font field */
            let ffid = a._canvas.id.replace("_canvas", "_font");
            let ffobj = getObject(ffid);
            if(undefined != ffobj){
                ffobj.ctx=ctx;
                ffobj.a=a;
                ffobj.addEventListener("change", function () {
                    let inputid = this.a._canvas.id.replace("_canvas", "_input");
                    let inputobj=document.querySelector('#'+inputid);
                    let event = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    inputobj.dispatchEvent(event);
                });
            }
            /* check for dataurl value */
            var s = a._canvas.id.replace("_canvas", "_dataurl"),
                r = getObject(s);
            void 0 != r && r.value.length > 0 && a.fromDataURL(r.value);
            /* check for reset button */
            var d = a._canvas.id.replace("_canvas", "_reset"),
                r = getObject(d);
            if(undefined != r){
                r.ctx=ctx;
                r.a=a;
            }
            void 0 != r && r.addEventListener("click", function () {
                this.a.clear();
                let editid = this.a._canvas.id.replace("_canvas", "_edit");
                let editimg=document.querySelector('#'+editid);
                if(undefined != editimg){
                    let img = new Image;
                    img.ctx=this.ctx;
                    img.a=this.a;
                    img.onload = function(){
                        this.ctx.drawImage(this,0,0);
                        this.a.saveSignature();
                    };
                    img.src = editimg.src;
                }
            });
            /* check for sign button */
            var s = a._canvas.id.replace("_canvas", "_sign"),
                r = getObject(s);
            if(undefined != r){
                r.ctx=ctx;
                r.a=a;
            }
            void 0 != r && r.addEventListener("click", function () {
                this.a.clear();
                let sigid = this.a._canvas.id.replace("_canvas", "_user");
                let sigimg=document.querySelector('#'+sigid);
                if(undefined != sigimg){
                    let img = new Image;
                    img.ctx=this.ctx;
                    img.a=this.a;
                    img.onload = function(){
                        this.ctx.drawImage(this,0,0);
                        this.a.saveSignature();
                    };
                    img.src = sigimg.src;
                    
                }
            });
        }
		//load signature into textarea if in edit mode
        var q = a._canvas.id.replace("_canvas", "_edit"), qObj = getObject(q);
        if(undefined != qObj){
            let editid = a._canvas.id.replace("_canvas", "_edit");
            let editimg=document.querySelector('#'+editid);
            if(undefined != editimg){
                let img = new Image;
                img.ctx=this._ctx;
                img.a=this.a;
                img.onload = function(){
                    this.ctx.drawImage(this,0,0);
                };
                img.src = editimg.src;
            }
        }
        e.addEventListener("touchstart", function (t) {
            a._reset();
            var e = t.changedTouches[0],
                i = a._createPoint(e);
            a._addPoint(i)
        }), e.addEventListener("touchmove", function (t) {
            t.preventDefault();
            var e = t.changedTouches[0],
                i = a._createPoint(e);
            a._addPoint(i)
        }), t.addEventListener("touchend", function (t) {
            var e = t.target === a._canvas,
                i = a.points.length > 2,
                o = a.points[0],
                n = a._ctx,
                r = "function" == typeof a.dotSize ? a.dotSize.call(a) : a.dotSize;
            e && !i && o && (n.beginPath(), a._drawPoint(o.x, o.y, r), n.closePath(), n.fill()), a.saveSignature()
        })
    };
    e.prototype.clear = function () {
        var t = this._ctx,
            e = this._canvas;
        t.fillStyle = this.backgroundColor, t.clearRect(0, 0, e.width, e.height), t.fillRect(0, 0, e.width, e.height), this._reset()
    }, e.prototype.toDataURL = function () {
        var t = this._canvas;
        return t.toDataURL.apply(t, arguments)
    }, e.prototype.saveSignature = function () {
        var t = this.toDataURL("image/png");
        if (void 0 != this._canvas.id) {
            var e = this._canvas.id.replace("_canvas", "");
            setText(e, t)
        }
    }, e.prototype.fromDataURL = function (t) {
        var e = new Image;
        e.src = t, this._ctx.drawImage(e, 0, 0, this._canvas.width, this._canvas.height)
    }, e.prototype.isEmpty = function () {
        return this._isEmpty
    }, e.prototype._reset = function () {
        this.points = [], this._lastVelocity = 0, this._lastWidth = (this.minWidth + this.maxWidth) / 2, this._isEmpty = !0, this._ctx.fillStyle = this.penColor
    }, e.prototype._createPoint = function (t) {
        var e = this._canvas.getBoundingClientRect();
        return new i(t.clientX - e.left, t.clientY - e.top)
    }, e.prototype._addPoint = function (t) {
        var e, i, o, n, r = this.points;
        r.push(t), r.length > 2 && (3 === r.length && r.unshift(r[0]), n = this._calculateCurveControlPoints(r[0], r[1], r[2]), e = n.c2, n = this._calculateCurveControlPoints(r[1], r[2], r[3]), i = n.c1, o = new a(r[1], e, i, r[2]), this._addCurve(o), r.shift())
    }, e.prototype._calculateCurveControlPoints = function (t, e, a) {
        var o = t.x - e.x,
            n = t.y - e.y,
            r = e.x - a.x,
            s = e.y - a.y,
            d = {
                x: (t.x + e.x) / 2,
                y: (t.y + e.y) / 2
            }, l = {
                x: (e.x + a.x) / 2,
                y: (e.y + a.y) / 2
            }, u = Math.sqrt(o * o + n * n),
            c = Math.sqrt(r * r + s * s),
            v = d.x - l.x,
            h = d.y - l.y,
            p = c / (u + c),
            _ = {
                x: l.x + v * p,
                y: l.y + h * p
            }, g = e.x - _.x,
            f = e.y - _.y;
        return {
            c1: new i(d.x + g, d.y + f),
            c2: new i(l.x + g, l.y + f)
        }
    }, e.prototype._addCurve = function (t) {
        var e, i, a = t.startPoint,
            o = t.endPoint;
        e = o.velocityFrom(a), e = this.velocityFilterWeight * e + (1 - this.velocityFilterWeight) * this._lastVelocity, i = this._strokeWidth(e), this._drawCurve(t, this._lastWidth, i), this._lastVelocity = e, this._lastWidth = i
    }, e.prototype._drawPoint = function (t, e, i) {
        var a = this._ctx;
        a.moveTo(t, e), a.arc(t, e, i, 0, 2 * Math.PI, !1), this._isEmpty = !1
    }, e.prototype._drawCurve = function (t, e, i) {
        var a, o, n, r, s, d, l, u, c, v, h, p = this._ctx,
            _ = i - e;
        for (a = Math.floor(t.length()), p.beginPath(), n = 0; a > n; n++) r = n / a, s = r * r, d = s * r, l = 1 - r, u = l * l, c = u * l, v = c * t.startPoint.x, v += 3 * u * r * t.control1.x, v += 3 * l * s * t.control2.x, v += d * t.endPoint.x, h = c * t.startPoint.y, h += 3 * u * r * t.control1.y, h += 3 * l * s * t.control2.y, h += d * t.endPoint.y, o = e + d * _, this._drawPoint(v, h, o);
        p.closePath(), p.fill()
    }, e.prototype._strokeWidth = function (t) {
        return Math.max(this.maxWidth / (t + 1), this.minWidth)
    };
    var i = function (t, e, i) {
        this.x = t, this.y = e, this.time = i || (new Date).getTime()
    };
    i.prototype.velocityFrom = function (t) {
        return this.distanceTo(t) / (this.time - t.time)
    }, i.prototype.distanceTo = function (t) {
        return Math.sqrt(Math.pow(this.x - t.x, 2) + Math.pow(this.y - t.y, 2))
    };
    var a = function (t, e, i, a) {
        this.startPoint = t, this.control1 = e, this.control2 = i, this.endPoint = a
    };
    return a.prototype.length = function () {
        var t, e, i, a, o, n, r, s, d = 10,
            l = 0;
        for (t = 0; d >= t; t++) e = t / d, i = this._point(e, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x), a = this._point(e, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y), t > 0 && (r = i - o, s = a - n, l += Math.sqrt(r * r + s * s)), o = i, n = a;
        return l
    }, a.prototype._point = function (t, e, i, a, o) {
        return e * (1 - t) * (1 - t) * (1 - t) + 3 * i * (1 - t) * (1 - t) * t + 3 * a * (1 - t) * t * t + o * t * t * t
    }, e
}(document);
