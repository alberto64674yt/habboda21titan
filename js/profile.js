/* ==========================================================================
   js/profile.js - GESTIÓN DEL PERSONAJE (Habbo Imager y Editor Pro)
   ========================================================================== */

const ProfileEditor = {
    currentGender: 'M',
    currentSetType: 'hd',
    
    // JSON Originales Intactos
    palettesJSON: {"1":{"14":{"index":0,"selectable":1,"hex":"F5DA88"},"10":{"index":1,"selectable":1,"hex":"FFDBC1"},"1":{"index":2,"selectable":1,"hex":"FFCB98"},"8":{"index":3,"selectable":1,"hex":"F4AC54"},"12":{"index":4,"selectable":1,"hex":"FF987F"},"1369":{"index":5,"selectable":1,"hex":"e0a9a9"},"1370":{"index":6,"selectable":1,"hex":"ca8154"},"19":{"index":7,"selectable":1,"hex":"B87560"},"20":{"index":8,"selectable":1,"hex":"9C543F"},"1371":{"index":9,"selectable":1,"hex":"904925"},"30":{"index":10,"selectable":1,"hex":"4C311E"},"1372":{"index":11,"selectable":1,"hex":"543d35"},"1373":{"index":12,"selectable":1,"hex":"653a1d"},"21":{"index":13,"selectable":1,"hex":"6E392C"},"1374":{"index":14,"selectable":1,"hex":"714947"},"1375":{"index":15,"selectable":1,"hex":"856860"},"1376":{"index":16,"selectable":1,"hex":"895048"},"1377":{"index":17,"selectable":1,"hex":"a15253"},"1378":{"index":18,"selectable":1,"hex":"aa7870"},"1379":{"index":19,"selectable":1,"hex":"be8263"},"1380":{"index":20,"selectable":1,"hex":"b6856d"},"1381":{"index":21,"selectable":1,"hex":"ba8a82"},"1382":{"index":22,"selectable":1,"hex":"c88f82"},"1383":{"index":23,"selectable":1,"hex":"d9a792"},"1384":{"index":24,"selectable":1,"hex":"c68383"},"1368":{"index":25,"selectable":1,"hex":"BC576A"},"1367":{"index":26,"selectable":1,"hex":"FF5757"},"1366":{"index":27,"selectable":1,"hex":"FF7575"},"1358":{"index":28,"selectable":1,"hex":"B65E38"},"1385":{"index":29,"selectable":1,"hex":"a76644"},"1386":{"index":30,"selectable":1,"hex":"7c5133"},"1387":{"index":31,"selectable":1,"hex":"9a7257"},"5":{"index":32,"selectable":1,"hex":"945C2F"},"1389":{"index":33,"selectable":1,"hex":"d98c63"},"4":{"index":34,"selectable":1,"hex":"AE7748"},"1388":{"index":35,"selectable":1,"hex":"c57040"},"1359":{"index":36,"selectable":1,"hex":"B88655"},"3":{"index":37,"selectable":1,"hex":"C99263"},"18":{"index":38,"selectable":1,"hex":"A89473"},"17":{"index":39,"selectable":1,"hex":"C89F56"},"9":{"index":40,"selectable":1,"hex":"DC9B4C"},"1357":{"index":41,"selectable":1,"hex":"FF8C40"},"1390":{"index":42,"selectable":1,"hex":"de9d75"},"1391":{"index":43,"selectable":1,"hex":"eca782"},"11":{"index":44,"selectable":1,"hex":"FFB696"},"2":{"index":45,"selectable":1,"hex":"E3AE7D"},"7":{"index":46,"selectable":1,"hex":"FFC680"},"15":{"index":47,"selectable":1,"hex":"DFC375"},"13":{"index":48,"selectable":1,"hex":"F0DCA3"},"22":{"index":49,"selectable":1,"hex":"EAEFD0"},"23":{"index":50,"selectable":1,"hex":"E2E4B0"},"24":{"index":51,"selectable":1,"hex":"D5D08C"},"1361":{"index":52,"selectable":1,"hex":"BDE05F"},"1362":{"index":53,"selectable":1,"hex":"5DC446"},"1360":{"index":54,"selectable":1,"hex":"A2CC89"},"26":{"index":55,"selectable":1,"hex":"C2C4A7"},"28":{"index":56,"selectable":1,"hex":"F1E5DA"},"1392":{"index":57,"selectable":1,"hex":"f6d3d4"},"1393":{"index":58,"selectable":1,"hex":"e5b6b0"},"25":{"index":59,"selectable":1,"hex":"C4A7B3"},"1363":{"index":60,"selectable":1,"hex":"AC94B3"},"1364":{"index":61,"selectable":1,"hex":"D288CE"},"1365":{"index":62,"selectable":1,"hex":"6799CC"},"29":{"index":63,"selectable":1,"hex":"B3BDC3"},"27":{"index":64,"selectable":1,"hex":"C5C0C2"}},"2":{"40":{"index":0,"selectable":1,"hex":"D8D3D9"},"34":{"index":1,"selectable":1,"hex":"FFEEB9"},"35":{"index":2,"selectable":1,"hex":"F6D059"},"36":{"index":3,"selectable":1,"hex":"F2B11D"},"31":{"index":4,"selectable":1,"hex":"FFD6A9"},"32":{"index":5,"selectable":1,"hex":"DFA66F"},"37":{"index":6,"selectable":1,"hex":"9A5D2E"},"38":{"index":7,"selectable":1,"hex":"AC5300"},"43":{"index":8,"selectable":1,"hex":"F29159"},"46":{"index":9,"selectable":1,"hex":"FF8746"},"47":{"index":10,"selectable":1,"hex":"FC610C"},"48":{"index":11,"selectable":1,"hex":"DE3900"},"44":{"index":12,"selectable":1,"hex":"9E3D3B"},"39":{"index":13,"selectable":1,"hex":"783400"},"45":{"index":14,"selectable":1,"hex":"5C4332"},"42":{"index":15,"selectable":1,"hex":"4A4656"},"61":{"index":16,"selectable":1,"hex":"2D2D2D"},"1394":{"index":17,"selectable":1,"hex":"3f2113"},"1395":{"index":18,"selectable":1,"hex":"774422"},"33":{"index":19,"selectable":1,"hex":"D1803A"},"1396":{"index":20,"selectable":1,"hex":"cc8b33"},"1397":{"index":21,"selectable":1,"hex":"e5ba6a"},"1398":{"index":22,"selectable":1,"hex":"f6d990"},"49":{"index":23,"selectable":1,"hex":"FFFFFF"},"1342":{"index":24,"selectable":1,"hex":"fffdd6"},"1343":{"index":25,"selectable":1,"hex":"fff392"},"1399":{"index":26,"selectable":1,"hex":"ffff00"},"1344":{"index":27,"selectable":1,"hex":"ffe508"},"1400":{"index":28,"selectable":1,"hex":"ff7716"},"1401":{"index":29,"selectable":1,"hex":"aa2c1b"},"59":{"index":30,"selectable":1,"hex":"E71B0A"},"1345":{"index":31,"selectable":1,"hex":"ff3e3e"},"1348":{"index":32,"selectable":1,"hex":"ff638f"},"54":{"index":33,"selectable":1,"hex":"FFBDBC"},"1346":{"index":34,"selectable":1,"hex":"ffddf1"},"1347":{"index":35,"selectable":1,"hex":"ffaedc"},"55":{"index":36,"selectable":1,"hex":"DE34A4"},"1349":{"index":37,"selectable":1,"hex":"9e326a"},"56":{"index":38,"selectable":1,"hex":"9F5699"},"1350":{"index":39,"selectable":1,"hex":"8a4fb5"},"1351":{"index":40,"selectable":1,"hex":"722ba6"},"1352":{"index":41,"selectable":1,"hex":"4c1d6f"},"1402":{"index":42,"selectable":1,"hex":"322c7a"},"1403":{"index":43,"selectable":1,"hex":"71584a"},"1404":{"index":44,"selectable":1,"hex":"aa8864"},"1405":{"index":45,"selectable":1,"hex":"bbb1aa"},"1353":{"index":46,"selectable":1,"hex":"c1c6ef"},"57":{"index":47,"selectable":1,"hex":"D5F9FB"},"60":{"index":48,"selectable":1,"hex":"95FFFA"},"58":{"index":49,"selectable":1,"hex":"6699CC"},"1354":{"index":50,"selectable":1,"hex":"4481e5"},"1355":{"index":51,"selectable":1,"hex":"2c50aa"},"1356":{"index":52,"selectable":1,"hex":"2a4167"},"53":{"index":53,"selectable":1,"hex":"3A7B93"},"52":{"index":54,"selectable":1,"hex":"339966"},"1406":{"index":55,"selectable":1,"hex":"70c100"},"51":{"index":56,"selectable":1,"hex":"A3FF8F"},"1316":{"index":57,"selectable":1,"hex":"D2FF00"},"50":{"index":58,"selectable":1,"hex":"E5FF09"},"41":{"index":59,"selectable":1,"hex":"918D98"},"1407":{"index":60,"selectable":1,"hex":"333333"}},"3":{"1408":{"index":0,"selectable":1,"hex":"dddddd"},"90":{"index":1,"selectable":1,"hex":"96743D"},"91":{"index":2,"selectable":1,"hex":"6B573B"},"66":{"index":3,"selectable":1,"hex":"E7B027"},"1320":{"index":4,"selectable":1,"hex":"fff7b7"},"68":{"index":5,"selectable":1,"hex":"F8C790"},"73":{"index":6,"selectable":1,"hex":"9F2B31"},"72":{"index":7,"selectable":1,"hex":"ED5C50"},"71":{"index":8,"selectable":1,"hex":"FFBFC2"},"74":{"index":9,"selectable":1,"hex":"E7D1EE"},"75":{"index":10,"selectable":1,"hex":"AC94B3"},"76":{"index":11,"selectable":1,"hex":"7E5B90"},"82":{"index":12,"selectable":1,"hex":"4F7AA2"},"81":{"index":13,"selectable":1,"hex":"75B7C7"},"80":{"index":14,"selectable":1,"hex":"C5EDE6"},"83":{"index":15,"selectable":1,"hex":"BBF3BD"},"84":{"index":16,"selectable":1,"hex":"6BAE61"},"85":{"index":17,"selectable":1,"hex":"456F40"},"88":{"index":18,"selectable":1,"hex":"7A7D22"},"64":{"index":19,"selectable":1,"hex":"595959"},"110":{"index":20,"selectable":1,"hex":"1E1E1E"},"1325":{"index":21,"selectable":1,"hex":"84573c"},"67":{"index":22,"selectable":1,"hex":"A86B19"},"1409":{"index":23,"selectable":1,"hex":"c69f71"},"89":{"index":24,"selectable":1,"hex":"F3E1AF"},"92":{"index":25,"selectable":1,"hex":"FFFFFF"},"93":{"index":26,"selectable":1,"hex":"FFF41D"},"1321":{"index":27,"selectable":1,"hex":"ffe508"},"1410":{"index":28,"selectable":1,"hex":"ffcc00"},"1322":{"index":29,"selectable":1,"hex":"ffa508"},"94":{"index":30,"selectable":1,"hex":"FF9211"},"1323":{"index":31,"selectable":1,"hex":"ff5b08"},"70":{"index":32,"selectable":1,"hex":"C74400"},"1411":{"index":33,"selectable":1,"hex":"da6a43"},"1324":{"index":34,"selectable":1,"hex":"b18276"},"1329":{"index":35,"selectable":1,"hex":"ae4747"},"1330":{"index":36,"selectable":1,"hex":"813033"},"1331":{"index":37,"selectable":1,"hex":"5b2420"},"100":{"index":38,"selectable":1,"hex":"9B001D"},"1412":{"index":39,"selectable":1,"hex":"d2183c"},"1413":{"index":40,"selectable":1,"hex":"e53624"},"96":{"index":41,"selectable":1,"hex":"FF1300"},"1328":{"index":42,"selectable":1,"hex":"ff638f"},"1414":{"index":43,"selectable":1,"hex":"fe86b1"},"97":{"index":44,"selectable":1,"hex":"FF6D8F"},"1326":{"index":45,"selectable":1,"hex":"ffc7e4"},"98":{"index":46,"selectable":1,"hex":"E993FF"},"1327":{"index":47,"selectable":1,"hex":"ff88f4"},"95":{"index":48,"selectable":1,"hex":"FF27A6"},"99":{"index":49,"selectable":1,"hex":"C600AD"},"1415":{"index":50,"selectable":1,"hex":"a1295e"},"1416":{"index":51,"selectable":1,"hex":"a723c9"},"1417":{"index":52,"selectable":1,"hex":"6a0481"},"1418":{"index":53,"selectable":1,"hex":"693959"},"1419":{"index":54,"selectable":1,"hex":"62368c"},"79":{"index":55,"selectable":1,"hex":"544A81"},"1420":{"index":56,"selectable":1,"hex":"957caf"},"78":{"index":57,"selectable":1,"hex":"6D80BB"},"1340":{"index":58,"selectable":1,"hex":"574bfb"},"1421":{"index":59,"selectable":1,"hex":"6b71ed"},"1339":{"index":60,"selectable":1,"hex":"8791f0"},"1337":{"index":61,"selectable":1,"hex":"c1c6ef"},"105":{"index":62,"selectable":1,"hex":"94FFEC"},"104":{"index":63,"selectable":1,"hex":"00B9A8"},"1422":{"index":64,"selectable":1,"hex":"009db9"},"106":{"index":65,"selectable":1,"hex":"1BD2FF"},"1423":{"index":66,"selectable":1,"hex":"2f8ce9"},"107":{"index":67,"selectable":1,"hex":"1F55FF"},"1424":{"index":68,"selectable":1,"hex":"1946c7"},"108":{"index":69,"selectable":1,"hex":"0219A5"},"1341":{"index":70,"selectable":1,"hex":"394a7e"},"1425":{"index":71,"selectable":1,"hex":"2d547b"},"1426":{"index":72,"selectable":1,"hex":"406184"},"1338":{"index":73,"selectable":1,"hex":"6fa5cc"},"77":{"index":74,"selectable":1,"hex":"ACC9E6"},"1427":{"index":75,"selectable":1,"hex":"c8c8c8"},"63":{"index":76,"selectable":1,"hex":"A4A4A4"},"1428":{"index":77,"selectable":1,"hex":"868686"},"1334":{"index":78,"selectable":1,"hex":"89906e"},"1335":{"index":79,"selectable":1,"hex":"738b6e"},"1429":{"index":80,"selectable":1,"hex":"626738"},"109":{"index":81,"selectable":1,"hex":"3A5341"},"1336":{"index":82,"selectable":1,"hex":"1d301a"},"1430":{"index":83,"selectable":1,"hex":"0a6437"},"1431":{"index":84,"selectable":1,"hex":"47891f"},"1432":{"index":85,"selectable":1,"hex":"10a32f"},"1433":{"index":86,"selectable":1,"hex":"69bb2d"},"87":{"index":87,"selectable":1,"hex":"BABB3D"},"86":{"index":88,"selectable":1,"hex":"EDFF9A"},"1315":{"index":89,"selectable":1,"hex":"D2FF00"},"103":{"index":90,"selectable":1,"hex":"AFF203"},"102":{"index":91,"selectable":1,"hex":"1CDC00"},"101":{"index":92,"selectable":1,"hex":"76FF2D"},"1332":{"index":93,"selectable":1,"hex":"9eff8d"},"1333":{"index":94,"selectable":1,"hex":"a2cc89"}}},
    setsJSON: [{"paletteid":2,"type":"hr","sets":{"175":{"gender":"M"},"3004":{"gender":"F"},"3011":{"gender":"U"},"3012":{"gender":"F"},"3020":{"gender":"M"},"3021":{"gender":"U"},"3024":{"gender":"F"},"3025":{"gender":"M"},"3037":{"gender":"F"},"3040":{"gender":"F"},"3041":{"gender":"U"},"3043":{"gender":"U"},"3044":{"gender":"F"},"3048":{"gender":"U"},"3056":{"gender":"M"},"3090":{"gender":"U"},"3160":{"gender":"F"},"3161":{"gender":"F"},"3162":{"gender":"M"},"3163":{"gender":"M"},"3172":{"gender":"U"},"3194":{"gender":"U"},"3195":{"gender":"F"},"3221":{"gender":"F"},"3247":{"gender":"U"},"3251":{"gender":"F"},"3255":{"gender":"F"},"3256":{"gender":"U"},"3260":{"gender":"M"},"3273":{"gender":"F"},"3278":{"gender":"M"},"3281":{"gender":"M"},"3322":{"gender":"U"},"3325":{"gender":"U"},"3339":{"gender":"U"},"3357":{"gender":"M"},"3369":{"gender":"U"},"3370":{"gender":"U"},"3377":{"gender":"U"},"3386":{"gender":"U"},"3393":{"gender":"U"},"3396":{"gender":"U"},"3436":{"gender":"U"},"3468":{"gender":"U"},"3499":{"gender":"U"},"3516":{"gender":"U"},"3519":{"gender":"U"},"3520":{"gender":"U"},"3525":{"gender":"U"},"3531":{"gender":"U"},"9534":{"gender":"F"},"145":{"gender":"M"},"550":{"gender":"F"},"125":{"gender":"M"},"165":{"gender":"M"},"676":{"gender":"U"},"105":{"gender":"M"},"155":{"gender":"M"},"500":{"gender":"F"},"555":{"gender":"F"},"681":{"gender":"U"},"510":{"gender":"F"},"115":{"gender":"M"},"170":{"gender":"M"},"505":{"gender":"F"},"540":{"gender":"F"},"530":{"gender":"F"},"515":{"gender":"F"},"679":{"gender":"U"},"135":{"gender":"M"},"575":{"gender":"F"},"110":{"gender":"M"},"520":{"gender":"F"},"545":{"gender":"F"},"889":{"gender":"M"},"890":{"gender":"F"},"891":{"gender":"U"},"892":{"gender":"U"},"893":{"gender":"U"},"802":{"gender":"M"},"840":{"gender":"F"},"828":{"gender":"M"},"837":{"gender":"F"},"834":{"gender":"F"},"830":{"gender":"M"},"831":{"gender":"M"},"836":{"gender":"F"},"811":{"gender":"F"},"833":{"gender":"F"},"838":{"gender":"F"},"835":{"gender":"F"},"829":{"gender":"M"},"678":{"gender":"U"},"832":{"gender":"F"},"839":{"gender":"F"},"677":{"gender":"U"}}},{"paletteid":1,"type":"hd","sets":{"620":{"gender":"F"},"626":{"gender":"F"},"3096":{"gender":"F"},"180":{"gender":"M"},"207":{"gender":"M"},"3091":{"gender":"M"},"205":{"gender":"M"},"190":{"gender":"M"},"3092":{"gender":"M"},"625":{"gender":"F"},"185":{"gender":"M"},"195":{"gender":"M"},"3093":{"gender":"M"},"610":{"gender":"F"},"3097":{"gender":"F"},"200":{"gender":"M"},"600":{"gender":"F"},"615":{"gender":"F"},"3098":{"gender":"F"},"206":{"gender":"M"},"3094":{"gender":"M"},"627":{"gender":"F"},"605":{"gender":"F"},"3099":{"gender":"F"},"208":{"gender":"M"},"209":{"gender":"M"},"3095":{"gender":"M"},"628":{"gender":"F"},"629":{"gender":"F"},"3100":{"gender":"F"},"3101":{"gender":"M"},"3102":{"gender":"M"},"3103":{"gender":"M"},"3104":{"gender":"F"},"3105":{"gender":"F"},"3106":{"gender":"F"}}},{"paletteid":3,"type":"ch","sets":{"680":{"gender":"F"},"3001":{"gender":"M"},"3005":{"gender":"F"},"3013":{"gender":"F"},"3014":{"gender":"F"},"3015":{"gender":"M"},"3022":{"gender":"M"},"3030":{"gender":"M"},"3032":{"gender":"M"},"3033":{"gender":"F"},"3036":{"gender":"F"},"3038":{"gender":"M"},"3045":{"gender":"F"},"3046":{"gender":"F"},"3049":{"gender":"F"},"3050":{"gender":"M"},"3051":{"gender":"F"},"3059":{"gender":"M"},"3060":{"gender":"F"},"3067":{"gender":"F"},"3076":{"gender":"F"},"3077":{"gender":"M"},"3109":{"gender":"M"},"3110":{"gender":"M"},"3111":{"gender":"M"},"3112":{"gender":"F"},"3113":{"gender":"F"},"3114":{"gender":"F"},"3133":{"gender":"F"},"3135":{"gender":"F"},"3137":{"gender":"F"},"3165":{"gender":"F"},"3167":{"gender":"M"},"3183":{"gender":"F"},"3185":{"gender":"M"},"3197":{"gender":"F"},"3199":{"gender":"F"},"3203":{"gender":"M"},"3208":{"gender":"M"},"3213":{"gender":"F"},"3214":{"gender":"F"},"3215":{"gender":"M"},"3222":{"gender":"M"},"3233":{"gender":"F"},"3234":{"gender":"M"},"3237":{"gender":"U"},"3244":{"gender":"F"},"3245":{"gender":"F"},"3250":{"gender":"F"},"3266":{"gender":"F"},"3279":{"gender":"M"},"3293":{"gender":"F"},"3321":{"gender":"U"},"3323":{"gender":"M"},"3332":{"gender":"U"},"3334":{"gender":"M"},"3335":{"gender":"F"},"3336":{"gender":"M"},"3340":{"gender":"F"},"3342":{"gender":"U"},"3351":{"gender":"F"},"3367":{"gender":"F"},"3368":{"gender":"M"},"3371":{"gender":"F"},"3372":{"gender":"M"},"3399":{"gender":"F"},"3400":{"gender":"M"},"3416":{"gender":"M"},"3417":{"gender":"F"},"3428":{"gender":"F"},"3429":{"gender":"M"},"3432":{"gender":"M"},"3433":{"gender":"F"},"3438":{"gender":"M"},"3439":{"gender":"F"},"3442":{"gender":"F"},"3443":{"gender":"M"},"3446":{"gender":"U"},"3459":{"gender":"U"},"3486":{"gender":"M"},"3487":{"gender":"F"},"3489":{"gender":"M"},"3490":{"gender":"F"},"3491":{"gender":"M"},"3492":{"gender":"F"},"3496":{"gender":"F"},"3497":{"gender":"F"},"3498":{"gender":"M"},"3501":{"gender":"F"},"3505":{"gender":"F"},"3506":{"gender":"M"},"3510":{"gender":"M"},"3517":{"gender":"F"},"3518":{"gender":"M"},"3527":{"gender":"M"},"3528":{"gender":"F"},"3529":{"gender":"M"},"3530":{"gender":"F"},"876":{"gender":"M"},"675":{"gender":"F"},"690":{"gender":"F"},"879":{"gender":"F"},"210":{"gender":"M"},"665":{"gender":"F"},"685":{"gender":"F"},"267":{"gender":"M"},"245":{"gender":"M"},"878":{"gender":"M"},"670":{"gender":"F"},"645":{"gender":"F"},"640":{"gender":"F"},"220":{"gender":"M"},"655":{"gender":"F"},"882":{"gender":"F"},"881":{"gender":"F"},"255":{"gender":"M"},"880":{"gender":"F"},"875":{"gender":"M"},"262":{"gender":"M"},"669":{"gender":"F"},"691":{"gender":"F"},"660":{"gender":"F"},"240":{"gender":"M"},"250":{"gender":"M"},"877":{"gender":"M"},"650":{"gender":"F"},"215":{"gender":"M"},"230":{"gender":"M"},"266":{"gender":"M"},"235":{"gender":"M"},"635":{"gender":"F"},"265":{"gender":"M"},"667":{"gender":"F"},"630":{"gender":"F"},"225":{"gender":"M"},"807":{"gender":"M"},"816":{"gender":"F"},"813":{"gender":"F"},"812":{"gender":"F"},"815":{"gender":"F"},"823":{"gender":"F"},"804":{"gender":"M"},"818":{"gender":"F"},"803":{"gender":"M"},"814":{"gender":"F"},"809":{"gender":"M"},"819":{"gender":"F"},"824":{"gender":"F"},"808":{"gender":"M"},"825":{"gender":"F"},"822":{"gender":"F"},"805":{"gender":"M"},"806":{"gender":"M"},"821":{"gender":"F"},"826":{"gender":"F"},"820":{"gender":"F"},"817":{"gender":"F"},"883":{"gender":"F"},"884":{"gender":"F"},"885":{"gender":"F"}}},{"paletteid":3,"type":"lg","sets":{"715":{"gender":"F"},"3006":{"gender":"F"},"3017":{"gender":"U"},"3018":{"gender":"F"},"3019":{"gender":"F"},"3023":{"gender":"U"},"3047":{"gender":"F"},"3057":{"gender":"U"},"3058":{"gender":"U"},"3061":{"gender":"F"},"3078":{"gender":"U"},"3088":{"gender":"U"},"3116":{"gender":"U"},"3134":{"gender":"F"},"3136":{"gender":"U"},"3138":{"gender":"U"},"3166":{"gender":"F"},"3174":{"gender":"F"},"3190":{"gender":"F"},"3191":{"gender":"F"},"3192":{"gender":"F"},"3198":{"gender":"F"},"3200":{"gender":"F"},"3201":{"gender":"M"},"3202":{"gender":"U"},"3216":{"gender":"U"},"3235":{"gender":"U"},"3257":{"gender":"U"},"3267":{"gender":"F"},"3282":{"gender":"F"},"3283":{"gender":"F"},"3290":{"gender":"M"},"3320":{"gender":"U"},"3328":{"gender":"U"},"3333":{"gender":"U"},"3337":{"gender":"U"},"3341":{"gender":"U"},"3353":{"gender":"U"},"3355":{"gender":"U"},"3361":{"gender":"U"},"3364":{"gender":"U"},"3365":{"gender":"U"},"3384":{"gender":"U"},"3387":{"gender":"U"},"3391":{"gender":"U"},"3401":{"gender":"U"},"3407":{"gender":"U"},"3408":{"gender":"U"},"3418":{"gender":"U"},"3434":{"gender":"U"},"3449":{"gender":"U"},"3460":{"gender":"U"},"3483":{"gender":"U"},"3502":{"gender":"F"},"3521":{"gender":"U"},"3526":{"gender":"U"},"696":{"gender":"F"},"280":{"gender":"M"},"285":{"gender":"M"},"710":{"gender":"F"},"720":{"gender":"F"},"270":{"gender":"M"},"281":{"gender":"M"},"275":{"gender":"M"},"700":{"gender":"F"},"705":{"gender":"F"},"695":{"gender":"F"},"827":{"gender":"F"},"716":{"gender":"F"}}},{"paletteid":3,"type":"sh","sets":{"740":{"gender":"F"},"3016":{"gender":"U"},"3027":{"gender":"U"},"3035":{"gender":"U"},"3064":{"gender":"F"},"3068":{"gender":"U"},"3089":{"gender":"U"},"300":{"gender":"M"},"735":{"gender":"F"},"730":{"gender":"F"},"305":{"gender":"M"},"295":{"gender":"M"},"725":{"gender":"F"},"290":{"gender":"M"},"905":{"gender":"U"},"906":{"gender":"U"},"907":{"gender":"F"},"908":{"gender":"M"},"3115":{"gender":"U"},"3154":{"gender":"U"},"3180":{"gender":"F"},"3184":{"gender":"F"},"3206":{"gender":"U"},"3252":{"gender":"U"},"3275":{"gender":"U"},"3277":{"gender":"F"},"3338":{"gender":"U"},"3348":{"gender":"U"},"3354":{"gender":"U"},"3375":{"gender":"U"},"3383":{"gender":"U"},"3419":{"gender":"U"},"3435":{"gender":"U"},"3467":{"gender":"U"},"3524":{"gender":"U"}}},{"paletteid":3,"type":"ha","sets":{"1010":{"gender":"U"},"1003":{"gender":"U"},"1018":{"gender":"U"},"1020":{"gender":"U"},"1022":{"gender":"U"},"1006":{"gender":"U"},"1021":{"gender":"U"},"1023":{"gender":"U"},"1017":{"gender":"U"},"1002":{"gender":"U"},"1007":{"gender":"U"},"1014":{"gender":"U"},"1005":{"gender":"U"},"1001":{"gender":"U"},"1008":{"gender":"U"},"1015":{"gender":"U"},"1004":{"gender":"U"},"1009":{"gender":"U"},"1013":{"gender":"U"},"1019":{"gender":"U"},"1016":{"gender":"U"},"1024":{"gender":"U"},"1011":{"gender":"U"},"1012":{"gender":"U"},"1025":{"gender":"U"},"1026":{"gender":"U"},"1027":{"gender":"U"},"3026":{"gender":"U"},"3054":{"gender":"U"},"3086":{"gender":"U"},"3117":{"gender":"U"},"3118":{"gender":"U"},"3129":{"gender":"U"},"3130":{"gender":"U"},"3139":{"gender":"U"},"3140":{"gender":"U"},"3144":{"gender":"U"},"3145":{"gender":"U"},"3150":{"gender":"U"},"3156":{"gender":"U"},"3171":{"gender":"U"},"3173":{"gender":"U"},"3179":{"gender":"U"},"3209":{"gender":"U"},"3220":{"gender":"F"},"3231":{"gender":"U"},"3236":{"gender":"U"},"3238":{"gender":"U"},"3240":{"gender":"U"},"3241":{"gender":"U"},"3242":{"gender":"U"},"3243":{"gender":"U"},"3253":{"gender":"U"},"3254":{"gender":"U"},"3259":{"gender":"U"},"3261":{"gender":"U"},"3265":{"gender":"U"},"3268":{"gender":"U"},"3272":{"gender":"U"},"3291":{"gender":"U"},"3298":{"gender":"U"},"3300":{"gender":"U"},"3303":{"gender":"U"},"3305":{"gender":"U"},"3331":{"gender":"U"},"3347":{"gender":"U"},"3349":{"gender":"U"},"3352":{"gender":"U"},"3356":{"gender":"U"},"3362":{"gender":"U"},"3363":{"gender":"U"},"3382":{"gender":"U"},"3392":{"gender":"U"},"3394":{"gender":"U"},"3404":{"gender":"U"},"3409":{"gender":"U"},"3415":{"gender":"U"},"3421":{"gender":"U"},"3422":{"gender":"U"},"3426":{"gender":"U"},"3430":{"gender":"U"},"3431":{"gender":"U"},"3440":{"gender":"U"},"3441":{"gender":"U"},"3450":{"gender":"U"},"3451":{"gender":"U"},"3452":{"gender":"U"},"3453":{"gender":"U"},"3454":{"gender":"U"},"3455":{"gender":"U"},"3456":{"gender":"U"},"3457":{"gender":"U"},"3461":{"gender":"U"},"3463":{"gender":"U"},"3477":{"gender":"U"},"3478":{"gender":"U"},"3479":{"gender":"U"},"3480":{"gender":"U"},"3481":{"gender":"U"},"3482":{"gender":"U"},"3488":{"gender":"U"},"3494":{"gender":"U"},"3495":{"gender":"U"},"3500":{"gender":"U"},"3514":{"gender":"U"},"3533":{"gender":"U"},"3534":{"gender":"U"},"3535":{"gender":"U"}}},{"paletteid":3,"type":"he","sets":{"1606":{"gender":"U"},"3069":{"gender":"U"},"3070":{"gender":"U"},"3071":{"gender":"U"},"3079":{"gender":"U"},"3081":{"gender":"U"},"3082":{"gender":"U"},"3146":{"gender":"U"},"3149":{"gender":"U"},"3155":{"gender":"U"},"3164":{"gender":"U"},"3181":{"gender":"U"},"1605":{"gender":"U"},"1602":{"gender":"U"},"1601":{"gender":"U"},"1607":{"gender":"U"},"1604":{"gender":"U"},"1603":{"gender":"U"},"1608":{"gender":"U"},"1609":{"gender":"U"},"1610":{"gender":"U"},"3188":{"gender":"F"},"3189":{"gender":"U"},"3218":{"gender":"U"},"3227":{"gender":"U"},"3228":{"gender":"U"},"3229":{"gender":"U"},"3239":{"gender":"U"},"3258":{"gender":"U"},"3274":{"gender":"U"},"3295":{"gender":"U"},"3297":{"gender":"U"},"3324":{"gender":"U"},"3329":{"gender":"U"},"3358":{"gender":"U"},"3376":{"gender":"U"},"3379":{"gender":"U"},"3385":{"gender":"U"},"3395":{"gender":"U"},"3465":{"gender":"U"},"3469":{"gender":"U"}}},{"paletteid":3,"type":"ea","sets":{"1404":{"gender":"U"},"3083":{"gender":"U"},"3107":{"gender":"U"},"3108":{"gender":"U"},"3141":{"gender":"U"},"3148":{"gender":"U"},"3168":{"gender":"U"},"3169":{"gender":"U"},"3170":{"gender":"U"},"3196":{"gender":"U"},"3224":{"gender":"U"},"3226":{"gender":"U"},"3262":{"gender":"U"},"3270":{"gender":"U"},"3318":{"gender":"U"},"3388":{"gender":"U"},"3484":{"gender":"U"},"3493":{"gender":"U"},"1401":{"gender":"U"},"1403":{"gender":"U"},"1402":{"gender":"U"},"1405":{"gender":"U"},"1406":{"gender":"U"}}},{"paletteid":3,"type":"fa","sets":{"1202":{"gender":"U"},"3147":{"gender":"U"},"3193":{"gender":"U"},"3230":{"gender":"U"},"3276":{"gender":"U"},"3296":{"gender":"U"},"3344":{"gender":"U"},"3345":{"gender":"U"},"3346":{"gender":"U"},"3350":{"gender":"U"},"3378":{"gender":"U"},"3462":{"gender":"U"},"3470":{"gender":"U"},"3471":{"gender":"U"},"3472":{"gender":"U"},"3473":{"gender":"U"},"3474":{"gender":"U"},"3475":{"gender":"U"},"3476":{"gender":"U"},"1208":{"gender":"U"},"1206":{"gender":"U"},"1204":{"gender":"U"},"1205":{"gender":"U"},"1201":{"gender":"U"},"1209":{"gender":"U"},"1203":{"gender":"U"},"1207":{"gender":"U"},"1210":{"gender":"U"},"1211":{"gender":"U"},"1212":{"gender":"U"}}},{"paletteid":3,"type":"ca","sets":{"1810":{"gender":"U"},"3084":{"gender":"U"},"3085":{"gender":"U"},"3131":{"gender":"U"},"3151":{"gender":"U"},"3175":{"gender":"U"},"3176":{"gender":"U"},"3177":{"gender":"U"},"3187":{"gender":"U"},"3217":{"gender":"U"},"3219":{"gender":"U"},"3223":{"gender":"U"},"3225":{"gender":"U"},"3292":{"gender":"U"},"3343":{"gender":"U"},"3410":{"gender":"U"},"3411":{"gender":"U"},"3412":{"gender":"U"},"3413":{"gender":"U"},"3414":{"gender":"U"},"3423":{"gender":"U"},"3424":{"gender":"U"},"3425":{"gender":"U"},"3437":{"gender":"U"},"3444":{"gender":"U"},"3458":{"gender":"U"},"3464":{"gender":"U"},"3466":{"gender":"U"},"3485":{"gender":"U"},"3503":{"gender":"U"},"3511":{"gender":"M"},"1803":{"gender":"U"},"1806":{"gender":"U"},"1809":{"gender":"U"},"1805":{"gender":"U"},"1801":{"gender":"U"},"1802":{"gender":"U"},"1804":{"gender":"U"},"1808":{"gender":"U"},"1811":{"gender":"U"},"1807":{"gender":"U"},"1812":{"gender":"U"},"1813":{"gender":"U"},"1814":{"gender":"U"},"1815":{"gender":"U"},"1816":{"gender":"U"},"1817":{"gender":"U"},"1818":{"gender":"U"},"1819":{"gender":"U"}}},{"paletteid":3,"type":"wa","sets":{"2012":{"gender":"U"},"3072":{"gender":"U"},"3073":{"gender":"U"},"3074":{"gender":"U"},"3080":{"gender":"U"},"3178":{"gender":"F"},"3210":{"gender":"F"},"3211":{"gender":"M"},"3212":{"gender":"U"},"3263":{"gender":"U"},"3264":{"gender":"U"},"3359":{"gender":"U"},"3366":{"gender":"U"},"3427":{"gender":"U"},"3504":{"gender":"U"},"2007":{"gender":"U"},"2006":{"gender":"U"},"2011":{"gender":"U"},"2009":{"gender":"U"},"2008":{"gender":"U"},"2002":{"gender":"U"},"2004":{"gender":"U"},"2001":{"gender":"U"},"2003":{"gender":"U"},"2010":{"gender":"F"},"2005":{"gender":"U"}}},{"paletteid":3,"type":"cc","sets":{"3002":{"gender":"M"},"3003":{"gender":"F"},"3007":{"gender":"M"},"3008":{"gender":"F"},"3009":{"gender":"M"},"3010":{"gender":"F"},"3039":{"gender":"M"},"3066":{"gender":"F"},"3075":{"gender":"M"},"3087":{"gender":"M"},"3152":{"gender":"M"},"3153":{"gender":"M"},"3157":{"gender":"F"},"3158":{"gender":"M"},"3159":{"gender":"F"},"3186":{"gender":"M"},"3232":{"gender":"U"},"3246":{"gender":"U"},"3248":{"gender":"F"},"3249":{"gender":"F"},"3269":{"gender":"M"},"3280":{"gender":"M"},"3289":{"gender":"U"},"3294":{"gender":"U"},"3299":{"gender":"U"},"3302":{"gender":"M"},"3304":{"gender":"F"},"3326":{"gender":"U"},"3327":{"gender":"U"},"3360":{"gender":"U"},"3373":{"gender":"F"},"3374":{"gender":"M"},"3380":{"gender":"M"},"3381":{"gender":"F"},"3389":{"gender":"M"},"3390":{"gender":"F"},"3397":{"gender":"F"},"3398":{"gender":"M"},"3405":{"gender":"M"},"3406":{"gender":"F"},"3420":{"gender":"U"},"3447":{"gender":"F"},"3448":{"gender":"M"},"3507":{"gender":"F"},"3508":{"gender":"M"},"3509":{"gender":"M"},"3512":{"gender":"M"},"3513":{"gender":"F"},"3515":{"gender":"F"},"3522":{"gender":"M"},"3523":{"gender":"F"},"3532":{"gender":"U"},"9563":{"gender":"F"},"9865":{"gender":"F"},"260":{"gender":"M"},"888":{"gender":"F"},"886":{"gender":"M"},"887":{"gender":"U"}}},{"paletteid":3,"type":"cp","sets":{"3119":{"gender":"U"},"3120":{"gender":"U"},"3121":{"gender":"U"},"3122":{"gender":"U"},"3123":{"gender":"U"},"3124":{"gender":"U"},"3125":{"gender":"U"},"3126":{"gender":"U"},"3127":{"gender":"U"},"3128":{"gender":"U"},"3204":{"gender":"M"},"3205":{"gender":"M"},"3207":{"gender":"F"},"3284":{"gender":"M"},"3285":{"gender":"F"},"3286":{"gender":"M"},"3287":{"gender":"F"},"3288":{"gender":"U"},"3307":{"gender":"U"},"3308":{"gender":"U"},"3309":{"gender":"U"},"3310":{"gender":"U"},"3311":{"gender":"U"},"3312":{"gender":"U"},"3313":{"gender":"U"},"3314":{"gender":"U"},"3315":{"gender":"U"},"3316":{"gender":"U"},"3317":{"gender":"U"},"3402":{"gender":"U"},"3403":{"gender":"U"}}}],

    habboM: { hr: { color: '61', set: '831' }, hd: { color: '2', set: '3092' }, ch: { color: '110-1408', set: '3438' }, lg: { color: '110', set: '3058' }, sh: { color: '1408', set: '3089' }, ha: { color: '', set: '' }, he: { color: '', set: '' }, ea: { color: '', set: '' }, fa: { color: '', set: '' }, ca: { color: '110', set: '3219' }, wa: { color: '0', set: '2001' }, cc: { color: '', set: '' }, cp: { color: '', set: '' } },
    habboF: { hr: { color: '33', set: '515' }, hd: { color: '1', set: '600' }, ch: { color: '70', set: '635' }, lg: { color: '66-62', set: '716' }, sh: { color: '68', set: '735' }, ha: { color: '', set: '' }, he: { color: '', set: '' }, ea: { color: '', set: '' }, fa: { color: '', set: '' }, ca: { color: '', set: '' }, wa: { color: '', set: '' }, cc: { color: '', set: '' }, cp: { color: '', set: '' } },

    init: function() {
        this.setupNavigation();
        this.setupImagerSave();
        this.setupEditorSave();
        
        // Arrancamos el visor
        this.loadClothes('hd');
        this.loadColors('hd');
        this.updateAvatar();
    },

    getHabbo: function() {
        return this.currentGender === 'M' ? this.habboM : this.habboF;
    },

    buildFigure: function() {
        let figure = "";
        const h = this.getHabbo();
        for (const [part, data] of Object.entries(h)) {
            if (data.set && data.color !== "") {
                figure += `.${part}-${data.set}-${data.color}`;
            }
        }
        return figure.substring(1);
    },

    updateAvatar: function() {
        const fig = this.buildFigure();
        const url = `https://www.habbo.es/habbo-imaging/avatarimage?head_direction=4&direction=4&size=l&figure=${fig}&gender=${this.currentGender}`;
        document.getElementById('myHabbo2').src = url;
    },

    filterByType: function(type) {
        return this.setsJSON.find(s => s.type === type);
    },

    loadClothes: function(type) {
        const container = document.getElementById('clothes');
        container.innerHTML = '';
        const load = this.filterByType(type);
        if (!load) return;

        // Botón de quitar ropa
        if (type !== 'hd' && type !== 'lg') {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'clothes-object removable';
            a.style.backgroundImage = 'url("assets/img/editor/removable.png")'; 
            
            if (!this.getHabbo()[type].set) a.classList.add('selected');
            a.onclick = (e) => {
                e.preventDefault();
                this.getHabbo()[type].set = '';
                document.querySelectorAll('#clothes .selected').forEach(el => el.classList.remove('selected'));
                a.classList.add('selected');
                this.updateAvatar();
            };
            container.appendChild(a);
        }

        Object.entries(load.sets).forEach(([index, value]) => {
            if ((value.gender === this.currentGender || value.gender === 'U')) {
                const current = this.getHabbo()[type];
                const colorToUse = current.color || '61';
                const partString = `${type}-${index}-${colorToUse}`;
                
                const a = document.createElement('a');
                a.href = '#';
                a.className = `clothes-object ${type}`;
                if (index === current.set) a.classList.add('selected');
                
                a.style.backgroundImage = `url(https://www.habbo.es/habbo-imaging/avatarimage?figure=${partString}&gender=${this.currentGender})`;
                
                a.onclick = (e) => {
                    e.preventDefault();
                    this.getHabbo()[type].set = index;
                    this.getHabbo()[type].color = colorToUse;
                    document.querySelectorAll('#clothes .selected').forEach(el => el.classList.remove('selected'));
                    a.classList.add('selected');
                    this.updateAvatar();
                };
                container.appendChild(a);
            }
        });
    },

    loadColors: function(type) {
        const container = document.getElementById('colors');
        container.innerHTML = '';
        const load = this.filterByType(type);
        if (!load) return;
        
        const colorsData = this.palettesJSON[load.paletteid];
        Object.entries(colorsData).forEach(([index, value]) => {
            if (value.selectable === 1) {
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'color-object';
                a.style.background = `#${value.hex}`;
                a.style.display = 'inline-block';
                a.style.width = '20px';
                a.style.height = '20px';
                a.style.margin = '2px';
                a.style.borderRadius = '3px';
                a.style.border = '1px solid #000';
                a.onclick = (e) => {
                    e.preventDefault();
                    this.getHabbo()[type].color = index;
                    this.updateAvatar();
                    this.loadClothes(type);
                };
                container.appendChild(a);
            }
        });
    },

    setupNavigation: function() {
        const self = this;
        
        // Modos: Imager vs Editor
        document.getElementById("btn-mode-imager").addEventListener("click", () => {
            document.getElementById("profile-choice-menu").classList.add("hidden");
            document.getElementById("imager-section").classList.remove("hidden");
        });

        document.getElementById("btn-mode-editor").addEventListener("click", () => {
            document.getElementById("profile-choice-menu").classList.add("hidden");
            document.getElementById("editor-section").classList.remove("hidden");
        });

        // Navegación dentro del Editor Pro
        document.querySelectorAll('a[data-navigate]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget;
                
                if (target.dataset.subnav) {
                    document.querySelectorAll('.main-navigation li').forEach(li => li.classList.remove('active'));
                    target.parentElement.classList.add('active');
                    
                    document.querySelectorAll('.sub-navigation ul').forEach(ul => {
                        ul.classList.remove('display');
                        ul.classList.add('hidden');
                    });
                    document.getElementById(target.dataset.subnav).classList.remove('hidden');
                    document.getElementById(target.dataset.subnav).classList.add('display');
                }

                document.querySelectorAll('.sub-navigation a.nav-selected').forEach(el => {
                    if (el.dataset.navigate) el.classList.remove('nav-selected');
                });
                if (!target.dataset.subnav) target.classList.add('nav-selected');

                self.currentSetType = target.dataset.navigate;
                self.loadClothes(self.currentSetType);
                self.loadColors(self.currentSetType);
            });
        });

        // Cambio de género
        document.querySelectorAll('a[data-gender]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const newGender = e.currentTarget.dataset.gender;
                if (newGender === self.currentGender) return;
                
                document.querySelectorAll('a[data-gender]').forEach(el => el.classList.remove('nav-selected'));
                e.currentTarget.classList.add('nav-selected');
                
                self.currentGender = newGender;
                self.loadClothes(self.currentSetType);
                self.updateAvatar();
            });
        });
    },

    // Guardar opción Habbo Imager
    setupImagerSave: function() {
        document.getElementById("btn-save-imager").addEventListener("click", async () => {
            const name = document.getElementById("habbo-name-input").value.trim();
            if (!name) return;

            const btn = document.getElementById("btn-save-imager");
            btn.textContent = "Guardando...";

            const { data: { user } } = await db.auth.getUser();
            if (user) {
                const { error } = await db.from('users').update({ look_string: name }).eq('id', user.id);
                if (!error) {
                    alert("¡Nombre guardado correctamente!");
                    location.reload();
                } else {
                    alert("Error al guardar: " + error.message);
                    btn.textContent = "Guardar Nombre";
                }
            } else {
                alert("Error: No estás conectado.");
                btn.textContent = "Guardar Nombre";
            }
        });
    },

    // Guardar opción Creador Pro
    setupEditorSave: function() {
        document.getElementById("btn-descargar-pro").addEventListener("click", async () => {
            const btn = document.getElementById("btn-descargar-pro");
            btn.textContent = "Guardando...";
            
            const fig = this.buildFigure();
            const { data: { user } } = await db.auth.getUser();
            
            if (user) {
                // AQUÍ ESTABA EL ÚNICO FALLO EN TU CÓDIGO (supabase -> db)
                const { error } = await db.from('users').update({ look_string: fig }).eq('id', user.id);
                
                if (!error) {
                    alert("¡Avatar guardado correctamente!");
                    location.reload(); 
                } else {
                    alert("Error: " + error.message);
                    btn.textContent = "Guardar Avatar";
                }
            } else {
                alert("No estás conectado.");
                btn.textContent = "Guardar Avatar";
            }
        });
    }
};

// Arrancamos el editor al cargar el script
ProfileEditor.init();