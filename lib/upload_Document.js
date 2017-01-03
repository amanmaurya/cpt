var xlsx_parser = require('excel-parser');
var connection = require('./mysql.js');
var passwordMailer = require('./password_mailer.js');

var mysql = require('mysql');
var connection1 = mysql.createConnection({
  host: '192.168.1.56',
  user: 'sa',
  password: 'root',
  database: 'cptdev'
});

var xls_to_json = {
  upload_attribute: function(file_name, req, res) {
    xlsx_parser.parse({
      inFile: file_name,
      worksheet: 1
    }, function(err, results) {
      if (err)
      {
        console.log("Error in excelfile");        
        res.redirect('/admin/merchant?msg=4');
      }
      else {
        var columnlist='';
        var Excelheader=results[0];
        results=results.splice(1);
        var successArray=[];
        var errorArray=[];
        connection1.query("INSERT INTO merchantstaging(MerchantId,DispatchTime)  VALUES ?;", [results], function(err) {
          if (err)
          {
            console.log(err)
            res.redirect('/admin/merchant?msg=4');
          }

          else
          {
            connection1.query('call usp_uploadMerchant_nr()', function(err,resultupload) {       
              if (err)
                res.redirect('/admin/merchant?msg=1');      
              else
              {
                if(resultupload[0].length != 0)
                {
                   var query = "Select * from t_dispatchtime ";
                   connection1.query(query,function(err,result){
                    if(err){
                      console.log(err);
                    } 
                    else {
                      res.render('admin/merchant',{templatedata: '',msg:3,merchantdata:result,Groupdata:'',divid:'merchant',name:req.session.email,errordata:resultupload[0]});
                    }
                  });
                }
                else
                  res.redirect('/admin/merchant?msg=2');  
              }
            });
          }

        });

      }
    });

},
upload_resbrand: function(file_name, req, res) {
  console.log("i am in upload_resbrand.");
    xlsx_parser.parse({
      inFile: file_name,
      worksheet: 1
    }, function(err, results) {
      if (err)
      {
        console.log("Error in excelfile");       
        res.redirect('/admin/res_brand');
      }
      else {
        var columnlist='';
        var Excelheader=results[0];
        console.log("Excelheader----",Excelheader);
        results=results.splice(1);
        console.log("data in excelfile is----",results);
        var successArray=[];
        var errorArray=[];
        connection1.query("INSERT INTO brandstaging(Brand,MerchantId)  VALUES ?;", [results], function(err) {
          console.log("err")
          if (err)
          {
            console.log("ttttttttt-------",err);
            console.log(err)
            res.redirect('/admin/res_brand?msg=4');
          }

          else
          {
            console.log("going for call procedure----");
            connection1.query('call usp_uploadResBrand_nr()', function(err,resultupload) {      
              if (err){
                console.log("i am in error");
                res.redirect('/admin/res_brand?msg=1');     
              }
              else
              {
                console.log("results-------",resultupload);
                if(resultupload[0].length != 0)
                {
                    var query = 'call usp_getresbrnad()';
                  connection1.query(query,function(err,rows){
                    if(err) console.log(err);
                    else{
                      console.log("hi----");
                      res.render('admin/res_brand', {rows: rows[0],name:req.session.email,errordata:resultupload[0]});
                    }
                  });
                }
                else{
                  res.redirect('/admin/res_brand?msg=2'); 
                console.log("Byee----");
                 }
            }
            });
          }

        });

      }
    });

},
upload_Users: function(file_name, req, res) {
    xlsx_parser.parse({
      inFile: file_name,
      worksheet: 1
    }, function(err, results) {
      if (err)
      {
        console.log("Error in excelfile");       
        res.redirect('/admin/Users?msg=4');
      }
      else {
        var columnlist='';
        var Excelheader=results[0];
        results=results.splice(1);
        var successArray=[];
        var errorArray=[];
        connection1.query("INSERT INTO userstaging(Email,Role)  VALUES ?;", [results], function(err) {
          console.log("err")
          if (err)
          {
            console.log(err)
            res.redirect('/admin/User?msg=4');
          }

          else
          {
            connection1.query('call usp_uploadUsers_nr()', function(err,resultupload) {      
              if (err)
                res.redirect('/admin/User?msg=1');     
              else
              {
               // console.log(resultupload);
                var maillist=resultupload[1][0].Email;
                req.body.email=maillist;
                  //console.log(maillist);
                 // console.log(resultupload[2][0].pass);
                 if(typeof maillist!='null') 
                 {
                   passwordMailer(req, res, resultupload[2][0].pass);
                 }  
                if(resultupload[0].length != 0)
                {
                    var query = 'call usp_getUsers_rs()';
                  connection1.query(query,function(err,rows){
                    if(err) console.log(err);
                    else{
                      res.render('admin/User', 
                        {usersList: rows[0],usersLi:rows[1],msg:1,name:req.session.email,errordata:resultupload[0]});
                      
                    }
                  });
                }
                else
                  res.redirect('/admin/User?msg=2'); 
              }
            });
          }

        });

      }
    });

},
upload_Headers: function(file_name, req, res) {
    xlsx_parser.parse({
      inFile: file_name,
      worksheet: 1
    }, function(err, results) {
      if (err)
      {
        console.log("Error in excelfile");       
        res.redirect('/admin/Users?msg=4');
      }
      else {
        var columnlist='';
        var Excelheader=results[0];
        results=results.splice(1);
        var successArray=[];
        var errorArray=[];
        
        //console.log(req.body.catID);
          var query = {
            sql : 'call gettemplattribute(?)',
            values : [req.body.catID]
          }
           connection1.query(query,function(err,result){
            if(err){
              console.log(err);
            }
            else {
              var bugs=result[0];
              var columns=[];
              for (var i = 0; i < result[0].length; i++) {
                columns.push(result[0][i].Attribute);
              };
             
             var Excelheader1=[];
             var Excelheader2=[];
             Excelheader2.push(Excelheader);
             Excelheader2=Excelheader2[0];
              

             // console.log("head11:"+Excelheader2);
              var index1 = Excelheader2.indexOf('Category Id 1');

                  if (index1 !== -1) {
                      Excelheader2[index1] = 'Category Id';
                  }
                 // console.log("head:"+Excelheader2)
              var r12 = Excelheader2.filter(function(value, index){
                  return((columns.indexOf(value)>-1));
              });

             var temp1=result[0];
             var temp=[];
             var i;
             

             for (i = 0; i < r12.length; i++) {
                //console.log("emt"+temp1[i].Attribute);
                  for (var k = 0; k < temp1.length; k++) {
                    if(r12[i]==temp1[k].Attribute)
                    {
                      temp1[k].ord=(i+1);
                       
                      temp.push(temp1[k]);
                        break;
                   
                    }

                  };
             };
             
             var temp12=result[0];
             for (var k = 0; k < temp12.length; k++) {
                if(r12.indexOf(temp12[k].Attribute)==-1){
                  i++;
                  temp12[k].ord=(i);
                  temp.push(temp12[k]);
                  
                }
             };
             res.json(temp);
            }
          });

      }
    });

}
}
module.exports = xls_to_json;