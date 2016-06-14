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

Template.files.helpers({
  'list'() {
    return Files.find();
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

      let id = data.result;
      let file =  Files.findOne({_id: id});
      console.log(file);

      Session.set('downloadFile', id);

      // let html = `<a id="tes" href="${url}" download>TES</a>`
      //
      // $('body').append(html);
      //
      // console.log($('#tes'));
    });
  }
});

Template.downloadFile.helpers({
  'data'() {
    console.log(Session.get('downloadFile'));
    return Files.find({_id: Session.get('downloadFile')});
  }
});


const saveFile = function(blob, name, callback) {
  var fileReader = new FileReader();
  fileReader.onload = function(file) {
    Meteor.call('saveFile', file.srcElement.result, name, callback);
  }
  fileReader.readAsBinaryString(blob);
}
