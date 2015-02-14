var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//test comment
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);


//random code
var sslRootCAs = require('ssl-root-cas/latest')
sslRootCAs.inject();
//ends here


//var userRequest;

function buildHash(inRequest, inResourcePath){

    var sourceString = ""; // shared secret + fields in correct format
    var hash="";
    var sharedSecret="Lu5dYjfpbF0ugZfEnsQNR1vJ7qiSxZUAdfSMd/8-";
    var apikey="U40OBBDQ5ZZ2MX2HWMR021wLqWBjDueyC5fe4N6_1gP5laWY0";
    //var resourcePath="amlofac/WatchListInquiry";
    //userRequest = "{ \"ReferenceNumber\": 103809005128, \"AcquiringBin\": 409999, \"AcquirerCountryCode\": 101, \"Name\": \"Jack Smith\", \"Address\": { \"City\": \"Boulder\", \"CountryCode\": \"USA\" } }";

    //var timeStamp = (new Date).getTime();

    ///var date = new Date();
    var timeStamp = Math.round((new Date).getTime()/1000);
    //var timeStamp = String(Math.round(date.getTime() / 1000) + date.getTimezoneOffset() * 60);

    //sourceString = sharedSecret + timeStamp + resourcePath + "apikey=" + apikey + userRequest;
    //sourceString = sharedSecret + timeStamp + resourcePath + "apikey=" + apikey + inRequest;
    sourceString = sharedSecret + timeStamp + inResourcePath + "apikey=" + apikey + inRequest;

    var hash = CryptoJS.SHA256(sourceString);

    var xpayToken = "x:"+timeStamp+":"+hash;

    //xpayToken="x:1416383155:d2393f9f2a4b35b658ead5de19e900813f5dd2e5aa406bdb2b3869d5b9dfa19e"

    //x:UNIX_UTC_Timestamp:SHA256_hash

    console.log("returned xpayToken: " + xpayToken);

    return xpayToken;

    //var base64String = new Buffer(hash).toString('base64');



    /*
    var crypto = require('crypto');
    var hash = crypto.createHash('sha256').update(sourceString).digest('base64');
    */

}


//http://127.0.0.1:3000/

app.get('/', function(req, res) {res.render('index')});


app.post('/foreX', function(req, res) {
    var fromCurrencyCode = req.body.fromCurrencyCode;
    var toCurrencyCode = req.body.toCurrencyCode;
    var userAmount = req.body.userAmount;
    console.log("fromCurrencyCode: " + fromCurrencyCode);
    console.log("toCurrencyCode: " + toCurrencyCode);
    console.log("userAmount: " + userAmount);

    //var xpayToken = "x:1416380932:ff5ac2c5cbb1ce31e6319bc1f5a4748323ca8ecc56eb48c1a916b522144ccb09";
    //userRequest = "{ \"ReferenceNumber\": 103809005128, \"AcquiringBin\": 409999, \"AcquirerCountryCode\": 101, \"Name\": \"Jack Smith\", \"Address\": { \"City\": \"Boulder\", \"CountryCode\": \"USA\" } }";
    //var userRequest = "{ \"ReferenceNumber\": 103809005128, \"AcquiringBin\": 409999, \"AcquirerCountryCode\": 101, \"Name\": \"Jack Smith\", \"Address\": { \"City\": \"Boulder\", \"CountryCode\": \"" + cardHolderCountryCode + "\" } }";

    userRequest= "{"+"\"SystemsTraceAuditNumber\": 451012,"+
                    "\"RetrievalReferenceNumber\": \"430015451012\","+
                    "\"AcquiringBin\": 409999,"+
                    "\"AcquirerCountryCode\": \"101\","+
                    "\"DestinationCurrencyCode\": \""+toCurrencyCode+"\","+
                    "\"SourceCurrencyCode\": \""+fromCurrencyCode+"\","+
                    "\"SourceAmount\": \""+userAmount+"\","+
                    "\"CardAcceptor\": {"+
                        "\"Name\": \"Mr Smith\","+
                        "\"TerminalId\": \"12332\","+
                        "\"IdCode\": \"1014\","+
                        "\"Address\": {"+
                            "\"City\": \"San Francisco\","+
                            "\"State\": \"CA\","+
                            "\"County\": \"075\","+
                            "\"Country\": \"USA\","+
                            "\"ZipCode\": \"56913\""+
                            "}"+
                        "}"+
                    "}";

    var resourcePath="cd/ForExInquiry";
    //var xpayToken = buildHash();
    var xpayToken = buildHash(userRequest,resourcePath);


    console.log("xpayToken return: " + xpayToken);

    var nodeReq = require('request');

    //process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    var options = {
        url: 'https://sandbox.api.visa.com/da/cd/ForExInquiry?apikey=U40OBBDQ5ZZ2MX2HWMR021wLqWBjDueyC5fe4N6_1gP5laWY0',
        rejectUnauthorized: false,
        headers: {
            'x-pay-token' : xpayToken,
            'Content-Type' : 'application/json',
            'Accept' : 'application/vnd.visa.CommonData.v1+json'
        },
        method: 'POST',
        body: userRequest
    };

    console.log("options JSON " + options);
    console.log("userRequest = " + userRequest);

    function callback(error, response, body) {

        if (error) {
            return console.log("error: " + error);
        };

        if (!error && response.statusCode == 200) {

            var info = JSON.parse(body);

            console.log("callback function executed...");
            console.log("response.statusCode =" + response.statusCode);

            console.log("ConversionRate " + info.ConversionRate);
            console.log("DestinationAmount " + info.DestinationAmount);

            res.render('foreX', { title: 'MyApp', myFx: info.ConversionRate, myFx2: info.DestinationAmount});            
        }
    }

    nodeReq(options, callback);
});


