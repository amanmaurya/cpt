var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var form = require('reformed');
var auth = require('../lib/auth.js');
var mysql = require('../lib/mysql.js');
var util = require('../lib/util.js');
var createUser = require('../lib/create_user.js');
var xls_to_json = require('../lib/upload_Document.js');
var math = require('mathjs');
var fs = require('fs');
var path = require('path');

router.use(function(req, res, next) {
    // var role = req.session.role;
    // console.log('session',req.session)
    if (req.session!=undefined && auth.isUserValidated(req) && auth.isAdmin(req)) {
        next();
    } else {
        req.session.destroy();
        res.redirect('/');
    }
});

//var passwordMailer = require('../password_mailer.js');
//var generatePassword = require('../generate_password');
router.get('/', function(req, res, next) {


    var query = require('url').parse(req.url, true).query;
    if (query.msg != undefined) {
        var msg = query.msg;
    } else {
        var msg = -1;
    }
    var query = "call usp_gettreestructuretemplate_rs()";
    mysql(query, function(err, result) {
        if (err) {
            console.log("err");
        } else {

            res.render('admin/admin_panel', {
                templatedata: result[0],
                name: req.session.email,
                fname:req.session.name,
                msg: msg,
                errordata: ''
            });
        }
    });

});


router.post('/addtempandcat', function(req, res, next) {
    if(req.body.code!=''){
    var code1 = (req.body.code).trim();
    }
    else{
    var code1 = (req.body.code);    
    }
    var rtime;
    var rpid;
    var ctgroup;
    var vertid;
    if ((req.body.returntime) == '') {
        rtime = 0;
    } else {
        rtime = req.body.returntime;
    }
    if ((req.body.rpolicyid) == '') {
        rpid = 0;
    } else {
        rpid = req.body.rpolicyid;
    }
    if (req.body.catgroup == 'undefined' && (req.body.catgroup) == '') {
        ctgroup = 0;
    } else {
        ctgroup = req.body.catgroup;
    }
    if ((req.body.vertid) == '') {
        vertid = 0;
    } else {
        vertid = req.body.vertid;
    }
    var query = {
        sql: 'call usp_addtempandcat_nr(?,?,?,?,?,?,?,?,?)',
        values: [req.body.flg, req.body.id1, req.body.name, req.body.desc, code1, rtime, rpid, ctgroup, vertid]
    }
    console.log(query)
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            // var success = result[0];
            // var message = success[0].success
            console.log(result)
            res.json({
                'result':result
            })
            // res.redirect('/admin/?msg=' + message);
        }
    });
});

router.post('/getgroup', function(req, res, next) {
    var query = "call usp_getcategorygropu_rs()";
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});

router.post('/getmerchant', function(req, res, next) {
   // console.log("jai ho",req.body);
    var query ={
     sql:"call getMerchantdata(?,?,?)",
     values: [req.body.start,req.body.length,req.body['search[value]']]
 }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
          // console.log("sahsfahs",result[0],result[1][0].totalRecord)
           // res.json({"data":result[0]});
            res.json({"sEcho": parseInt(req.body.draw),
                "iTotalRecords": result[1][0].totalRecord,
                "iTotalDisplayRecords": result[1][0].totalRecord,
                "aaData": result[0]});
        }
    });
});

router.post('/edittempcatatt', function(req, res, next) {
    var query = {
        sql: 'call usp_geteditvalue_rs(?,?,?)',
        values: [req.body.id1, req.body.flg, req.body.patid]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});

router.get('/merchant', function(req, res, next) {
    var query = require('url').parse(req.url, true).query;
    var msg = query.msg;
    if (msg == 1) {
        msg = 1;
    } else if (msg == 2) {
        msg = 2;
    } else if (msg == 3) {
        msg = 3;
    } else if (msg == 4) {
        msg = 4;
    } else {
        msg = 0;
    }
    var query = "SELECT * FROM t_merchantAttrMapping";
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.render('admin/merchant', {
                templatedata: '',
                msg: msg,
                merchantdata: result,
                Groupdata: '',
                divid: 'merchant',
                name: req.session.email,
                fname:req.session.name,
                errordata: ''
            });
            // res.json(result);
        }
    });
});


