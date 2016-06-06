function asinh(x) {
    if (x === -Infinity) {
        return x;
    } else {
        return Math.log(x + Math.sqrt(x * x + 1));
    }
}
function acosh(x) {
    return Math.log(x + Math.sqrt(x * x - 1));
}
function atanh(x) {
    return Math.log((1+x)/(1-x)) / 2;
}
function cbrt(x) {
    var y = Math.pow(Math.abs(x), 1/3);
    return x < 0 ? -y : y;
}
function cosh(x) {
    var y = Math.exp(x);
    return (y + 1 / y) / 2;
}
function expm1(x) {
    return Math.exp(x) - 1;
}
function log1p(x) {
    return Math.log(1 + x);
}
function sinh(x){
    var y = Math.exp(x);
    return (y - 1/y) / 2;
}
function tanh(x) {
    if(x === Infinity) {
        return 1;
    } else if(x === -Infinity) {
        return -1;
    } else {
        var y = Math.exp(2 * x);
        return (y - 1) / (y + 1);
    }
}
fp.math = {
    "asinh(1)": asinh(1),
    "acosh(1e300)": acosh(1e300),
    "atanh(0.5)": atanh(0.5),
    "expm1(1)": expm1(1),
    "cbrt(100)": cbrt(100),
    "log1p(10)": log1p(10),
    "sinh(1)": sinh(1),
    "cosh(10)": cosh(10),
    "tanh(1)": tanh(1)
};