app.post('/wlM', function(req, res) {
    var curCode = req.body.currencyCode;
    var userAmt = req.body.userAmount;
    var cardHolderCountryCode = req.body.cardHolderCountryCode;
    var resourcePath="amlofac/WatchListInquiry";

    //var xpayToken = "x:1416380932:ff5ac2c5cbb1ce31e6319bc1f5a4748323ca8ecc56eb48c1a916b522144ccb09";
    //userRequest = "{ \"ReferenceNumber\": 103809005128, \"AcquiringBin\": 409999, \"AcquirerCountryCode\": 101, \"Name\": \"Jack Smith\", \"Address\": { \"City\": \"Boulder\", \"CountryCode\": \"USA\" } }";
    //var userRequest = "{ \"ReferenceNumber\": 103809005128, \"AcquiringBin\": 409999, \"AcquirerCountryCode\": 101, \"Name\": \"Jack Smith\", \"Address\": { \"City\": \"Boulder\", \"CountryCode\": \"" + cardHolderCountryCode + "\" } }";
    var userRequest = "{ \"ReferenceNumber\": 103809005128,"+
                        " \"AcquiringBin\": 409999,"+
                        " \"AcquirerCountryCode\": 101,"+
                        " \"Name\": \"Jack Smith\","+
                        " \"Address\": {"+
                            " \"City\": \"Boulder\","+
                            " \"CountryCode\": \""+
                            cardHolderCountryCode+
                        "\" }"+
                        " }";

    var xpayToken = buildHash(userRequest,resourcePath);

    console.log("cardHolderCountryCode: " + cardHolderCountryCode);
    console.log("xpayToken return: " + xpayToken);

    var nodeReq = require('request');

    var options = {
        url: 'https://sandbox.api.visa.com/rft/amlofac/WatchListInquiry?apikey=U40OBBDQ5ZZ2MX2HWMR021wLqWBjDueyC5fe4N6_1gP5laWY0',
        rejectUnauthorized: false,
        headers: {
            'x-pay-token' : xpayToken,
            'Content-Type' : 'application/json; charset=UTF-8',
            'Accept' : 'application/json; charset=UTF-8'
        },
        method: 'POST',
        body: userRequest
    };

    console.log("options JSON" + options);

    function callback(error, response, body) {

        if (error) {
            return console.log("error: " + error);
        };

        if (!error && response.statusCode == 200) {

            var info = JSON.parse(body);

            console.log("callback function executed...");
            console.log("response.statusCode =" + response.statusCode);

            console.log("ReferenceNumber " + info.ReferenceNumber);
            console.log("OFACScore " + info.OFACScore);
            console.log("Status " + info.Status);

            //res.render('index', { title: 'MyApp', myIn: info.ReferenceNumber, myIn2: info.OFACScore, myIn3: info.Status});            
            res.render('wlM', { title: 'MyApp', myIn: info.ReferenceNumber, myIn2: info.OFACScore, myIn3: info.Status});            
        }
    }

    nodeReq(options, callback);
});