router.post('/checkduplicateattr', function(req, res, next) {
    var query = "SELECT count(*) as flag FROM cpt.t_merchantAttrMapping where Name='"+req.body.checkduplicateattr+"';";

    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
       
            res.json(result);
        }
    });
});

router.post('/checkduplicateattronadit', function(req, res, next) {
    var query = "SELECT count(*) as flag FROM cpt.t_merchantAttrMapping where Name='"+req.body.checkduplicateattr+"' and attrId!="+req.body.attrid+";";

    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
       
            res.json(result);
        }
    });
});

router.post('/editcatandtemp', function(req, res, next) {
    if(req.body.ccode!=''){
    var code = (req.body.ccode).trim();}
    else{
     var code = (req.body.ccode);   
    }
    var rtime;
    var rpid;
    var ctgroup;
    if ((req.body.creturntime) == '') {
        rtime = 0;
    } else {
        rtime = req.body.creturntime;
    }
    if ((req.body.crpolicyid) == '') {
        rpid = 0;
    } else {
        rpid = req.body.crpolicyid;
    }
    if (req.body.ccatgroup == 0) {
        ctgroup = 0;
    } else {
        ctgroup = req.body.ccatgroup;
    }
    var query = {
        sql: 'call usp_edittempandcat_nr(?,?,?,?,?,?,?,?,?)',
        values: [req.body.cid, req.body.cflg, req.body.cname, req.body.cdesc, code, rtime, rpid, ctgroup, req.body.cvertid]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/admin/');
        }
    });

});

router.post('/editattribute', function(req, res, next) {
    var query = {
        sql: 'call usp_editattribute_nr(?,?,?,?)',
        values: [req.body.aid, req.body.apid, req.body.astate, req.body.valid]
    }
    mysql(query, function(err, result) {
      //  console.log('usp_editattribute_nr is ',result)
        if (err) {
            console.log(err);
        } else {
            res.redirect('/admin/');
        }
    });

});

router.post('/addgroup', function(req, res, next) {
    var checklist = "";
    if (req.body.check != undefined) {
        if (req.body.check.constructor === Array) {
            for (var i = 0; i < req.body.check.length; i++) {
                if (i != req.body.check.length - 1) {
                    checklist = checklist + req.body.check[i] + ",";
                } else {
                    checklist = checklist + req.body.check[i];
                }
            }
        } else {
            checklist = req.body.check;
        }
    } else {
        checklist = '';
    }
    var query = {
        sql: 'call usp_addgroup_nr(?,?,?)',
        values: [req.body.groupname, req.body.txtid, checklist]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/admin/Group');
        }
    });

});


router.post('/addMerchant', function(req, res, next) {
 //   console.log("req.body",req.body);
    var allattrdata=null;
    for(var i=0;i<Object.keys(req.body).length-3;i++){
        if(i==0){
        var attrval= "attrname".concat(i);
          allattrdata=req.body[attrval];}
          else{
            var attrval= "attrname".concat(i);
          allattrdata=allattrdata +','+ req.body[attrval];
          }
    }
   console.log("jai ho");

    var query = {
        sql: 'call usp_addmerchant_nr(?,?,?,?,?)',
        values: [req.body.merchantid, req.body.merchanecode, req.body.merchantdispatchtime,allattrdata,Object.keys(req.body).length-4]
    }
      // console.log("jai ho",query);
    mysql(query, function(err, result) {

        if (err) {
            console.log(err);
        } else {
            res.redirect('/admin/merchant');
        }
    });

});

//addattrMerchant
router.post('/addattrMerchant', function(req, res, next) {
    //console.log("sssa body",req.body);
    var query = {
        sql: 'call inr_attributeformerchant(?,?,?)',
        values: [req.body.merchantid1, req.body.attername, req.body.attrvalue]
    }
    console.log(query)
    mysql(query, function(err, result) {

        if (err) {
            console.log(err);
        } else {
            res.redirect('/admin/merchant');
        }
    });

});

router.post('/editattrMerchant', function(req, res, next) {
 //   console.log("sssa body",req.body);
    var query = {
        sql: 'call inr_attributeformerchant(?,?,?)',
        values: [req.body.merchantid1, req.body.attername, req.body.attrvalue]
    }
    mysql(query, function(err, result) {

        if (err) {
            console.log(err);
        } else {
            res.json('sucess');
        }
    });

});


