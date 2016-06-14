import { Meteor } from 'meteor/meteor';


const BASE_PATH = Npm.require('path').resolve('.').split('.meteor')[0] + '/private/';


Meteor.publish('Users', function () {
  return Meteor.users.find();
});

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  saveFile: function(blob, name) {
    let fs = Npm.require('fs');
    let path = Npm.require('path');
    var fiber = Npm.require('fibers');
    let encoding = 'binary';

    name = cleanName(name);

    return Async.runSync(function(done) {
      fs.writeFile(BASE_PATH + name, blob, encoding, function(err) {
        if (err) {
          throw (new Meteor.Error(500, 'Failed to save file.', err));
          done(err, null);
        } else {

          let excel = new Excel('xlsx');
          let workbook = excel.readFile(BASE_PATH + name);
          let sheetsName = workbook.SheetNames;
          let sheet = workbook.Sheets[sheetsName[0]]
          let workbookJson = excel.utils.sheet_to_json(sheet, {});

          let result = [];
          for (let row of workbookJson) {
            fiber(function() {
              let userId = Accounts.createUser({
                username: row['username'],
                email: row['email']
              });
              console.log(userId);
              result.push(userId)
            }).run();
          }
          done(null, result);
        }
      });
    });

    function cleanName(str) {
      return str.replace(/\.\./g,'').replace(/\//g,'');
    }
  },
  
  downLoad() {
    return Async.runSync(function(done) {
      var mongoXlsx = require('mongo-xlsx');
      var data = [ { name : "Peter", lastName : "Parker", isSpider : true } ,
               { name : "Remy",  lastName : "LeBeau", powers : ["kinetic cards"] }];
      var model = mongoXlsx.buildDynamicModel(data);
      mongoXlsx.mongoData2Xlsx(data, model, {path: BASE_PATH}, function(err, data) {
        console.log('File saved at:', data.fullPath);
        done(null, data)
      });
    });
  }
});
