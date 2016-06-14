import { Meteor } from 'meteor/meteor';

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
    let basepath = path.resolve('.').split('.meteor')[0] + '/private';
    let encoding = 'binary';

    name = cleanName(name);

    return Async.runSync(function(done) {
      fs.writeFile(basepath + name, blob, encoding, function(err) {
        if (err) {
          throw (new Meteor.Error(500, 'Failed to save file.', err));
          done(err, null);
        } else {

          let excel = new Excel('xlsx');
          let workbook = excel.readFile(basepath + name);
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
  }
});