router.post('/get_template', function(req, res, next) {
    var query = "SELECT * FROM t_template order by Name";

    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});

router.post('/get_categoty', function(req, res, next) {

    var query = {
        sql: "call get_categotybytemplate(?)",
        values: [req.body.data]
    }
    mysql(query, function(err, result) {

        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});

router.post('/get_categotybygroup', function(req, res, next) {
    var query = {
        sql: "call usp_getcategorybygroup_rs(?,?)",
        values: [req.body.data, req.body.gid]
    }
    mysql(query, function(err, result) {

        if (err) {
            console.log(err);
        } else {
            //console.log(result[1])
            res.json(result);
        }
    });
});


router.post('/save_attribute', function(req, res, next) {

    var checklist = "";
    if (req.body.check != undefined) {
        if (req.body.check.constructor === Array) {
            for (var i = 0; i < req.body.check.length; i++) {
                if (i != req.body.check.length - 1) {
                    checklist = checklist + req.body.check[i] + ",";
                } else {
                    checklist = checklist + req.body.check[i];
                }
            }
        } else {
            checklist = req.body.check;
        }
    } else {
        checklist = '';
    }
    var query = {
        sql: "call usp_addattribute_nr(?,?,?,?,?,?,?,?,?,?,?)",
        values: [checklist, req.body.txtattribute, req.body.ddlvalidation, req.body.ddlifAttribute, req.body.valuesetgroup, req.body.txtdesc, req.body.txtdatatype, req.body.txtlength, req.body.txtprecison, req.body.scale, req.body.exprcollection]
    }
 //   console.log("jai ho",query);
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            if (req.body.renders != 0) {
                res.redirect('/admin/');
            } else {
                res.redirect('/admin/attribute?msg=1');
            }
        }
    });
});



router.post('/changestatusmerchant', function(req, res, next) {

    var query = {
        sql: "call usp_changestatusmerchant_nr(?,?)",
        values: [req.body.ID, req.body.Status]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json("Action saved successfully.");
        }
    });
});

router.post('/changestatusgroup', function(req, res, next) {

    var query = {
        sql: "call usp_changestatusgroup_nr(?,?)",
        values: [req.body.ID, req.body.Status]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json("Action saved successfully.");
        }
    });
});

router.post('/GetAllvalues', function(req, res, next) {

    var query = {
        sql: 'call usp_getlovlistbyid_rs(?)',
        values: [req.body.data]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {

            res.json(result[0]);
        }
    });
});


router.get('/User', function(req, res, next) {
    var querymsg = require('url').parse(req.url, true).query;
    var msg = querymsg.msg;
    if (msg != "undefined") {
        msg = msg;
    }
    var query = "call usp_getUsers_rs()";
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            //console.log(result[0]);
            res.render('admin/User', {
                usersList: result[0],
                usersLi: result[1],
                msg: msg,
                name: req.session.email,
                fname:req.session.name,
                errordata: ''
            });
        }
    });
});

router.get('/Group', function(req, res, next) {
    var query = "call usp_getcategorygropu_rs()";
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            //res.json(result[0]);
            res.render('admin/group', {
                templatedata: '',
                merchantdata: '',
                Groupdata: result[0],
                divid: 'group',
                name: req.session.email,
                fname:req.session.name
            });
        }
    });
});


router.get('/attribute', function(req, res, next) {
    var query = require('url').parse(req.url, true).query;
    var catid = query.catid;
    var msg = query.msg;
    var tempid1, tempid;
    if (catid == undefined) {
        catid = 0;
    }
    var query = {
        sql: 'call usp_gettemplateid_rs(?)',
        values: [catid]
    }
    mysql(query, function(err, result) {

     //   console.log('attribute is',result)
        if (err) {
            console.log(err);
        } else {
            if (result[0].length != 0) {
                tempid1 = result[0];
                tempid = tempid1[0].fk_TemplateId;
            } else {
                tempid = 0;
            }
            res.render('admin/attribute', {
                catid: catid,
                tempid: tempid,
                name: req.session.email,
                fname:req.session.name,
                msg: msg
            });
        }
    });
});


router.get('/existgetvaluset', function(req, res, next) {
    var query = "call usp_getvaluesset_rs()";
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
})

