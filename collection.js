Files = new FS.Collection('files', {
    stores: [
        new FS.Store.FileSystem("files",  {path: "~/uploads"})
    ],
    filter: {
        allow: {
            extensions: ['pdf','doc','docx','xls','xlsx','zip']
        },
        onInvalid: function (message) {
            if (Meteor.isClient) {
                // my custom error handling here
            }
        }
    }
});

Files.allow({
  'insert': function () {
    // add custom authentication code here
    return true;
  }
});


if (Meteor.isServer) {
  Meteor.publish('Users', function () {
    return Meteor.users.find();
  });
  Meteor.publish('Files', function () {
    return Files.find();
  });
}
