import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('Users');
Meteor.subscribe('Files');

Template.users.helpers({
  'list'() {
    return Meteor.users.find();
  }
});

Template.upload.events({
  'change input'(e) {
    var file = e.currentTarget.files[0];
    saveFile(file, file.name, function(err, data) {
      console.log(err, data);
    });
  }
});

Template.download.events({
  'click button'() {
    Meteor.call('downLoad', function(err, data) {
      console.log(err, data);
      if (err) {
        console.log(err);
      } else {
        if (data.error) {
          console.log(data.error);
        } else {
          let id = data.result;
          let file =  Files.findOne({_id: id});
          let url = file.url({brokenIsFine: true});
          let html = `<a id="download" href="${url}" download style="display:none">TES</a>`
          $('body').append(html);
          $('#download').get(0).click();
        }
      }
    });
  }
});

const saveFile = function(blob, name, callback) {
  var fileReader = new FileReader();
  fileReader.onload = function(file) {
    Meteor.call('saveFile', file.srcElement.result, name, callback);
  }
  fileReader.readAsBinaryString(blob);
}