router.get('/existgetvaluset1', function(req, res, next) {
    var query = "call usp_getvaluesset_rs()";
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
})

router.post('/getlovs', function(req, res, next) {
    var query = "call usp_getlovs_rs()";
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});

router.post('/addvalueset', function(req, res, next) {
    var query = {
        sql: 'call usp_addvalueste_nr(?,?,?,?,?)',
        values: [req.body.valueset, req.body.desc, req.body.newvauleset, req.body.checklist,req.body.isnan]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json({
                "value": 1
            });
        }
    });
});





router.post('/getlovlistbyid', function(req, res, next) {
    var query = {
        sql: 'call usp_getlovbyid_rs(?)',
        values: [req.body.id]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});

router.post('/editvalueset', function(req, res, next) {
    var query = {
        sql: 'call usp_editvaluset_nr(?,?,?,?,?,?)',
        values: [req.body.valueset, req.body.desc, req.body.newvauleset, req.body.checklist, req.body.valueset1,req.body.isnan1]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json({
                "value": 1
            });
        }
    });
});

router.get('/lov', function(req, res, next) {
    res.render('admin/add_valuset', {
        name: req.session.email,fname:req.session.name
    });
});


router.post('/adduser', function(req, res, next) {
    createUser(req, res);
});

router.post('/get_attribut', function(req, res, next) {
    var query = "call usp_getattr_rs()";
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});

router.post('/get_attrinfo', function(req, res, next) {
    var query = {
        sql: 'call usp_getattrinfo_rs(?)',
        values: [req.body.id]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});
router.post('/delmerchantattr', function(req, res, next) {
    var query = {
        sql: 'call usp_del_merchanr_attr(?)',
        values: [req.body.id]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});
router.get('/editattribute', function(req, res, next) {
    var query = require('url').parse(req.url, true).query;
    var id = query.id;
    var query = "call usp_getvaluesset_rs()";
    mysql(query, function(err, valset) {
        if (err) {
            console.log(err);
        } else {
            var query = "call usp_gettemplate_rs()";
            mysql(query, function(err, templates) {
                if (err) {
                    console.log(err);
                } else {
                    var query = {
                        sql: 'call usp_getcategorybyattrid_rs(?)',
                        values: [id]
                    }
                    mysql(query, function(err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                         //   console.log("categories---",categories[0]);
                         //   console.log("vset---------",valset[0]);
                         //  console.log("attrdatatype=-----",categories[1])
                            res.render('admin/editattribute', {
                                vset: valset[0],
                                templ: templates[0],
                                cat: categories[0],
                                name: req.session.email,
                                fname:req.session.name,
                                attrdatatype:categories[1]
                            });
                        }
                    });
                }
            });
        }
    });
});

router.post('/editandinsert_attribute', function(req, res, next) {
    //console.log(req.body);
    var query = {
        sql: 'call usp_insertandupdateattribute_nr(?,?,?,?,?,?)',
        values: [req.body.catid, req.body.attrid, req.body.valset, req.body.isattr, req.body.flag, req.body.validflag]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json({
                "value": 1
            });
        }
    });
});

router.post('/del_attribute', function(req, res, next) {
   // console.log(req.body);
    var query = {
        sql: 'call usp_delattribute_nr(?)',
        values: [ req.body.attrid]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
            res.json(result);
        } else {
            res.json(result);
        }
    });
});

router.get('/log_Summary', function(req, res) {
    var query = 'call usp_getAuditLog_rs()';
    mysql(query, function(err, rows) {
        if (err) console.log(err);
        else {
            res.render('admin/log_summary', {
                rows: rows[0],rows1:rows[1],
                name: req.session.email,fname:req.session.name
            });
        }
    });
});

router.post('/log_Detail', function(req, res) {
    var query = {
        sql: 'call usp_getAuditLogDetail_rs(?,?)',
        values: [req.body.uid, req.body.ltime]
    }
    mysql(query, function(err, rows) {
        if (err) console.log(err);
        else {
            res.json(rows[0]);
            //res.render('admin/log_summary', {rows: rows[0],name:req.session.email});
        }
    });
});