app.post('/ocT', function(req, res) {
    var senderAccountNumber = req.body.senderAccountNumber;
    var recepientCardPrimaryAccountNumber = req.body.recepientCardPrimaryAccountNumber;
    var cardAcceptorCountryCode = req.body.cardAcceptorCountryCode;
    var transactionCurrency = req.body.transactionCurrency;
    var amount = req.body.amount;
    var cardAcceptorName = req.body.cardAcceptorName;

    var actionCode;
    var approvalCode;

    console.log("senderAccountNumber ="+senderAccountNumber);
    console.log("recepientCardPrimaryAccountNumber ="+recepientCardPrimaryAccountNumber);
    console.log("cardAcceptorCountryCode ="+cardAcceptorCountryCode);
    console.log("transactionCurrency ="+transactionCurrency);
    console.log("amount ="+amount);
    console.log("cardAcceptorName ="+cardAcceptorName);

    userRequest= "{"+"\"SystemsTraceAuditNumber\": 350420,"+
                    "\"RetrievalReferenceNumber\": \"401010350420\","+
                    "\"DateAndTimeLocalTransaction\": \"2021-10-26T21:32:52\","+
                    "\"AcquiringBin\": 409999,"+
                    "\"AcquirerCountryCode\": \"101\","+
                    "\"SenderReference\": \"\","+ 
                    "\"SenderAccountNumber\": "+"\""+senderAccountNumber+"\","+
                    "\"SenderCountryCode\": \"USA\","+
                    "\"TransactionCurrency\": "+"\""+transactionCurrency+"\","+
                    "\"SenderName\": \"John Smith\","+
                    "\"SenderAddress\": \"44 Market St.\","+
                    "\"SenderCity\": \"San Francisco\","+
                    "\"SenderStateCode\": \"CA\","+
                    "\"RecipientCardPrimaryAccountNumber\": \""+recepientCardPrimaryAccountNumber+"\","+
                    "\"Amount\": "+"\""+amount+"\","+
                    "\"BusinessApplicationID\": \"AA\","+
                    "\"MerchantCategoryCode\": 6012,"+
                    "\"TransactionIdentifier\": 234234322342343,"+
                    "\"SourceOfFunds\": \"03\","+
                    "\"CardAcceptor\": {"+
                        "\"Name\": "+"\""+cardAcceptorName+"\","+
                        "\"TerminalId\": \"365539\","+
                        "\"IdCode\": \"VMT200911026070\","+
                        "\"Address\": {"+                  
                            "\"State\": \"CA\","+
                            "\"County\": \"081\","+
                            "\"Country\": "+"\""+cardAcceptorCountryCode+"\","+
                            "\"ZipCode\": \"94105\""+
                            "}"+
                        "},"+
                        "\"FeeProgramIndicator\": \"123\""+
                    "}";

    var resourcePath="ft/OriginalCreditTransactions";
    //var xpayToken = buildHash();
    var xpayToken = buildHash(userRequest,resourcePath);

    console.log("xpayToken return: " + xpayToken);
    console.log("userRequest:" + userRequest);

    var nodeReq = require('request');

    //process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    var options = {
        url: 'https://sandbox.api.visa.com/pm/ft/OriginalCreditTransactions?apikey=U40OBBDQ5ZZ2MX2HWMR021wLqWBjDueyC5fe4N6_1gP5laWY0',
        rejectUnauthorized: false,
        headers: {
            'x-pay-token' : xpayToken,
            'Content-Type' : 'application/json; charset=UTF-8',
            'Accept' : 'application/json; charset=UTF-8'
        },
        method: 'POST',
        body: userRequest
    };

    console.log("options JSON" + options);

    function callback(error, response, body) {

        if (error) {
            return console.log("error: " + error);
        };

        if (!error && response.statusCode == 200) {

            var info = JSON.parse(body);

            console.log("callback function executed...");
            console.log("response.statusCode =" + response.statusCode);

            console.log("TransactionIdentifier " + info.TransactionIdentifier);
            console.log("ActionCode " + info.ActionCode);

            res.render('ocT', { title: 'Money Sent', myTransactionIdentifier: info.TransactionIdentifier, myActionCode: info.ActionCode});            
        }
    }

    nodeReq(options, callback);
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handlers
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;







//cryptography library 
var CryptoJS = CryptoJS || function(h, s) {
    var f = {},
        t = f.lib = {},
        g = function() {},
        j = t.Base = {
            extend: function(a) {
                g.prototype = this;
                var c = new g;
                a && c.mixIn(a);
                c.hasOwnProperty("init") || (c.init = function() {
                    c.$super.init.apply(this, arguments)
                });
                c.init.prototype = c;
                c.$super = this;
                return c
            },
            create: function() {
                var a = this.extend();
                a.init.apply(a, arguments);
                return a
            },
            init: function() {},
            mixIn: function(a) {
                for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
                a.hasOwnProperty("toString") && (this.toString = a.toString)
            },
            clone: function() {
                return this.init.prototype.extend(this)
            }
        },
        q = t.WordArray = j.extend({
            init: function(a, c) {
                a = this.words = a || [];
                this.sigBytes = c != s ? c : 4 * a.length
            },
            toString: function(a) {
                return (a || u).stringify(this)
            },
            concat: function(a) {
                var c = this.words,
                    d = a.words,
                    b = this.sigBytes;
                a = a.sigBytes;
                this.clamp();
                if (b % 4)
                    for (var e = 0; e < a; e++) c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((b + e) % 4);
                else if (65535 < d.length)
                    for (e = 0; e < a; e += 4) c[b + e >>> 2] = d[e >>> 2];
                else c.push.apply(c, d);
                this.sigBytes += a;
                return this
            },
            clamp: function() {
                var a = this.words,
                    c = this.sigBytes;
                a[c >>> 2] &= 4294967295 <<
                    32 - 8 * (c % 4);
                a.length = h.ceil(c / 4)
            },
            clone: function() {
                var a = j.clone.call(this);
                a.words = this.words.slice(0);
                return a
            },
            random: function(a) {
                for (var c = [], d = 0; d < a; d += 4) c.push(4294967296 * h.random() | 0);
                return new q.init(c, a)
            }
        }),
        v = f.enc = {},
        u = v.Hex = {
            stringify: function(a) {
                var c = a.words;
                a = a.sigBytes;
                for (var d = [], b = 0; b < a; b++) {
                    var e = c[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
                    d.push((e >>> 4).toString(16));
                    d.push((e & 15).toString(16))
                }
                return d.join("")
            },
            parse: function(a) {
                for (var c = a.length, d = [], b = 0; b < c; b += 2) d[b >>> 3] |= parseInt(a.substr(b,
                    2), 16) << 24 - 4 * (b % 8);
                return new q.init(d, c / 2)
            }
        },
        k = v.Latin1 = {
            stringify: function(a) {
                var c = a.words;
                a = a.sigBytes;
                for (var d = [], b = 0; b < a; b++) d.push(String.fromCharCode(c[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
                return d.join("")
            },
            parse: function(a) {
                for (var c = a.length, d = [], b = 0; b < c; b++) d[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
                return new q.init(d, c)
            }
        },
        l = v.Utf8 = {
            stringify: function(a) {
                try {
                    return decodeURIComponent(escape(k.stringify(a)))
                } catch (c) {
                    throw Error("Malformed UTF-8 data");
                }
            },
            parse: function(a) {
                return k.parse(unescape(encodeURIComponent(a)))
            }
        },
        x = t.BufferedBlockAlgorithm = j.extend({
            reset: function() {
                this._data = new q.init;
                this._nDataBytes = 0
            },
            _append: function(a) {
                "string" == typeof a && (a = l.parse(a));
                this._data.concat(a);
                this._nDataBytes += a.sigBytes
            },
            _process: function(a) {
                var c = this._data,
                    d = c.words,
                    b = c.sigBytes,
                    e = this.blockSize,
                    f = b / (4 * e),
                    f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
                a = f * e;
                b = h.min(4 * a, b);
                if (a) {
                    for (var m = 0; m < a; m += e) this._doProcessBlock(d, m);
                    m = d.splice(0, a);
                    c.sigBytes -= b
                }
                return new q.init(m, b)
            },
            clone: function() {
                var a = j.clone.call(this);
                a._data = this._data.clone();
                return a
            },
            _minBufferSize: 0
        });
    t.Hasher = x.extend({
        cfg: j.extend(),
        init: function(a) {
            this.cfg = this.cfg.extend(a);
            this.reset()
        },
        reset: function() {
            x.reset.call(this);
            this._doReset()
        },
        update: function(a) {
            this._append(a);
            this._process();
            return this
        },
        finalize: function(a) {
            a && this._append(a);
            return this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function(a) {
            return function(c, d) {
                return (new a.init(d)).finalize(c)
            }
        },
        _createHmacHelper: function(a) {
            return function(c, d) {
                return (new w.HMAC.init(a,
                    d)).finalize(c)
            }
        }
    });
    var w = f.algo = {};
    return f
}(Math);
(function(h) {
    for (var s = CryptoJS, f = s.lib, t = f.WordArray, g = f.Hasher, f = s.algo, j = [], q = [], v = function(a) {
            return 4294967296 * (a - (a | 0)) | 0
        }, u = 2, k = 0; 64 > k;) {
        var l;
        a: {
            l = u;
            for (var x = h.sqrt(l), w = 2; w <= x; w++)
                if (!(l % w)) {
                    l = !1;
                    break a
                }
            l = !0
        }
        l && (8 > k && (j[k] = v(h.pow(u, 0.5))), q[k] = v(h.pow(u, 1 / 3)), k++);
        u++
    }
    var a = [],
        f = f.SHA256 = g.extend({
            _doReset: function() {
                this._hash = new t.init(j.slice(0))
            },
            _doProcessBlock: function(c, d) {
                for (var b = this._hash.words, e = b[0], f = b[1], m = b[2], h = b[3], p = b[4], j = b[5], k = b[6], l = b[7], n = 0; 64 > n; n++) {
                    if (16 > n) a[n] =
                        c[d + n] | 0;
                    else {
                        var r = a[n - 15],
                            g = a[n - 2];
                        a[n] = ((r << 25 | r >>> 7) ^ (r << 14 | r >>> 18) ^ r >>> 3) + a[n - 7] + ((g << 15 | g >>> 17) ^ (g << 13 | g >>> 19) ^ g >>> 10) + a[n - 16]
                    }
                    r = l + ((p << 26 | p >>> 6) ^ (p << 21 | p >>> 11) ^ (p << 7 | p >>> 25)) + (p & j ^ ~p & k) + q[n] + a[n];
                    g = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & m ^ f & m);
                    l = k;
                    k = j;
                    j = p;
                    p = h + r | 0;
                    h = m;
                    m = f;
                    f = e;
                    e = r + g | 0
                }
                b[0] = b[0] + e | 0;
                b[1] = b[1] + f | 0;
                b[2] = b[2] + m | 0;
                b[3] = b[3] + h | 0;
                b[4] = b[4] + p | 0;
                b[5] = b[5] + j | 0;
                b[6] = b[6] + k | 0;
                b[7] = b[7] + l | 0
            },
            _doFinalize: function() {
                var a = this._data,
                    d = a.words,
                    b = 8 * this._nDataBytes,
                    e = 8 * a.sigBytes;
                d[e >>> 5] |= 128 << 24 - e % 32;
                d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);
                d[(e + 64 >>> 9 << 4) + 15] = b;
                a.sigBytes = 4 * d.length;
                this._process();
                return this._hash
            },
            clone: function() {
                var a = g.clone.call(this);
                a._hash = this._hash.clone();
                return a
            }
        });
    s.SHA256 = g._createHelper(f);
    s.HmacSHA256 = g._createHmacHelper(f)
})(Math);