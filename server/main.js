import { Meteor } from 'meteor/meteor';

const fs = require('fs-extra');
const fiber = Npm.require('fibers');
const homepath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const BASE_PATH = homepath + '/temp/'

fs.mkdirsSync(BASE_PATH);

Meteor.methods({
  saveFile: function(blob, name) {
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
              let userId = '';
              try {
                userId = Accounts.createUser({
                  username: row['username'],
                  email: row['email']
                });
              } catch (e) {
                console.log(e);
              } finally {
                console.log(userId);
                result.push(userId)
              }
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

  downLoad:function() {
    return Async.runSync(function(done) {
      var mongoXlsx = require('mongo-xlsx');
      var data = Meteor.users.find().fetch();
      for (let v of data) {
        let createdAt = v.createdAt;
        v.createdAt = moment(createdAt).format('YYYY-MM-DD HH:MM');
      }
      var model = mongoXlsx.buildDynamicModel(data);
      mongoXlsx.mongoData2Xlsx(data, model, {path: BASE_PATH}, function(err, data) {
        if (err) {
          console.log(err);
          done(err, null);
          return;
        }
        fiber(function() {
          Files.insert(data.fullPath, function (err, fileObj) {
            try {
              // temp file delete
              var targetRemoveFiles = fs.readdirSync(BASE_PATH);
              for (let v of targetRemoveFiles) {
                fs.unlinkSync(BASE_PATH + v);
              }
            } catch (e) {
              console.log(e);
            }
            if (err) {
              console.log(err);
              done(err, null);
              return;
            }
            let url = fileObj.url({brokenIsFine: true});
            console.log(url);
            done(null, fileObj._id);
          });
        }).run();
      });
    });
  }
});