router.post('/update_attribute', function(req, res, next) {
   //  console.log(req.body);
    var query = {
        sql: 'call usp_updateattribute_nr(?, ?, ?,?,?, ?, ?,?)',
        values: [req.body.attrid,
            req.body.edittxtdesc,
            req.body.txtdatatype,
            req.body.txtlength,
            req.body.txtprecison,
            req.body.scale,
            req.body.editattr,
            req.body.valuesetgroup
        ]
    }
    mysql(query, function(err, result) {
        if (err) {

            console.log(err);
            res.json({});
        } else {
            res.json({});

            //res.redirect('/admin/attribute')
        }
    });
});

router.post('/getattrdetails', function(req, res, next) {
    var query = {
        sql: 'call usp_attributedetails_rs(?,?)',
        values: [req.body.id, req.body.pid]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});

router.post('/getdropdownvaluesbyddname', function(req, res, next) {
    var query = {
        sql: 'call usp_getdropdownvalues_rs(?)',
        values: [req.body.data]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});

router.post('/upload_merchant', busboy(),
    form({
        uploadfile: {
            filename: true,
            required: true
        }
    }),
    function(req, res, next) {
        //console.log(req.files);
        var filename = req.files.attributefile.path;
        xls_to_json.upload_attribute(filename, req, res);

    });

router.get('/getCategoryAndTemplateByAttribute', function(req, res, next) {
    var query = require('url').parse(req.url, true).query;
    var attrid = query.attrid;
    var catid = query.catid;
    var query = {
        sql: 'call usp_getcatandtempbyattr_rs(?,?)',
        values: [catid, attrid]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            var query = "call usp_getvaluesset_rs()";
            mysql(query, function(err, valset) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('admin/editattributenycategory', {
                        category: result[0],
                        valset: valset[0],
                        name: req.session.email,fname:req.session.name
                    });
                }
            });
        }
    });
});

router.get('/deleteTemplateandCategoryandAttribute', function(req, res, next) {
    var query = require('url').parse(req.url, true).query;
    var id = query.id;
    var pid = query.pid;
    var flag = query.flag;
    var query = {
        sql: 'call usp_deleteTemplateAndCategoryAndAttribute(?,?,?)',
        values: [id, pid, flag]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            var msg = result[0];
            console.log(msg)
            res.json(msg);
        }
    })
});

router.post('/getExpression', function(req, res, next) {
    var query = {
        sql: 'call usp_getExpression_rs(?,?)',
        values: [req.body.catid, req.body.attrid]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});

router.post('/submitExpression', function(req, res, next) {

    var query = {
        sql: 'call usp_editExpression_nr(?,?,?)',
        values: [req.body.catid, req.body.attrid, req.body.expres]
    }

    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json('Success');
        }
    });
});

router.post('/submitExpressionall', function(req, res, next) {
//console.log('req.body',req.body)
    var query = {
        sql: 'call usp_editExpressionall_nr(?,?,?)',
        values: [req.body.catid, req.body.attrid, req.body.expres]
    }

    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json('Success');
        }
    });
});

router.get('/res_brand', function(req, res) {
    var query = 'call usp_getresbrnad()';
    mysql(query, function(err, rows) {
        if (err) console.log(err);
        else {
          //  console.log("ressuuuuutttt---",rows);
            res.render('admin/res_brand', {
                rows: rows[0],
                name: req.session.email,
                fname:req.session.name,
                errordata: ''
            });
        }
    });
});

router.post('/upload_resbrand', busboy(),
    form({
        uploadfile: {
            filename: true,
            required: true
        }
    }),
    function(req, res, next) {
        //console.log(req.files);
        var filename = req.files.attributefile.path;
        xls_to_json.upload_resbrand(filename, req, res);
        console.log('upload res_brand');

    });

router.post('/deleteUser', function(req, res, next) {
    //console.log(req.body);
    if (req.body.flag == 0) {
        //  console.log('per0');
        var query = {
            sql: 'call usp_delteuser_nr(?)',
            values: [req.body.ID]
        }

        mysql(query, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json('success');
            }
        });
    } else {
        //console.log('per0');
        var query = {
            sql: 'call usp_delteuserPer_nr(?)',
            values: [req.body.ID]
        }

        mysql(query, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json('success');
            }
        });
    }

});

