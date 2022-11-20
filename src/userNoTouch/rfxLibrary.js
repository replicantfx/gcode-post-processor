let exports = {};
exports.unitConversion = {
    mm: {
        mm: 1,
        cm: 1 / 10,
        m: 1 / 1000,
        km: 1 / 1000000,
        in: 1 / 25.4,
        ft: 1 / 304.8,
        yd: 1 / 914.4,
        miles: 1 / 1609344
    },
    cm: {
        mm: 10,
        cm: 1,
        m: 1 / 100,
        km: 1 / 100000,
        in: 1 / 2.54,
        ft: 1 / 30.48,
        yd: 1 / 91.44,
        miles: 1 / 160934.4
    },
    m: {
        mm: 1000,
        cm: 100,
        m: 1,
        km: 1 / 1000,
        in: 1 / 0.0254,
        ft: 1 / 0.3048,
        yd: 1 / 0.9144,
        miles: 1 / 1609.344
    },
    km: {
        mm: 1000000,
        cm: 100000,
        m: 1000,
        km: 1,
        in: 1 / 0.0000254,
        ft: 1 / 0.0003048,
        yd: 1 / 0.0009144,
        miles: 1 / 1.609344
    },
    in: {
        mm: 25.4,
        cm: 2.54,
        m: 0.0254,
        km: 0.0000254,
        in: 1,
        ft: 1 / 12,
        yd: 1 / 36,
        miles: 1 / 63360
    },
    ft: {
        mm: 304.8,
        cm: 30.48,
        m: 0.3048,
        km: 0.0003048,
        in: 12,
        ft: 1,
        yd: 1 / 3,
        miles: 1 / 5280
    },
    yd: {
        mm: 914.4,
        cm: 91.44,
        m: 0.9144,
        km: 0.0009144,
        in: 36,
        ft: 3,
        yd: 1,
        miles: 1 / 1760
    },
    miles: {
        mm: 1609344,
        cm: 160934.4,
        m: 1609.344,
        km: 1.609344,
        in: 63360,
        ft: 5280,
        yd: 1760,
        miles: 1
    }
}
exports.point3D = [0,0,0,0];
exports.matrix3D = [
[1,0,0,0],
[0,1,0,0],
[0,0,1,0],
[0,0,0,1]
]
exports.sigs = [1,10,100,1000,10000,100000,1000000,10000000,100000000,1000000000];
exports.toSigFig = function(input, sigFig=4) {
    //return Number(Math.round(input*sigs[sigFig])/sigs[sigFig]);
    return Number(input.toFixed(sigFig));
}
exports.execFn = function(fnName, ctx /*, args */) {
    // get passed arguments except first two (fnName, ctx)
    var args = Array.prototype.slice.call(arguments, 2);
    // execute the function with passed parameters and return result
    return ctx[fnName].apply(ctx, args);
}
exports.isIdentity = function(input) {
    if (!input)
        return false;
    if (!input.length)
        return false;
    if (input.length <= 0)
        return false;
    for (let r = 0; r < input.length; r++) {
        if (input.length != input.length[r])
            return false;
        for (let c = 0; c < input.length[r]; c++) {
            if (r == c && input[r][c] != 1)
                return false;
            if (r != c && input[r][c] != 0)
                return false;
        }
    }
    return true;
}
exports.transformPoint = function(point, transform) {
    if (!transform)
        return point;
    if (!transform.length) {
        rfxGlobal.writeTo("WARNING: Transform isn't an array, not procssing transform");
        return point;
    }
    if (transform.length != transform[0].length) {
        rfxGlobal.writeTo("WARNING: Transform isn't square, not processing transform");
        return point;
    }
    let result = [];
    let r = 0;
    for (let r = 0; r < point.length; r++) {
        let n = 0;
        for (let c = 0; c < point.length; c++) {
            n += point[c] * transform[r][c];
        }
        result.push(n);
    }
    return result;
}
exports.dateString = () => {
    let date = new Date();
    console.log("#########>>>> "+date)
  return (
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
    ":" +
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
    ":" +
    (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()) +
    " " +
    date.toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  );
};
export default exports;