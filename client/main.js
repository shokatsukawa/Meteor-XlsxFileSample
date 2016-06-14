import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('Users');

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

const saveFile = function(blob, name, callback) {
  var fileReader = new FileReader();
  fileReader.onload = function(file) {
    Meteor.call('saveFile', file.srcElement.result, name, callback);
  }
  fileReader.readAsBinaryString(blob);
}