router.post('/getcatattribute', function(req, res, next) {
    //console.log(req.body.catID);
    var query = {
        sql: 'call gettemplattribute(?)',
        values: [req.body.catID]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            //console.log(result[0])
            res.json(result[0]);
        }
    });
});

router.post('/treeforajex', function(req, res, next) {
    //console.log(req.body.catID);
    var query = {
        sql: 'call usp_gettreenodedata_rs(?)',
        values: [req.body.id1]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
           // console.log(result)
            res.json(result);
        }
    });
});

router.post('/renderattr', function(req, res, next) {
    //console.log(req.body.catID);
    var query = {
        sql: 'call usp_getattrtreenodedata_rs(?)',
        values: [req.body.id1]
    }
    console.log(query)
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
         //   console.log(result)
            res.json(result);
        }
    });
});

router.post('/updatesequence', function(req, res, next) {
    //console.log(req.body);
    var query = {
        sql: 'call usp_updmapcategoryseq_nr(?,?,?)',
        values: [req.body.upseqid1, req.body.upseqflg, req.body.templup]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            // console.log(result[0])
            res.redirect('/admin/');
        }
    });
});


router.post('/upload_Users', busboy(),
    form({
        uploadfile: {
            filename: true,
            required: true
        }
    }),
    function(req, res, next) {
        //console.log(req.files);
        var filename = req.files.attributefile.path;
        xls_to_json.upload_Users(filename, req, res);

    });

router.post('/upload_Headers', busboy(),
    form({
        uploadfile: {
            filename: true,
            required: true
        }
    }),
    function(req, res, next) {
     //   console.log(req.files);
      //  console.log(req.body);
        var filename = req.files.attributefile.path;
        xls_to_json.upload_Headers(filename, req, res);

    });

router.get('/addmultipleattr', function(req, res, next) {
    var query = require('url').parse(req.url, true).query;
    var id = query.catid;
  //  console.log("query from fromtend----",query);
 /* var id = 555;*/
    var query1 = "call usp_getvaluesset_rs()";

    var qr="select categoryName from t_category where Id="+id;

    mysql(qr,function(err,catname){
    if(err){
   console.log(err);
    }else
    {
     //  console.log("category namae----",catname[0].categoryName);
    mysql(query1, function(err, valset) {
        if (err) {
            console.log(err);
        } else {
            var query1 = "call usp_getattr_rs()";
                   
                    mysql(query1, function(err, attributes) {
                        if (err) {
                            console.log(err);
                        } 
                        else
                         {
                            var query = {
                                sql: 'call usp_getmapcatattribute_rs(?)',
                                values: [id]
                            }
                         //   console.log("query-----",query);
                                mysql(query, function(err, attrmapcat) {
                                    if (err) {
                                        console.log(err);}
                                      else{
                                            //console.log("valsetattrcap----",attrmapcat[1]);
                                        //    console.log("attributes-----",attributes[0]);
                                         //   console.log("valueset-------",valset[0]);
                                            res.render('admin/addmultipleattr', {
                                            vset: valset[0],
                                            attributes: attributes[0],
                                            categoryid: id,
                                            categoryname:catname[0].categoryName,
                                            attrmapcap:attrmapcat[0],
                                            valsetattrcap:attrmapcat[1],
                                            name: req.session.email,
                                            fname:req.session.name,
                                        });
                                     }
                                      });

                        }

                    });
                }
            });


         }
     });
 });


router.post('/addeditrestrictedbrand', function(req, res, next) {
 //   console.log("data-----",req.body);

    var query = {
        sql: 'call usp_addeditrestrictedbrand(?,?,?)',
        values: [req.body.brandid,req.body.brandname,req.body.merchantcode]
    }
 //   console.log('query for restricted res_brand---',query);
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            /*console.log(result)
            res.json(result);*/
               res.redirect('/admin/res_brand');
        }
    });
});


router.post('/deleterestrictedbrand', function(req, res, next) {
    //console.log(req.body.catID);
    var query = {
        sql: 'call usp_deleterestrictedbrand(?)',
        values: [req.body.id]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
         //   console.log(result[0])
            res.json(result[0]);
        }
    });
});



router.post('/deletelov', function(req, res, next) {
    var query = {
        sql: 'call usp_delete_lov(?)',
        values: [req.body.lovid]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});

module.exports = router;